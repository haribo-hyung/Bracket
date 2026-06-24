"""Environment-driven configuration for bracket-api.

Priority: environment variables > /app/config/config.yml > defaults.
The config file is written by the first-run setup wizard and lives in the
mounted config volume. Env vars always take precedence for advanced users.
"""
import os
import secrets
import uuid
from pathlib import Path


CONFIG_FILE = Path(os.getenv("CONFIG_FILE", "/app/config/config.yml"))


def _load_yaml() -> dict:
    if not CONFIG_FILE.exists():
        return {}
    try:
        import yaml
        return yaml.safe_load(CONFIG_FILE.read_text()) or {}
    except Exception:
        return {}


_c = _load_yaml()


def _e(key: str, *path: str, default: str = "") -> str:
    v = os.getenv(key)
    if v is None:
        d = _c
        for k in path:
            if not isinstance(d, dict):
                d = None
                break
            d = d.get(k)
        v = str(d) if d is not None and d != {} else default
    return v.rstrip("/") if "URL" in key else v


def _b(key: str, *path: str, default: bool = False) -> bool:
    v = os.getenv(key)
    if v is not None:
        return v.lower() in ("1", "true", "yes", "on")
    d = _c
    for k in path:
        if not isinstance(d, dict):
            return default
        d = d.get(k)
    return bool(d) if isinstance(d, bool) else default


def _i(key: str, *path: str, default: int = 0) -> int:
    v = os.getenv(key)
    if v is not None:
        try:
            return int(v)
        except (ValueError, TypeError):
            return default
    d = _c
    for k in path:
        if not isinstance(d, dict):
            return default
        d = d.get(k)
    try:
        return int(d) if d is not None else default
    except (ValueError, TypeError):
        return default


def _instances(section: str) -> list[dict]:
    """Return list of service instances; normalises dict→[dict] for backward compat."""
    raw = _c.get(section)
    if isinstance(raw, list):
        return [
            {**i, "url": (i.get("url") or "").rstrip("/")}
            for i in raw if isinstance(i, dict) and i.get("url")
        ]
    if isinstance(raw, dict) and raw.get("url"):
        return [{**raw, "url": raw["url"].rstrip("/")}]
    return []


# --- Seerr -------------------------------------------------------------------
SEERR_URL        = _e("SEERR_URL",        "seerr", "url")
SEERR_API_KEY    = _e("SEERR_API_KEY",    "seerr", "api_key")
SEERR_PUBLIC_URL = _e("SEERR_PUBLIC_URL", "seerr", "public_url")
SEERR_VERIFY_SSL = _b("SEERR_VERIFY_SSL", "seerr", "verify_ssl")
SEERR_CA_BUNDLE  = _e("SEERR_CA_BUNDLE",  "seerr", "ca_bundle")
WATCHLIST_PAST_DAYS = _i("WATCHLIST_PAST_DAYS", "watchlist_past_days", default=3650)

# --- Servarr — multi-instance ------------------------------------------------
RADARR_INSTANCES: list[dict] = _instances("radarr")
if not RADARR_INSTANCES:
    _ru, _rk = os.getenv("RADARR_URL", "").rstrip("/"), os.getenv("RADARR_API_KEY", "")
    if _ru and _rk:
        RADARR_INSTANCES = [{"url": _ru, "api_key": _rk}]

SONARR_INSTANCES: list[dict] = _instances("sonarr")
# Merge legacy top-level sonarr_anime section
for _ai in _instances("sonarr_anime"):
    _ai.setdefault("is_anime", True)
    if not any(i.get("url") == _ai["url"] for i in SONARR_INSTANCES):
        SONARR_INSTANCES.append(_ai)
# Legacy single env vars
if not SONARR_INSTANCES:
    _su, _sk = os.getenv("SONARR_URL", "").rstrip("/"), os.getenv("SONARR_API_KEY", "")
    if _su and _sk:
        SONARR_INSTANCES.append({"url": _su, "api_key": _sk, "is_anime": False})
_au, _ak = os.getenv("ANIME_URL", "").rstrip("/"), os.getenv("ANIME_API_KEY", "")
if _au and _ak and not any(i.get("url") == _au for i in SONARR_INSTANCES):
    SONARR_INSTANCES.append({"url": _au, "api_key": _ak, "is_anime": True})

