"""SQLite store for the custom Watchlist + per-user settings.

Keyed on the stable Plex identity (plexId). Emits the Bracket WatchlistItem shape
(type, seerrUrl, backdropUrl, status 'library', releases attached downstream).
"""
import json
import os
import sqlite3
import threading
from typing import Optional

from . import config

_lock = threading.Lock()
_db_conn: Optional[sqlite3.Connection] = None


def _get_conn() -> sqlite3.Connection:
    global _db_conn
    if _db_conn is None:
        os.makedirs(os.path.dirname(config.DB_PATH), exist_ok=True)
        _db_conn = sqlite3.connect(config.DB_PATH, timeout=10, check_same_thread=False)
        _db_conn.row_factory = sqlite3.Row
        _db_conn.execute("PRAGMA journal_mode=WAL;")
        _db_conn.execute("PRAGMA synchronous=NORMAL;")
        _db_conn.execute("PRAGMA busy_timeout=10000;")
    return _db_conn


def init_db() -> None:
    with _lock, _get_conn() as c:
        c.executescript(
            """
            CREATE TABLE IF NOT EXISTS watchlist (
                plex_id     INTEGER NOT NULL,
                tmdb_id     INTEGER NOT NULL,
                media_type  TEXT    NOT NULL,
                title       TEXT    NOT NULL,
                year        INTEGER,
                poster_url  TEXT,
                backdrop_url TEXT,
                overview    TEXT NOT NULL DEFAULT '',
                tvdb_id     INTEGER,
                status      TEXT    NOT NULL DEFAULT 'announced',
                next_date   TEXT,
                runtime     INTEGER,
                season_count INTEGER,
                added_at    TEXT    NOT NULL,
                PRIMARY KEY (plex_id, tmdb_id, media_type)
            );
            CREATE INDEX IF NOT EXISTS idx_wl_plex ON watchlist(plex_id);
            CREATE INDEX IF NOT EXISTS idx_wl_plex_added ON watchlist(plex_id, added_at DESC);

            CREATE TABLE IF NOT EXISTS user_settings (
                plex_id       INTEGER PRIMARY KEY,
                default_view  TEXT NOT NULL DEFAULT 'month',
                timezone      TEXT NOT NULL DEFAULT 'Europe/London',
                theme         TEXT NOT NULL DEFAULT 'system',
                default_types TEXT NOT NULL DEFAULT '["movie","tv","anime"]'
            );

            -- Titles that proved unretrievable from Seerr/TMDB (e.g. deleted from
            -- TMDB). Global: a dead TMDB id is dead for everyone. Skipped on import
            -- without re-hitting Seerr, so they cause no repeated 500s or log noise.
            CREATE TABLE IF NOT EXISTS import_skip (
                media_type TEXT    NOT NULL,
                tmdb_id    INTEGER NOT NULL,
                reason     TEXT,
                at         TEXT    NOT NULL,
                PRIMARY KEY (media_type, tmdb_id)
            );
            """
        )
        _wl_cols = {row[1] for row in c.execute("PRAGMA table_info(watchlist)").fetchall()}
        for _col, _ddl in (("runtime", "runtime INTEGER"), ("season_count", "season_count INTEGER")):
            if _col not in _wl_cols:
                c.execute(f"ALTER TABLE watchlist ADD COLUMN {_ddl}")
        _s_cols = {row[1] for row in c.execute("PRAGMA table_info(user_settings)").fetchall()}
        for _col, _ddl in (
            ("week_start_day",         "week_start_day TEXT NOT NULL DEFAULT 'monday'"),
            ("dropping_soon_days",     "dropping_soon_days INTEGER NOT NULL DEFAULT 14"),
            ("calendar_past_days",     "calendar_past_days INTEGER NOT NULL DEFAULT 365"),
            ("calendar_future_days",   "calendar_future_days INTEGER NOT NULL DEFAULT 730"),
            ("hide_released",          "hide_released INTEGER NOT NULL DEFAULT 0"),
            ("hide_unaired_seasons",   "hide_unaired_seasons INTEGER NOT NULL DEFAULT 0"),
            ("confirm_request",        "confirm_request INTEGER NOT NULL DEFAULT 0"),
            ("discover_default_types", "discover_default_types TEXT NOT NULL DEFAULT '[\"movie\",\"tv\",\"anime\"]'"),
        ):
            if _col not in _s_cols:
                c.execute(f"ALTER TABLE user_settings ADD COLUMN {_ddl}")


