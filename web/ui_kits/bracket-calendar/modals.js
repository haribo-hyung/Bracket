(function(){
/* Bracket kit — detail modal, watchlist drawer, settings, auth gate */
const {
  Modal,
  Button,
  Poster,
  TypePill,
  StatusBadge,
  Badge,
  FilterChip,
  SearchInput,
  Select,
  Switch,
  EmptyState
} = window.BracketDesignSystem_93e078;
const TYPE_LABEL = {
  movie: 'Movie',
  tv: 'Series',
  anime: 'Anime'
};
const TYPE_COLOR = {
  movie: 'var(--type-movie)',
  tv: 'var(--type-tv)',
  anime: 'var(--type-anime)'
};
const fmtRuntime = m => {
  if (!m) return '';
  const h = Math.floor(m / 60),
    mm = m % 60;
  return [h ? `${h}hr` : '', mm ? `${mm}mins` : ''].filter(Boolean).join(' ');
};
const extraMeta = it => it.type === 'movie' ? fmtRuntime(it.runtime) : it.seasonCount ? `${it.seasonCount} season${it.seasonCount > 1 ? 's' : ''}` : '';
const PAGE = 12;
const RELEASE_LABEL = {
  theatrical: 'Theatrical',
  digital: 'Digital',
  physical: 'Physical / 4K',
  episode: 'Episode'
};
function prettyDate(iso) {
  const d = new Date(iso.length > 10 ? iso : iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

/* ---------------- DETAIL MODAL ---------------- */
function DetailModal({
  item,
  onClose,
  onRemove,
  onAdd,
  inWatchlist,
  mobile
}) {
  if (!item) return null;
  return /*#__PURE__*/React.createElement(Modal, {
    open: true,
    onClose: onClose,
    width: 820
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: 16,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Poster, {
    type: item.type,
    src: item.posterUrl,
    width: 108,
    radius: "var(--radius-md)",
    style: {
      boxShadow: 'var(--shadow-xl)',
      flex: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 170,
      alignSelf: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(TypePill, {
    type: item.type
  }), /*#__PURE__*/React.createElement(StatusBadge, {
    status: item.status
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--fs-2xl)',
      fontWeight: 800,
      color: 'var(--text-strong)',
      letterSpacing: 'var(--ls-snug)'
    }
  }, item.title), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 'var(--fs-sm)',
      marginTop: 2,
      fontFamily: 'var(--font-mono)'
    }
  }, item.year, extraMeta(item) ? ` · ${extraMeta(item)}` : '')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: mobile ? 'row' : 'column',
      alignItems: 'stretch',
      gap: 8,
      flex: 'none',
      width: mobile ? '100%' : 168,
      alignSelf: mobile ? 'auto' : 'center'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: item.seerrUrl,
    target: "_blank",
    rel: "noreferrer",
    className: "bracket-req",
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      flex: mobile ? 1 : 'none',
      boxSizing: 'border-box',
      minHeight: mobile ? 42 : 50,
      padding: '8px 16px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--brand)',
      color: 'var(--text-on-brand, #fff)',
      fontWeight: 600,
      fontSize: 'var(--fs-sm)',
      lineHeight: 1.15,
      textDecoration: 'none',
      boxShadow: 'var(--shadow-sm)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", null, mobile ? `Request ${TYPE_LABEL[item.type]}` : /*#__PURE__*/React.createElement(React.Fragment, null, "Request", /*#__PURE__*/React.createElement("br", null), TYPE_LABEL[item.type])), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      position: 'absolute',
      right: 9,
      bottom: 9,
      width: 14,
      height: 14
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 17L17 7M9 7h8v8"
  }))), mobile ? /*#__PURE__*/React.createElement("button", {
    onClick: () => inWatchlist ? onRemove(item.id) : onAdd(),
    "aria-label": inWatchlist ? 'Remove from watchlist' : 'Add to watchlist',
    title: inWatchlist ? 'Remove' : 'Add',
    style: {
      flex: 'none',
      alignSelf: 'center',
      width: 42,
      height: 42,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)',
      background: 'var(--surface-2)',
      color: 'var(--text-body)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      width: 22,
      height: 22
    }
  }, inWatchlist ? /*#__PURE__*/React.createElement("path", {
    d: "M6 6l12 12M18 6L6 18"
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M11 5H7a2 2 0 0 0-2 2V20l6-4 6 4V11"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14.5 5h5M17 2.5v5"
  })))) : inWatchlist ? /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    fullWidth: true,
    onClick: () => onRemove(item.id)
  }, "Remove") : /*#__PURE__*/React.createElement(Button, {
    variant: "default",
    size: "sm",
    fullWidth: true,
    onClick: onAdd
  }, "Add to Watchlist"))), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-body)',
      fontSize: 'var(--fs-sm)',
      lineHeight: 'var(--lh-normal)',
      marginBottom: 18
    }
  }, item.overview), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--fs-xs)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--ls-wide)',
      color: 'var(--text-muted)',
      fontWeight: 600,
      marginBottom: 8
    }
  }, "Release dates"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      border: '1px solid var(--border)'
    }
  }, item.releases.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '9px 12px',
      background: 'var(--surface-2)',
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-muted)'
    }
  }, "No upcoming dates \u2014 already in your library or not yet announced."), item.releases.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10,
      padding: '9px 12px',
      background: 'var(--surface-2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-body)',
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      minWidth: 0
    }
  }, r.kind === 'episode' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      color: 'var(--accent)',
      fontWeight: 600
    }
  }, "S", r.season, "E", r.episode), /*#__PURE__*/React.createElement("span", {
    style: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, r.episodeTitle)) : /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, RELEASE_LABEL[r.kind])), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-mono)',
      flex: 'none'
    }
  }, prettyDate(r.date)))))));
}

