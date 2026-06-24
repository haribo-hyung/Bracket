"""Pydantic models — the typed contract, matching the Bracket front-end api.ts exactly."""
import zoneinfo
from typing import Literal, Optional
from pydantic import BaseModel, field_validator

MediaType = Literal["movie", "tv", "anime"]
WatchStatus = Literal["library", "requested", "announced", "released"]
ReleaseKind = Literal["theatrical", "digital", "physical", "episode"]
CalendarView = Literal["day", "week", "month"]


class Me(BaseModel):
    id: str
    plexUsername: str
    displayName: str
    avatarUrl: Optional[str] = None
    isAdmin: bool = False
    seerrPublicUrl: str = ""


class Settings(BaseModel):
    defaultView: CalendarView = "month"
    timezone: str = ""
    theme: Literal["dark", "light", "system"] = "system"
    defaultTypes: list[MediaType] = ["movie", "tv", "anime"]
    weekStartDay: Literal["monday", "sunday"] = "monday"
    droppingSoonDays: int = 7
    calendarPastDays: int = 90
    calendarFutureDays: int = 180
    hideReleased: bool = False
    hideUnairedSeasons: bool = False
    confirmRequest: bool = True
    discoverDefaultTypes: list[MediaType] = ["movie", "tv", "anime"]

    @field_validator("timezone")
    @classmethod
    def _valid_timezone(cls, v: str) -> str:
        if not v:
            return v  # empty = auto-detect in browser
        try:
            zoneinfo.ZoneInfo(v)
        except Exception:
            raise ValueError("unknown timezone")
        return v


class ReleaseDate(BaseModel):
    kind: ReleaseKind
    date: str  # ISO date; episodes carry a time
    season: Optional[int] = None
    episode: Optional[int] = None
    episodeTitle: Optional[str] = None


class WatchlistItem(BaseModel):
    id: str
    tmdbId: int
    type: MediaType
    title: str
    year: Optional[int] = None
    posterUrl: Optional[str] = None
    backdropUrl: Optional[str] = None
    overview: str = ""
    status: WatchStatus
    releases: list[ReleaseDate] = []
    nextDate: Optional[str] = None
    runtime: Optional[int] = None
    seasonCount: Optional[int] = None
    seerrUrl: str
    addedAt: str


class CalendarEvent(BaseModel):
    id: str
    itemId: str
    type: MediaType
    title: str
    posterUrl: Optional[str] = None
    start: str
    allDay: bool
    releaseKind: ReleaseKind
    label: str


class SearchResult(BaseModel):
    tmdbId: int
    type: MediaType
    title: str
    year: Optional[int] = None
    posterUrl: Optional[str] = None
    overview: str = ""
    onWatchlist: bool = False


class AddWatchlistBody(BaseModel):
    tmdbId: int
    type: MediaType


class RequestMediaBody(BaseModel):
    tmdbId: int
    type: MediaType


class OkResponse(BaseModel):
    ok: bool = True


class ImportResult(BaseModel):
    added: int
    skipped: int          # already on the user's list
    failed: int = 0       # couldn't be retrieved from Seerr/TMDB (e.g. deleted title)


# --- Setup wizard ------------------------------------------------------------

class SetupServarr(BaseModel):
    url: str
    api_key: str


class SetupSeerr(SetupServarr):
    public_url: str = ""


class SetupRadarr(BaseModel):
    url: str
    api_key: str
    name: Optional[str] = None


class SetupSonarr(BaseModel):
    url: str
    api_key: str
    name: Optional[str] = None
    is_anime: bool = False
    seerr_service_id: Optional[int] = None


class SetupConfig(BaseModel):
    seerr: SetupSeerr
    radarr: list[SetupRadarr] = []
    sonarr: list[SetupSonarr] = []
    # Legacy single-instance fields kept for backward compat
    sonarr_anime: Optional[SetupServarr] = None
    anime_seerr_service_id: Optional[int] = None


class SetupTestRequest(BaseModel):
    service: str  # "seerr" | "radarr" | "sonarr"
    url: str
    api_key: str
