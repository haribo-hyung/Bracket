(function(){
/* Bracket kit — calendar views (Month / Week / Day) */
const {
  EventChip,
  Badge,
  Poster,
  TypePill
} = window.BracketDesignSystem_93e078;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TYPE_BAR = {
  movie: 'var(--type-movie)',
  tv: 'var(--type-tv)',
  anime: 'var(--type-anime)'
};
const TYPE_PLURAL = [['movie', 'Movies'], ['tv', 'Series'], ['anime', 'Anime']];
function ymd(d) {
  return d.toISOString().slice(0, 10);
}
function fromYmd(s) {
  const [y, m, dd] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, dd));
}
function addMonths(d, n) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
}
function mondayIndex(d) {
  return (d.getUTCDay() + 6) % 7;
} // 0=Mon
function isWeekend(i) {
  return i % 7 >= 5;
}
function fmtTime(iso) {
  const t = iso.slice(11, 16);
  if (!t) return '';
  let [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'p' : 'a';
  h = h % 12 || 12;
  return m ? `${h}:${String(m).padStart(2, '0')}${ap}` : `${h}${ap}`;
}
/* Bucket events by day once (O(N)) instead of filtering the whole array per cell. */
function bucketByDay(events) {
  const m = new Map();
  for (const e of events) {
    const k = e.start.slice(0, 10);
    let a = m.get(k);
    if (!a) {
      a = [];
      m.set(k, a);
    }
    a.push(e);
  }
  return m;
}

/* --- Calendar-entry text: "Name, S04E35" + "16:00, EPISODE TITLE" --- */
function pad2(n) {
  return String(n).padStart(2, '0');
}
function localTime(iso) {
  if (!iso || iso.length <= 10) return '';
  const d = new Date(iso);
  return isNaN(d) ? '' : d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}
function epCode(e) {
  return e.season != null && e.episode != null ? `S${pad2(e.season)}E${pad2(e.episode)}` : '';
}
function chipTitle(e) {
  const code = e.releaseKind === 'episode' ? epCode(e) : '';
  return code ? `${e.title}, ${code}` : e.title;
}
function chipMeta(e) {
  const t = localTime(e.start);
  if (e.releaseKind === 'episode') return [t, e.episodeTitle].filter(Boolean).join(', ');
  const kind = e.releaseKind ? e.releaseKind.charAt(0).toUpperCase() + e.releaseKind.slice(1) : '';
  return [t, kind].filter(Boolean).join(', ');
}

/* Wrapper that collapses + fades a chip in/out with the toggle's soft-close curve,
   so hiding a type animates instead of snapping. Kept mounted to animate both ways. */
const FADE_EASE = 'cubic-bezier(0.2, 0.75, 0.12, 1)';
function FadeChip({
  show,
  gap = 3,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      maxHeight: show ? 140 : 0,
      opacity: show ? 1 : 0,
      marginBottom: show ? gap : 0,
      overflow: 'hidden',
      pointerEvents: show ? 'auto' : 'none',
      transition: `max-height 650ms ${FADE_EASE}, opacity 650ms ${FADE_EASE}, margin 650ms ${FADE_EASE}`
    }
  }, children);
}