/* ---------------- WATCHLIST DRAWER (search-to-add + browse, merged) ----------------
   Empty query  -> your watchlist (filter chips, tap to open).
   Typed query  -> live catalog search; every result shows +Add or Added inline. */
function WatchlistDrawer({
  open,
  onClose,
  items,
  onSelect,
  onAdd
}) {
  const [q, setQ] = React.useState('');
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
  const ref = React.useRef(null);
  const searching = q.trim().length > 0;
  React.useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement;
    const node = ref.current;
    const FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const list = () => Array.from(node ? node.querySelectorAll(FOCUSABLE) : []).filter(el => el.offsetParent !== null);
    const first = list()[0];
    (first || node) && (first || node).focus({
      preventScroll: true
    });
    const onKey = e => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const f = list();
      if (!f.length) {
        e.preventDefault();
        node && node.focus();
        return;
      }
      const a = f[0],
        b = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        b.focus();
      } else if (!e.shiftKey && document.activeElement === b) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (prevFocus && prevFocus.focus) prevFocus.focus({
        preventScroll: true
      });
    };
  }, [open]);
  React.useEffect(() => {
    if (!searching) {
      setResults([]);
      setError(false);
      setPage(1);
      setTotalPages(1);
      setShown(PAGE);
      setMoreError(false);
      return;
    }
    let live = true;
    setLoading(true);
    setError(false);
    setMoreError(false);
    const t = setTimeout(async () => {
      try {
        const d = await window.BracketApi.search(q.trim(), 1);
        if (live) {
          setResults(d.results || []);
          setPage(d.page || 1);
          setTotalPages(d.totalPages || 1);
          setShown(PAGE);
        }
      } catch (e) {
        if (live) {
          setResults([]);
          setError(true);
        }
      } finally {
        if (live) setLoading(false);
      }
    }, 300);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [q]);
  React.useEffect(() => {
    if (!filterOpen) return;
    const onDown = e => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [filterOpen]);

  // Closing the drawer (Close button or clicking off the pane) resets filters to All.
  React.useEffect(() => {
    if (!open) {
      setTypes(['movie', 'tv', 'anime']);
      setUpcomingOnly(false);
      setFilterOpen(false);
      setPreview(null);
      setQ('');
      setShown(PAGE);
      setMoreError(false);
    }
  }, [open]);
  if (!open) return null;
  const have = new Set(items.map(i => i.type + ':' + i.tmdbId));
  const doAdd = async r => {
    setAddError(null);
    const k = r.type + ':' + r.tmdbId;
    setAdding(a => ({
      ...a,
      [k]: true
    }));
    try {
      await onAdd(r);
    } catch (e) {
      setAdding(a => ({
        ...a,
        [k]: false
      }));
      setAddError(`Couldn’t add “${r.title}” — try again.`);
    }
  };
  const visibleResults = results.filter(r => types.includes(r.type));
  const hasMore = searching && (shown < visibleResults.length || page < totalPages);
  const seeMore = async () => {
    setMoreError(false);
    if (shown < visibleResults.length) {
      setShown(s => s + PAGE);
      return;
    }
    if (page < totalPages) {
      setLoadingMore(true);
      try {
        const d = await window.BracketApi.search(q.trim(), page + 1);
        setResults(prev => [...prev, ...(d.results || [])]);
        setPage(d.page || page + 1);
        setShown(s => s + PAGE);
      } catch (e) {
        setMoreError(true);
      } finally {
        setLoadingMore(false);
      }
    }
  };
  const TYPE_OPTS = [['movie', 'Movies', 'var(--type-movie)'], ['tv', 'Series', 'var(--type-tv)'], ['anime', 'Anime', 'var(--type-anime)']];
  const countOf = t => items.filter(i => i.type === t).length;
  const toggleFilterType = t => setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const filterActive = types.length < 3 || upcomingOnly;
  const list = items.filter(i => types.includes(i.type) && (!upcomingOnly || i.nextDate));
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 40,
      overflow: 'hidden',
      background: 'var(--overlay)',
      backdropFilter: 'var(--blur-sm)',
      WebkitBackdropFilter: 'var(--blur-sm)',
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'bracket-fade .18s ease'
    }
  }, /*#__PURE__*/React.createElement("style", null, `@keyframes bracket-fade{from{opacity:0}to{opacity:1}}@keyframes bracket-slide{from{transform:translateX(100%)}to{transform:translateX(0)}}`), /*#__PURE__*/React.createElement("aside", {
    ref: ref,
    tabIndex: -1,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Watchlist",
    onClick: e => e.stopPropagation(),
    className: "bracket-scroll",
    style: {
      width: 'min(440px, 100vw)',
      height: '100%',
      background: 'var(--surface-1)',
      borderLeft: '1px solid var(--border)',
      boxShadow: 'var(--shadow-xl)',
      display: 'flex',
      flexDirection: 'column',
      animation: 'bracket-slide .26s var(--ease-out)',
      outline: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-5)',
      borderBottom: '1px solid var(--border)',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--fs-xl)',
      fontWeight: 700,
      color: 'var(--text-strong)'
    }
  }, "Watchlist"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "default",
    onClick: onClose,
    "aria-label": "Close watchlist"
  }, "Close")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(SearchInput, {
    placeholder: "Search to add movies, series, anime\u2026",
    value: q,
    onChange: e => setQ(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    ref: filterRef,
    style: {
      position: 'relative',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setFilterOpen(o => !o),
    "aria-label": "Filter watchlist",
    "aria-haspopup": "true",
    "aria-expanded": filterOpen,
    style: {
      position: 'relative',
      width: 40,
      height: 40,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-md)',
      border: `1px solid ${filterActive ? 'var(--border-strong)' : 'var(--border)'}`,
      background: filterActive ? 'var(--surface-2)' : 'transparent',
      color: filterActive ? 'var(--text-strong)' : 'var(--text-muted)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      width: 18,
      height: 18
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z"
  })), filterActive && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: 'var(--accent)'
    }
  })), filterOpen && /*#__PURE__*/React.createElement("div", {
    role: "menu",
    style: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: 0,
      zIndex: 5,
      width: 204,
      background: 'var(--surface-1)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-xl)',
      padding: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-2xs)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--ls-wide)',
      color: 'var(--text-faint)',
      fontWeight: 600,
      padding: '6px 8px 4px'
    }
  }, "Show types"), TYPE_OPTS.map(([t, label, c]) => {
    const on = types.includes(t);
    return /*#__PURE__*/React.createElement("button", {
      key: t,
      role: "menuitemcheckbox",
      "aria-checked": on,
      onClick: () => toggleFilterType(t),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: 8,
        background: 'none',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        color: on ? 'var(--text-body)' : 'var(--text-faint)',
        fontSize: 'var(--fs-sm)',
        textAlign: 'left'
      },
      onMouseEnter: e => {
        e.currentTarget.style.background = 'var(--surface-2)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = 'none';
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 12,
        height: 12,
        borderRadius: '3px',
        background: on ? c : 'transparent',
        border: on ? 'none' : '1px solid var(--border-strong)',
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--fs-2xs)',
        color: 'var(--text-faint)',
        fontFamily: 'var(--font-mono)'
      }
    }, countOf(t)));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border)',
      margin: '4px 8px'
    }
  }), /*#__PURE__*/React.createElement("button", {
    role: "menuitemcheckbox",
    "aria-checked": upcomingOnly,
    onClick: () => setUpcomingOnly(v => !v),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: '100%',
      padding: 8,
      background: 'none',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      color: upcomingOnly ? 'var(--text-body)' : 'var(--text-faint)',
      fontSize: 'var(--fs-sm)',
      textAlign: 'left'
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = 'var(--surface-2)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'none';
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      borderRadius: '3px',
      background: upcomingOnly ? 'var(--accent)' : 'transparent',
      border: upcomingOnly ? 'none' : '1px solid var(--border-strong)',
      flex: 'none'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, "Upcoming only"))))), addError && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontSize: 'var(--fs-2xs)',
      color: 'var(--red-400)'
    }
  }, addError)), /*#__PURE__*/React.createElement("div", {
    className: "bracket-scroll",
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      padding: 'var(--space-4)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, searching ? /*#__PURE__*/React.createElement(React.Fragment, null, loading && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-2xs)',
      color: 'var(--text-faint)',
      padding: 6
    }
  }, "Searching\u2026"), !loading && error && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-2xs)',
      color: 'var(--red-400)',
      padding: 6
    }
  }, "Search is unavailable right now \u2014 try again shortly."), !loading && !error && visibleResults.length === 0 && !hasMore && /*#__PURE__*/React.createElement(EmptyState, {
    icon: "\uD83D\uDD0D",
    title: "No results",
    body: results.length ? 'Nothing matches your current type filter.' : `Nothing found for “${q}”.`
  }), visibleResults.slice(0, shown).map(r => {
    const k = r.type + ':' + r.tmdbId;
    const added = have.has(k) || r.onWatchlist || adding[k];
    return /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        padding: '8px 8px 8px 11px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      title: TYPE_LABEL[r.type],
      style: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        background: TYPE_COLOR[r.type] || TYPE_COLOR.movie
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => setPreview(r),
      style: {
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement(Poster, {
      type: r.type,
      src: r.posterUrl,
      width: 40
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      title: r.title,
      style: {
        display: 'block',
        fontWeight: 600,
        color: 'var(--text-strong)',
        fontSize: 'var(--fs-sm)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, r.title), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 'var(--fs-2xs)',
        color: 'var(--text-muted)'
      }
    }, r.year || ''))), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: added ? 'default' : 'primary',
      disabled: added,
      onClick: () => doAdd(r)
    }, added ? 'Added' : '+ Add'));
  }), !loading && !error && hasMore && /*#__PURE__*/React.createElement("button", {
    onClick: seeMore,
    disabled: loadingMore,
    style: {
      marginTop: 4,
      padding: 10,
      borderRadius: 'var(--radius-md)',
      border: '1px dashed var(--border-strong)',
      background: 'none',
      color: 'var(--text-body)',
      cursor: loadingMore ? 'default' : 'pointer',
      fontSize: 'var(--fs-sm)',
      fontWeight: 600
    }
  }, loadingMore ? 'Loading…' : 'See more results'), !loading && !error && !hasMore && visibleResults.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: 10,
      fontSize: 'var(--fs-2xs)',
      color: 'var(--text-faint)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--ls-wide)'
    }
  }, "End of results"), moreError && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-2xs)',
      color: 'var(--red-400)',
      padding: 4
    }
  }, "Couldn\u2019t load more \u2014 give it a moment.")) : list.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "\uD83D\uDECB\uFE0F",
    title: items.length === 0 ? 'Your watchlist is empty' : 'Nothing here',
    body: items.length === 0 ? 'Search above to add the movies, series and anime you’re waiting on.' : 'Try a different filter.'
  }) : list.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    onClick: () => onSelect(it.id),
    style: {
      flexShrink: 0,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      textAlign: 'left',
      padding: '8px 8px 8px 11px',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)',
      background: 'var(--surface-2)',
      cursor: 'pointer',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    title: TYPE_LABEL[it.type],
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      background: TYPE_COLOR[it.type] || TYPE_COLOR.movie
    }
  }), /*#__PURE__*/React.createElement(Poster, {
    type: it.type,
    src: it.posterUrl,
    width: 44
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    title: it.title,
    style: {
      display: 'block',
      fontWeight: 600,
      color: 'var(--text-strong)',
      fontSize: 'var(--fs-sm)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, it.title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(StatusBadge, {
    status: it.status
  }), extraMeta(it) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-2xs)',
      color: 'var(--text-muted)'
    }
  }, extraMeta(it))), it.nextDate && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--fs-2xs)',
      color: 'var(--text-muted)',
      marginTop: 5,
      fontFamily: 'var(--font-mono)'
    }
  }, "Next \xB7 ", prettyDate(it.nextDate)))))), preview && (() => {
    const pk = preview.type + ':' + preview.tmdbId;
    const pAdded = have.has(pk) || preview.onWatchlist || adding[pk];
    return /*#__PURE__*/React.createElement(Modal, {
      open: true,
      onClose: () => setPreview(null),
      width: 460,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "default",
        onClick: () => setPreview(null)
      }, "Close"), /*#__PURE__*/React.createElement(Button, {
        variant: pAdded ? 'default' : 'primary',
        disabled: pAdded,
        onClick: () => doAdd(preview)
      }, pAdded ? 'Added' : '+ Add to Watchlist'))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Poster, {
      type: preview.type,
      src: preview.posterUrl,
      width: 104,
      radius: "var(--radius-md)",
      style: {
        boxShadow: 'var(--shadow-lg)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement(TypePill, {
      type: preview.type
    }), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 'var(--fs-xl)',
        fontWeight: 800,
        color: 'var(--text-strong)',
        letterSpacing: 'var(--ls-snug)',
        marginTop: 8
      }
    }, preview.title), /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--text-muted)',
        fontSize: 'var(--fs-sm)',
        marginTop: 2,
        fontFamily: 'var(--font-mono)'
      }
    }, preview.year || '—'))), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--text-body)',
        fontSize: 'var(--fs-sm)',
        lineHeight: 'var(--lh-normal)',
        marginTop: 14
      }
    }, preview.overview || 'No description available yet.'));
  })()));
}

