"""Seerr client — identity (Plex users), search, and media detail.

Seerr (Jellyseerr/Overseerr fork) is the Plex-identity hub and the TMDB-backed
search source. Reached over the internal Traefik route with verify=False.
Shapes here feed the Bracket contract (status value 'library', type, etc.).
"""
import time
from datetime import date
from typing import Optional
from urllib.parse import quote

import httpx

from .. import config

_users_cache: dict = {"at": 0.0, "by_plex": {}}
_http: Optional[httpx.AsyncClient] = None


def open() -> None:
    global _http
    _http = httpx.AsyncClient(
        base_url=config.SEERR_URL,
        headers={"X-API-Key": config.SEERR_API_KEY},
        verify=(config.SEERR_CA_BUNDLE or config.SEERR_VERIFY_SSL),
        timeout=15,
    )


async def close() -> None:
    global _http
    if _http:
        await _http.aclose()
        _http = None


def poster_url(p: Optional[str]) -> Optional[str]:
    return config.TMDB_IMG_BASE + p if p else None


def backdrop_url(p: Optional[str]) -> Optional[str]:
    return config.TMDB_BACKDROP_BASE + p if p else None


def status_for(media_info: Optional[dict], release_date: Optional[str]) -> str:
    if media_info:
        s = media_info.get("status")
        if s == 5:
            return "library"
        if s in (2, 3, 4):
            return "requested"
    if release_date:
        try:
            if date.fromisoformat(release_date[:10]) <= date.today():
                return "released"
        except ValueError:
            pass
    return "announced"


async def list_users() -> dict:
    """Return {plexId(int) -> {plexId, plexUsername, displayName, avatarUrl, isAdmin}}."""
    now = time.monotonic()
    if _users_cache["by_plex"] and now - _users_cache["at"] < config.SEERR_USERS_TTL_SECONDS:
        return _users_cache["by_plex"]
    by_plex: dict = {}
    skip, take = 0, 50
    while True:
        r = await _http.get("/api/v1/user", params={"take": take, "skip": skip})
        r.raise_for_status()
        data = r.json()
        for u in data.get("results", []):
            pid = u.get("plexId")
            if pid is None:
                continue
            by_plex[int(pid)] = {
                "plexId": int(pid),
                "seerrId": int(u.get("id", 0)),
                "plexUsername": u.get("plexUsername") or u.get("username") or "",
                "displayName": u.get("displayName") or u.get("plexUsername") or "Member",
                "avatarUrl": u.get("avatar"),
                # Seerr user id 1 is the server owner/admin.
                "isAdmin": int(u.get("id", 0)) == 1,
            }
        page = data.get("pageInfo", {})
        if page.get("page", 1) >= page.get("pages", 1):
            break
        skip += take
    _users_cache.update(at=now, by_plex=by_plex)
    return by_plex


async def get_user_by_plex_id(plex_id: int) -> Optional[dict]:
    return (await list_users()).get(int(plex_id))


EAST_ASIAN_LANGS = {"ja", "ko", "zh", "cn"}


def tv_is_anime(genre_ids, original_language, service_id) -> bool:
    """Anime (East-Asian animation) vs western-animation 'Series'.
    The *arr service is authoritative: if the title is in a service, sonarr-anime
    => anime, regular Sonarr => series. When it isn't in any service yet, fall
    back to TMDB Animation genre (16) + an East-Asian original language."""
    if service_id is not None:
        return service_id in config.ANIME_SEERR_SERVICE_IDS
    return (16 in (genre_ids or set())) and (original_language in EAST_ASIAN_LANGS)


