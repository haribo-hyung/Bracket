"""Servarr calendar aggregation — release/air dates for watchlist items.

Pulls Radarr (movies) + Sonarr (tv) + sonarr-anime (anime) /api/v3/calendar, indexes
by tmdbId / tvdbId, and produces per-item releases[] (for /api/watchlist) or flattened
CalendarEvent[] (for /api/calendar), matching the Bracket contract shapes.

The upstream fetch always uses a CANONICAL month-snapped window (not the caller's exact
dates), so the cache key only changes monthly — this stops the old daily-drift cache
busting and the unbounded never-evicted cache, and means one fetch serves every request.
Callers pass their requested [start, end]; results are sliced to it in memory.
"""
import asyncio
import datetime as dt
import logging
import time
from typing import Optional

import httpx

from .. import config

log = logging.getLogger("bracket")

_cal_cache: dict = {}  # "cstart|cend" -> {at, movies, eps_tv, eps_anime}
_CACHE_MAX = 4         # bounded; canonical keys change ~monthly so this is plenty

_radarr_clients: list[httpx.AsyncClient] = []
_sonarr_clients: list[httpx.AsyncClient] = []
_anime_clients: list[httpx.AsyncClient] = []


def open() -> None:
    global _radarr_clients, _sonarr_clients, _anime_clients
    for inst in config.RADARR_INSTANCES:
        if inst.get("api_key"):
            _radarr_clients.append(httpx.AsyncClient(
                base_url=inst["url"], timeout=20,
                headers={"X-Api-Key": inst["api_key"]}))
    for inst in config.SONARR_INSTANCES:
        if not inst.get("api_key"):
            continue
        c = httpx.AsyncClient(base_url=inst["url"], timeout=20,
                              headers={"X-Api-Key": inst["api_key"]})
        ((_anime_clients if inst.get("is_anime") else _sonarr_clients).append(c))


async def close() -> None:
    global _radarr_clients, _sonarr_clients, _anime_clients
    for c in [*_radarr_clients, *_sonarr_clients, *_anime_clients]:
        await c.aclose()
    _radarr_clients = _sonarr_clients = _anime_clients = []


async def _get(client: httpx.AsyncClient, params: dict) -> list:
    r = await client.get("/api/v3/calendar", params=params)
    r.raise_for_status()
    return r.json()


def _in(d: Optional[str], start: str, end: str) -> bool:
    return bool(d) and start <= d[:10] <= end


def _month_floor(d: dt.date) -> dt.date:
    return d.replace(day=1)


def _month_ceil(d: dt.date) -> dt.date:
    nxt = d.replace(year=d.year + 1, month=1, day=1) if d.month == 12 else d.replace(month=d.month + 1, day=1)
    return nxt - dt.timedelta(days=1)


def _canonical_window() -> tuple[str, str]:
    """Month-snapped window for the *arr calendar fetch. Stable for a month.

    The past reach is capped (SERVARR_CAL_PAST_DAYS) independently of the much
    larger WATCHLIST_PAST_DAYS: a Sonarr /calendar?includeSeries query returns
    every aired episode in range with the full series object repeated per row, so
    a multi-year past window is hundreds of MB and times out / OOMs — leaving the
    calendar empty. A release calendar only needs recent-past + upcoming.
    """
    today = dt.date.today()
    cstart = _month_floor(today - dt.timedelta(days=config.SERVARR_CAL_PAST_DAYS))
    cend = _month_ceil(today + dt.timedelta(days=config.SERVARR_CAL_FUTURE_DAYS))
    return cstart.isoformat(), cend.isoformat()


async def _fetch_radarr(client: httpx.AsyncClient, start: str, end: str) -> dict:
    try:
        rows = await _get(client, {"start": start, "end": end})
    except Exception as exc:
        log.warning("radarr calendar fetch failed (%s): %s: %s",
                    client.base_url, type(exc).__name__, exc)
        return {}
    idx: dict[int, list] = {}
    for m in rows:
        tmdb = m.get("tmdbId")
        if not tmdb:
            continue
        for field, kind in (("inCinemas", "theatrical"), ("digitalRelease", "digital"),
                            ("physicalRelease", "physical")):
            d = m.get(field)
            if _in(d, start, end):
                idx.setdefault(tmdb, []).append((d[:10], kind))
    return idx


async def _fetch_sonarr(client: httpx.AsyncClient, start: str, end: str) -> dict:
    try:
        rows = await _get(client, {"start": start, "end": end, "includeSeries": "true"})
    except Exception as exc:
        log.warning("sonarr calendar fetch failed (%s): %s: %s",
                    client.base_url, type(exc).__name__, exc)
        return {}
    idx: dict[int, list] = {}
    for ep in rows:
        tvdb = (ep.get("series") or {}).get("tvdbId")
        air = ep.get("airDateUtc") or ep.get("airDate")
        if not tvdb or not _in(air, start, end):
            continue
        idx.setdefault(tvdb, []).append(
            (air, ep.get("seasonNumber"), ep.get("episodeNumber"), ep.get("title"))
        )
    return idx


async def _radarr_index(start: str, end: str) -> dict:
    if not _radarr_clients:
        return {}
    parts = await asyncio.gather(*[_fetch_radarr(c, start, end) for c in _radarr_clients])
    merged: dict[int, list] = {}
    for p in parts:
        for tmdb, entries in p.items():
            merged.setdefault(tmdb, []).extend(entries)
    return merged


