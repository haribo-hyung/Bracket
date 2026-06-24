/* Bracket kit — detail modal, watchlist drawer, settings, auth gate, setup wizard */
const { Modal, Button, Poster, TypePill, StatusBadge, Badge, FilterChip, SearchInput, Select, Switch, EmptyState, Spinner } = window.BracketDesignSystem_93e078;
const _SetupApi = window.BracketApi;

function _errMsg(e) {
  try { const b = JSON.parse(e.message); if (b && b.detail) return b.detail; } catch (_) {}
  if (e.message && e.message.length > 4 && e.message.length < 300) return e.message;
  return 'Try again or check your connection.';
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <Modal open onClose={onCancel} width={400}
      footer={<>
        <Button variant="default" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={onConfirm}>Confirm</Button>
      </>}>
      <p style={{ margin: 0, color: 'var(--text-body)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-normal)' }}>{message}</p>
    </Modal>
  );
}

function useConfirm() {
  const [state, setState] = React.useState(null);
  const confirm = React.useCallback((msg) => new Promise((resolve) => setState({ msg, resolve })), []);
  const el = state ? (
    <ConfirmModal
      message={state.msg}
      onConfirm={() => { setState(null); state.resolve(true); }}
      onCancel={() => { setState(null); state.resolve(false); }}
    />
  ) : null;
  return [el, confirm];
}