def dead_import_ids() -> dict:
    """Map {(media_type, tmdb_id): last_failed_iso} for unretrievable titles.

    The caller applies a cooldown: skip while recent, re-check once it lapses so
    titles that reappear on TMDB (e.g. an upcoming film that finally gets an
    entry) import automatically — see clear_dead_import for the success path.
    """
    with _lock, _get_conn() as c:
        rows = c.execute("SELECT media_type, tmdb_id, at FROM import_skip").fetchall()
    return {(r["media_type"], r["tmdb_id"]): r["at"] for r in rows}


def mark_dead_import(media_type: str, tmdb_id: int, reason: str, at: str) -> None:
    with _lock, _get_conn() as c:
        c.execute(
            """INSERT INTO import_skip (media_type, tmdb_id, reason, at) VALUES (?,?,?,?)
               ON CONFLICT(media_type, tmdb_id) DO UPDATE SET
                 reason=excluded.reason, at=excluded.at""",
            (media_type, tmdb_id, reason, at),
        )


def clear_dead_import(media_type: str, tmdb_id: int) -> None:
    """Drop a title from the skip-list once it's retrievable again."""
    with _lock, _get_conn() as c:
        c.execute("DELETE FROM import_skip WHERE media_type=? AND tmdb_id=?",
                  (media_type, tmdb_id))


def item_id(media_type: str, tmdb_id: int) -> str:
    return f"{media_type}:{tmdb_id}"


def _seerr_url(media_type: str, tmdb_id: int) -> str:
    seg = "movie" if media_type == "movie" else "tv"
    return f"{config.SEERR_PUBLIC_URL}/{seg}/{tmdb_id}"


def _row_to_item(r: sqlite3.Row) -> dict:
    mt = r["media_type"]
    return {
        "id": item_id(mt, r["tmdb_id"]),
        "tmdbId": r["tmdb_id"],
        "tvdbId": r["tvdb_id"],          # internal; ignored by the TS type
        "type": mt,
        "title": r["title"],
        "year": r["year"],
        "posterUrl": r["poster_url"],
        "backdropUrl": r["backdrop_url"],
        "overview": r["overview"] or "",
        "status": r["status"],
        "releases": [],                  # attached by servarr.attach_releases
        "nextDate": r["next_date"],
        "runtime": r["runtime"],
        "seasonCount": r["season_count"],
        "seerrUrl": _seerr_url(mt, r["tmdb_id"]),
        "addedAt": r["added_at"],
    }


def retype_item(plex_id: int, tmdb_id: int, old_type: str, new_type: str) -> None:
    """Move a watchlist row to a new media_type (anime<->tv) without ever clobbering
    a legitimately-distinct sibling row. If the target type already exists for this
    (plex_id, tmdb_id), drop the stale source row instead of overwriting."""
    if old_type == new_type:
        return
    with _lock, _get_conn() as c:
        target = c.execute(
            "SELECT 1 FROM watchlist WHERE plex_id=? AND tmdb_id=? AND media_type=?",
            (plex_id, tmdb_id, new_type),
        ).fetchone()
        if target:
            c.execute("DELETE FROM watchlist WHERE plex_id=? AND tmdb_id=? AND media_type=?",
                      (plex_id, tmdb_id, old_type))
        else:
            c.execute("UPDATE watchlist SET media_type=? WHERE plex_id=? AND tmdb_id=? AND media_type=?",
                      (new_type, plex_id, tmdb_id, old_type))


def count_watchlist(plex_id: int) -> int:
    with _lock, _get_conn() as c:
        return c.execute("SELECT COUNT(*) FROM watchlist WHERE plex_id=?", (plex_id,)).fetchone()[0]


def all_watchlist_rows() -> list[dict]:
    """(plex_id, tmdb_id, media_type, tvdb_id) for every row — for the off-request reconcile sweep."""
    with _lock, _get_conn() as c:
        rows = c.execute("SELECT plex_id, tmdb_id, media_type, tvdb_id FROM watchlist").fetchall()
    return [dict(r) for r in rows]


def delete_all_for(plex_id: int) -> int:
    with _lock, _get_conn() as c:
        cur = c.execute("DELETE FROM watchlist WHERE plex_id=?", (plex_id,))
        c.execute("DELETE FROM user_settings WHERE plex_id=?", (plex_id,))
        return cur.rowcount


def list_watchlist(plex_id: int) -> list[dict]:
    with _lock, _get_conn() as c:
        rows = c.execute("SELECT * FROM watchlist WHERE plex_id=? ORDER BY added_at DESC",
                         (plex_id,)).fetchall()
    return [_row_to_item(r) for r in rows]