# Service IDs that map to anime in Seerr (for tv_is_anime detection)
ANIME_SEERR_SERVICE_IDS: set[int] = {
    int(i["seerr_service_id"])
    for i in SONARR_INSTANCES
    if i.get("is_anime") and i.get("seerr_service_id")
}
if not ANIME_SEERR_SERVICE_IDS:
    # Legacy: sonarr_anime.seerr_service_id or ANIME_SEERR_SERVICE_ID env var
    _legacy = _i("ANIME_SEERR_SERVICE_ID", "sonarr_anime", "seerr_service_id", default=0)
    if _legacy:
        ANIME_SEERR_SERVICE_IDS = {_legacy}

# Legacy single-value aliases (used by existing callers in servarr.py / tests)
RADARR_URL     = RADARR_INSTANCES[0]["url"]     if RADARR_INSTANCES else ""
RADARR_API_KEY = RADARR_INSTANCES[0]["api_key"] if RADARR_INSTANCES else ""
_sonarr_tv  = [i for i in SONARR_INSTANCES if not i.get("is_anime")]
_sonarr_ani = [i for i in SONARR_INSTANCES if i.get("is_anime")]
SONARR_URL     = _sonarr_tv[0]["url"]      if _sonarr_tv else ""
SONARR_API_KEY = _sonarr_tv[0]["api_key"]  if _sonarr_tv else ""
ANIME_URL      = _sonarr_ani[0]["url"]     if _sonarr_ani else ""
ANIME_API_KEY  = _sonarr_ani[0]["api_key"] if _sonarr_ani else ""
ANIME_SEERR_SERVICE_ID = next(iter(ANIME_SEERR_SERVICE_IDS), 3)

# --- TMDB -------------------------------------------------------------------
TMDB_IMG_BASE      = _e("TMDB_IMG_BASE",      "tmdb", "img_base",      default="https://image.tmdb.org/t/p/w500")
TMDB_BACKDROP_BASE = _e("TMDB_BACKDROP_BASE", "tmdb", "backdrop_base", default="https://image.tmdb.org/t/p/w780")

# --- Auth / sessions --------------------------------------------------------
SECRET_KEY        = _e("SECRET_KEY",        "secret_key")
SESSION_COOKIE    = _e("SESSION_COOKIE",    "session_cookie",    default="bracket_session")
SESSION_MAX_AGE   = _i("SESSION_MAX_AGE",   "session_max_age",   default=60 * 60 * 24 * 7)
SESSION_SECURE    = _b("SESSION_SECURE",    "session_secure",    default=False)
SESSION_EPOCH     = _e("SESSION_EPOCH",     "session_epoch",     default="1")
PIN_NONCE_COOKIE  = _e("PIN_NONCE_COOKIE",  "pin_nonce_cookie",  default="bracket_pin")
PIN_NONCE_MAX_AGE = _i("PIN_NONCE_MAX_AGE", "pin_nonce_max_age", default=900)
PLEX_CLIENT_ID    = _e("PLEX_CLIENT_ID",   "plex_client_id")
PLEX_PRODUCT      = _e("PLEX_PRODUCT",     "plex_product",      default="Bracket")
DEV_PLEX_ID       = _e("DEV_PLEX_ID")

# --- Storage / caching ------------------------------------------------------
DB_PATH                 = _e("DB_PATH",                 "db_path",                 default="/app/config/bracket.db")
CALENDAR_TTL_SECONDS    = _i("CALENDAR_TTL_SECONDS",    "calendar_ttl_seconds",    default=1800)
SEERR_USERS_TTL_SECONDS = _i("SEERR_USERS_TTL_SECONDS", "seerr_users_ttl_seconds", default=21600)
CAL_WINDOW_DAYS         = _i("CAL_WINDOW_DAYS",         "cal_window_days",         default=730)
CAL_MAX_SPAN_DAYS       = _i("CAL_MAX_SPAN_DAYS",       "cal_max_span_days",       default=4015)