async def search(query: str, page: int = 1) -> dict:
    # Seerr requires %20-encoded spaces (rejects httpx's default '+'), so encode the
    # query ourselves rather than via params.
    r = await _http.get(f"/api/v1/search?query={quote(query, safe='')}&page={int(page)}")
    r.raise_for_status()
    data = r.json()
    out = []
    for it in data.get("results", []):
        mt = it.get("mediaType")
        if mt not in ("movie", "tv"):
            continue
        # Anime isn't a Seerr mediaType — classify East-Asian animation as anime
        # (service-authoritative, language fallback) so it groups/labels correctly.
        if mt == "tv" and tv_is_anime(it.get("genreIds"), it.get("originalLanguage"),
                                      (it.get("mediaInfo") or {}).get("serviceId")):
            mt = "anime"
        rel = it.get("releaseDate") or it.get("firstAirDate")
        out.append({
            "tmdbId": it["id"],
            "type": mt,
            "title": it.get("title") or it.get("name") or "Untitled",
            "year": int(rel[:4]) if rel and rel[:4].isdigit() else None,
            "posterUrl": poster_url(it.get("posterPath")),
            "overview": it.get("overview") or "",
        })
    return {"results": out, "page": data.get("page", page), "totalPages": data.get("totalPages", 1)}


async def detail(media_type: str, tmdb_id: int) -> dict:
    """movie/tv detail: title, year, poster, backdrop, overview, tvdbId, status, anime flag."""
    path = "/api/v1/movie/" if media_type == "movie" else "/api/v1/tv/"
    r = await _http.get(f"{path}{tmdb_id}")
    r.raise_for_status()
    d = r.json()
    if media_type == "movie":
        release, title, tvdb, is_anime = d.get("releaseDate"), d.get("title"), None, False
        runtime, season_count = d.get("runtime"), None
    else:
        release, title = d.get("firstAirDate"), d.get("name")
        tvdb = (d.get("externalIds") or {}).get("tvdbId")
        is_anime = tv_is_anime(
            {g.get("id") for g in d.get("genres", [])},
            d.get("originalLanguage"),
            (d.get("mediaInfo") or {}).get("serviceId"),
        )
        runtime, season_count = None, d.get("numberOfSeasons")
    return {
        "tmdbId": tmdb_id,
        "tvdbId": tvdb,
        "title": title or "Untitled",
        "year": int(release[:4]) if release and release[:4].isdigit() else None,
        "posterUrl": poster_url(d.get("posterPath")),
        "backdropUrl": backdrop_url(d.get("backdropPath")),
        "overview": d.get("overview") or "",
        "status": status_for(d.get("mediaInfo"), release),
        "release_date": release,
        "is_anime": is_anime,
        "service_id": (d.get("mediaInfo") or {}).get("serviceId"),
        "runtime": runtime,
        "season_count": season_count,
    }


async def fetch_user_requests(seerr_id: int) -> list[dict]:
    """Return [{type, tmdbId}] for all requests made by this Seerr user (up to 200)."""
    results: list[dict] = []
    skip, take = 0, 50
    while True:
        r = await _http.get("/api/v1/request", params={
            "take": take, "skip": skip, "filter": "all",
            "requestedBy": seerr_id, "sort": "added",
        })
        r.raise_for_status()
        data = r.json()
        for req in data.get("results", []):
            media = req.get("media") or {}
            mt = req.get("type") or media.get("mediaType")
            tmdb_id = media.get("tmdbId")
            if mt in ("movie", "tv") and tmdb_id:
                results.append({"type": mt, "tmdbId": int(tmdb_id)})
        page = data.get("pageInfo", {})
        if not data.get("results") or page.get("page", 1) >= page.get("pages", 1):
            break
        skip += take
        if len(results) >= 200:
            break
    return results


def _seerr_url(media_type: str, tmdb_id: int) -> str:
    seg = "movie" if media_type == "movie" else "tv"
    return f"{config.SEERR_PUBLIC_URL}/{seg}/{tmdb_id}"


