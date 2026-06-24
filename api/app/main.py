"""bracket-api — backend + static front-end for the Bracket release calendar.

Implements the api.ts contract: /api/me, /api/settings, /api/watchlist,
/api/calendar, /api/search, plus Plex-OAuth auth endpoints, and serves the
Bracket UI bundle same-origin from WEB_DIR.
"""
import asyncio
import datetime as dt
import importlib
import logging
import os
import time

import httpx
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from starlette.concurrency import run_in_threadpool

from . import auth, config, db
from .clients import seerr, servarr
from .models import (AddWatchlistBody, CalendarEvent, ImportResult, Me,
                     OkResponse, RequestMediaBody, SearchResult, Settings,
                     SetupConfig, SetupTestRequest, WatchlistItem)

log = logging.getLogger("bracket")

_LOG_FILE = None  # set by _setup_file_logging() to whichever path is writable

def _setup_file_logging() -> None:
    global _LOG_FILE
    # Prefer the config dir; fall back to /tmp when /app is read-only or the
    # config dir doesn't exist (env-var-only deployments).
    candidates = [
        os.path.join(os.path.dirname(str(config.CONFIG_FILE)) or "/tmp", "bracket-error.log"),
        "/tmp/bracket-error.log",
    ]
    for path in candidates:
        try:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            fh = logging.FileHandler(path)
            fh.setLevel(logging.WARNING)
            fh.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
            logging.getLogger().addHandler(fh)
            _LOG_FILE = path
            return
        except Exception:
            continue
    log.warning("Could not open any error log file (tried %s)", candidates)

from contextlib import asynccontextmanager


@asynccontextmanager
async def _lifespan(app: FastAPI):
    _setup_file_logging()
    db.init_db()
    seerr.open()
    servarr.open()
    task = asyncio.create_task(_reconcile_loop())
    try:
        yield
    finally:
        task.cancel()
        await seerr.close()
        await servarr.close()