# --- Global settings ---------------------------------------------------------
# Defaults for everything under the in-app Settings panel, plus the *arr calendar
# fetch window. These set the baseline for all users; each user can still
# personalise their own from the UI. Configured under `global_settings:` in
# config.yml (snake_case keys). The *arr fetch window is kept modest because a
# wide Sonarr includeSeries query is huge and times out / OOMs (empty calendar).
_DEFAULT_SETTINGS: dict = {
    "defaultView": "month",
    "timezone": "",
    "theme": "system",
    "defaultTypes": ["movie", "tv", "anime"],
    "weekStartDay": "monday",
    "droppingSoonDays": 7,
    "calendarPastDays": 90,
    "calendarFutureDays": 180,
    "hideReleased": False,
    "hideUnairedSeasons": False,
    "confirmRequest": True,
    "discoverDefaultTypes": ["movie", "tv", "anime"],
}
# config.yml snake_case key -> Settings-contract camelCase key
_SETTINGS_KEYS: dict = {
    "default_view": "defaultView",
    "timezone": "timezone",
    "theme": "theme",
    "default_types": "defaultTypes",
    "week_start_day": "weekStartDay",
    "dropping_soon_days": "droppingSoonDays",
    "calendar_past_days": "calendarPastDays",
    "calendar_future_days": "calendarFutureDays",
    "hide_released": "hideReleased",
    "hide_unaired_seasons": "hideUnairedSeasons",
    "confirm_request": "confirmRequest",
    "discover_default_types": "discoverDefaultTypes",
}


def _build_global_settings() -> dict:
    s = {**_DEFAULT_SETTINGS}
    gs = _c.get("global_settings")
    if isinstance(gs, dict):
        for ykey, skey in _SETTINGS_KEYS.items():
            if gs.get(ykey) is not None:
                s[skey] = gs[ykey]
    return s


GLOBAL_SETTINGS: dict = _build_global_settings()
SERVARR_CAL_PAST_DAYS   = _i("SERVARR_CAL_PAST_DAYS",   "global_settings", "fetch_past_days",   default=90)
SERVARR_CAL_FUTURE_DAYS = _i("SERVARR_CAL_FUTURE_DAYS", "global_settings", "fetch_future_days", default=180)
WATCHLIST_MAX           = _i("WATCHLIST_MAX",            "watchlist_max",           default=500)

# --- CORS -------------------------------------------------------------------
_cors_raw = _e("CORS_ORIGINS", "cors_origins", default="*")
CORS_ORIGINS = [o.strip() for o in _cors_raw.split(",") if o.strip()] or ["*"]

# --- Setup state ------------------------------------------------------------
SETUP_COMPLETE = bool(SEERR_URL and SEERR_API_KEY and SECRET_KEY and PLEX_CLIENT_ID)


# --- Config writer ----------------------------------------------------------

def _yv(v) -> str:
    """Render a scalar for inline YAML.

    JSON is a strict subset of YAML, so json.dumps always yields a valid,
    single-line YAML scalar. (yaml.dump appends a '\\n...' document-end marker
    to bare scalars, which fragments the file into multiple documents and makes
    yaml.safe_load reject it — the bug that made setup never complete.)
    """
    import json
    if v is None or v == "":
        return "''"
    return json.dumps(v, ensure_ascii=False)


def write_config(data: dict) -> None:
    """Write config.yml with comments; auto-generates secret_key and plex_client_id."""
    if not data.get("secret_key"):
        data["secret_key"] = secrets.token_hex(32)
    if not data.get("plex_client_id"):
        data["plex_client_id"] = str(uuid.uuid4())

    # Normalise legacy sonarr_anime top-level key → sonarr list entry
    sonarr_anime = data.pop("sonarr_anime", None)
    svc_id = data.pop("anime_seerr_service_id", None)
    if isinstance(sonarr_anime, dict) and sonarr_anime.get("url"):
        sonarr_anime.setdefault("is_anime", True)
        if svc_id:
            sonarr_anime.setdefault("seerr_service_id", svc_id)
        data.setdefault("sonarr", [])
        if isinstance(data["sonarr"], list):
            data["sonarr"].append(sonarr_anime)

    # Normalise single-instance dicts → lists
    for key in ("radarr", "sonarr"):
        v = data.get(key)
        if isinstance(v, dict):
            data[key] = [v]
        elif not isinstance(v, list):
            data.pop(key, None)

    # Preserve manually-tuned global settings across a re-run of setup
    if "global_settings" not in data and isinstance(_c.get("global_settings"), dict):
        data["global_settings"] = _c["global_settings"]

    CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
    CONFIG_FILE.write_text(_render_config(data))