def _tv_entry(it: dict, force_type: str | None = None) -> dict:
    air = it.get("firstAirDate")
    is_a = tv_is_anime(
        it.get("genreIds"),
        it.get("originalLanguage"),
        (it.get("mediaInfo") or {}).get("serviceId"),
    )
    t = force_type or ("anime" if is_a else "tv")
    return {
        "tmdbId": it["id"],
        "type": t,
        "title": it.get("name") or "Untitled",
        "year": int(air[:4]) if air and air[:4].isdigit() else None,
        "releaseDate": air,
        "posterUrl": poster_url(it.get("posterPath")),
        "overview": it.get("overview") or "",
        "onWatchlist": bool((it.get("mediaInfo") or {}).get("status")),
        "inLibrary": (it.get("mediaInfo") or {}).get("status") in (4, 5),
        "isRequested": (it.get("mediaInfo") or {}).get("status") in (2, 3),
        "seerrUrl": _seerr_url(t, it["id"]),
        "_genres": it.get("genreIds") or [],
        "_lang": it.get("originalLanguage") or "",
    }


async def discover_this_month(month_start: str, month_end: str, anime_since: str) -> dict:
    """Movies/series this month + anime from last 90 days, all sorted newest-first."""
    movies_r = await _http.get("/api/v1/discover/movies", params={
        "primaryReleaseDateGte": month_start,
        "primaryReleaseDateLte": month_end,
        "sortBy": "primaryReleaseDateDesc",
        "page": 1,
    })
    movies_r.raise_for_status()

    # Series: general TV this month (we exclude animation genre=16 below)
    tv_r = await _http.get("/api/v1/discover/tv", params={
        "firstAirDateGte": month_start,
        "firstAirDateLte": month_end,
        "sortBy": "firstAirDateDesc",
        "page": 1,
    })
    tv_r.raise_for_status()

    # Anime: animation (genre=16) over the last 90 days — anime seasons don't
    # align with calendar months so a wider window surfaces actual content.
    anim_r = await _http.get("/api/v1/discover/tv", params={
        "firstAirDateGte": anime_since,
        "firstAirDateLte": month_end,
        "sortBy": "firstAirDateDesc",
        "genre": "16",
        "page": 1,
    })
    anim_r.raise_for_status()

    movies = []
    for it in movies_r.json().get("results", []):
        rel = it.get("releaseDate")
        movies.append({
            "tmdbId": it["id"],
            "type": "movie",
            "title": it.get("title") or "Untitled",
            "year": int(rel[:4]) if rel and rel[:4].isdigit() else None,
            "releaseDate": rel,
            "posterUrl": poster_url(it.get("posterPath")),
            "overview": it.get("overview") or "",
            "onWatchlist": bool((it.get("mediaInfo") or {}).get("status")),
            "inLibrary": (it.get("mediaInfo") or {}).get("status") in (4, 5),
            "isRequested": (it.get("mediaInfo") or {}).get("status") in (2, 3),
            "seerrUrl": _seerr_url("movie", it["id"]),
        })

    # Series: TV this month, skip animation (genre 16) — those surface via anime fetch
    tv_shows: list = []
    for it in tv_r.json().get("results", []):
        if 16 in (it.get("genreIds") or []):
            continue
        e = _tv_entry(it)
        if e["type"] == "tv":
            tv_shows.append({k: v for k, v in e.items() if not k.startswith("_")})

    # Anime: East-Asian animation from the wider window
    seen: set = set()
    anime: list = []
    for it in anim_r.json().get("results", []):
        e = _tv_entry(it)
        if e["_lang"] not in EAST_ASIAN_LANGS:
            continue
        if e["tmdbId"] in seen:
            continue
        seen.add(e["tmdbId"])
        anime.append({k: v for k, v in e.items() if not k.startswith("_")})

    return {"movies": movies[:10], "tv": tv_shows[:10], "anime": anime[:10]}


async def request_media(media_type: str, tmdb_id: int) -> dict:
    seerr_type = "movie" if media_type == "movie" else "tv"
    r = await _http.post("/api/v1/request", json={"mediaType": seerr_type, "mediaId": tmdb_id})
    if not r.is_success:
        try:
            body = r.json()
            msg = body.get("message") or body.get("detail") or ""
        except Exception:
            msg = r.text[:200]
        raise SeerrRequestError(r.status_code, msg)
    return {"ok": True}


class SeerrRequestError(Exception):
    def __init__(self, status: int, message: str):
        self.status = status
        self.message = message
        super().__init__(message)