def add_watchlist(plex_id: int, item: dict, added_at: str) -> dict:
    with _lock, _get_conn() as c:
        c.execute(
            """INSERT INTO watchlist
               (plex_id, tmdb_id, media_type, title, year, poster_url, backdrop_url,
                overview, tvdb_id, status, next_date, runtime, season_count, added_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
               ON CONFLICT(plex_id, tmdb_id, media_type) DO UPDATE SET
                 title=excluded.title, year=excluded.year, poster_url=excluded.poster_url,
                 backdrop_url=excluded.backdrop_url, overview=excluded.overview,
                 tvdb_id=excluded.tvdb_id, status=excluded.status,
                 next_date=excluded.next_date, runtime=excluded.runtime,
                 season_count=excluded.season_count""",
            (plex_id, item["tmdbId"], item["type"], item["title"], item.get("year"),
             item.get("posterUrl"), item.get("backdropUrl"), item.get("overview") or "",
             item.get("tvdbId"), item.get("status", "announced"), item.get("nextDate"),
             item.get("runtime"), item.get("seasonCount"), added_at),
        )
        r = c.execute("SELECT * FROM watchlist WHERE plex_id=? AND tmdb_id=? AND media_type=?",
                      (plex_id, item["tmdbId"], item["type"])).fetchone()
    return _row_to_item(r)


def remove_watchlist(plex_id: int, the_id: str) -> bool:
    try:
        media_type, tmdb = the_id.split(":", 1)
        tmdb_id = int(tmdb)
    except (ValueError, AttributeError):
        return False
    with _lock, _get_conn() as c:
        cur = c.execute("DELETE FROM watchlist WHERE plex_id=? AND tmdb_id=? AND media_type=?",
                        (plex_id, tmdb_id, media_type))
        return cur.rowcount > 0


def get_settings(plex_id: int) -> dict:
    with _lock, _get_conn() as c:
        r = c.execute("SELECT * FROM user_settings WHERE plex_id=?", (plex_id,)).fetchone()
    if not r:
        # No per-user row yet → fall back to the config.yml global_settings defaults.
        g = config.GLOBAL_SETTINGS
        return {**g, "defaultTypes": list(g["defaultTypes"]),
                "discoverDefaultTypes": list(g["discoverDefaultTypes"])}
    return {
        "defaultView": r["default_view"],
        "timezone": r["timezone"],
        "theme": r["theme"],
        "defaultTypes": json.loads(r["default_types"]),
        "weekStartDay": r["week_start_day"],
        "droppingSoonDays": r["dropping_soon_days"],
        "calendarPastDays": r["calendar_past_days"],
        "calendarFutureDays": r["calendar_future_days"],
        "hideReleased": bool(r["hide_released"]),
        "hideUnairedSeasons": bool(r["hide_unaired_seasons"]),
        "confirmRequest": bool(r["confirm_request"]),
        "discoverDefaultTypes": json.loads(r["discover_default_types"]),
    }


def upsert_settings(plex_id: int, s: dict) -> dict:
    with _lock, _get_conn() as c:
        c.execute(
            """INSERT INTO user_settings
               (plex_id, default_view, timezone, theme, default_types,
                week_start_day, dropping_soon_days, calendar_past_days, calendar_future_days,
                hide_released, hide_unaired_seasons, confirm_request, discover_default_types)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
               ON CONFLICT(plex_id) DO UPDATE SET
                 default_view=excluded.default_view, timezone=excluded.timezone,
                 theme=excluded.theme, default_types=excluded.default_types,
                 week_start_day=excluded.week_start_day,
                 dropping_soon_days=excluded.dropping_soon_days,
                 calendar_past_days=excluded.calendar_past_days,
                 calendar_future_days=excluded.calendar_future_days,
                 hide_released=excluded.hide_released,
                 hide_unaired_seasons=excluded.hide_unaired_seasons,
                 confirm_request=excluded.confirm_request,
                 discover_default_types=excluded.discover_default_types""",
            (plex_id, s["defaultView"], s["timezone"], s["theme"],
             json.dumps(s["defaultTypes"]), s["weekStartDay"],
             s["droppingSoonDays"], s["calendarPastDays"], s["calendarFutureDays"],
             int(s["hideReleased"]), int(s["hideUnairedSeasons"]), int(s["confirmRequest"]),
             json.dumps(s["discoverDefaultTypes"])),
        )
    return get_settings(plex_id)
