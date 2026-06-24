/* Bracket kit — app orchestrator (wired to bracket-api) */
const { Spinner, EmptyState, Button, IconButton, Poster } = window.BracketDesignSystem_93e078;
const { TopBar, MonthGrid, MonthAgenda, WeekGrid, DayAgenda, DayPanel, MONTHS, DetailModal, WatchlistDrawer, SettingsModal, AuthGate, Icons, SetupWizard } = window.BracketKit;
const API = window.BracketApi;
const buildEvents = window.BracketBuildEvents;
const TODAY = window.BracketToday;

function weekOffset(weekStart) { return weekStart === 'sunday' ? 0 : 1; }
function weekStartIdx(d, weekStart) { return (d.getUTCDay() - weekOffset(weekStart) + 7) % 7; }
function rangeLabel(view, cursor, weekStart) {
  if (view === 'month') return `${MONTHS[cursor.getUTCMonth()]} ${cursor.getUTCFullYear()}`;
  if (view === 'day') return cursor.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const start = new Date(cursor); start.setUTCDate(cursor.getUTCDate() - weekStartIdx(cursor, weekStart));
  const end = new Date(start); end.setUTCDate(start.getUTCDate() + 6);
  const sm = start.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });
  const em = end.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });
  return `${start.getUTCDate()} ${sm} – ${end.getUTCDate()} ${em} ${end.getUTCFullYear()}`;
}

const centerStyle = { minHeight: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app-gradient)' };

const ORANGE = '#f59e0b';
const TYPE_BAR = { movie: 'var(--type-movie)', tv: 'var(--type-tv)', anime: 'var(--type-anime)' };
const KEY_ITEMS = [
  { type: 'movie', label: 'Movies', c: 'var(--type-movie)' },
  { type: 'tv', label: 'Series', c: 'var(--type-tv)' },
  { type: 'anime', label: 'Anime', c: 'var(--type-anime)' },
];
/* Floating, chrome-less event-type toggles in the left gutter (desktop).
   Translucent at rest, full on hover; "off" types lose their colour + dim. */
