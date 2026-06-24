"""Plex OAuth (PIN flow) + signed-cookie sessions.

Flow: client GETs /api/auth/plex/pin -> opens authUrl on plex.tv -> polls
/api/auth/plex/callback?pinId= until authenticated. On success we resolve the
Plex user, verify they're a Seerr member, and set a signed session cookie.
"""
from typing import Optional

import httpx
from fastapi import Request, HTTPException
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

from . import config

_PLEX = "https://plex.tv/api/v2"


def _serializer() -> URLSafeTimedSerializer:
    if not config.SECRET_KEY:
        raise RuntimeError("SECRET_KEY is not set")
    return URLSafeTimedSerializer(config.SECRET_KEY, salt="bracket-session")


def _plex_headers() -> dict:
    return {
        "Accept": "application/json",
        "X-Plex-Product": config.PLEX_PRODUCT,
        "X-Plex-Client-Identifier": config.PLEX_CLIENT_ID,
    }


async def create_pin() -> dict:
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(f"{_PLEX}/pins", params={"strong": "true"},
                         headers=_plex_headers())
        r.raise_for_status()
        d = r.json()
    code = d["code"]
    auth_url = (
        "https://app.plex.tv/auth#?clientID="
        f"{config.PLEX_CLIENT_ID}&code={code}"
        f"&context%5Bdevice%5D%5Bproduct%5D={config.PLEX_PRODUCT}"
    )
    return {"pinId": d["id"], "code": code, "authUrl": auth_url}


async def check_pin(pin_id: int) -> Optional[str]:
    """Return the user's Plex authToken once the PIN is linked, else None."""
    try:
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.get(f"{_PLEX}/pins/{pin_id}", headers=_plex_headers())
            r.raise_for_status()
            return r.json().get("authToken")
    except httpx.HTTPError:
        return None


async def fetch_plex_user(auth_token: str) -> dict:
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.get(f"{_PLEX}/user",
                        headers={**_plex_headers(), "X-Plex-Token": auth_token})
        r.raise_for_status()
        d = r.json()
    return {"plexId": int(d["id"]), "username": d.get("username"),
            "thumb": d.get("thumb")}


def _pin_serializer() -> URLSafeTimedSerializer:
    if not config.SECRET_KEY:
        raise RuntimeError("SECRET_KEY is not set")
    return URLSafeTimedSerializer(config.SECRET_KEY, salt="bracket-pin")


def sign_pin_nonce(pin_id: int) -> str:
    return _pin_serializer().dumps({"pinId": int(pin_id)})


def read_pin_nonce(token: str) -> Optional[int]:
    if not config.SECRET_KEY:
        return None
    try:
        data = _pin_serializer().loads(token, max_age=config.PIN_NONCE_MAX_AGE)
        return int(data["pinId"])
    except (BadSignature, SignatureExpired, KeyError, ValueError):
        return None


def sign_session(plex_id: int) -> str:
    return _serializer().dumps({"plexId": int(plex_id), "e": str(config.SESSION_EPOCH)})


def read_session(token: str) -> Optional[int]:
    # No SECRET_KEY (e.g. setup not finished yet) means no session can be valid —
    # a leftover cookie must not blow up the request. Return None, never raise.
    if not config.SECRET_KEY:
        return None
    try:
        data = _serializer().loads(token, max_age=config.SESSION_MAX_AGE)
        if str(data.get("e")) != str(config.SESSION_EPOCH):
            return None
        return int(data["plexId"])
    except (BadSignature, SignatureExpired, KeyError, ValueError):
        return None


def current_plex_id(request: Request) -> int:
    """FastAPI dependency: resolve the signed session (or dev override) -> plexId."""
    if config.DEV_PLEX_ID:
        dev = request.headers.get("X-Dev-Plex-Id") or request.query_params.get("devPlexId")
        if dev:
            return int(dev)
    token = request.cookies.get(config.SESSION_COOKIE)
    if token:
        pid = read_session(token)
        if pid is not None:
            return pid
    raise HTTPException(status_code=401, detail="Not authenticated")