/* ---------------- SETTINGS ---------------- */
function SettingsModal({
  open,
  onClose,
  settings,
  onChange
}) {
  if (!open) return null;
  const set = patch => onChange({
    ...settings,
    ...patch
  });
  const toggleType = t => {
    const has = settings.defaultTypes.includes(t);
    set({
      defaultTypes: has ? settings.defaultTypes.filter(x => x !== t) : [...settings.defaultTypes, t]
    });
  };
  const Field = ({
    label,
    hint,
    children
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
      padding: '14px 0',
      borderBottom: '1px solid var(--border)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: 'var(--text-strong)',
      fontSize: 'var(--fs-sm)'
    }
  }, label), hint && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-2xs)',
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, hint)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none',
      minWidth: 150,
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, children));
  return /*#__PURE__*/React.createElement(Modal, {
    open: true,
    onClose: onClose,
    title: "Settings",
    subtitle: "Preferences are saved to your happysofa profile",
    width: 540,
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: onClose
    }, "Done")
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Default view",
    hint: "The in-app switcher overrides this per session"
  }, /*#__PURE__*/React.createElement(Select, {
    value: settings.defaultView,
    onChange: e => set({
      defaultView: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: "day"
  }, "Day"), /*#__PURE__*/React.createElement("option", {
    value: "week"
  }, "Week"), /*#__PURE__*/React.createElement("option", {
    value: "month"
  }, "Month"))), /*#__PURE__*/React.createElement(Field, {
    label: "Timezone",
    hint: "Episode air times are shown in this zone"
  }, /*#__PURE__*/React.createElement(Select, {
    value: settings.timezone,
    onChange: e => set({
      timezone: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: "Europe/London"
  }, "London"), /*#__PURE__*/React.createElement("option", {
    value: "America/New_York"
  }, "New York"), /*#__PURE__*/React.createElement("option", {
    value: "America/Los_Angeles"
  }, "Los Angeles"), /*#__PURE__*/React.createElement("option", {
    value: "Asia/Tokyo"
  }, "Tokyo"))), /*#__PURE__*/React.createElement(Field, {
    label: "Theme"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-muted)'
    }
  }, settings.theme === 'dark' ? 'Dark' : 'Light'), /*#__PURE__*/React.createElement(Switch, {
    checked: settings.theme === 'dark',
    onChange: v => set({
      theme: v ? 'dark' : 'light'
    }),
    label: "Dark theme"
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Default type filters",
    hint: "Which release types show by default"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap',
      justifyContent: 'flex-end'
    }
  }, [['movie', 'Movies', 'var(--type-movie)'], ['tv', 'Series', 'var(--type-tv)'], ['anime', 'Anime', 'var(--type-anime)']].map(([t, l, c]) => {
    const on = settings.defaultTypes.includes(t);
    return /*#__PURE__*/React.createElement("button", {
      key: t,
      onClick: () => toggleType(t),
      "aria-pressed": on,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 10px',
        borderRadius: 'var(--radius-full)',
        border: `1px solid ${on ? 'var(--border-strong)' : 'var(--border)'}`,
        background: on ? 'var(--surface-2)' : 'transparent',
        color: on ? 'var(--text-body)' : 'var(--text-faint)',
        cursor: 'pointer',
        fontSize: 'var(--fs-sm)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10,
        height: 10,
        borderRadius: '3px',
        background: c,
        opacity: on ? 1 : 0.35
      }
    }), l);
  }))));
}