const EYE_OPEN = <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />;
const EYE_OPEN_PUPIL = <circle cx="12" cy="12" r="3" />;
const EYE_SHUT = <><path d="M3 13c3.5 3.5 14.5 3.5 18 0" /><path d="M4.5 15.5l-1 2M9 17.5l-.5 2M15 17.5l.5 2M19.5 15.5l1 2" /></>;
function CalendarKey({ activeTypes, onToggle }) {
  const [open, setOpen] = React.useState(false);
  const [hoverIdx, setHoverIdx] = React.useState(-1);
  const [eyeY, setEyeY] = React.useState(0);
  const [blink, setBlink] = React.useState(0);
  const [closing, setClosing] = React.useState(false);
  const [keyW, setKeyW] = React.useState(190);   // measured: padL9 + eye18 + gap7 + label + 7 right
  const ref = React.useRef(null);
  const labelRef = React.useRef(null);
  const rowRefs = React.useRef([]);
  const leaveTimer = React.useRef(null);
  const shrinkTimer = React.useRef(null);
  const inited = React.useRef(false);
  const EYE = 16;

  const beginShrink = () => {
    clearTimeout(leaveTimer.current);
    setClosing(true);                                   // animate shrink into the corner
    shrinkTimer.current = setTimeout(() => { setOpen(false); setClosing(false); setHoverIdx(-1); }, 450);
  };
  const startClose = () => { clearTimeout(leaveTimer.current); leaveTimer.current = setTimeout(beginShrink, 5000); };
  const cancelClose = () => { clearTimeout(leaveTimer.current); clearTimeout(shrinkTimer.current); setClosing(false); };

  React.useEffect(() => () => { clearTimeout(leaveTimer.current); clearTimeout(shrinkTimer.current); }, []);
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) beginShrink(); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  React.useLayoutEffect(() => {
    if (!open) { inited.current = false; return; }
    let i = -1;                                          // eye only ever rests on an option
    if (hoverIdx >= 0) { i = hoverIdx; inited.current = true; }
    else if (!inited.current) { i = 0; inited.current = true; }
    if (i >= 0) { const t = rowRefs.current[i]; if (t) setEyeY(t.offsetTop + t.offsetHeight / 2); }
  }, [open, hoverIdx]);

  React.useLayoutEffect(() => {
    const measure = () => { if (labelRef.current) setKeyW(48 + Math.ceil(labelRef.current.getBoundingClientRect().width)); };
    measure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  }, []);

  const clickOption = (type) => { onToggle(type); setBlink((b) => b + 1); };
  const hoveredOn = hoverIdx >= 0 ? activeTypes.includes(KEY_ITEMS[hoverIdx].type) : true;
  const glass = { background: 'var(--glass-bg)', backdropFilter: 'var(--blur-md)', WebkitBackdropFilter: 'var(--blur-md)' };

  return (
    <aside ref={ref} aria-label="Toggle event types" style={{ position: 'fixed', left: 'var(--space-5)', bottom: 'var(--space-5)', zIndex: 35 }}>
      <style>{`
        .bracket-eye-btn{ box-sizing: border-box; width: 38px; height: 38px; padding: 0 0 0 9px; gap: 7px; overflow: hidden; transition: width .55s var(--ease-out); }
        .bracket-eye-btn:hover{ width: ${keyW}px; transition: width .6s var(--ease-out) .6s; }
        .bracket-eye-label{ display:inline-block; white-space:nowrap; opacity:0; transition: opacity .35s ease; }
        .bracket-eye-btn:hover .bracket-eye-label{ opacity:1; transition: opacity .45s ease .9s; }
        .bracket-eye-btn:hover .bracket-eye-icon{ animation: bracket-blink .75s ease; }
        @keyframes bracket-blink{ 0%,100%{transform:scaleY(1)} 38%,58%{transform:scaleY(.1)} 80%{transform:scaleY(1)} }
        @keyframes bracket-optin{ from{opacity:0; transform:translateX(-14px)} to{opacity:1; transform:translateX(0)} }
        @keyframes bracket-header-in{ 0%{opacity:0; transform:translate(26px,112px); animation-timing-function:cubic-bezier(0.2,0.75,0.12,1)} 55%{opacity:1; transform:translate(26px,0)} 100%{opacity:1; transform:translate(0,0)} }
        @keyframes bracket-fillin{ from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes bracket-fadein{ from{opacity:0} to{opacity:1} }
      `}</style>

      {open ? (
        <div onMouseEnter={cancelClose} onMouseLeave={startClose} style={{ ...glass, position: 'relative', width: keyW, border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', padding: 8, transformOrigin: 'bottom left', transform: closing ? 'scale(0.2)' : 'scale(1)', opacity: closing ? 0 : 1, transition: 'transform .45s var(--ease-out), opacity .45s ease' }}>
          <div style={{ height: 16, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', fontSize: 'var(--fs-2xs)', fontWeight: 700, color: ORANGE, textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)', marginBottom: 8, animation: 'bracket-header-in 1.25s var(--ease-out)' }}>Toggle visibility</div>
          <span aria-hidden="true" style={{ position: 'absolute', right: 14, top: eyeY - EYE / 2 - 1, width: EYE, height: EYE, color: ORANGE, transition: 'top .42s var(--ease-out)', pointerEvents: 'none', zIndex: 1, animation: 'bracket-fadein .4s ease .7s both' }}>
            <svg key={blink} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', transformOrigin: 'center', animation: blink ? 'bracket-blink .6s ease' : 'none' }}>{hoveredOn ? <>{EYE_OPEN}{EYE_OPEN_PUPIL}</> : EYE_SHUT}</svg>
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {KEY_ITEMS.map((it, i) => {
              const on = activeTypes.includes(it.type);
              const hovered = hoverIdx === i;
              return (
                <button key={it.type} ref={(el) => { rowRefs.current[i] = el; }}
                  onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(-1)}
                  onClick={() => clickOption(it.type)} aria-pressed={on}
                  style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', height: 30, padding: '0 30px 0 10px', borderRadius: 'var(--radius-md)', border: `1px solid ${hovered ? 'var(--border-strong)' : (on ? `color-mix(in srgb, ${it.c} 55%, transparent)` : 'var(--border)')}`, background: hovered ? 'color-mix(in srgb, var(--surface-2) 85%, transparent)' : 'transparent', cursor: 'pointer', fontSize: 'var(--fs-xs)', fontWeight: 600, textAlign: 'left', color: on ? 'var(--text-strong)' : 'var(--text-faint)', animation: `bracket-optin .5s var(--ease-out) ${0.7 + i * 0.1}s both`, transitionProperty: 'background, border-color, color', transitionDuration: '.2s' }}>
                  <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: on ? '100%' : '0%', transformOrigin: 'left', background: `color-mix(in srgb, ${it.c} 30%, transparent)`, transition: 'width 700ms var(--ease-out)', animation: on ? `bracket-fillin .7s var(--ease-out) ${0.7 + i * 0.1 + 0.15}s both` : 'none' }} />
                  <span style={{ position: 'relative' }}>{it.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <button className="bracket-eye-btn" onClick={() => setOpen(true)} aria-label="Toggle visibility" title="Toggle visibility"
          style={{ ...glass, display: 'inline-flex', alignItems: 'center', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', cursor: 'pointer', color: ORANGE, fontWeight: 700, fontSize: 'var(--fs-2xs)', textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)' }}>
          <svg className="bracket-eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, flex: 'none' }}>{EYE_OPEN}{EYE_OPEN_PUPIL}</svg>
          <span ref={labelRef} className="bracket-eye-label">Toggle visibility</span>
        </button>
      )}
    </aside>
  );
}

/* Top-right calendar nav: prev/next, plus a reset-to-today icon (plus a faint
   divider) that surfaces only when the cursor is off the current period. */
function CalendarNav({ view, cursor, today, onPrev, onNext, onToday, weekStart }) {
  const td = new Date(today + 'T00:00:00Z');
  let isCurrent;
  if (view === 'month') isCurrent = cursor.getUTCFullYear() === td.getUTCFullYear() && cursor.getUTCMonth() === td.getUTCMonth();
  else if (view === 'day') isCurrent = cursor.toISOString().slice(0, 10) === today;
  else { const s = new Date(cursor); s.setUTCDate(cursor.getUTCDate() - weekStartIdx(cursor, weekStart)); const e = new Date(s); e.setUTCDate(s.getUTCDate() + 6); isCurrent = td >= s && td <= e; }
  // Tally the years across every visible box. Show a "2026-27" range only when the
  // EARLIER year is the dominant one; if the newer year dominates (e.g. a January
  // grid with a few trailing December days), just show the newer year.
  let span = [];
  if (view === 'month') {
    const f = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), 1));
    const gs = new Date(f); gs.setUTCDate(1 - weekStartIdx(f, weekStart));
    for (let i = 0; i < 42; i++) { const d = new Date(gs); d.setUTCDate(gs.getUTCDate() + i); span.push(d.getUTCFullYear()); }
  } else if (view === 'week') {
    const ws = new Date(cursor); ws.setUTCDate(cursor.getUTCDate() - weekStartIdx(cursor, weekStart));
    for (let i = 0; i < 7; i++) { const d = new Date(ws); d.setUTCDate(ws.getUTCDate() + i); span.push(d.getUTCFullYear()); }
  } else { span = [cursor.getUTCFullYear()]; }
  const counts = {};
  span.forEach((y) => { counts[y] = (counts[y] || 0) + 1; });
  const years = Object.keys(counts).map(Number).sort((a, b) => a - b);
  let yearLabel;
  if (years.length === 1) yearLabel = `${years[0]}`;
  else {
    const [earlier, later] = years;
    yearLabel = counts[earlier] >= counts[later] ? `${earlier}-${String(later).slice(-2)}` : `${later}`;
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 'var(--space-4)' }}>
      <span style={{ fontSize: 'var(--fs-3xl)', fontWeight: 800, color: 'var(--text-strong)', letterSpacing: 'var(--ls-tight)', fontVariantNumeric: 'tabular-nums' }}>{yearLabel}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {!isCurrent && (
          <>
            <IconButton label="Back to today" size="sm" onClick={onToday}>{Icons.reset}</IconButton>
            <span aria-hidden="true" style={{ width: 1, alignSelf: 'stretch', margin: '4px 4px', background: 'var(--border)', opacity: 0.6 }} />
          </>
        )}
        <IconButton label="Previous" size="sm" onClick={onPrev}>{Icons.chevL}</IconButton>
        <IconButton label="Next" size="sm" onClick={onNext}>{Icons.chevR}</IconButton>
      </div>
    </div>
  );
}