/* ---------------- MONTH ---------------- */
function MonthGrid({
  cursor,
  events,
  today,
  onSelect,
  onOpenDay,
  activeTypes,
  mobile,
  fill
}) {
  const byDay = React.useMemo(() => bucketByDay(events), [events]);
  const first = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), 1));
  const start = new Date(first);
  start.setUTCDate(1 - mondayIndex(first));
  // Only render the weeks the month actually occupies (drops the perpetual dead
  // trailing row) — usually 5 rows, never the old fixed 6.
  const daysInMonth = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0)).getUTCDate();
  const cellCount = Math.ceil((mondayIndex(first) + daysInMonth) / 7) * 7;
  const cells = Array.from({
    length: cellCount
  }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    return d;
  });
  const curMonth = cursor.getUTCMonth();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: fill ? '100%' : 'auto',
      background: 'var(--surface-1)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-lg)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
      borderBottom: '1px solid var(--border)',
      flex: 'none'
    }
  }, DOW.map(d => /*#__PURE__*/React.createElement("div", {
    key: d,
    style: {
      padding: '8px 10px',
      fontSize: 'var(--fs-xs)',
      fontWeight: 600,
      letterSpacing: 'var(--ls-wide)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, d))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
      gridAutoRows: fill ? '1fr' : 'auto',
      flex: fill ? 1 : 'none',
      minHeight: 0
    }
  }, cells.map((d, i) => {
    const ds = ymd(d);
    const inMonth = d.getUTCMonth() === curMonth;
    const isToday = ds === today;
    const evs = byDay.get(ds) || [];
    const visible = evs.filter(e => activeTypes.includes(e.type));
    const shown = visible.slice(0, 3);
    const shownIds = new Set(shown.map(e => e.id));
    const more = visible.length - shown.length;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "bracket-daycell",
      onClick: () => onOpenDay && onOpenDay(ds),
      style: {
        borderRight: i % 7 !== 6 ? '1px solid var(--border)' : 'none',
        borderBottom: i < cellCount - 7 ? '1px solid var(--border)' : 'none',
        position: 'relative',
        cursor: 'pointer',
        aspectRatio: mobile || fill ? 'auto' : '4 / 3.5',
        minHeight: mobile ? 58 : 0,
        overflow: 'hidden',
        padding: 5,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        background: isToday ? 'var(--brand-soft)' : inMonth ? isWeekend(i) ? 'color-mix(in srgb, var(--surface-sunken) 22%, transparent)' : 'transparent' : 'color-mix(in srgb, var(--surface-sunken) 45%, transparent)',
        transition: 'background var(--dur-fast) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        padding: '1px 1px 1px 3px'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onOpenDay && onOpenDay(ds),
      "aria-label": `Open ${ds}`,
      style: {
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        fontSize: 'var(--fs-sm)',
        fontWeight: isToday ? 700 : 500,
        fontVariantNumeric: 'tabular-nums',
        color: isToday ? '#fff' : inMonth ? 'var(--text-body)' : 'var(--text-faint)',
        background: isToday ? 'var(--brand)' : 'transparent',
        width: 26,
        height: 26,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none'
      }
    }, d.getUTCDate())), d.getUTCDate() === 1 && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: mobile ? 6 : 9,
        right: mobile ? 6 : 9,
        fontSize: 'var(--fs-2xs)',
        fontWeight: 700,
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        whiteSpace: 'nowrap',
        pointerEvents: 'none'
      }
    }, MONTHS[d.getUTCMonth()].slice(0, 3)), mobile ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minWidth: 0
      }
    }, TYPE_PLURAL.map(([t, label]) => {
      const n = visible.filter(e => e.type === t).length;
      return n ? /*#__PURE__*/React.createElement("span", {
        key: t,
        style: {
          fontSize: 'var(--fs-2xs)',
          fontWeight: 700,
          color: `color-mix(in srgb, ${TYPE_BAR[t]} 65%, var(--text-strong))`,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: 1.3
        }
      }, n, "\xD7 ", label) : null;
    })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0
      }
    }, evs.map(e => /*#__PURE__*/React.createElement(FadeChip, {
      key: e.id,
      show: activeTypes.includes(e.type) && shownIds.has(e.id)
    }, /*#__PURE__*/React.createElement(EventChip, {
      title: chipTitle(e),
      type: e.type,
      poster: e.posterUrl,
      meta: chipMeta(e),
      dense: true,
      onClick: () => onSelect(e.itemId)
    })))), more > 0 && /*#__PURE__*/React.createElement("button", {
      onClick: () => onOpenDay && onOpenDay(ds),
      style: {
        alignSelf: 'flex-start',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-full)',
        padding: '1px 8px',
        fontSize: 'var(--fs-2xs)',
        fontWeight: 600,
        color: 'var(--text-muted)',
        cursor: 'pointer'
      }
    }, "+", more, " more")));
  })), /*#__PURE__*/React.createElement("style", null, `.bracket-daycell:hover{background:color-mix(in srgb, var(--surface-2) 75%, transparent)!important;box-shadow:inset 0 0 0 1px var(--border-strong);}`));
}