def _render_config(cfg: dict) -> str:
    """Produce a human-readable, commented YAML config string."""
    lines: list[str] = [
        "# Bracket configuration",
        "# Generated by the setup wizard — edit manually or re-run setup to change.",
        "# Docs: https://github.com/haribo-hyung/bracket",
        "",
    ]

    seerr = cfg.get("seerr") or {}
    lines += [
        "# ── Seerr ──────────────────────────────────────────────────────────────────────",
        "# Required. Handles Plex login, media search, and sending requests.",
        "# api_key: Seerr → Settings → General → API Key",
        "seerr:",
        f"  url: {_yv(seerr.get('url', ''))}",
        f"  api_key: {_yv(seerr.get('api_key', ''))}",
        f"  public_url: {_yv(seerr.get('public_url', ''))}  # link shown to users; leave blank to hide",
        "",
    ]

    radarr_list = [i for i in (cfg.get("radarr") or []) if i.get("url")]
    if radarr_list:
        lines += [
            "# ── Radarr ─────────────────────────────────────────────────────────────────────",
            "# Movie release dates on the calendar. Multiple instances supported (e.g. 4K).",
            "# api_key: Radarr → Settings → General → Security → API Key",
            "radarr:",
        ]
        for inst in radarr_list:
            lines.append(f"  - url: {_yv(inst.get('url', ''))}")
            lines.append(f"    api_key: {_yv(inst.get('api_key', ''))}")
            if inst.get("name"):
                lines.append(f"    name: {_yv(inst['name'])}")
        lines.append("")

    sonarr_list = [i for i in (cfg.get("sonarr") or []) if i.get("url")]
    if sonarr_list:
        lines += [
            "# ── Sonarr ─────────────────────────────────────────────────────────────────────",
            "# TV/anime episode air dates. Multiple instances supported.",
            "# is_anime: true  →  this instance handles anime (East-Asian animation).",
            "# seerr_service_id: numeric ID in Seerr → Settings → Services for this Sonarr.",
            "# api_key: Sonarr → Settings → General → Security → API Key",
            "sonarr:",
        ]
        for inst in sonarr_list:
            lines.append(f"  - url: {_yv(inst.get('url', ''))}")
            lines.append(f"    api_key: {_yv(inst.get('api_key', ''))}")
            if inst.get("name"):
                lines.append(f"    name: {_yv(inst['name'])}")
            if inst.get("is_anime"):
                lines.append(f"    is_anime: true")
            if inst.get("seerr_service_id"):
                lines.append(f"    seerr_service_id: {int(inst['seerr_service_id'])}")
        lines.append("")

    gs = cfg.get("global_settings") or {}
    def _g(k, d):
        return gs.get(k, d)
    lines += [
        "# ── Global settings ─────────────────────────────────────────────────────────────",
        "# Defaults for everything under the in-app Settings panel. These set the baseline",
        "# for all users; each user can still personalise their own from the UI.",
        "global_settings:",
        "  # Release-calendar fetch window — how far Bracket pulls dates from Radarr/Sonarr.",
        "  # Wider = much heavier Sonarr queries (every episode in range); keep these modest.",
        f"  fetch_past_days: {int(_g('fetch_past_days', 90))}      # days of already-released dates to include",
        f"  fetch_future_days: {int(_g('fetch_future_days', 180))}  # days ahead to include",
        "  # Calendar view + display defaults",
        f"  default_view: {_yv(_g('default_view', 'month'))}            # month | week | day",
        f"  timezone: {_yv(_g('timezone', ''))}                   # blank = auto-detect in the browser",
        f"  theme: {_yv(_g('theme', 'system'))}                  # system | dark | light",
        f"  week_start_day: {_yv(_g('week_start_day', 'monday'))}         # monday | sunday",
        f"  default_types: {_yv(_g('default_types', ['movie', 'tv', 'anime']))}",
        f"  dropping_soon_days: {int(_g('dropping_soon_days', 7))}",
        f"  calendar_past_days: {int(_g('calendar_past_days', 90))}     # how far back the calendar view shows",
        f"  calendar_future_days: {int(_g('calendar_future_days', 180))}",
        f"  hide_released: {_yv(_g('hide_released', False))}",
        f"  hide_unaired_seasons: {_yv(_g('hide_unaired_seasons', False))}",
        f"  confirm_request: {_yv(_g('confirm_request', True))}          # ask before submitting a request",
        f"  discover_default_types: {_yv(_g('discover_default_types', ['movie', 'tv', 'anime']))}",
        "",
        "# ── Auth ────────────────────────────────────────────────────────────────────────",
        "# Auto-generated on first run. Treat these like passwords — do not share.",
        f"secret_key: {_yv(cfg.get('secret_key', ''))}",
        f"plex_client_id: {_yv(cfg.get('plex_client_id', ''))}",
        "",
    ]

    return "\n".join(lines)