function epLabel(e) {
  if (e.season == null || e.episode == null) return e.label;
  const code = 'S' + String(e.season).padStart(2, '0') + 'E' + String(e.episode).padStart(2, '0');
  return e.episodeTitle ? code + ' | ' + e.episodeTitle : code;
}

function prettyDropDate(iso) {
  const d = iso.slice(0, 10);
  if (d === TODAY) return 'Today';
  const tom = new Date(TODAY + 'T00:00:00Z');
  tom.setUTCDate(tom.getUTCDate() + 1);
  if (d === tom.toISOString().slice(0, 10)) return 'Tomorrow';
  return new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
}

function App() {
  const [setupNeeded, setSetupNeeded] = React.useState(null); // null=checking, true=wizard, false=normal
  const [booting, setBooting] = React.useState(true);
  const [bootError, setBootError] = React.useState(false);
  const [authed, setAuthed] = React.useState(false);
  const [signingIn, setSigningIn] = React.useState(false);
  const [authError, setAuthError] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const [me, setMe] = React.useState(null);
  const [settings, setSettings] = React.useState({ defaultView: 'month', timezone: '', theme: 'system', defaultTypes: ['movie', 'tv', 'anime'] });
  const effectiveTz = settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [view, setView] = React.useState('month');
  const [cursor, setCursor] = React.useState(new Date(TODAY + 'T00:00:00Z'));
  const [activeTypes, setActiveTypes] = React.useState(['movie', 'tv', 'anime']);
  const [watchlist, setWatchlist] = React.useState([]);
  const [drawer, setDrawer] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [detailId, setDetailId] = React.useState(null);
  const [compact, setCompact] = React.useState(false);
  const [mobile, setMobile] = React.useState(false);
  const [wide, setWide] = React.useState(false);
  const [dayPanel, setDayPanel] = React.useState(null);
  const swipeRef = React.useRef(null);

  const today = TODAY;
  const allEvents = React.useMemo(() => {
    let evs = buildEvents(watchlist);
    if (settings.hideReleased) evs = evs.filter((e) => e.start >= today);
    if (settings.hideUnairedSeasons) {
      const nextSeason = {};
      for (const e of evs) {
        if (e.season == null) continue;
        if (e.start >= today && (nextSeason[e.itemId] == null || e.season < nextSeason[e.itemId]))
          nextSeason[e.itemId] = e.season;
      }
      evs = evs.filter((e) => e.season == null || nextSeason[e.itemId] == null || e.season <= nextSeason[e.itemId]);
    }
    return evs;
  }, [watchlist, settings.hideReleased, settings.hideUnairedSeasons, today]);
  const events = React.useMemo(() => allEvents.filter((e) => activeTypes.includes(e.type)), [allEvents, activeTypes]);
  const droppingSoon = React.useMemo(() => {
    const days = settings.droppingSoonDays ?? 14;
    const end = new Date(today + 'T00:00:00Z'); end.setUTCDate(end.getUTCDate() + days);
    const endStr = end.toISOString().slice(0, 10);
    return events.filter((e) => { const d = e.start.slice(0, 10); return d >= today && d <= endStr; });
  }, [events, settings.droppingSoonDays, today]);
  const stepRef = React.useRef(null);
  const goTodayRef = React.useRef(null);
  const foundDetail = watchlist.find((i) => i.id === detailId);
  const lastDetail = React.useRef(null);
  React.useEffect(() => { if (foundDetail) lastDetail.current = foundDetail; }, [foundDetail]);
  const detailItem = foundDetail || (detailId ? lastDetail.current : null);   // keep showing after Remove

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const resolved = settings.theme === 'system' ? (mq.matches ? 'dark' : 'light') : settings.theme;
      document.documentElement.setAttribute('data-theme', resolved);
    };
    apply();
    if (settings.theme === 'system') { mq.addEventListener('change', apply); return () => mq.removeEventListener('change', apply); }
  }, [settings.theme]);
  React.useEffect(() => {
    const mqMobile = window.matchMedia('(max-width: 640px)');     // phone
    const mqCompact = window.matchMedia('(max-width: 1024px)');   // phone + tablet
    const mqWide = window.matchMedia('(min-width: 1700px)');      // room for fixed-width calendar beside the flyout
    const on = () => { setMobile(mqMobile.matches); setCompact(mqCompact.matches); setWide(mqWide.matches); };
    on();
    const ms = [mqMobile, mqCompact, mqWide];
    ms.forEach((m) => m.addEventListener('change', on));
    return () => ms.forEach((m) => m.removeEventListener('change', on));
  }, []);
  React.useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 3200); return () => clearTimeout(t); }, [toast]);
  React.useEffect(() => { setDayPanel(null); }, [view]); // switching views closes the flyout

  React.useEffect(() => {
    if (!authed) return;
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable) return;
      if (drawer || settingsOpen || detailId) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); stepRef.current(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); stepRef.current(1); }
      else if (e.key === 't' || e.key === 'T') goTodayRef.current();
      else if (e.key === 'd' || e.key === 'D') setView('day');
      else if (e.key === 'w' || e.key === 'W') setView('week');
      else if (e.key === 'm' || e.key === 'M') setView('month');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [authed, drawer, settingsOpen, detailId]);

  async function loadAll() {
    const [meRes, setRes, wl] = await Promise.all([API.me(), API.settings(), API.watchlist(90, 90)]); // hot: ±90d for instant paint
    setMe(meRes); setSettings(setRes); setView(setRes.defaultView);
    setActiveTypes([...setRes.defaultTypes]); setWatchlist(wl);
  }

  // On load: check setup first, then attempt session restore.
  React.useEffect(() => { (async () => {
    try {
      const status = await API.setupStatus();
      if (status.needsSetup) { setSetupNeeded(true); setBooting(false); return; }
    } catch(e) {}
    setSetupNeeded(false);
    try { await loadAll(); setAuthed(true); }
    catch (e) { if (e.status !== 401) setBootError(true); }
    setBooting(false);
  })(); }, []);

  // After first paint, widen the calendar using the user's configured window.
  React.useEffect(() => {
    if (!authed) return;
    let live = true;
    API.watchlist(settings.calendarPastDays ?? 365, settings.calendarFutureDays ?? 730).then((w) => { if (live) setWatchlist(w); }).catch(() => {});
    return () => { live = false; };
  }, [authed]);

  async function retryBoot() {
    setBootError(false); setBooting(true);
    try { await loadAll(); setAuthed(true); } catch (e) { if (e.status !== 401) setBootError(true); }
    setBooting(false);
  }

  async function signIn() {
    setSigningIn(true); setAuthError(null);
    try {
      const { pinId, authUrl } = await API.authPin();
      const popup = window.open(authUrl, 'plexauth', 'width=620,height=720');
      if (!popup) { setAuthError('Your browser blocked the Plex pop-up — allow pop-ups and try again.'); setSigningIn(false); return; }
      await new Promise((resolve, reject) => {
        let tries = 0;
        const iv = setInterval(async () => {
          tries += 1;
          if (popup.closed && tries > 2) { clearInterval(iv); reject(new Error('cancelled')); return; }
          if (tries > 90) { clearInterval(iv); reject(new Error('Sign-in timed out')); return; }
          try {
            const r = await API.authPoll(pinId);
            if (r && r.authenticated) { clearInterval(iv); if (popup) popup.close(); resolve(); }
          } catch (err) { if (err.status && err.status !== 404) { clearInterval(iv); reject(err); } }
        }, 2000);
      });
      await loadAll(); setAuthed(true);
    } catch (e) {
      if (e.message !== 'cancelled') setAuthError(e.status === 403 ? "That Plex account isn't authorized." : 'Sign-in failed — please try again.');
    }
    setSigningIn(false);
  }

  const step = (dir) => {
    const c = new Date(cursor);
    if (view === 'month') c.setUTCMonth(c.getUTCMonth() + dir);
    else if (view === 'week') c.setUTCDate(c.getUTCDate() + dir * 7);
    else c.setUTCDate(c.getUTCDate() + dir);
    setCursor(c); setDayPanel(null);
  };
  const openDay = (ds) => setDayPanel((prev) => prev === ds ? null : ds);
  const goToday = () => { setCursor(new Date(today + 'T00:00:00Z')); setDayPanel(null); };
  // Keep refs current so the keyboard handler (below) never closes over stale state.
  stepRef.current = step;
  goTodayRef.current = goToday;
  const toggleType = (t) => setActiveTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  const removeItem = async (id) => {
    const prev = watchlist;
    setWatchlist((w) => w.filter((i) => i.id !== id));   // modal stays open (re-add via the toggle)
    try { await API.remove(id); } catch (e) { setWatchlist(prev); setToast("Couldn't remove that — try again."); }
  };
  // throws on failure so AddPanel can surface it + clear its pending state
  const addItem = async (r) => { await API.add(r.tmdbId, r.type); setWatchlist(await API.watchlist(settings.calendarPastDays ?? 365, settings.calendarFutureDays ?? 730)); };
  const changeSettings = (next) => {
    const prev = settings;
    setSettings(next);
    if (next.defaultView !== prev.defaultView) setView(next.defaultView);
    if (JSON.stringify(next.defaultTypes) !== JSON.stringify(prev.defaultTypes)) setActiveTypes(next.defaultTypes.length ? [...next.defaultTypes] : prev.defaultTypes);
    if (next.calendarPastDays !== prev.calendarPastDays || next.calendarFutureDays !== prev.calendarFutureDays)
      API.watchlist(next.calendarPastDays, next.calendarFutureDays).then(setWatchlist).catch(() => {});
    API.saveSettings(next).catch(() => { setSettings(prev); setToast("Couldn't save settings — reverted."); });
  };
  const logout = async () => {
    try { await API.logout(); } catch (e) {}
    setMe(null); setWatchlist([]); setDrawer(false); setSettingsOpen(false); setDetailId(null); setDayPanel(null); setAuthed(false);
  };

  if (booting || setupNeeded === null) return <div style={centerStyle}><Spinner size={56} /></div>;
  if (setupNeeded) return <SetupWizard onComplete={() => window.location.reload()} />;
  if (bootError) {
    return <div style={centerStyle}><div style={{ textAlign: 'center', maxWidth: 360, padding: 24 }}>
      <div style={{ fontSize: 34, marginBottom: 10 }}>🛋️</div>
      <h2 style={{ fontSize: 'var(--fs-xl)', color: 'var(--text-strong)', marginBottom: 6 }}>Bracket is having a moment</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', marginBottom: 18 }}>We couldn't reach the server. It's usually brief.</p>
      <Button variant="primary" onClick={retryBoot}>Try again</Button>
    </div></div>;
  }
  if (!authed) {
    if (signingIn) return <div style={centerStyle}><div style={{ textAlign: 'center' }}><Spinner size={48} /><p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', marginTop: 14 }}>Waiting for Plex…</p><button onClick={() => setSigningIn(false)} style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 'var(--fs-sm)', textDecoration: 'underline' }}>Cancel</button></div></div>;
    return (
      <div style={{ position: 'relative', height: '100%' }}>
        <AuthGate onSignIn={signIn} error={authError} />
      </div>
    );
  }

  const narrow = mobile || compact;                                    // phone + tablet share the mobile layout
  const fillMonth = false;                                             // (was tablet-only; tablet now uses the mobile layout)
  const stretchH = view !== 'month' || fillMonth;                      // full-height chain (else natural)
  const showFlyout = !!dayPanel && !narrow && watchlist.length > 0;    // side panel (desktop only)
  const showInlineDay = !!dayPanel && narrow && watchlist.length > 0;  // below the calendar (mobile + tablet)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-app-gradient)' }}>
      <TopBar view={view} onView={setView}
        onOpenWatchlist={() => setDrawer(true)} onOpenSettings={() => setSettingsOpen(true)} onLogout={logout} me={me} compact={compact}
        viewport={/\.internal$/i.test(window.location.hostname) ? (mobile ? 'Mobile' : wide ? 'Desktop (wide)' : compact ? 'Tablet' : 'Desktop') : null} />

      <main style={{ flex: 1, minHeight: 0, padding: compact ? 'var(--space-2)' : 'var(--space-5)', paddingTop: compact ? 'var(--space-3)' : 'var(--space-6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto' }}>
        <div style={{ display: 'flex', gap: 'var(--space-4)', width: '100%', height: stretchH ? '100%' : 'auto', maxWidth: showFlyout ? (wide ? 1696 : '100%') : 'var(--content-max)', transition: wide ? 'max-width 320ms cubic-bezier(0.2, 0.75, 0.12, 1)' : 'none' }}>
          <div style={{ flex: wide ? '0 0 var(--content-max)' : '1 1 0', maxWidth: '100%', minWidth: 0, height: stretchH ? '100%' : 'auto', display: 'flex', flexDirection: 'column' }}>
          {watchlist.length === 0
            ? <div style={{ flex: 1, minHeight: '55vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EmptyState icon="🛋️" title="Nothing on your list yet"
                  body="Search for titles in the drawer to add them — or import your existing Seerr requests from Settings."
                  action={<Button variant="primary" onClick={() => setDrawer(true)}>Browse &amp; add titles</Button>} />
              </div>
            : <>
                <CalendarNav view={view} cursor={cursor} today={today} onPrev={() => step(-1)} onNext={() => step(1)} onToday={goToday} weekStart={settings.weekStartDay} />
                <div style={{ flex: stretchH ? 1 : 'none', minHeight: 0, position: 'relative' }}>
                  <div
                    onTouchStart={(e) => { const t = e.touches[0]; swipeRef.current = { x: t.clientX, y: t.clientY }; }}
                    onTouchEnd={(e) => { const s = swipeRef.current; swipeRef.current = null; if (!s) return; const t = e.changedTouches[0]; const dx = t.clientX - s.x, dy = t.clientY - s.y; if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1); }}
                    style={{ height: stretchH ? '100%' : 'auto', overflowY: stretchH ? 'auto' : 'visible', filter: activeTypes.length === 0 ? 'blur(7px)' : 'none', pointerEvents: activeTypes.length === 0 ? 'none' : 'auto', transition: 'filter 650ms cubic-bezier(0.2, 0.75, 0.12, 1)' }}>
                    {view === 'month' && <MonthGrid cursor={cursor} events={allEvents} today={today} onSelect={setDetailId} onOpenDay={openDay} activeTypes={activeTypes} mobile={narrow} fill={fillMonth} tz={effectiveTz} weekStart={settings.weekStartDay} />}
                    {view === 'week' && <WeekGrid cursor={cursor} events={allEvents} today={today} onSelect={setDetailId} activeTypes={activeTypes} tz={effectiveTz} weekStart={settings.weekStartDay} />}
                    {view === 'day' && <DayAgenda cursor={cursor} events={allEvents} today={today} onSelect={setDetailId} activeTypes={activeTypes} tz={effectiveTz} />}
                  </div>
                  {allEvents.length === 0 && activeTypes.length > 0 && watchlist.length > 0 && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, pointerEvents: 'none' }}>
                      <div style={{ textAlign: 'center', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', padding: '22px 28px', maxWidth: 380 }}>
                        <div style={{ fontSize: 26, marginBottom: 8 }}>📅</div>
                        <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>No release dates yet</h2>
                        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', margin: 0 }}>
                          Your list has titles but none have dates in the calendar window.
                          Connect <strong>Radarr</strong> and <strong>Sonarr</strong> in Setup for full episode &amp; release schedules — or widen your calendar window in Settings.
                        </p>
                      </div>
                    </div>
                  )}
                  {activeTypes.length === 0 && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, pointerEvents: 'none' }}>
                      <div style={{ textAlign: 'center', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', padding: '22px 28px', maxWidth: 360 }}>
                        <div style={{ fontSize: 26, marginBottom: 8 }}>🫥</div>
                        <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>Nothing to show</h2>
                        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', margin: 0 }}>Use <span style={{ color: ORANGE, fontWeight: 700 }}>Toggle visibility</span> to bring your releases back.</p>
                      </div>
                    </div>
                  )}
                </div>
                {showInlineDay && <DayPanel dateStr={dayPanel} events={allEvents} today={today} onSelect={setDetailId} onClose={() => setDayPanel(null)} activeTypes={activeTypes} inline tz={effectiveTz} />}
                {droppingSoon.length > 0 && (
                  <div style={{ marginTop: 'var(--space-4)', paddingBottom: 'var(--space-4)' }}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 'var(--fs-2xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)', color: 'var(--text-muted)' }}>Dropping soon</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : compact ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', gap: 6 }}>
                      {droppingSoon.map((e) => (
                        <button key={e.id} onClick={() => setDetailId(e.itemId)}
                          style={{ position: 'relative', overflow: 'hidden', display: 'flex', gap: 8, alignItems: 'center', textAlign: 'left', padding: '8px 8px 8px 11px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer', width: '100%' }}>
                          <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: TYPE_BAR[e.type] }} />
                          <Poster type={e.type} src={e.posterUrl} width={36} />
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-strong)', fontSize: 'var(--fs-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title}</span>
                            <span style={{ display: 'block', fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {e.season != null && e.episode != null
                                ? <>{('S' + String(e.season).padStart(2, '0') + 'E' + String(e.episode).padStart(2, '0'))}{e.episodeTitle && <> | <em style={{ fontStyle: 'italic' }}>{e.episodeTitle}</em></>}{mobile && (' · ' + prettyDropDate(e.start))}</>
                                : mobile ? (e.label + ' · ' + prettyDropDate(e.start)) : e.label}
                            </span>
                          </span>
                          {!mobile && <span style={{ flex: 'none', fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{prettyDropDate(e.start)}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>}
          </div>
          {showFlyout && <DayPanel dateStr={dayPanel} events={allEvents} today={today} onSelect={setDetailId} onClose={() => setDayPanel(null)} activeTypes={activeTypes} tz={effectiveTz} />}
        </div>
      </main>

      {detailItem && <DetailModal item={detailItem} inWatchlist={!!foundDetail} mobile={narrow} onClose={() => { setDetailId(null); lastDetail.current = null; }} onRemove={removeItem} onAdd={() => addItem(detailItem)} confirmRequest={settings.confirmRequest} />}
      <WatchlistDrawer open={drawer} onClose={() => setDrawer(false)} items={watchlist} onSelect={(id) => { setDrawer(false); setDetailId(id); }} onAdd={addItem} onRefresh={async () => setWatchlist(await API.watchlist(settings.calendarPastDays ?? 365, settings.calendarFutureDays ?? 730))} settings={settings} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} settings={settings} onChange={changeSettings} onRefresh={async () => setWatchlist(await API.watchlist(settings.calendarPastDays ?? 365, settings.calendarFutureDays ?? 730))} seerrPublicUrl={me?.seerrPublicUrl || ''} />

      {watchlist.length > 0 && <CalendarKey activeTypes={activeTypes} onToggle={toggleType} />}

      {toast && <div role="status" style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 60, background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-body)', padding: '10px 16px', borderRadius: 'var(--radius-md)', fontSize: 'var(--fs-sm)', boxShadow: 'var(--shadow-lg)' }}>{toast}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