app = FastAPI(title="bracket-api", version="1.2.0", lifespan=_lifespan)
app.add_middleware(
    CORSMiddleware, allow_origins=config.CORS_ORIGINS, allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# Defense-in-depth headers for the app origin (the strict marketing-site CSP does not
# cover this host). React is self-hosted so script-src can be 'self'. Inline style
# attributes / <style> blocks the kit injects need style 'unsafe-inline'.
_CSP = (
    "default-src 'self'; "
    "script-src 'self'; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com; "
    "img-src 'self' https://image.tmdb.org data:; "
    "connect-src 'self'; "
    "frame-ancestors 'none'; base-uri 'none'; object-src 'none'; form-action 'self'"
)
_SEC_HEADERS = {
    "Content-Security-Policy": _CSP,
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
}


@app.middleware("http")
async def _headers_and_session(request: Request, call_next):
    resp = await call_next(request)
    # Security headers on every response.
    for k, v in _SEC_HEADERS.items():
        resp.headers.setdefault(k, v)
    # Caching: HTML never cached (so ?v= asset URLs are always fresh); versioned .js
    # immutable; CSS/JSX revalidate.
    p = request.url.path
    if p in ("/", "/view") or p.endswith(".html"):
        resp.headers["Cache-Control"] = "no-store"
    elif p.endswith(".js"):
        resp.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    elif p.endswith((".css", ".jsx")):
        resp.headers["Cache-Control"] = "no-cache, must-revalidate"
    # Sliding session: refresh a still-valid cookie on authenticated API use (not auth/logout).
    if p.startswith("/api/") and not p.startswith("/api/auth/"):
        tok = request.cookies.get(config.SESSION_COOKIE)
        if tok:
            try:
                pid = auth.read_session(tok)
                if pid is not None:
                    resp.set_cookie(config.SESSION_COOKIE, auth.sign_session(pid),
                                    max_age=config.SESSION_MAX_AGE, httponly=True,
                                    secure=config.SESSION_SECURE, samesite="lax")
            except Exception as exc:
                # A bad/stale cookie must never break the response.
                log.warning("session refresh skipped on %s: %s", p, exc)
    return resp


@app.exception_handler(httpx.HTTPError)
async def _upstream_error(request: Request, exc: httpx.HTTPError) -> JSONResponse:
    log.warning("upstream error on %s: %s", request.url.path, exc.__class__.__name__)
    return JSONResponse(status_code=502, content={"detail": "Upstream service unavailable."})


@app.exception_handler(seerr.SeerrRequestError)
async def _seerr_request_error(request: Request, exc: seerr.SeerrRequestError) -> JSONResponse:
    detail = _friendly_seerr_error(exc.status, exc.message)
    log.info("seerr request error %s: %s", exc.status, exc.message)
    return JSONResponse(status_code=exc.status if exc.status in (409, 422, 403) else 502,
                        content={"detail": detail})


def _friendly_seerr_error(status: int, raw: str) -> str:
    low = raw.lower()
    if "no indexers" in low or "indexer" in low:
        return "No indexers are configured in Radarr/Sonarr — ask your admin to add one."
    if "already request" in low or status == 409:
        return "Already requested or in your library."
    if "quota" in low or "limit" in low:
        return "You've hit your request quota — try again later or ask your admin."
    if "cannot read properties" in low or "is not a function" in low or "typeerror" in low:
        return "Seerr has no Sonarr service configured — add one in Seerr → Settings → Services → Sonarr, then try again."
    if "cannot find" in low or "not found" in low or status == 404:
        return "Seerr couldn't find that title — it may not be in your media server."
    if status == 403:
        return "Seerr denied the request — you may not have permission."
    if raw:
        return f"Request failed: {raw[:160]}"
    return "Seerr didn't accept the request — check your Seerr settings."


# ---- simple in-process sliding-window rate limiter (single worker; see note) ----
# NOTE: correct ONLY with uvicorn workers == 1 (the deploy default). If you ever add
# --workers, move this to the shared plex-manager redis, or limits become per-worker.
_RATE: dict[str, dict[str, list]] = {}


def _rate_ok(bucket: str, key: str, limit: int, window: float) -> bool:
    now = time.monotonic()
    b = _RATE.setdefault(bucket, {})
    hits = [t for t in b.get(key, []) if now - t < window]
    if len(hits) >= limit:
        b[key] = hits
        return False
    hits.append(now)
    b[key] = hits
    # opportunistic prune of emptied keys so the dict can't grow unbounded
    if len(b) > 256:
        for k in [k for k, v in b.items() if not v or now - v[-1] > window]:
            b.pop(k, None)
    return True


def _client_ip(request: Request) -> str:
    return (request.client.host if request.client else "?")


# ---- background type-reconcile sweep (off the request path; replaces the write-on-GET) ----
_SWEEP_INTERVAL = max(3600, config.CALENDAR_TTL_SECONDS)


async def _reconcile_loop() -> None:
    await asyncio.sleep(20)  # let the app settle / first calendar fetch warm
    while True:
        try:
            rows = await run_in_threadpool(db.all_watchlist_rows)
            st = await servarr.service_types()
            for r in rows:
                mt = r["media_type"]
                if mt not in ("tv", "anime"):
                    continue
                svc = st.get(r["tvdb_id"])
                if svc and svc != mt:
                    await run_in_threadpool(db.retype_item, r["plex_id"], r["tmdb_id"], mt, svc)
        except Exception as e:  # never let the sweep kill the loop
            log.warning("reconcile sweep skipped: %s", e.__class__.__name__)
        await asyncio.sleep(_SWEEP_INTERVAL)


@app.get("/healthz")
async def healthz() -> dict:
    return {"status": "ok"}


def _me(plex_id: int, member: dict | None) -> Me:
    member = member or {}
    return Me(id=f"u_{plex_id}",
              plexUsername=member.get("plexUsername") or "",
              displayName=member.get("displayName") or "Member",
              avatarUrl=member.get("avatarUrl"),
              isAdmin=bool(member.get("isAdmin")),
              seerrPublicUrl=config.SEERR_PUBLIC_URL)


async def require_member(request: Request) -> int:
    """Auth dependency: valid session AND still a HappySofa member. Fails OPEN on a
    Seerr outage (a member with a valid signed cookie isn't locked out if Seerr is down)
    but fails CLOSED for a confirmed ex-member."""
    pid = auth.current_plex_id(request)  # 401 if no valid session
    try:
        members = await seerr.list_users()
    except Exception:
        return pid  # fail open — don't lock everyone out on a Seerr blip
    if members and pid not in members:
        raise HTTPException(status_code=403, detail="Not authorized.")
    return pid


def _valid_date(s: str | None, default: str) -> str:
    if not s:
        return default
    try:
        return dt.date.fromisoformat(s[:10]).isoformat()
    except ValueError:
        raise HTTPException(status_code=422, detail="Bad date (expected YYYY-MM-DD).")


def _clamp_window(start: str, end: str) -> tuple[str, str]:
    s = dt.date.fromisoformat(start)
    e = dt.date.fromisoformat(end)
    if e < s:
        s, e = e, s
    if (e - s).days > config.CAL_MAX_SPAN_DAYS:
        e = s + dt.timedelta(days=config.CAL_MAX_SPAN_DAYS)
    return s.isoformat(), e.isoformat()


# --- Setup (first-run wizard) -------------------------------------------------

@app.get("/api/setup/status")
async def setup_status() -> dict:
    return {"needsSetup": not config.SETUP_COMPLETE}


@app.post("/api/setup/test")
async def setup_test(body: SetupTestRequest) -> dict:
    url = body.url.rstrip("/")
    try:
        async with httpx.AsyncClient(verify=False, timeout=8.0) as c:
            if body.service == "seerr":
                r = await c.get(f"{url}/api/v1/user?take=1&skip=0", headers={"X-Api-Key": body.api_key})
            else:
                r = await c.get(f"{url}/api/v3/system/status", headers={"X-Api-Key": body.api_key})
            r.raise_for_status()
        return {"ok": True}
    except httpx.HTTPStatusError as e:
        return {"ok": False, "error": f"HTTP {e.response.status_code}"}
    except Exception as e:
        return {"ok": False, "error": str(e)[:120]}


async def _do_reload() -> None:
    """Reload config and reinitialise HTTP clients in-place — no process restart needed."""
    await asyncio.sleep(0.3)
    try:
        importlib.reload(config)
        log.info("setup: config reloaded; SETUP_COMPLETE=%s", config.SETUP_COMPLETE)
        await seerr.close()
        seerr.open()
        await servarr.close()
        servarr.open()
        log.info("setup: HTTP clients reinitialised")
    except Exception as exc:
        log.error("setup: reload failed — %s", exc, exc_info=True)


@app.post("/api/setup/discover")
async def setup_discover(body: SetupTestRequest) -> dict:
    """Fetch Radarr/Sonarr configs already registered in Seerr."""
    url = body.url.rstrip("/")
    headers = {"X-Api-Key": body.api_key}
    def _build_url(cfg: dict) -> str:
        scheme = "https" if cfg.get("useSsl") else "http"
        base = (cfg.get("baseUrl") or "").rstrip("/")
        return f"{scheme}://{cfg['hostname']}:{cfg['port']}{base}"
    try:
        async with httpx.AsyncClient(verify=False, timeout=8.0) as c:
            radarr_r, sonarr_r = await asyncio.gather(
                c.get(f"{url}/api/v1/settings/radarr", headers=headers),
                c.get(f"{url}/api/v1/settings/sonarr", headers=headers),
            )
            radarr_r.raise_for_status()
            sonarr_r.raise_for_status()
        radarr = [{"id": r["id"], "name": r.get("name","Radarr"), "url": _build_url(r), "api_key": r["apiKey"]}
                  for r in radarr_r.json()]
        sonarr = [{"id": s["id"], "name": s.get("name","Sonarr"), "url": _build_url(s), "api_key": s["apiKey"],
                   "anime": bool(s.get("animeSeriesType")) or "anime" in s.get("name","").lower()}
                  for s in sonarr_r.json()]
        return {"ok": True, "radarr": radarr, "sonarr": sonarr}
    except httpx.HTTPStatusError as e:
        return {"ok": False, "error": f"HTTP {e.response.status_code}"}
    except Exception as e:
        return {"ok": False, "error": str(e)[:120]}


@app.post("/api/setup/save")
async def setup_save(body: SetupConfig, background_tasks: BackgroundTasks) -> dict:
    if config.SETUP_COMPLETE:
        raise HTTPException(status_code=409, detail="Already configured.")
    try:
        config.write_config(body.model_dump(exclude_none=True))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Write failed: {e}")
    background_tasks.add_task(_do_reload)
    return {"ok": True}


@app.get("/api/setup/logs")
async def setup_logs() -> dict:
    """Return the last 80 lines of the error log for in-browser troubleshooting."""
    try:
        from pathlib import Path
        if not _LOG_FILE:
            return {"lines": [], "note": "No writable log location available."}
        p = Path(_LOG_FILE)
        if not p.exists():
            return {"lines": [], "note": "No error log yet — this is normal if nothing has gone wrong."}
        lines = p.read_text(errors="replace").splitlines()[-80:]
        return {"lines": lines, "path": str(p)}
    except Exception as exc:
        return {"lines": [], "error": str(exc)}


@app.get("/api/version")
async def version() -> dict:
    import datetime as _dt
    return {"setupComplete": config.SETUP_COMPLETE, "built": "2026-06-24"}


@app.get("/api/servarr/health")
async def servarr_health(plex_id: int = Depends(require_member)) -> dict:
    """Probe every configured Radarr/Sonarr instance so a calendar that's missing
    episode/release data has an obvious, actionable cause (unreachable URL, bad key)."""
    async def _probe(kind: str, inst: dict) -> dict:
        url = inst.get("url", "")
        try:
            async with httpx.AsyncClient(verify=False, timeout=8.0) as c:
                r = await c.get(f"{url}/api/v3/system/status",
                                headers={"X-Api-Key": inst.get("api_key", "")})
                r.raise_for_status()
                data = r.json()
            return {"kind": kind, "url": url, "ok": True, "version": data.get("version")}
        except httpx.HTTPStatusError as e:
            hint = "check the API key" if e.response.status_code in (401, 403) else "check the URL"
            return {"kind": kind, "url": url, "ok": False,
                    "error": f"HTTP {e.response.status_code} — {hint}"}
        except Exception as e:
            return {"kind": kind, "url": url, "ok": False,
                    "error": f"{type(e).__name__}: {str(e)[:140]} — the container can't reach this URL"}

    tasks = [_probe("radarr", i) for i in config.RADARR_INSTANCES]
    tasks += [_probe("sonarr-anime" if i.get("is_anime") else "sonarr", i)
              for i in config.SONARR_INSTANCES]
    results = await asyncio.gather(*tasks) if tasks else []
    return {"configured": len(results), "instances": results}


# --- Auth ---------------------------------------------------------------------
@app.get("/api/auth/plex/pin")
async def auth_pin(request: Request, response: Response) -> dict:
    if not _rate_ok("auth", _client_ip(request), 20, 60.0):
        raise HTTPException(status_code=429, detail="Too many attempts — give it a moment.")
    pin = await auth.create_pin()
    # Bind this PIN to the browser that started it (anti login-CSRF / fixation).
    response.set_cookie(config.PIN_NONCE_COOKIE, auth.sign_pin_nonce(pin["pinId"]),
                        max_age=config.PIN_NONCE_MAX_AGE, httponly=True,
                        secure=config.SESSION_SECURE, samesite="lax")
    return pin


@app.api_route("/api/auth/plex/callback", methods=["GET", "POST"])
async def auth_callback(pinId: int, request: Request, response: Response) -> dict:
    if not _rate_ok("auth", _client_ip(request), 60, 60.0):
        raise HTTPException(status_code=429, detail="Too many attempts — give it a moment.")
    # The PIN must match the nonce issued to THIS browser by /pin.
    nonce = request.cookies.get(config.PIN_NONCE_COOKIE)
    if not nonce or auth.read_pin_nonce(nonce) != int(pinId):
        raise HTTPException(status_code=400, detail="Invalid or expired sign-in attempt.")
    token = await auth.check_pin(pinId)
    if not token:
        return {"authenticated": False}
    user = await auth.fetch_plex_user(token)
    member = await seerr.get_user_by_plex_id(user["plexId"])
    if not member:
        raise HTTPException(status_code=403,
                            detail="This Plex account isn't authorized.")
    response.set_cookie(config.SESSION_COOKIE, auth.sign_session(user["plexId"]),
                        max_age=config.SESSION_MAX_AGE, httponly=True,
                        secure=config.SESSION_SECURE, samesite="lax")
    response.delete_cookie(config.PIN_NONCE_COOKIE)
    return {"authenticated": True, "me": _me(user["plexId"], member)}


@app.post("/api/auth/logout")
async def logout(response: Response) -> dict:
    response.delete_cookie(config.SESSION_COOKIE)
    return {"ok": True}


# --- Me / settings ------------------------------------------------------------
@app.get("/api/me", response_model=Me)
async def get_me(plex_id: int = Depends(require_member)) -> Me:
    return _me(plex_id, await seerr.get_user_by_plex_id(plex_id))


@app.delete("/api/me/data", response_model=OkResponse)
async def delete_my_data(plex_id: int = Depends(require_member)) -> OkResponse:
    await run_in_threadpool(db.delete_all_for, plex_id)
    return OkResponse()


@app.get("/api/settings", response_model=Settings)
async def get_settings(plex_id: int = Depends(require_member)) -> Settings:
    return Settings(**await run_in_threadpool(db.get_settings, plex_id))


@app.put("/api/settings", response_model=Settings)
async def put_settings(body: Settings,
                       plex_id: int = Depends(require_member)) -> Settings:
    return Settings(**await run_in_threadpool(db.upsert_settings, plex_id, body.model_dump()))


# --- Watchlist ----------------------------------------------------------------
@app.get("/api/watchlist", response_model=list[WatchlistItem])
async def get_watchlist(
    plex_id: int = Depends(require_member),
    past: int = Query(config.WATCHLIST_PAST_DAYS, ge=0, le=4015),
    future: int = Query(config.CAL_WINDOW_DAYS, ge=0, le=4015),
):
    if not _rate_ok("read", str(plex_id), 120, 60.0):
        raise HTTPException(status_code=429, detail="Slow down a moment.")
    items = await run_in_threadpool(db.list_watchlist, plex_id)
    today = dt.date.today()
    start = (today - dt.timedelta(days=past)).isoformat()
    end = (today + dt.timedelta(days=future)).isoformat()
    # Read-only: type reclassification happens in the background sweep, not here.
    return await servarr.attach_releases(items, start, end)


@app.post("/api/watchlist", response_model=OkResponse)
async def add_watchlist(body: AddWatchlistBody,
                        plex_id: int = Depends(require_member)) -> OkResponse:
    if not _rate_ok("write", str(plex_id), 60, 60.0):
        raise HTTPException(status_code=429, detail="Slow down a moment.")
    if await run_in_threadpool(db.count_watchlist, plex_id) >= config.WATCHLIST_MAX:
        raise HTTPException(status_code=409,
                            detail=f"Watchlist is full (max {config.WATCHLIST_MAX}).")
    d = await seerr.detail(body.type, body.tmdbId)
    # Authoritative anime flag (service first, language fallback) is computed in detail().
    media_type = "movie" if body.type == "movie" else ("anime" if d.get("is_anime") else "tv")
    item = {
        "tmdbId": body.tmdbId, "type": media_type, "title": d["title"], "year": d["year"],
        "posterUrl": d["posterUrl"], "backdropUrl": d["backdropUrl"],
        "overview": d["overview"], "tvdbId": d["tvdbId"], "status": d["status"],
        "nextDate": d["release_date"][:10] if d.get("release_date") else None,
        "runtime": d.get("runtime"), "seasonCount": d.get("season_count"),
    }
    now = dt.datetime.now(dt.timezone.utc).isoformat()
    await run_in_threadpool(db.add_watchlist, plex_id, item, now)
    return OkResponse()


@app.delete("/api/watchlist/{item_id}", response_model=OkResponse)
async def delete_watchlist(item_id: str,
                           plex_id: int = Depends(require_member)) -> OkResponse:
    if not await run_in_threadpool(db.remove_watchlist, plex_id, item_id):
        raise HTTPException(status_code=404, detail="Not on your watchlist")
    return OkResponse()


# --- Calendar -----------------------------------------------------------------
@app.get("/api/calendar", response_model=list[CalendarEvent])
async def get_calendar(plex_id: int = Depends(require_member),
                       start: str | None = None, end: str | None = None,
                       types: str | None = None):
    if not _rate_ok("read", str(plex_id), 120, 60.0):
        raise HTTPException(status_code=429, detail="Slow down a moment.")
    today = dt.date.today()
    start = _valid_date(start, today.isoformat())
    end = _valid_date(end, (today + dt.timedelta(days=config.CAL_WINDOW_DAYS)).isoformat())
    start, end = _clamp_window(start, end)
    type_list = [t.strip() for t in types.split(",")] if types else None
    items = await run_in_threadpool(db.list_watchlist, plex_id)
    return await servarr.build_events(items, start, end, type_list)


# --- Discover -----------------------------------------------------------------
@app.get("/api/discover")
async def get_discover(plex_id: int = Depends(require_member)):
    today = dt.date.today()
    month_start = today.replace(day=1).isoformat()
    if today.month == 12:
        month_end = today.replace(year=today.year + 1, month=1, day=1) - dt.timedelta(days=1)
    else:
        month_end = today.replace(month=today.month + 1, day=1) - dt.timedelta(days=1)
    anime_since = (today - dt.timedelta(days=90)).isoformat()
    data = await seerr.discover_this_month(month_start, month_end.isoformat(), anime_since)
    # Override onWatchlist from local DB so it matches what the calendar shows
    owned = {it["id"] for it in await run_in_threadpool(db.list_watchlist, plex_id)}
    for section in ("movies", "tv", "anime"):
        for r in data.get(section, []):
            r["onWatchlist"] = f"{r['type']}:{r['tmdbId']}" in owned
    return data


@app.post("/api/request", response_model=OkResponse)
async def post_request(body: RequestMediaBody, plex_id: int = Depends(require_member)):
    return await seerr.request_media(body.type, body.tmdbId)


# --- Seerr import -------------------------------------------------------------
_IMPORT_RETRY_DAYS = 14  # re-check unretrievable titles after this long

def _cooldown_lapsed(last_iso: str, now_dt: dt.datetime) -> bool:
    """True if a dead-import mark is old enough to re-check against Seerr."""
    try:
        last = dt.datetime.fromisoformat(last_iso)
    except (ValueError, TypeError):
        return True  # unparseable → re-check
    if last.tzinfo is None:
        last = last.replace(tzinfo=dt.timezone.utc)
    return (now_dt - last) >= dt.timedelta(days=_IMPORT_RETRY_DAYS)


@app.post("/api/import/seerr", response_model=ImportResult)
async def import_from_seerr(plex_id: int = Depends(require_member)) -> ImportResult:
    if not _rate_ok("import", str(plex_id), 2, 60.0):
        raise HTTPException(status_code=429, detail="Slow down a moment.")
    try:
        member = await seerr.get_user_by_plex_id(plex_id)
    except Exception as exc:
        log.warning("import: could not reach Seerr for user lookup — %s", exc)
        raise HTTPException(status_code=502, detail="Couldn't reach Seerr to look up your account. Check Seerr is online and try again.")
    if not member or not member.get("seerrId"):
        raise HTTPException(status_code=404, detail="Seerr account not linked.")
    try:
        requests = await seerr.fetch_user_requests(member["seerrId"])
    except Exception as exc:
        log.warning("import: could not fetch requests from Seerr — %s", exc)
        raise HTTPException(status_code=502, detail="Couldn't fetch your requests from Seerr. Check Seerr is online and try again.")
    current = await run_in_threadpool(db.list_watchlist, plex_id)
    existing = {f"{it['type']}:{it['tmdbId']}" for it in current}
    existing |= {f"movie:{it['tmdbId']}" for it in current} | {f"tv:{it['tmdbId']}" for it in current} | {f"anime:{it['tmdbId']}" for it in current}
    now_dt = dt.datetime.now(dt.timezone.utc)
    now = now_dt.isoformat()
    # Titles confirmed unretrievable recently: skipped during the cooldown, then
    # re-checked once so any that reappear on TMDB import automatically.
    dead = await run_in_threadpool(db.dead_import_ids)
    added = skipped = failed = 0
    for req in requests:
        mt, tmdb_id = req["type"], req["tmdbId"]
        if any(f"{t}:{tmdb_id}" in existing for t in ("movie", "tv", "anime")):
            skipped += 1
            continue
        last_dead = dead.get((mt, tmdb_id))
        if last_dead and not _cooldown_lapsed(last_dead, now_dt):
            continue  # known-dead, still in cooldown — skip silently, no Seerr call
        if await run_in_threadpool(db.count_watchlist, plex_id) >= config.WATCHLIST_MAX:
            break
        try:
            d = await seerr.detail(mt, tmdb_id)
            media_type = "movie" if mt == "movie" else ("anime" if d.get("is_anime") else "tv")
            item = {
                "tmdbId": tmdb_id, "type": media_type, "title": d["title"], "year": d["year"],
                "posterUrl": d["posterUrl"], "backdropUrl": d["backdropUrl"],
                "overview": d["overview"], "tvdbId": d["tvdbId"], "status": d["status"],
                "nextDate": d["release_date"][:10] if d.get("release_date") else None,
                "runtime": d.get("runtime"), "seasonCount": d.get("season_count"),
            }
            await run_in_threadpool(db.add_watchlist, plex_id, item, now)
            existing.add(f"{media_type}:{tmdb_id}")
            added += 1
            if last_dead:  # was dead, now retrievable — drop it from the skip-list
                await run_in_threadpool(db.clear_dead_import, mt, tmdb_id)
        except Exception as exc:
            # Seerr commonly 500s with "Unable to retrieve movie." for titles deleted
            # from TMDB. Remember it so we don't re-hit Seerr every import until the
            # cooldown lapses. Only counts/logs on first failure or a re-check.
            log.warning("import: could not retrieve tmdbId=%s type=%s — %s", tmdb_id, mt, exc)
            await run_in_threadpool(db.mark_dead_import, mt, tmdb_id, str(exc)[:200], now)
            failed += 1
    return ImportResult(added=added, skipped=skipped, failed=failed)


# --- Search (proxy to Seerr) --------------------------------------------------
@app.get("/api/search")
async def search(q: str, page: int = 1, plex_id: int = Depends(require_member)):
    if not _rate_ok("search", str(plex_id), 40, 60.0):
        raise HTTPException(status_code=429, detail="Too many searches — give it a moment.")
    q = q.strip()
    if len(q) < 2:
        return {"results": [], "page": 1, "totalPages": 1}
    page = min(max(1, int(page)), 20)  # clamp pagination
    data = await seerr.search(q, page)
    owned = {it["id"] for it in await run_in_threadpool(db.list_watchlist, plex_id)}
    for r in data["results"]:
        r["onWatchlist"] = f"{r['type']}:{r['tmdbId']}" in owned
    return data


# --- Static front-end (same-origin) -------------------------------------------
from fastapi.responses import FileResponse

_WEB_DIR = os.getenv("WEB_DIR", "/web")
_INDEX = os.path.join(_WEB_DIR, "ui_kits/bracket-calendar/index.html")


@app.get("/")
async def _root() -> RedirectResponse:
    return RedirectResponse(url="/view")


@app.get("/view")
async def _view() -> FileResponse:
    return FileResponse(_INDEX)


# Explicit asset subtrees only — avoids serving build tooling (e.g. build-deploy.sh)
# that lives in the web root. Mounted last so /api/*, /view, /healthz win.
for _sub in ("assets", "tokens", "ui_kits"):
    _d = os.path.join(_WEB_DIR, _sub)
    if os.path.isdir(_d):
        app.mount(f"/{_sub}", StaticFiles(directory=_d), name=_sub)


@app.get("/styles.css")
async def _styles() -> FileResponse:
    return FileResponse(os.path.join(_WEB_DIR, "styles.css"))


@app.get("/_ds_bundle.js")
async def _ds_bundle() -> FileResponse:
    return FileResponse(os.path.join(_WEB_DIR, "_ds_bundle.js"), media_type="application/javascript")


@app.get("/manifest.json")
async def _manifest() -> FileResponse:
    return FileResponse(os.path.join(_WEB_DIR, "manifest.json"), media_type="application/manifest+json")


@app.get("/favicon.ico")
async def _favicon() -> FileResponse:
    return FileResponse(os.path.join(_WEB_DIR, "assets/brand/bracket.svg"), media_type="image/svg+xml")