/* ---------------- WEEK ---------------- */
function WeekGrid({
  cursor,
  events,
  today,
  onSelect,
  activeTypes
}) {
  const byDay = React.useMemo(() => bucketByDay(events), [events]);
  const start = new Date(cursor);
  start.setUTCDate(cursor.getUTCDate() - mondayIndex(cursor));
  const days = Array.from({
    length: 7
  }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    return d;
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "bracket-scroll",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, minmax(132px, 1fr))',
      gap: 8,
      height: '100%',
      overflowX: 'auto'
    }
  }, days.map((d, i) => {
    const ds = ymd(d);
    const isToday = ds === today;
    const evs = (byDay.get(ds) || []).slice().sort((a, b) => Number(a.allDay) - Number(b.allDay) || a.start.localeCompare(b.start));
    const visible = evs.filter(e => activeTypes.includes(e.type));
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "bracket-scroll",
      style: {
        background: 'var(--surface-1)',
        border: `1px solid ${isToday ? 'color-mix(in srgb, var(--brand) 55%, transparent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 10px',
        borderBottom: '1px solid var(--border)',
        flex: 'none',
        background: isToday ? 'var(--brand-soft)' : 'transparent',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 'var(--fs-xs)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--ls-wide)',
        color: 'var(--text-muted)',
        fontWeight: 600
      }
    }, DOW[i]), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 'var(--fs-xl)',
        fontWeight: 700,
        color: isToday ? 'var(--accent)' : 'var(--text-strong)'
      }
    }, d.getUTCDate())), visible.length > 0 && /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral"
    }, visible.length)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 6,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }
    }, visible.length === 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--fs-2xs)',
        color: 'var(--text-muted)',
        padding: 6
      }
    }, "Nothing scheduled"), evs.map(e => /*#__PURE__*/React.createElement(FadeChip, {
      key: e.id,
      show: activeTypes.includes(e.type),
      gap: 5
    }, /*#__PURE__*/React.createElement(EventChip, {
      title: chipTitle(e),
      type: e.type,
      poster: e.posterUrl,
      meta: chipMeta(e),
      onClick: () => onSelect(e.itemId)
    })))));
  }));
}

/* ---------------- DAY ---------------- */
function DayAgenda({
  cursor,
  events,
  today,
  onSelect,
  activeTypes
}) {
  const byDay = React.useMemo(() => bucketByDay(events), [events]);
  const ds = ymd(cursor);
  const isToday = ds === today;
  const evs = (byDay.get(ds) || []).slice().sort((a, b) => Number(a.allDay) - Number(b.allDay) || a.start.localeCompare(b.start));
  const allDayAll = evs.filter(e => e.allDay);
  const timedAll = evs.filter(e => !e.allDay);
  const visAllDay = allDayAll.filter(e => activeTypes.includes(e.type));
  const visTimed = timedAll.filter(e => activeTypes.includes(e.type));
  const heading = cursor.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
  const Row = ({
    e
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: () => onSelect(e.itemId),
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'center',
      width: '100%',
      textAlign: 'left',
      padding: 12,
      background: 'var(--surface-1)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      cursor: 'pointer',
      boxShadow: 'var(--shadow-sm)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 64,
      flex: 'none',
      fontSize: 'var(--fs-sm)',
      fontFamily: 'var(--font-mono)',
      color: 'var(--text-muted)'
    }
  }, e.allDay ? 'All day' : localTime(e.start) || 'All day'), /*#__PURE__*/React.createElement(Poster, {
    type: e.type,
    src: e.posterUrl,
    width: 42
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontWeight: 700,
      color: 'var(--text-strong)',
      fontSize: 'var(--fs-base)'
    }
  }, chipTitle(e)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-muted)'
    }
  }, e.releaseKind === 'episode' ? e.episodeTitle || '' : chipMeta(e))), /*#__PURE__*/React.createElement(TypePill, {
    type: e.type
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: "bracket-scroll",
    style: {
      maxWidth: 760,
      margin: '0 auto',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      overflowY: 'auto',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--fs-xl)',
      fontWeight: 700,
      color: 'var(--text-strong)'
    }
  }, heading), isToday && /*#__PURE__*/React.createElement(Badge, {
    tone: "brand"
  }, "Today")), visAllDay.length + visTimed.length === 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-muted)'
    }
  }, "Nothing dropping this day. Enjoy the quiet."), visAllDay.length > 0 && /*#__PURE__*/React.createElement(Section, {
    title: "All day",
    count: visAllDay.length
  }, allDayAll.map(e => /*#__PURE__*/React.createElement(FadeChip, {
    key: e.id,
    show: activeTypes.includes(e.type),
    gap: 8
  }, /*#__PURE__*/React.createElement(Row, {
    e: e
  })))), visTimed.length > 0 && /*#__PURE__*/React.createElement(Section, {
    title: "Scheduled",
    count: visTimed.length
  }, timedAll.map(e => /*#__PURE__*/React.createElement(FadeChip, {
    key: e.id,
    show: activeTypes.includes(e.type),
    gap: 8
  }, /*#__PURE__*/React.createElement(Row, {
    e: e
  })))));
}
function Section({
  title,
  count,
  children
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--fs-xs)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--ls-wide)',
      color: 'var(--text-muted)',
      fontWeight: 600
    }
  }, title), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, count)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, children));
}

/* ---------------- DAY FLYOUT ---------------- */
/* Compact day view that pops out beside the calendar (calendar stays interactive). */
function DayPanel({
  dateStr,
  events,
  today,
  onSelect,
  onClose,
  activeTypes,
  inline
}) {
  const byDay = React.useMemo(() => bucketByDay(events), [events]);
  const d = fromYmd(dateStr);
  const evs = (byDay.get(dateStr) || []).slice().sort((a, b) => Number(a.allDay) - Number(b.allDay) || a.start.localeCompare(b.start)).filter(e => activeTypes.includes(e.type));
  const isToday = dateStr === today;
  const heading = d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC'
  });
  const shell = inline ? {
    flex: 'none',
    width: '100%',
    maxHeight: 'min(60vh, 460px)',
    marginTop: 'var(--space-3)',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--surface-1)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
    overflow: 'hidden'
  } : {
    flex: 'none',
    width: 'min(380px, 42vw)',
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--surface-1)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-xl)',
    overflow: 'hidden',
    animation: 'bracket-flyout .3s var(--ease-out)'
  };
  return /*#__PURE__*/React.createElement("aside", {
    "aria-label": `Releases on ${heading}`,
    style: shell
  }, /*#__PURE__*/React.createElement("style", null, `@keyframes bracket-flyout{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}`), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px',
      borderBottom: '1px solid var(--border)',
      flex: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      background: isToday ? 'var(--brand-soft)' : 'transparent'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--fs-base)',
      fontWeight: 700,
      color: 'var(--text-strong)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, heading), isToday && /*#__PURE__*/React.createElement(Badge, {
    tone: "brand"
  }, "Today")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close day view",
    style: {
      flex: 'none',
      width: 28,
      height: 28,
      borderRadius: 'var(--radius-md)',
      border: 'none',
      background: 'var(--surface-2)',
      color: 'var(--text-muted)',
      cursor: 'pointer',
      fontSize: 18,
      lineHeight: 1
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    className: "bracket-scroll",
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, evs.length === 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-muted)',
      padding: 4
    }
  }, "Nothing dropping this day."), evs.map(e => /*#__PURE__*/React.createElement("button", {
    key: e.id,
    onClick: () => onSelect(e.itemId),
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      width: '100%',
      textAlign: 'left',
      padding: 8,
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 50,
      flex: 'none',
      fontSize: 'var(--fs-xs)',
      fontFamily: 'var(--font-mono)',
      color: 'var(--text-muted)'
    }
  }, e.allDay ? 'All day' : localTime(e.start) || 'All day'), /*#__PURE__*/React.createElement(Poster, {
    type: e.type,
    src: e.posterUrl,
    width: 38
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontWeight: 600,
      color: 'var(--text-strong)',
      fontSize: 'var(--fs-sm)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, chipTitle(e)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--fs-2xs)',
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, e.releaseKind === 'episode' ? e.episodeTitle || '' : chipMeta(e))), /*#__PURE__*/React.createElement(TypePill, {
    type: e.type
  })))));
}

/* ---------------- MONTH (mobile agenda) ----------------
   On phones the 7-col grid is unusable, so render the month as a scrollable
   list grouped by date — only days that actually have (visible) events. */
function MonthAgenda({
  cursor,
  events,
  today,
  onSelect,
  activeTypes
}) {
  const ym = ymd(cursor).slice(0, 7);
  const evs = events.filter(e => activeTypes.includes(e.type) && e.start.slice(0, 7) === ym).slice().sort((a, b) => a.start.localeCompare(b.start));
  const byDay = new Map();
  for (const e of evs) {
    const k = e.start.slice(0, 10);
    let a = byDay.get(k);
    if (!a) {
      a = [];
      byDay.set(k, a);
    }
    a.push(e);
  }
  const days = [...byDay.keys()];
  return /*#__PURE__*/React.createElement("div", {
    className: "bracket-scroll",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      height: '100%',
      overflowY: 'auto',
      paddingBottom: 8
    }
  }, days.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      color: 'var(--text-muted)',
      fontSize: 'var(--fs-sm)',
      padding: 'var(--space-10) var(--space-4)'
    }
  }, "Nothing scheduled in ", MONTHS[cursor.getUTCMonth()], "."), days.map(ds => {
    const d = fromYmd(ds);
    const isToday = ds === today;
    return /*#__PURE__*/React.createElement("div", {
      key: ds
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 8,
        padding: '0 2px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--fs-xl)',
        fontWeight: 800,
        color: isToday ? 'var(--accent)' : 'var(--text-strong)',
        fontVariantNumeric: 'tabular-nums'
      }
    }, d.getUTCDate()), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--fs-xs)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--ls-wide)',
        color: 'var(--text-muted)',
        fontWeight: 600
      }
    }, d.toLocaleDateString('en-GB', {
      weekday: 'long',
      timeZone: 'UTC'
    })), isToday && /*#__PURE__*/React.createElement(Badge, {
      tone: "brand"
    }, "Today")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, byDay.get(ds).map(e => /*#__PURE__*/React.createElement("button", {
      key: e.id,
      onClick: () => onSelect(e.itemId),
      style: {
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        textAlign: 'left',
        padding: '8px 8px 8px 11px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        background: 'var(--surface-1)',
        cursor: 'pointer',
        width: '100%'
      }
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        background: TYPE_BAR[e.type] || TYPE_BAR.movie
      }
    }), !e.allDay && localTime(e.start) && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 44,
        flex: 'none',
        fontSize: 'var(--fs-2xs)',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-muted)'
      }
    }, localTime(e.start)), /*#__PURE__*/React.createElement(Poster, {
      type: e.type,
      src: e.posterUrl,
      width: 34
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontWeight: 600,
        color: 'var(--text-strong)',
        fontSize: 'var(--fs-sm)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, chipTitle(e)), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 'var(--fs-2xs)',
        color: 'var(--text-muted)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, e.releaseKind === 'episode' ? e.episodeTitle || '' : chipMeta(e)))))));
  }));
}
window.BracketKit = Object.assign(window.BracketKit || {}, {
  MonthGrid,
  MonthAgenda,
  WeekGrid,
  DayAgenda,
  DayPanel,
  MONTHS,
  addMonths,
  ymd,
  fromYmd,
  mondayIndex
});

})();