async def _sonarr_index(clients: list, start: str, end: str) -> dict:
    if not clients:
        return {}
    parts = await asyncio.gather(*[_fetch_sonarr(c, start, end) for c in clients])
    merged: dict[int, list] = {}
    for p in parts:
        for tvdb, entries in p.items():
            merged.setdefault(tvdb, []).extend(entries)
    return merged


async def _indices() -> dict:
    """Canonical (month-snapped) indices, cached ~monthly and bounded."""
    cstart, cend = _canonical_window()
    k = f"{cstart}|{cend}"
    now = time.monotonic()
    ent = _cal_cache.get(k)
    if ent and now - ent["at"] < config.CALENDAR_TTL_SECONDS:
        return ent
    movies, eps_tv, eps_anime = await asyncio.gather(
        _radarr_index(cstart, cend),
        _sonarr_index(_sonarr_clients, cstart, cend),
        _sonarr_index(_anime_clients, cstart, cend),
    )
    ent = {"at": now, "movies": movies, "eps_tv": eps_tv, "eps_anime": eps_anime}
    _cal_cache[k] = ent
    # Bound the cache (old monthly keys fall out).
    if len(_cal_cache) > _CACHE_MAX:
        for old in sorted(_cal_cache, key=lambda kk: _cal_cache[kk]["at"])[:-_CACHE_MAX]:
            _cal_cache.pop(old, None)
    return ent


def _releases_for(item: dict, idx: dict, start: str, end: str) -> list[dict]:
    """ReleaseDate[] (Bracket shape) for a single watchlist item, sliced to [start, end]."""
    mt, tmdb = item["type"], item["tmdbId"]
    rels: list[dict] = []
    if mt == "movie":
        for d, kind in idx["movies"].get(tmdb, []):
            if _in(d, start, end):
                rels.append({"kind": kind, "date": d})
        if not rels and _in(item.get("nextDate"), start, end):
            rels.append({"kind": "theatrical", "date": item["nextDate"][:10]})
    else:
        tvdb = item.get("tvdbId")
        if tvdb:
            entries = idx["eps_anime"].get(tvdb) if mt == "anime" else idx["eps_tv"].get(tvdb)
            entries = entries or idx["eps_tv"].get(tvdb) or idx["eps_anime"].get(tvdb) or []
            for air, season, ep, ep_title in entries:
                if not _in(air, start, end):
                    continue
                rels.append({"kind": "episode", "date": air, "season": season,
                             "episode": ep, "episodeTitle": ep_title})
        # Fallback: no Sonarr configured — use TMDB next-air date so the show
        # at least appears on the calendar until episode-level data is available.
        if not rels and _in(item.get("nextDate"), start, end):
            rels.append({"kind": "episode", "date": item["nextDate"][:10]})
    rels.sort(key=lambda r: r["date"])
    return rels


def _next_date(rels: list[dict]) -> Optional[str]:
    today = dt.date.today().isoformat()
    for r in rels:
        if r["date"][:10] >= today:
            return r["date"]
    return None


def _service_type(tvdb, idx: dict) -> Optional[str]:
    """Which Sonarr instance currently carries this series (authoritative anime flag)."""
    if not tvdb:
        return None
    if idx["eps_anime"].get(tvdb):
        return "anime"
    if idx["eps_tv"].get(tvdb):
        return "tv"
    return None


async def attach_releases(items: list[dict], start: str, end: str,
                          on_retype=None) -> list[dict]:
    idx = await _indices()
    for it in items:
        # Off-request reconcile (the sweep) passes on_retype; the GET path passes None
        # so it stays read-only. Type correction now happens in the background sweep.
        if on_retype and it["type"] in ("tv", "anime") and it.get("tvdbId"):
            svc = _service_type(it["tvdbId"], idx)
            if svc and svc != it["type"]:
                old = it["type"]
                it["type"] = svc
                it["id"] = f'{svc}:{it["tmdbId"]}'
                on_retype(it["tmdbId"], old, svc)
        rels = _releases_for(it, idx, start, end)
        it["releases"] = rels
        it["nextDate"] = _next_date(rels)
    return items


def _label(r: dict) -> str:
    if r["kind"] == "episode":
        base = f"S{r.get('season', 0):02d}E{r.get('episode', 0):02d}"
        return f"{base} · {r['episodeTitle']}" if r.get("episodeTitle") else base
    return r["kind"][:1].upper() + r["kind"][1:]


async def build_events(items: list[dict], start: str, end: str,
                       types: Optional[list[str]] = None) -> list[dict]:
    idx = await _indices()
    events: list[dict] = []
    for it in items:
        if types and it["type"] not in types:
            continue
        for r in _releases_for(it, idx, start, end):
            is_ep = r["kind"] == "episode"
            events.append({
                "id": f"{it['id']}-{r['kind']}-{r['date']}-{r.get('episode') or ''}",
                "itemId": it["id"],
                "type": it["type"],
                "title": it["title"],
                "posterUrl": it.get("posterUrl"),
                "start": r["date"],
                "allDay": not is_ep,
                "releaseKind": r["kind"],
                "label": _label(r),
            })
    events.sort(key=lambda e: e["start"])
    return events


async def service_types() -> dict:
    """tvdbId -> 'anime'|'tv' from the canonical indices (used by the reconcile sweep)."""
    idx = await _indices()
    out: dict = {}
    for tvdb in idx["eps_anime"]:
        out[tvdb] = "anime"
    for tvdb in idx["eps_tv"]:
        out.setdefault(tvdb, "tv")
    return out
