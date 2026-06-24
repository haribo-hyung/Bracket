# Bracket

**Your releases, bracketed.**

A minimal, self-hosted calendar that shows when everything on your watchlist
actually drops. Bracket logs into Plex, reads your household's
[Jellyseerr / Overseerr](https://docs.jellyseerr.dev/) requests and watchlist,
and lays out the real release and episode-air dates — pulled from Radarr and
Sonarr — on one clean calendar.

Users sign in with their existing Plex account. No extra accounts, no manual
data entry.

```
ghcr.io/haribo-hyung/bracket:latest
```

---

## What it does

- **One calendar for the whole household** — movie theatrical/digital/physical
  dates from Radarr, episode air dates from Sonarr (TV) and a separate
  Sonarr-anime instance, in month / week / day views.
- **Dropping Soon** — a glanceable strip of what releases in the next few days.
- **Per-user watchlist** — each user gets their own list, synced from their
  Seerr requests, plus a one-click **Import from Requesting Site**.
- **Discover & request** — browse what's new and request straight through Seerr
  from inside Bracket, without leaving for the Seerr UI.
- **Plex login** — Plex OAuth (PIN flow); access is gated to users who exist in
  your Seerr instance.

## How it works

Bracket is a single container: a **FastAPI** backend that serves the **React**
UI same-origin and exposes a small `/api`. It owns no media data of its own —
it's an aggregator:

| Source | Used for |
|--------|----------|
| **Seerr** (Jellyseerr/Overseerr) | Plex identity, search, requests, watchlist, TMDB metadata |
| **Radarr** | Movie release dates (in-cinemas / digital / physical), keyed by TMDB id |
| **Sonarr** (+ a separate anime instance) | Episode air dates, keyed by TheTVDB id |
| **TMDB** (via Seerr) | Posters, overviews, and a next-air-date fallback when an *arr has no data yet |

State lives in a SQLite DB (per-user watchlists + settings) inside the config
volume. Release dates are fetched from the *arr on a cached, bounded window and
matched onto watchlist items (movies by TMDB id, TV/anime by TVDB id).

## Quick start

1. Drop this `docker-compose.yml` somewhere:

   ```yaml
   services:
     bracket:
       image: ghcr.io/haribo-hyung/bracket:latest
       ports:
         - "8080:8080"
       volumes:
         - bracket-config:/app/config
       restart: unless-stopped

   volumes:
     bracket-config:
   ```

2. Start it and open `http://<host>:8080`:

   ```bash
   docker compose up -d
   ```

3. Complete the **first-run setup wizard**:
   - **Seerr** (required) — URL + API key (Seerr → Settings → General → API Key).
   - **Radarr** (optional) — URL + API key. Add multiple instances (e.g. a 4K
     instance) with **+ Add another**.
   - **Sonarr** (optional) — one or more instances. Tick **handles anime** for
     your anime instance and give it the matching Seerr service id.

   Save, and Bracket writes `config.yml`, reloads in place, and you're in.

> **URL gotcha:** the URLs you enter must be reachable **from inside the
> container**. `localhost` points at the container itself, not your host — use a
> LAN IP or a hostname the container can resolve. The setup wizard's **Test**
> button (and `GET /api/servarr/health`) will tell you if a connection works.

## Configuration

Everything is written to `config.yml` in the `bracket-config` volume by the
setup wizard — it's the single source of truth, and you can hand-edit it.
Environment variables override individual keys for headless/ops deploys.

```yaml
seerr:
  url: "http://seerr:5055"
  api_key: "..."
  public_url: "https://requests.example.com"   # link shown to users

radarr:
  - url: "http://radarr:7878"
    api_key: "..."

sonarr:
  - url: "http://sonarr:8989"
    api_key: "..."
  - url: "http://sonarr-anime:8989"
    api_key: "..."
    is_anime: true
    seerr_service_id: 3

# Defaults for everything under the in-app Settings panel + the *arr fetch
# window. Sets the baseline for all users; each user can still personalise theirs.
global_settings:
  fetch_past_days: 90        # how far back to pull *arr release dates
  fetch_future_days: 180     # how far ahead
  default_view: "month"      # month | week | day
  theme: "system"            # system | dark | light
  week_start_day: "monday"   # monday | sunday
  dropping_soon_days: 7
  hide_released: false
  confirm_request: true
  # …default_types, timezone, calendar range, etc.
```

## Useful endpoints

- `GET /healthz` — liveness.
- `GET /api/version` — build + whether setup is complete.
- `GET /api/servarr/health` — probes every configured Radarr/Sonarr instance and
  reports reachable/version or the exact error (great for debugging a calendar
  that's missing data).
- `GET /api/setup/logs` — last lines of the error log, in-browser.

## License

See repository.