/* ---------------- AUTH GATE ---------------- */
function AuthGate({
  onSignIn,
  error
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'var(--bg-app-gradient)',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(60% 50% at 50% 35%, color-mix(in srgb, var(--purple-700) 22%, transparent), transparent 70%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: 380,
      maxWidth: '100%',
      textAlign: 'center',
      background: 'var(--surface-1)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-2xl)',
      boxShadow: 'var(--shadow-xl)',
      padding: 36
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "/assets/brand/happysofa-sofa.jpg",
    alt: "happysofa",
    style: {
      width: 84,
      height: 84,
      borderRadius: 'var(--radius-xl)',
      objectFit: 'cover',
      boxShadow: 'var(--shadow-brand)',
      margin: '0 auto 18px'
    }
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30,
      fontWeight: 800,
      letterSpacing: 'var(--ls-tight)',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)'
    }
  }, "Bracket")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 'var(--fs-sm)',
      lineHeight: 'var(--lh-normal)',
      marginBottom: 24
    }
  }, "Your happysofa release calendar. Track the media on your watchlist \u2014 by the date it actually drops."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    onClick: onSignIn,
    iconLeft: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      fill: "currentColor",
      style: {
        width: '100%',
        height: '100%'
      }
    }, /*#__PURE__*/React.createElement("path", {
      d: "M4 2l8 10-8 10h4l8-10L8 2z"
    }))
  }, "Sign in with Plex"), error && /*#__PURE__*/React.createElement("p", {
    role: "alert",
    style: {
      color: 'var(--red-400)',
      fontSize: 'var(--fs-sm)',
      marginTop: 14,
      marginBottom: 0
    }
  }, error), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-faint)',
      fontSize: 'var(--fs-2xs)',
      marginTop: 16
    }
  }, "You sign in securely on plex.tv \u2014 Bracket never sees your password."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-faint)',
      fontSize: 'var(--fs-2xs)',
      marginTop: 6
    }
  }, "Private community \xB7 invite only")));
}
window.BracketKit = Object.assign(window.BracketKit || {}, {
  DetailModal,
  WatchlistDrawer,
  SettingsModal,
  AuthGate
});

})();