const TYPE_LABEL = { movie: 'Movie', tv: 'Series', anime: 'Anime' };
const TYPE_COLOR = { movie: 'var(--type-movie)', tv: 'var(--type-tv)', anime: 'var(--type-anime)' };
const fmtRuntime = (m) => {
  if (!m) return '';
  const h = Math.floor(m / 60), mm = m % 60;
  return [h ? `${h}hr` : '', mm ? `${mm}mins` : ''].filter(Boolean).join(' ');
};
const extraMeta = (it) => (it.type === 'movie' ? fmtRuntime(it.runtime) : (it.seasonCount ? `${it.seasonCount} season${it.seasonCount > 1 ? 's' : ''}` : ''));
const PAGE = 12;
const RELEASE_LABEL = { theatrical: 'Theatrical', digital: 'Digital', physical: 'Physical / 4K', episode: 'Episode' };
function prettyDate(iso) {
  const d = new Date(iso.length > 10 ? iso : iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}
function prettyRelDate(iso) {
  if (!iso) return '';
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

/* ---------------- DETAIL MODAL ---------------- */
function DetailModal({ item, onClose, onRemove, onAdd, inWatchlist, mobile, confirmRequest }) {
  const [reqState, setReqState] = React.useState(null);
  const [confirmEl, confirm] = useConfirm();
  React.useEffect(() => { setReqState(null); }, [item]);
  if (!item) return null;
  const inLib = item.status === 'library';
  const isReq = item.status === 'requested';
  const doDetailRequest = async () => {
    if (reqState === 'pending' || reqState === 'done') return;
    if (confirmRequest && !(await confirm(`Request "${item.title}"?`))) return;
    setReqState('pending');
    try {
      await window.BracketApi.requestMedia(item.tmdbId, item.type);
      if (!inWatchlist) onAdd();
      setReqState('done');
    } catch (e) { setReqState(_errMsg(e)); }
  };
  return (
    <React.Fragment>
    {confirmEl}
    <Modal open onClose={onClose} width={820}>
      <div style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
        <Poster type={item.type} src={item.posterUrl} width={108} radius="var(--radius-md)" style={{ boxShadow: 'var(--shadow-xl)', flex: 'none' }} />
        <div style={{ flex: 1, minWidth: 170, alignSelf: 'center' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <TypePill type={item.type} />
            <StatusBadge status={item.status} />
          </div>
          <h2 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 800, color: 'var(--text-strong)', letterSpacing: 'var(--ls-snug)' }}>{item.title}</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', marginTop: 2, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 5 }}>
            {item.year}{extraMeta(item) ? ` · ${extraMeta(item)}` : ''}
            {item.seerrUrl && (
              <a href={item.seerrUrl} target="_blank" rel="noreferrer" title="Open in Seerr"
                style={{ color: 'var(--text-faint)', opacity: 0.35, display: 'inline-flex', lineHeight: 1, textDecoration: 'none' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              </a>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: mobile ? 'row' : 'column', alignItems: 'stretch', gap: 8, flex: 'none', width: mobile ? '100%' : 168, alignSelf: mobile ? 'auto' : 'center' }}>
          {!inLib && (
            <button onClick={doDetailRequest} disabled={reqState === 'pending' || reqState === 'done' || isReq}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', flex: mobile ? 1 : 'none', boxSizing: 'border-box', minHeight: mobile ? 42 : 50, padding: '8px 16px', borderRadius: 'var(--radius-md)', background: isReq || reqState === 'done' ? 'var(--surface-3)' : 'var(--brand)', color: isReq || reqState === 'done' ? 'var(--text-muted)' : 'var(--text-on-brand, #fff)', fontWeight: 600, fontSize: 'var(--fs-sm)', lineHeight: 1.15, boxShadow: 'var(--shadow-sm)', cursor: isReq || reqState === 'pending' || reqState === 'done' ? 'default' : 'pointer', border: 'none' }}>
              <span>{
                reqState === 'pending' ? (mobile ? 'Requesting…' : <>Requesting…</>) :
                reqState === 'done' ? (mobile ? 'Requested ✓' : <>Requested ✓</>) :
                (reqState && reqState !== 'idle') ? (mobile ? `⚠ ${reqState.slice(0,40)}` : <>⚠ {reqState.slice(0,60)}</>) :
                isReq ? (mobile ? 'In Queue' : <>In<br />Queue</>) :
                mobile ? `Request ${TYPE_LABEL[item.type]}` : <>Request<br />{TYPE_LABEL[item.type]}</>
              }</span>
            </button>
          )}
          {mobile
            ? <button onClick={() => (inWatchlist ? onRemove(item.id) : onAdd())} aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'} title={inWatchlist ? 'Remove' : 'Add'}
                style={{ flex: 'none', alignSelf: 'center', width: 42, height: 42, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-body)', cursor: 'pointer' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>{inWatchlist ? <path d="M6 6l12 12M18 6L6 18" /> : <><path d="M11 5H7a2 2 0 0 0-2 2V20l6-4 6 4V11" /><path d="M14.5 5h5M17 2.5v5" /></>}</svg>
              </button>
            : (inWatchlist
                ? <Button variant="ghost" size="sm" fullWidth onClick={() => onRemove(item.id)}>Remove</Button>
                : <Button variant="default" size="sm" fullWidth onClick={onAdd}>Add to Watchlist</Button>)}
        </div>
      </div>
      <p style={{ color: 'var(--text-body)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-normal)', marginBottom: 18 }}>{item.overview}</p>

      <div style={{ marginBottom: 4 }}>
        <h3 style={{ fontSize: 'var(--fs-xs)', textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>Release dates</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          {item.releases.length === 0 && <div style={{ padding: '9px 12px', background: 'var(--surface-2)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>No upcoming dates — already in your library or not yet announced.</div>}
          {item.releases.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'var(--surface-2)' }}>
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-body)', display: 'flex', gap: 8, alignItems: 'center', minWidth: 0 }}>
                {r.kind === 'episode'
                  ? <><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>S{String(r.season).padStart(2,'0')}E{String(r.episode).padStart(2,'0')}</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.episodeTitle}</span></>
                  : <Badge tone="neutral">{RELEASE_LABEL[r.kind]}</Badge>}
              </span>
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flex: 'none' }}>{prettyDate(r.date)}</span>
            </div>
          ))}
        </div>
      </div>

    </Modal>
    </React.Fragment>
  );
}

/* ---------------- WATCHLIST DRAWER (search-to-add + browse, merged) ----------------
   Empty query  -> your watchlist (filter chips, tap to open).
   Typed query  -> live catalog search; every result shows +Add or Added inline. */
function WatchlistDrawer({ open, onClose, items, onSelect, onAdd, onRefresh, settings }) {
  const [confirmEl, confirm] = useConfirm();
  const [q, setQ] = React.useState('');
  const [mode, setMode] = React.useState('discover');   // 'list' | 'discover'
  const [sortBy, setSortBy] = React.useState('addedAt');  // 'addedAt' | 'nextDate' | 'title'
  const [types, setTypes] = React.useState(['movie', 'tv', 'anime']);
  const [upcomingOnly, setUpcomingOnly] = React.useState(false);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const filterRef = React.useRef(null);
  const [preview, setPreview] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [shown, setShown] = React.useState(PAGE);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [moreError, setMoreError] = React.useState(false);
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [adding, setAdding] = React.useState({});
  const [addError, setAddError] = React.useState(null);
  const [discoverData, setDiscoverData] = React.useState(null);
  const [discoverLoading, setDiscoverLoading] = React.useState(false);
  const [discoverError, setDiscoverError] = React.useState(false);
  const [expanded, setExpanded] = React.useState({});
  const [reqState, setReqState] = React.useState(null); // null | 'pending' | 'done' | 'err'
  const ref = React.useRef(null);
  const searching = mode === 'discover' && q.trim().length > 0;

  React.useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement;
    const node = ref.current;
    const FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const list = () => Array.from(node ? node.querySelectorAll(FOCUSABLE) : []).filter((el) => el.offsetParent !== null);
    const first = list()[0];
    (first || node) && (first || node).focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const f = list();
      if (!f.length) { e.preventDefault(); node && node.focus(); return; }
      const a = f[0], b = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
      else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll: true }); };
  }, [open]);

  React.useEffect(() => {
    if (!searching) { setResults([]); setError(false); setPage(1); setTotalPages(1); setShown(PAGE); setMoreError(false); return; }
    let live = true; setLoading(true); setError(false); setMoreError(false);
    const t = setTimeout(async () => {
      try { const d = await window.BracketApi.search(q.trim(), 1); if (live) { setResults(d.results || []); setPage(d.page || 1); setTotalPages(d.totalPages || 1); setShown(PAGE); } }
      catch (e) { if (live) { setResults([]); setError(true); } }
      finally { if (live) setLoading(false); }
    }, 300);
    return () => { live = false; clearTimeout(t); };
  }, [q]);

  React.useEffect(() => {
    if (!filterOpen) return;
    const onDown = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [filterOpen]);

  // Closing the drawer resets filters and transient state; mode resets to discover each time.
  React.useEffect(() => {
    if (!open) { setMode('discover'); setTypes(['movie', 'tv', 'anime']); setUpcomingOnly(false); setFilterOpen(false); setPreview(null); setQ(''); setShown(PAGE); setMoreError(false); setExpanded({}); }
  }, [open]);

  React.useEffect(() => { setReqState(null); }, [preview]);

  // Load discover data on first open (cached for the session; not refetched on reopen).
  React.useEffect(() => {
    if (!open || mode !== 'discover') return;
    if (discoverData !== null || discoverLoading) return;
    let live = true;
    setDiscoverLoading(true); setDiscoverError(false);
    window.BracketApi.discover()
      .then((d) => { if (live) { setDiscoverData(d); setDiscoverLoading(false); } })
      .catch(() => { if (live) { setDiscoverError(true); setDiscoverLoading(false); } });
    return () => { live = false; };
  }, [open, mode]);

  if (!open) return null;
  const have = new Set(items.map((i) => i.type + ':' + i.tmdbId));
  const doAdd = async (r) => {
    setAddError(null);
    const k = r.type + ':' + r.tmdbId;
    setAdding((a) => ({ ...a, [k]: true }));
    try { await onAdd(r); }
    catch (e) { setAdding((a) => ({ ...a, [k]: false })); setAddError(_errMsg(e)); }
  };
  const doRequest = async (r) => {
    if (settings?.confirmRequest && !(await confirm(`Request "${r.title}"?`))) return;
    setAddError(null);
    const k = r.type + ':' + r.tmdbId;
    if (adding[k]) return;
    setAdding((a) => ({ ...a, [k]: true }));
    try {
      await window.BracketApi.requestMedia(r.tmdbId, r.type);
      await onAdd(r);
    } catch (e) { setAdding((a) => ({ ...a, [k]: false })); setAddError(_errMsg(e)); }
  };

  const visibleResults = results.filter((r) => types.includes(r.type));
  const hasMore = searching && (shown < visibleResults.length || page < totalPages);
  const seeMore = async () => {
    setMoreError(false);
    if (shown < visibleResults.length) { setShown((s) => s + PAGE); return; }
    if (page < totalPages) {
      setLoadingMore(true);
      try {
        const d = await window.BracketApi.search(q.trim(), page + 1);
        setResults((prev) => [...prev, ...(d.results || [])]);
        setPage(d.page || page + 1);
        setShown((s) => s + PAGE);
      } catch (e) { setMoreError(true); }
      finally { setLoadingMore(false); }
    }
  };


  const TYPE_OPTS = [['movie', 'Movies', 'var(--type-movie)'], ['tv', 'Series', 'var(--type-tv)'], ['anime', 'Anime', 'var(--type-anime)']];
  const countOf = (t) => items.filter((i) => i.type === t).length;
  const toggleFilterType = (t) => setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  const filterActive = types.length < 3 || upcomingOnly;
  const wlQ = mode === 'list' ? q.trim().toLowerCase() : '';
  const list = items
    .filter((i) => types.includes(i.type) && (!upcomingOnly || i.nextDate) && (!wlQ || i.title.toLowerCase().includes(wlQ)))
    .slice()
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'nextDate') {
        if (!a.nextDate && !b.nextDate) return 0;
        if (!a.nextDate) return 1;
        if (!b.nextDate) return -1;
        return a.nextDate.localeCompare(b.nextDate);
      }
      return b.addedAt.localeCompare(a.addedAt);
    });

  return (
    <React.Fragment>
    {confirmEl}
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 40, overflow: 'hidden', background: 'var(--overlay)', backdropFilter: 'var(--blur-sm)', WebkitBackdropFilter: 'var(--blur-sm)', display: 'flex', justifyContent: 'flex-end', animation: 'bracket-fade .18s ease' }}>
      <style>{`@keyframes bracket-fade{from{opacity:0}to{opacity:1}}@keyframes bracket-slide{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
      <aside ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Watchlist" onClick={(e) => e.stopPropagation()} className="bracket-scroll" style={{ width: 'min(440px, 100vw)', height: '100%', background: 'var(--surface-1)', borderLeft: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column', animation: 'bracket-slide .26s var(--ease-out)', outline: 'none' }}>
        <div style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--border)', flex: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <h2 style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, color: 'var(--text-strong)' }}>Watchlist</h2>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{items.length}</span>
            </div>
            <Button size="sm" variant="default" onClick={onClose} aria-label="Close watchlist">Close</Button>
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {[['discover', 'Discover'], ['list', 'My List']].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setQ(''); }} aria-pressed={mode === m}
                style={{ flex: 1, padding: '6px 0', borderRadius: 'var(--radius-md)', border: `1px solid ${mode === m ? 'var(--border-strong)' : 'var(--border)'}`, background: mode === m ? 'var(--surface-2)' : 'transparent', color: mode === m ? 'var(--text-strong)' : 'var(--text-muted)', fontSize: 'var(--fs-sm)', fontWeight: 600, cursor: 'pointer', transition: 'background .15s, color .15s, border-color .15s' }}>{label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <SearchInput placeholder={mode === 'list' ? 'Filter your list…' : 'Search to add movies, series, anime…'} value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div ref={filterRef} style={{ position: 'relative', flex: 'none' }}>
              <button onClick={() => setFilterOpen((o) => !o)} aria-label="Filter watchlist" aria-haspopup="true" aria-expanded={filterOpen}
                style={{ position: 'relative', width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', border: `1px solid ${filterActive ? 'var(--border-strong)' : 'var(--border)'}`, background: filterActive ? 'var(--surface-2)' : 'transparent', color: filterActive ? 'var(--text-strong)' : 'var(--text-muted)', cursor: 'pointer' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
                {filterActive && <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />}
              </button>
              {filterOpen && (
                <div role="menu" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 5, width: 204, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', padding: 6 }}>
                  <div style={{ fontSize: 'var(--fs-2xs)', textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)', color: 'var(--text-faint)', fontWeight: 600, padding: '6px 8px 4px' }}>Show types</div>
                  {TYPE_OPTS.map(([t, label, c]) => {
                    const on = types.includes(t);
                    return (
                      <button key={t} role="menuitemcheckbox" aria-checked={on} onClick={() => toggleFilterType(t)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: 8, background: 'none', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: on ? 'var(--text-body)' : 'var(--text-faint)', fontSize: 'var(--fs-sm)', textAlign: 'left' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}>
                        <span style={{ width: 12, height: 12, borderRadius: '3px', background: on ? c : 'transparent', border: on ? 'none' : '1px solid var(--border-strong)', flex: 'none' }} />
                        <span style={{ flex: 1 }}>{label}</span>
                        <span style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{countOf(t)}</span>
                      </button>
                    );
                  })}
                  <div style={{ height: 1, background: 'var(--border)', margin: '4px 8px' }} />
                  <button role="menuitemcheckbox" aria-checked={upcomingOnly} onClick={() => setUpcomingOnly((v) => !v)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: 8, background: 'none', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: upcomingOnly ? 'var(--text-body)' : 'var(--text-faint)', fontSize: 'var(--fs-sm)', textAlign: 'left' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}>
                    <span style={{ width: 12, height: 12, borderRadius: '3px', background: upcomingOnly ? 'var(--accent)' : 'transparent', border: upcomingOnly ? 'none' : '1px solid var(--border-strong)', flex: 'none' }} />
                    <span style={{ flex: 1 }}>Upcoming only</span>
                  </button>
                  <div style={{ height: 1, background: 'var(--border)', margin: '4px 8px' }} />
                  <div style={{ fontSize: 'var(--fs-2xs)', textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)', color: 'var(--text-faint)', fontWeight: 600, padding: '6px 8px 4px' }}>Sort by</div>
                  {[['addedAt', 'Date added'], ['nextDate', 'Next release'], ['title', 'Title']].map(([s, label]) => (
                    <button key={s} role="menuitemradio" aria-checked={sortBy === s} onClick={() => setSortBy(s)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: 8, background: 'none', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: sortBy === s ? 'var(--text-body)' : 'var(--text-faint)', fontSize: 'var(--fs-sm)', textAlign: 'left' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: sortBy === s ? 'var(--accent)' : 'transparent', border: sortBy === s ? 'none' : '1px solid var(--border-strong)', flex: 'none' }} />
                      <span style={{ flex: 1 }}>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {addError && <div style={{ marginTop: 10, fontSize: 'var(--fs-2xs)', color: 'var(--red-400)' }}>{addError}</div>}
        </div>

        <div className="bracket-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {searching ? (
            <>
              {loading && <span style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-faint)', padding: 6 }}>Searching…</span>}
              {!loading && error && <span style={{ fontSize: 'var(--fs-2xs)', color: 'var(--red-400)', padding: 6 }}>Search is unavailable right now — try again shortly.</span>}
              {!loading && !error && visibleResults.length === 0 && !hasMore && <EmptyState icon="🔍" title="No results" body={results.length ? 'Nothing matches your current type filter.' : `Nothing found for "${q}".`} />}
              {visibleResults.slice(0, shown).map((r) => {
                const k = r.type + ':' + r.tmdbId;
                const added = have.has(k) || r.onWatchlist || adding[k];
                return (
                  <div key={k} style={{ flexShrink: 0, position: 'relative', overflow: 'hidden', display: 'flex', gap: 10, alignItems: 'center', padding: '8px 8px 8px 11px', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <span aria-hidden="true" title={TYPE_LABEL[r.type]} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: TYPE_COLOR[r.type] || TYPE_COLOR.movie }} />
                    <button onClick={() => setPreview(r)} style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, minWidth: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                      <Poster type={r.type} src={r.posterUrl} width={40} />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span title={r.title} style={{ display: 'block', fontWeight: 600, color: 'var(--text-strong)', fontSize: 'var(--fs-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</span>
                        <span style={{ display: 'block', fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)' }}>{r.year || ''}</span>
                      </span>
                    </button>
                    <Button size="sm" variant={added ? 'default' : 'primary'} disabled={added} onClick={() => doAdd(r)}>{added ? 'Added' : '+ Add'}</Button>
                  </div>
                );
              })}
              {!loading && !error && hasMore &&
                <button onClick={seeMore} disabled={loadingMore} style={{ marginTop: 4, padding: 10, borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-strong)', background: 'none', color: 'var(--text-body)', cursor: loadingMore ? 'default' : 'pointer', fontSize: 'var(--fs-sm)', fontWeight: 600 }}>{loadingMore ? 'Loading…' : 'See more results'}</button>}
              {!loading && !error && !hasMore && visibleResults.length > 0 &&
                <div style={{ textAlign: 'center', padding: 10, fontSize: 'var(--fs-2xs)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)' }}>End of results</div>}
              {moreError && <span style={{ fontSize: 'var(--fs-2xs)', color: 'var(--red-400)', padding: 4 }}>Couldn't load more — give it a moment.</span>}
            </>
          ) : mode === 'discover' ? (
            discoverLoading
              ? <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-faint)', padding: 6 }}>Loading recommendations…</span>
              : discoverError
                ? <EmptyState icon="⚠️" title="Could not load" body="Recommendations unavailable right now — try again later." />
                : !discoverData ? null
                : [['movie', 'Movies', discoverData.movies], ['tv', 'Series', discoverData.tv], ['anime', 'Anime', discoverData.anime]].filter(([type]) => !settings?.discoverDefaultTypes || settings.discoverDefaultTypes.includes(type)).map(([type, label, recs]) => {
                    if (!recs || !recs.length) return null;
                    const DISC_CAP = 3;
                    const isExp = !!expanded[type];
                    const shown2 = isExp ? recs : recs.slice(0, DISC_CAP);
                    const remaining = recs.length - DISC_CAP;
                    return (
                      <React.Fragment key={type}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, marginBottom: 2 }}>
                          <span style={{ width: 3, height: 13, borderRadius: 2, background: TYPE_COLOR[type], flex: 'none' }} />
                          <span style={{ fontSize: 'var(--fs-2xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)', color: 'var(--text-muted)' }}>{label}</span>
                        </div>
                        {shown2.map((r) => {
                          const k = r.type + ':' + r.tmdbId;
                          const bookmarked = have.has(k) || r.onWatchlist;
                          const loadingThis = !!adding[k];
                          const canRequest = r.seerrUrl && !r.inLibrary && !r.isRequested;
                          return (
                            <div key={k} style={{ flexShrink: 0, position: 'relative', overflow: 'hidden', display: 'flex', gap: 10, alignItems: 'center', padding: '8px 8px 8px 11px', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                              <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: TYPE_COLOR[r.type] || TYPE_COLOR.movie }} />
                              <button onClick={() => setPreview(r)} style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, minWidth: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                                <Poster type={r.type} src={r.posterUrl} width={40} />
                                <span style={{ flex: 1, minWidth: 0 }}>
                                  <span title={r.title} style={{ display: 'block', fontWeight: 600, color: 'var(--text-strong)', fontSize: 'var(--fs-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</span>
                                  <span style={{ display: 'block', fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)' }}>{prettyRelDate(r.releaseDate)}</span>
                                </span>
                              </button>
                              {canRequest
                                ? <Button size="sm" variant={bookmarked ? 'default' : 'primary'} disabled={bookmarked || loadingThis} onClick={() => doRequest(r)}>
                                    {loadingThis ? 'Requesting…' : bookmarked ? 'Requested ✓' : 'Request'}
                                  </Button>
                                : <Button size="sm" variant={bookmarked ? 'default' : 'primary'} disabled={bookmarked || loadingThis} onClick={() => doAdd(r)}>
                                    {loadingThis ? 'Adding…' : bookmarked ? 'Bookmarked' : '+ Bookmark'}
                                  </Button>
                              }
                            </div>
                          );
                        })}
                        {!isExp && remaining > 0 && (
                          <button onClick={() => setExpanded((ex) => ({ ...ex, [type]: true }))}
                            style={{ padding: 10, borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-strong)', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                            See {remaining} more
                          </button>
                        )}
                      </React.Fragment>
                    );
                  })
          ) : (
            list.length === 0
              ? <EmptyState icon="🛋️" title={items.length === 0 ? 'Your watchlist is empty' : 'Nothing here'} body={items.length === 0 ? 'Switch to Discover to add movies, series and anime.' : wlQ ? ('No matches for "' + wlQ + '".') : 'Try a different filter.'} />
              : list.map((it) => (
                <button key={it.id} onClick={() => onSelect(it.id)} style={{ flexShrink: 0, position: 'relative', overflow: 'hidden', display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left', padding: '8px 8px 8px 11px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer', width: '100%' }}>
                  <span aria-hidden="true" title={TYPE_LABEL[it.type]} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: TYPE_COLOR[it.type] || TYPE_COLOR.movie }} />
                  <Poster type={it.type} src={it.posterUrl} width={44} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span title={it.title} style={{ display: 'block', fontWeight: 600, color: 'var(--text-strong)', fontSize: 'var(--fs-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.title}</span>
                    <span style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                      <StatusBadge status={it.status} />
                      {extraMeta(it) && <span style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)' }}>{extraMeta(it)}</span>}
                    </span>
                    {it.status === 'library'
                      ? <span style={{ display: 'block', fontSize: 'var(--fs-2xs)', color: 'var(--text-faint)', marginTop: 5, fontStyle: 'italic' }}>In your library · not on calendar</span>
                      : it.nextDate && <span style={{ display: 'block', fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)', marginTop: 5, fontFamily: 'var(--font-mono)' }}>Next · {prettyDate(it.nextDate)}</span>}
                  </span>
                </button>
              ))
          )}
        </div>

        {preview && (() => {
          const pk = preview.type + ':' + preview.tmdbId;
          const pAdded = have.has(pk) || preview.onWatchlist || adding[pk];
          return (
            <Modal open onClose={() => setPreview(null)} width={460}
              footer={<>
                <Button variant="default" onClick={() => setPreview(null)}>Close</Button>
                {preview.seerrUrl && !preview.inLibrary && !preview.isRequested
                  ? <Button
                      variant={reqState === 'done' ? 'default' : 'primary'}
                      disabled={reqState === 'pending' || reqState === 'done'}
                      onClick={async () => {
                        if (reqState === 'pending' || reqState === 'done') return;
                        if (settings?.confirmRequest && !(await confirm(`Request "${preview.title}"?`))) return;
                        setReqState('pending');
                        try {
                          await window.BracketApi.requestMedia(preview.tmdbId, preview.type);
                          if (!pAdded) doAdd(preview);
                          setReqState('done');
                        } catch (e) { setReqState(_errMsg(e)); }
                      }}>
                      {reqState === 'pending' ? 'Requesting…' : reqState === 'done' ? 'Requested ✓' : (reqState && reqState !== 'idle') ? `⚠ ${reqState.slice(0, 60)}` : pAdded ? 'Request Again' : 'Request'}
                    </Button>
                  : <Button variant={pAdded ? 'default' : 'primary'} disabled={pAdded} onClick={() => doAdd(preview)}>{pAdded ? 'Bookmarked' : '+ Bookmark'}</Button>}
              </>}>
              <div style={{ display: 'flex', gap: 16 }}>
                <Poster type={preview.type} src={preview.posterUrl} width={104} radius="var(--radius-md)" style={{ boxShadow: 'var(--shadow-lg)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <TypePill type={preview.type} />
                  <h2 style={{ fontSize: 'var(--fs-xl)', fontWeight: 800, color: 'var(--text-strong)', letterSpacing: 'var(--ls-snug)', marginTop: 8 }}>{preview.title}</h2>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', marginTop: 2, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {preview.year || '—'}
                    {preview.seerrUrl && (
                      <a href={preview.seerrUrl} target="_blank" rel="noreferrer" title="Open in Seerr"
                        style={{ color: 'var(--text-faint)', opacity: 0.35, display: 'inline-flex', lineHeight: 1, textDecoration: 'none' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                          <polyline points="15 3 21 3 21 9"/>
                          <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <p style={{ color: 'var(--text-body)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-normal)', marginTop: 14 }}>{preview.overview || 'No description available yet.'}</p>
            </Modal>
          );
        })()}
      </aside>
    </div>
    </React.Fragment>
  );
}

/* ---------------- SETTINGS ---------------- */
function SettingsModal({ open, onClose, settings, onChange, onRefresh, seerrPublicUrl }) {
  const [importing, setImporting] = React.useState(false);
  const [importMsg, setImportMsg] = React.useState(null);
  if (!open) return null;
  const set = (patch) => onChange({ ...settings, ...patch });
  const doImport = async () => {
    setImporting(true); setImportMsg(null);
    try {
      const r = await window.BracketApi.importSeerr();
      const parts = [];
      if (r.skipped) parts.push(`${r.skipped} already on your list`);
      if (r.failed)  parts.push(`${r.failed} no longer on TMDB, skipped`);
      const tail = parts.length ? ` · ${parts.join(' · ')}` : '';
      if (r.added > 0) {
        setImportMsg(`Imported ${r.added} title${r.added !== 1 ? 's' : ''}${tail}.`);
      } else if (r.failed && !r.skipped) {
        setImportMsg(`None could be imported — ${r.failed} request${r.failed !== 1 ? 's are' : ' is'} no longer on TMDB.`);
      } else {
        setImportMsg(`Nothing new to import${tail}.`);
      }
      if (r.added > 0 && onRefresh) await onRefresh();
    } catch (e) {
      if (e.status === 404) setImportMsg("Your Seerr account isn't linked — ask an admin.");
      else if (e.status === 429) setImportMsg('Slow down — wait a minute and try again.');
      else setImportMsg('Import failed — try again shortly.');
    } finally { setImporting(false); }
  };
  const toggleType = (t) => {
    const has = settings.defaultTypes.includes(t);
    set({ defaultTypes: has ? settings.defaultTypes.filter((x) => x !== t) : [...settings.defaultTypes, t] });
  };
  const Field = ({ label, hint, children, dividerColor, paddingTop, fullWidth, align, alignChildren }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: align || 'center', gap: 16, padding: `${paddingTop ?? 14}px 0 14px`, borderBottom: `1px solid ${dividerColor || 'var(--border)'}`, flexWrap: 'wrap' }}>
      <div><div style={{ fontWeight: 600, color: 'var(--text-strong)', fontSize: 'var(--fs-sm)' }}>{label}</div>{hint && <div style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)', marginTop: 2 }}>{hint}</div>}</div>
      <div style={{ flex: fullWidth ? '0 0 100%' : 'none', minWidth: 150, display: 'flex', justifyContent: 'flex-end', alignSelf: alignChildren || 'auto' }}>{children}</div>
    </div>
  );
  return (
    <Modal open onClose={onClose} title="Settings" subtitle="Preferences are saved to your profile" width={540}
      footer={<Button variant="primary" onClick={onClose}>Done</Button>}>
      <Field label="Theme">
        <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {[['system', 'System'], ['light', 'Light'], ['dark', 'Dark']].map(([val, label]) => {
            const on = (settings.theme || 'system') === val;
            return (
              <button key={val} onClick={() => set({ theme: val })} aria-pressed={on}
                style={{ flex: 1, padding: '5px 10px', border: 'none', borderLeft: val !== 'system' ? '1px solid var(--border)' : 'none', background: on ? 'var(--surface-2)' : 'transparent', color: on ? 'var(--text-body)' : 'var(--text-faint)', fontSize: 'var(--fs-sm)', fontWeight: on ? 600 : 400, cursor: 'pointer', transition: 'background var(--dur-fast)' }}>
                {label}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Default view" hint="The in-app switcher overrides this per session">
        <Select value={settings.defaultView} onChange={(e) => set({ defaultView: e.target.value })}><option value="day">Day</option><option value="week">Week</option><option value="month">Month</option></Select>
      </Field>
      <Field label="Week starts on" hint="First day shown in week and month views">
        <Select value={settings.weekStartDay || 'monday'} onChange={(e) => set({ weekStartDay: e.target.value })}>
          <option value="monday">Monday</option>
          <option value="sunday">Sunday</option>
        </Select>
      </Field>
      <Field label="Timezone" hint="Episode air times are shown in this zone">
        <Select value={settings.timezone || ''} onChange={(e) => set({ timezone: e.target.value })}>
          <option value="">Auto-detect ({Intl.DateTimeFormat().resolvedOptions().timeZone})</option>
          <optgroup label="Europe">
            <option value="Europe/London">London (GMT/BST)</option>
            <option value="Europe/Paris">Paris (CET/CEST)</option>
            <option value="Europe/Berlin">Berlin</option>
            <option value="Europe/Madrid">Madrid</option>
            <option value="Europe/Rome">Rome</option>
            <option value="Europe/Amsterdam">Amsterdam</option>
            <option value="Europe/Stockholm">Stockholm</option>
            <option value="Europe/Warsaw">Warsaw</option>
            <option value="Europe/Helsinki">Helsinki</option>
            <option value="Europe/Athens">Athens</option>
            <option value="Europe/Istanbul">Istanbul</option>
            <option value="Europe/Moscow">Moscow</option>
          </optgroup>
          <optgroup label="Americas">
            <option value="America/New_York">New York (ET)</option>
            <option value="America/Chicago">Chicago (CT)</option>
            <option value="America/Denver">Denver (MT)</option>
            <option value="America/Los_Angeles">Los Angeles (PT)</option>
            <option value="America/Phoenix">Phoenix (no DST)</option>
            <option value="America/Anchorage">Anchorage</option>
            <option value="Pacific/Honolulu">Honolulu</option>
            <option value="America/Toronto">Toronto</option>
            <option value="America/Vancouver">Vancouver</option>
            <option value="America/Mexico_City">Mexico City</option>
            <option value="America/Sao_Paulo">São Paulo</option>
            <option value="America/Argentina/Buenos_Aires">Buenos Aires</option>
            <option value="America/Bogota">Bogotá</option>
            <option value="America/Santiago">Santiago</option>
          </optgroup>
          <optgroup label="Asia / Pacific">
            <option value="Asia/Tokyo">Tokyo</option>
            <option value="Asia/Seoul">Seoul</option>
            <option value="Asia/Shanghai">Shanghai</option>
            <option value="Asia/Hong_Kong">Hong Kong</option>
            <option value="Asia/Singapore">Singapore</option>
            <option value="Asia/Bangkok">Bangkok</option>
            <option value="Asia/Jakarta">Jakarta</option>
            <option value="Asia/Kolkata">India (IST)</option>
            <option value="Asia/Karachi">Karachi</option>
            <option value="Asia/Dubai">Dubai</option>
            <option value="Asia/Riyadh">Riyadh</option>
            <option value="Asia/Tehran">Tehran</option>
            <option value="Asia/Jerusalem">Jerusalem</option>
            <option value="Australia/Sydney">Sydney</option>
            <option value="Australia/Brisbane">Brisbane</option>
            <option value="Australia/Perth">Perth</option>
            <option value="Pacific/Auckland">Auckland</option>
          </optgroup>
          <optgroup label="Africa">
            <option value="Africa/Cairo">Cairo</option>
            <option value="Africa/Johannesburg">Johannesburg</option>
            <option value="Africa/Lagos">Lagos</option>
          </optgroup>
          <optgroup label="Universal">
            <option value="UTC">UTC</option>
          </optgroup>
        </Select>
      </Field>
      <Field label="Default type filters" hint="Which release types show by default">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {[['movie', 'Movies', 'var(--type-movie)'], ['tv', 'Series', 'var(--type-tv)'], ['anime', 'Anime', 'var(--type-anime)']].map(([t, l, c]) => {
            const on = settings.defaultTypes.includes(t);
            return (
              <button key={t} onClick={() => toggleType(t)} aria-pressed={on}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 'var(--radius-full)', border: `1px solid ${on ? 'var(--border-strong)' : 'var(--border)'}`, background: on ? 'var(--surface-2)' : 'transparent', color: on ? 'var(--text-body)' : 'var(--text-faint)', cursor: 'pointer', fontSize: 'var(--fs-sm)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '3px', background: c, opacity: on ? 1 : 0.35 }} />
                {l}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Discover segments" hint="Which segments show in the Discover tab">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {[['movie', 'Movies', 'var(--type-movie)'], ['tv', 'Series', 'var(--type-tv)'], ['anime', 'Anime', 'var(--type-anime)']].map(([t, l, c]) => {
            const types = settings.discoverDefaultTypes || ['movie', 'tv', 'anime'];
            const on = types.includes(t);
            return (
              <button key={t} onClick={() => set({ discoverDefaultTypes: on ? types.filter((x) => x !== t) : [...types, t] })} aria-pressed={on}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 'var(--radius-full)', border: `1px solid ${on ? 'var(--border-strong)' : 'var(--border)'}`, background: on ? 'var(--surface-2)' : 'transparent', color: on ? 'var(--text-body)' : 'var(--text-faint)', cursor: 'pointer', fontSize: 'var(--fs-sm)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '3px', background: c, opacity: on ? 1 : 0.35 }} />
                {l}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Dropping Soon window" hint="How far ahead the Dropping Soon section looks">
        <Select value={String(settings.droppingSoonDays ?? 14)} onChange={(e) => set({ droppingSoonDays: Number(e.target.value) })}>
          <option value="7">7 days</option>
          <option value="14">14 days</option>
          <option value="30">30 days</option>
          <option value="60">60 days</option>
        </Select>
      </Field>
      <Field label="Calendar window" hint="How far back and ahead the calendar loads">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Select value={String(settings.calendarPastDays ?? 365)} onChange={(e) => set({ calendarPastDays: Number(e.target.value) })}>
            <option value="90">90d back</option>
            <option value="180">180d back</option>
            <option value="365">1yr back</option>
            <option value="730">2yr back</option>
          </Select>
          <span style={{ color: 'var(--text-faint)', fontSize: 'var(--fs-xs)' }}>→</span>
          <Select value={String(settings.calendarFutureDays ?? 730)} onChange={(e) => set({ calendarFutureDays: Number(e.target.value) })}>
            <option value="90">90d ahead</option>
            <option value="180">180d ahead</option>
            <option value="365">1yr ahead</option>
            <option value="730">2yr ahead</option>
          </Select>
        </div>
      </Field>
      <Field label="Hide past releases" hint="Only show upcoming events on the calendar">
        <Switch checked={!!settings.hideReleased} onChange={(v) => set({ hideReleased: v })} label="Hide past releases" />
      </Field>
      <Field label="Hide future seasons" hint="Show only the next unreleased season per series">
        <Switch checked={!!settings.hideUnairedSeasons} onChange={(v) => set({ hideUnairedSeasons: v })} label="Hide future seasons" />
      </Field>
      <Field label="Confirm before requesting" hint="Ask before submitting a Seerr request" dividerColor="var(--red-600)">
        <Switch checked={!!settings.confirmRequest} onChange={(v) => set({ confirmRequest: v })} label="Confirm request" />
      </Field>

      <div style={{ display: 'flex', alignItems: 'stretch', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--red-600)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 'var(--fs-2xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)', color: 'var(--red-500)', marginBottom: 6 }}>Danger zone</div>
          <div style={{ fontWeight: 600, color: 'var(--text-strong)', fontSize: 'var(--fs-sm)' }}>Import from {seerrPublicUrl ? new URL(seerrPublicUrl).hostname : 'Requesting Site'}</div>
          <div style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)', marginTop: 2 }}>Adds all your requests to My List — This cannot be undone!</div>
          {importMsg && <div style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)', marginTop: 4 }}>{importMsg}</div>}
        </div>
        <button onClick={doImport} disabled={importing}
          style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '0 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--red-600)', background: 'transparent', color: importing ? 'var(--text-faint)' : 'var(--red-400)', fontSize: 'var(--fs-xs)', fontWeight: 600, cursor: importing ? 'default' : 'pointer' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          {importing ? 'Importing…' : 'Import'}
        </button>
      </div>
    </Modal>
  );
}

/* ---------------- AUTH GATE ---------------- */
function AuthGate({ onSignIn, error }) {
  return (
    <div style={{ minHeight: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-app-gradient)', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 50% at 50% 35%, color-mix(in srgb, var(--purple-700) 22%, transparent), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', width: 380, maxWidth: '100%', textAlign: 'center', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-xl)', padding: 36 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: 'var(--ls-tight)', marginBottom: 6 }}><span style={{ color: 'var(--accent)' }}>Bracket</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-normal)', marginBottom: 24 }}>Track the media on your watchlist — by the date it actually drops.</p>
        <Button variant="primary" size="lg" fullWidth onClick={onSignIn}
          iconLeft={<svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '100%', height: '100%' }}><path d="M4 2l8 10-8 10h4l8-10L8 2z" /></svg>}>
          Sign in with Plex
        </Button>
        {error && <p role="alert" style={{ color: 'var(--red-400)', fontSize: 'var(--fs-sm)', marginTop: 14, marginBottom: 0 }}>{error}</p>}
        <p style={{ color: 'var(--text-faint)', fontSize: 'var(--fs-2xs)', marginTop: 16 }}>You sign in securely on plex.tv — Bracket never sees your password.</p>
      </div>
    </div>
  );
}

function SetupWizard({ onComplete }) {
  const STEPS = [
    { key: 'seerr',  label: 'Seerr',  placeholder: 'http://seerr:5055'  },
    { key: 'radarr', label: 'Radarr', placeholder: 'http://radarr:7878', multi: true, skippable: true },
    { key: 'sonarr', label: 'Sonarr', placeholder: 'http://sonarr:8989', multi: true, hasAnime: true },
  ];
  const SAVING = STEPS.length;

  const [step, setStep] = React.useState(-1);
  const [cfg, setCfg] = React.useState({
    seerr:  { url: '', api_key: '', public_url: '' },
    radarr: [{ url: '', api_key: '' }],
    sonarr: [{ url: '', api_key: '', is_anime: false, seerr_service_id: '' }],
  });
  const [testResult, setTestResult] = React.useState(null); // single obj or array
  const [testing, setTesting] = React.useState(false);
  const [testingIdx, setTestingIdx] = React.useState(null);
  const [saveError, setSaveError] = React.useState('');

  React.useEffect(() => { setTestResult(null); setTesting(false); setTestingIdx(null); }, [step]);

  const inputStyle = { display: 'block', width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-body)', fontSize: 'var(--fs-sm)', outline: 'none', fontFamily: 'inherit', marginTop: 4 };
  const labelStyle = { display: 'block', fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--text-muted)', marginTop: 14 };
  const wrapper = { minHeight: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-app-gradient)' };
  const card = { maxWidth: '100%', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-xl)', padding: '32px 36px' };

  const updateInst = (key, idx, field, val) => {
    setTestResult(tr => Array.isArray(tr) ? tr.map((r, i) => i === idx ? null : r) : tr);
    setCfg(c => { const arr = [...c[key]]; arr[idx] = { ...arr[idx], [field]: val }; return { ...c, [key]: arr }; });
  };
  const addInst = (key, tmpl) => {
    setCfg(c => ({ ...c, [key]: [...c[key], { ...tmpl }] }));
    setTestResult(tr => Array.isArray(tr) ? [...tr, null] : null);
  };
  const removeInst = (key, idx) => {
    setCfg(c => ({ ...c, [key]: c[key].filter((_, i) => i !== idx) }));
    setTestResult(tr => Array.isArray(tr) ? tr.filter((_, i) => i !== idx) : tr);
  };

  const testSeerr = async () => {
    const d = cfg.seerr;
    setTesting(true); setTestResult(null);
    try {
      setTestResult(await _SetupApi.setupTest({ service: 'seerr', url: d.url, api_key: d.api_key }));
    } catch(e) { setTestResult({ ok: false, error: _errMsg(e) }); }
    setTesting(false);
  };

  const testInst = async (key, idx) => {
    const inst = cfg[key][idx];
    setTestingIdx(idx);
    setTestResult(tr => { const a = Array.isArray(tr) ? [...tr] : Array(cfg[key].length).fill(null); a[idx] = null; return a; });
    let res;
    try { res = await _SetupApi.setupTest({ service: key, url: inst.url, api_key: inst.api_key }); }
    catch(e) { res = { ok: false, error: _errMsg(e) }; }
    setTestResult(tr => { const a = Array.isArray(tr) ? [...tr] : Array(cfg[key].length).fill(null); a[idx] = res; return a; });
    setTestingIdx(null);
  };

  const save = async (body) => {
    setStep(SAVING); setSaveError('');
    try {
      await _SetupApi.setupSave(body);
      let tries = 0;
      const poll = async () => {
        tries++;
        try { const st = await _SetupApi.setupStatus(); if (!st.needsSetup) { onComplete(); return; } } catch(_) {}
        if (tries < 15) setTimeout(poll, 1000);
        else setSaveError('Configuration saved but server did not apply it — reload the page to retry.');
      };
      setTimeout(poll, 1000);
    } catch(e) {
      setSaveError('Save failed: ' + _errMsg(e));
      setStep(STEPS.length - 1);
    }
  };

  const buildBody = (inclRadarr, inclSonarr) => {
    const body = { seerr: cfg.seerr };
    if (inclRadarr) { const r = cfg.radarr.filter(i => i.url.trim()); if (r.length) body.radarr = r; }
    if (inclSonarr) {
      const s = cfg.sonarr.filter(i => i.url.trim()).map(i => ({
        ...i, seerr_service_id: i.seerr_service_id ? (parseInt(i.seerr_service_id) || null) : null,
      }));
      if (s.length) body.sonarr = s;
    }
    return body;
  };

  if (step === -1) return (
    <div style={wrapper}><div style={{ ...card, width: 460 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}><span style={{ color: 'var(--accent)' }}>Bracket</span></h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-normal)', marginBottom: 24 }}>
        Let's connect your services. You'll need your <strong>Seerr</strong>, <strong>Radarr</strong>, and <strong>Sonarr</strong> API keys ready.
      </p>
      <Button variant="primary" fullWidth onClick={() => setStep(0)}>Get Started</Button>
    </div></div>
  );

  if (step === SAVING) return (
    <div style={wrapper}><div style={{ ...card, width: 460, textAlign: 'center' }}>
      <Spinner size={40} />
      <p style={{ color: 'var(--text-body)', fontWeight: 600, marginTop: 16, marginBottom: 4 }}>Saving configuration…</p>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>Applying settings — this only takes a moment.</p>
      {saveError && <p style={{ color: 'var(--red-400)', fontSize: 'var(--fs-sm)', marginTop: 12 }}>{saveError}</p>}
    </div></div>
  );

  const def = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div style={wrapper}><div style={{ ...card, width: def.multi ? 520 : 460 }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 9999, background: i <= step ? 'var(--accent)' : 'var(--border)', opacity: i < step ? 0.4 : 1 }} />
        ))}
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)', marginBottom: 4 }}>Step {step + 1} of {STEPS.length}</div>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>{def.label}</h2>
      </div>

      {/* ── Seerr step (single) ── */}
      {!def.multi && (
        <React.Fragment>
          <label style={labelStyle}>Internal URL</label>
          <input type="url" value={cfg.seerr.url} placeholder={def.placeholder}
            onChange={e => { setTestResult(null); setCfg(c => ({ ...c, seerr: { ...c.seerr, url: e.target.value } })); }} style={inputStyle} />
          <label style={labelStyle}>API Key</label>
          <input type="text" value={cfg.seerr.api_key} placeholder="Paste your API key"
            onChange={e => { setTestResult(null); setCfg(c => ({ ...c, seerr: { ...c.seerr, api_key: e.target.value } })); }} style={inputStyle} />
          <label style={labelStyle}>Public URL <span style={{ fontWeight: 400, color: 'var(--text-faint)' }}>(optional — link shown to users)</span></label>
          <input type="url" value={cfg.seerr.public_url} placeholder="https://requests.yourdomain.com"
            onChange={e => setCfg(c => ({ ...c, seerr: { ...c.seerr, public_url: e.target.value } }))} style={inputStyle} />
          {testResult && (
            <div style={{ fontSize: 'var(--fs-sm)', marginTop: 12, color: testResult.ok ? 'var(--green-400)' : 'var(--red-400)' }}>
              {testResult.ok ? '✓ Connected' : `✗ ${testResult.error || 'Connection failed'}`}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
            <Button variant="ghost" disabled={!(cfg.seerr.url.trim() && cfg.seerr.api_key.trim()) || testing} onClick={testSeerr}>
              {testing ? 'Testing…' : 'Test Connection'}
            </Button>
            <Button variant="primary" disabled={!testResult?.ok} onClick={() => setStep(1)}>Continue →</Button>
          </div>
        </React.Fragment>
      )}

      {/* ── Radarr / Sonarr steps (multi-instance) ── */}
      {def.multi && (
        <React.Fragment>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cfg[def.key].map((inst, idx) => {
              const tr = Array.isArray(testResult) ? (testResult[idx] || null) : null;
              const isTesting = testingIdx === idx;
              return (
                <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
                  {cfg[def.key].length > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)' }}>
                        {def.label} #{idx + 1}
                      </span>
                      <button onClick={() => removeInst(def.key, idx)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 'var(--fs-sm)', padding: '2px 6px' }}>
                        Remove
                      </button>
                    </div>
                  )}
                  <label style={labelStyle}>URL</label>
                  <input type="url" value={inst.url} placeholder={def.placeholder}
                    onChange={e => updateInst(def.key, idx, 'url', e.target.value)} style={inputStyle} />
                  <label style={labelStyle}>API Key</label>
                  <input type="text" value={inst.api_key} placeholder="Paste your API key"
                    onChange={e => updateInst(def.key, idx, 'api_key', e.target.value)} style={inputStyle} />
                  {def.hasAnime && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, cursor: 'pointer', fontSize: 'var(--fs-sm)', color: 'var(--text-body)' }}>
                      <input type="checkbox" checked={inst.is_anime}
                        onChange={e => updateInst(def.key, idx, 'is_anime', e.target.checked)}
                        style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
                      This instance handles <strong style={{ marginLeft: 2 }}>anime</strong>
                    </label>
                  )}
                  {def.hasAnime && inst.is_anime && (
                    <React.Fragment>
                      <label style={labelStyle}>Seerr service ID <span style={{ fontWeight: 400, color: 'var(--text-faint)' }}>(Seerr → Settings → Services)</span></label>
                      <input type="number" min="1" value={inst.seerr_service_id}
                        onChange={e => updateInst(def.key, idx, 'seerr_service_id', e.target.value)}
                        style={{ ...inputStyle, width: 80 }} />
                    </React.Fragment>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                    <Button variant="ghost" size="sm" disabled={!(inst.url.trim() && inst.api_key.trim()) || isTesting}
                      onClick={() => testInst(def.key, idx)}>
                      {isTesting ? 'Testing…' : 'Test'}
                    </Button>
                    {tr && <span style={{ fontSize: 'var(--fs-sm)', color: tr.ok ? 'var(--green-400)' : 'var(--red-400)' }}>
                      {tr.ok ? '✓ Connected' : `✗ ${tr.error || 'Failed'}`}
                    </span>}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => addInst(def.key, def.hasAnime
              ? { url: '', api_key: '', is_anime: false, seerr_service_id: '' }
              : { url: '', api_key: '' })}
            style={{ marginTop: 10, width: '100%', padding: '8px 12px', background: 'none', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 'var(--fs-sm)' }}>
            + Add another {def.label}
          </button>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
            {def.skippable && <Button variant="ghost" onClick={() => setStep(s => s + 1)}>Skip</Button>}
            {isLast && <Button variant="ghost" onClick={() => save(buildBody(true, false))}>Skip & Save</Button>}
            {isLast
              ? <Button variant="primary" onClick={() => save(buildBody(true, true))}>Save & Finish</Button>
              : <Button variant="primary" onClick={() => setStep(s => s + 1)}>Continue →</Button>}
          </div>
        </React.Fragment>
      )}
    </div></div>
  );
}

window.BracketKit = Object.assign(window.BracketKit || {}, { DetailModal, WatchlistDrawer, SettingsModal, AuthGate, SetupWizard });
