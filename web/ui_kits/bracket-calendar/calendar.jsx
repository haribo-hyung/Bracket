/* Bracket kit — calendar views (Month / Week / Day) */
const { EventChip, Badge, Poster, TypePill } = window.BracketDesignSystem_93e078;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW_MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DOW_SUN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TYPE_BAR = { movie: 'var(--type-movie)', tv: 'var(--type-tv)', anime: 'var(--type-anime)' };
const TYPE_PLURAL = [['movie', 'Movies'], ['tv', 'Series'], ['anime', 'Anime']];

function ymd(d) { return d.toISOString().slice(0, 10); }
function fromYmd(s) { const [y, m, dd] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, dd)); }
function addMonths(d, n) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1)); }
function startOffset(weekStart) { return weekStart === 'sunday' ? 0 : 1; }
function startIdx(d, offset) { return (d.getUTCDay() - offset + 7) % 7; }
function mondayIndex(d) { return startIdx(d, 1); } // 0=Mon (kept for backward compat)
function isWeekendCell(i, offset) { return offset === 0 ? (i % 7 === 0 || i % 7 === 6) : i % 7 >= 5; }
function fmtTime(iso) {
  const t = iso.slice(11, 16);
  if (!t) return '';
  let [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'p' : 'a'; h = h % 12 || 12;
  return m ? `${h}:${String(m).padStart(2, '0')}${ap}` : `${h}${ap}`;
}
/* Bucket events by day once (O(N)) instead of filtering the whole array per cell. */
function bucketByDay(events) {
  const m = new Map();
  for (const e of events) {
    const k = e.start.slice(0, 10);
    let a = m.get(k); if (!a) { a = []; m.set(k, a); }
    a.push(e);
  }
  return m;
}

/* --- Calendar-entry text: "Name, S04E35" + "16:00, EPISODE TITLE" --- */
function pad2(n) { return String(n).padStart(2, '0'); }
function localTime(iso, tz) {
  if (!iso || iso.length <= 10) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, ...(tz ? { timeZone: tz } : {}) });
}
function epCode(e) { return (e.season != null && e.episode != null) ? `S${pad2(e.season)}E${pad2(e.episode)}` : ''; }
function chipTitle(e) {
  const code = e.releaseKind === 'episode' ? epCode(e) : '';
  return code ? `${e.title}, ${code}` : e.title;
}
function chipMeta(e, tz) {
  const t = localTime(e.start, tz);
  if (e.releaseKind === 'episode') return [t, e.episodeTitle].filter(Boolean).join(', ');
  const kind = e.releaseKind ? e.releaseKind.charAt(0).toUpperCase() + e.releaseKind.slice(1) : '';
  return [t, kind].filter(Boolean).join(', ');
}

/* Wrapper that collapses + fades a chip in/out with the toggle's soft-close curve,
   so hiding a type animates instead of snapping. Kept mounted to animate both ways. */
const FADE_EASE = 'cubic-bezier(0.2, 0.75, 0.12, 1)';
function FadeChip({ show, gap = 3, children }) {
  return (
    <div style={{
      maxHeight: show ? 140 : 0, opacity: show ? 1 : 0, marginBottom: show ? gap : 0,
      overflow: 'hidden', pointerEvents: show ? 'auto' : 'none',
      transition: `max-height 650ms ${FADE_EASE}, opacity 650ms ${FADE_EASE}, margin 650ms ${FADE_EASE}`,
    }}>{children}</div>
  );
}

/* ---------------- MONTH ---------------- */
function MonthGrid({ cursor, events, today, onSelect, onOpenDay, activeTypes, mobile, fill, tz, weekStart }) {
  const offset = startOffset(weekStart);
  const DOW = offset === 0 ? DOW_SUN : DOW_MON;
  const byDay = React.useMemo(() => bucketByDay(events), [events]);
  const first = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), 1));
  const firstIdx = startIdx(first, offset);
  const start = new Date(first); start.setUTCDate(1 - firstIdx);
  // Only render the weeks the month actually occupies (drops the perpetual dead
  // trailing row) — usually 5 rows, never the old fixed 6.
  const daysInMonth = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0)).getUTCDate();
  const cellCount = Math.ceil((firstIdx + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: cellCount }, (_, i) => { const d = new Date(start); d.setUTCDate(start.getUTCDate() + i); return d; });
  const curMonth = cursor.getUTCMonth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: fill ? '100%' : 'auto', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', borderBottom: '1px solid var(--border)', flex: 'none' }}>
        {DOW.map((d) => <div key={d} style={{ padding: '8px 10px', fontSize: 'var(--fs-xs)', fontWeight: 600, letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gridAutoRows: fill ? '1fr' : 'auto', flex: fill ? 1 : 'none', minHeight: 0 }}>
        {cells.map((d, i) => {
          const ds = ymd(d);
          const inMonth = d.getUTCMonth() === curMonth;
          const isToday = ds === today;
          const evs = byDay.get(ds) || [];
          const visible = evs.filter((e) => activeTypes.includes(e.type));
          const shown = visible.slice(0, 3);
          const shownIds = new Set(shown.map((e) => e.id));
          const more = visible.length - shown.length;
          return (
            <div key={i} className="bracket-daycell" onClick={() => onOpenDay && onOpenDay(ds)} style={{
              borderRight: (i % 7 !== 6) ? '1px solid var(--border)' : 'none',
              borderBottom: i < cellCount - 7 ? '1px solid var(--border)' : 'none',
              position: 'relative', cursor: 'pointer', aspectRatio: (mobile || fill) ? 'auto' : '4 / 3.5', minHeight: mobile ? 58 : 0, overflow: 'hidden', padding: 5, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3,
              background: isToday ? 'var(--brand-soft)'
                : inMonth ? (isWeekendCell(i, offset) ? 'color-mix(in srgb, var(--surface-sunken) 22%, transparent)' : 'transparent')
                : 'color-mix(in srgb, var(--surface-sunken) 45%, transparent)',
              transition: 'background var(--dur-fast) var(--ease-out)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '1px 1px 1px 3px' }}>
                <button aria-label={`Open ${ds}`}
                  style={{
                    border: 'none', cursor: 'pointer', padding: 0,
                    fontSize: 'var(--fs-sm)', fontWeight: isToday ? 700 : 500, fontVariantNumeric: 'tabular-nums',
                    color: isToday ? '#fff' : inMonth ? 'var(--text-body)' : 'var(--text-faint)',
                    background: isToday ? 'var(--brand)' : 'transparent',
                    width: 26, height: 26, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
                  }}>{d.getUTCDate()}</button>
              </div>
              {d.getUTCDate() === 1 && (
                <span style={{ position: 'absolute', top: mobile ? 6 : 9, right: mobile ? 6 : 9, fontSize: 'var(--fs-2xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap', pointerEvents: 'none' }}>{MONTHS[d.getUTCMonth()].slice(0, 3)}</span>
              )}
              {mobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  {TYPE_PLURAL.map(([t, label]) => {
                    const n = visible.filter((e) => e.type === t).length;
                    return n ? <span key={t} style={{ fontSize: 'var(--fs-2xs)', fontWeight: 700, color: `color-mix(in srgb, ${TYPE_BAR[t]} 65%, var(--text-strong))`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }}>{n}× {label}</span> : null;
                  })}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    {evs.map((e) => (
                      <FadeChip key={e.id} show={activeTypes.includes(e.type) && shownIds.has(e.id)}>
                        <div style={{ opacity: e.start.slice(0, 10) < today ? 0.45 : 1, transition: 'opacity 200ms' }}>
                          <EventChip title={chipTitle(e)} type={e.type} poster={e.posterUrl} meta={chipMeta(e, tz)} dense />
                        </div>
                      </FadeChip>
                    ))}
                  </div>
                  {more > 0 && (
                    <span
                      style={{ alignSelf: 'flex-start', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '1px 8px', fontSize: 'var(--fs-2xs)', fontWeight: 600, color: 'var(--text-muted)' }}>+{more} more</span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      <style>{`.bracket-daycell:hover{background:color-mix(in srgb, var(--surface-2) 75%, transparent)!important;box-shadow:inset 0 0 0 1px var(--border-strong);}`}</style>
    </div>
  );
}

/* ---------------- WEEK ---------------- */
function WeekGrid({ cursor, events, today, onSelect, activeTypes, tz, weekStart }) {
  const offset = startOffset(weekStart);
  const DOW = offset === 0 ? DOW_SUN : DOW_MON;
  const byDay = React.useMemo(() => bucketByDay(events), [events]);
  const start = new Date(cursor); start.setUTCDate(cursor.getUTCDate() - startIdx(cursor, offset));
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setUTCDate(start.getUTCDate() + i); return d; });
  return (
    <div className="bracket-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(132px, 1fr))', gap: 8, height: '100%', overflowX: 'auto' }}>
      {days.map((d, i) => {
        const ds = ymd(d); const isToday = ds === today;
        const evs = (byDay.get(ds) || []).slice().sort((a, b) => Number(a.allDay) - Number(b.allDay) || a.start.localeCompare(b.start));
        const visible = evs.filter((e) => activeTypes.includes(e.type));
        return (
          <div key={i} className="bracket-scroll" style={{ background: 'var(--surface-1)', border: `1px solid ${isToday ? 'color-mix(in srgb, var(--brand) 55%, transparent)' : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', flex: 'none', background: isToday ? 'var(--brand-soft)' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <div style={{ fontSize: 'var(--fs-xs)', textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)', color: 'var(--text-muted)', fontWeight: 600 }}>{DOW[i]}</div>
                <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, color: isToday ? 'var(--accent)' : 'var(--text-strong)' }}>{d.getUTCDate()}</div>
              </div>
              {visible.length > 0 && <Badge tone="neutral">{visible.length}</Badge>}
            </div>
            <div style={{ padding: 6, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              {visible.length === 0 && <span style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)', padding: 6 }}>Nothing scheduled</span>}
              {evs.map((e) => (
                <FadeChip key={e.id} show={activeTypes.includes(e.type)} gap={5}>
                  <div style={{ opacity: e.start.slice(0, 10) < today ? 0.45 : 1, transition: 'opacity 200ms' }}>
                    <EventChip title={chipTitle(e)} type={e.type} poster={e.posterUrl} meta={chipMeta(e, tz)} onClick={() => onSelect(e.itemId)} />
                  </div>
                </FadeChip>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- DAY ---------------- */
function DayAgenda({ cursor, events, today, onSelect, activeTypes, tz }) {
  const byDay = React.useMemo(() => bucketByDay(events), [events]);
  const ds = ymd(cursor);
  const isToday = ds === today;
  const evs = (byDay.get(ds) || []).slice().sort((a, b) => Number(a.allDay) - Number(b.allDay) || a.start.localeCompare(b.start));
  const allDayAll = evs.filter((e) => e.allDay);
  const timedAll = evs.filter((e) => !e.allDay);
  const visAllDay = allDayAll.filter((e) => activeTypes.includes(e.type));
  const visTimed = timedAll.filter((e) => activeTypes.includes(e.type));
  const heading = cursor.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const Row = ({ e }) => (
    <button onClick={() => onSelect(e.itemId)} style={{ display: 'flex', gap: 14, alignItems: 'center', width: '100%', textAlign: 'left', padding: 12, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', opacity: e.start.slice(0, 10) < today ? 0.55 : 1, transition: 'opacity 200ms' }}>
      <span style={{ width: 64, flex: 'none', fontSize: 'var(--fs-sm)', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{e.allDay ? 'All day' : (localTime(e.start, tz) || 'All day')}</span>
      <Poster type={e.type} src={e.posterUrl} width={42} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontWeight: 700, color: 'var(--text-strong)', fontSize: 'var(--fs-base)' }}>{chipTitle(e)}</span>
        <span style={{ display: 'block', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>{e.releaseKind === 'episode' ? (e.episodeTitle || '') : chipMeta(e, tz)}</span>
      </span>
      <TypePill type={e.type} />
    </button>
  );
  return (
    <div className="bracket-scroll" style={{ maxWidth: 760, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h2 style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, color: 'var(--text-strong)' }}>{heading}</h2>
        {isToday && <Badge tone="brand">Today</Badge>}
      </div>
      {visAllDay.length + visTimed.length === 0 && <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>Nothing dropping this day. Enjoy the quiet.</span>}
      {visAllDay.length > 0 && <Section title="All day" count={visAllDay.length}>{allDayAll.map((e) => <FadeChip key={e.id} show={activeTypes.includes(e.type)} gap={8}><Row e={e} /></FadeChip>)}</Section>}
      {visTimed.length > 0 && <Section title="Scheduled" count={visTimed.length}>{timedAll.map((e) => <FadeChip key={e.id} show={activeTypes.includes(e.type)} gap={8}><Row e={e} /></FadeChip>)}</Section>}
    </div>
  );
}
function Section({ title, count, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <h3 style={{ fontSize: 'var(--fs-xs)', textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)', color: 'var(--text-muted)', fontWeight: 600 }}>{title}</h3>
        <Badge tone="neutral">{count}</Badge>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  );
}

/* ---------------- DAY FLYOUT ---------------- */
/* Compact day view that pops out beside the calendar (calendar stays interactive). */
function DayPanel({ dateStr, events, today, onSelect, onClose, activeTypes, inline, tz }) {
  const byDay = React.useMemo(() => bucketByDay(events), [events]);
  const d = fromYmd(dateStr);
  const evs = (byDay.get(dateStr) || []).slice()
    .sort((a, b) => Number(a.allDay) - Number(b.allDay) || a.start.localeCompare(b.start))
    .filter((e) => activeTypes.includes(e.type));
  const isToday = dateStr === today;
  const heading = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  const shell = inline
    ? { flex: 'none', width: '100%', maxHeight: 'min(60vh, 460px)', marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }
    : { flex: 'none', width: 'min(380px, 42vw)', alignSelf: 'stretch', display: 'flex', flexDirection: 'column', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', animation: 'bracket-flyout .3s var(--ease-out)' };
  return (
    <aside aria-label={`Releases on ${heading}`} style={shell}>
      <style>{`@keyframes bracket-flyout{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}`}</style>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: isToday ? 'var(--brand-soft)' : 'transparent' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 700, color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{heading}</h2>
          {isToday && <Badge tone="brand">Today</Badge>}
        </div>
        <button onClick={onClose} aria-label="Close day view" style={{ flex: 'none', width: 28, height: 28, borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--surface-2)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      <div className="bracket-scroll" style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {evs.length === 0 && <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', padding: 4 }}>Nothing dropping this day.</span>}
        {evs.map((e) => (
          <button key={e.id} onClick={() => onSelect(e.itemId)} style={{ display: 'flex', gap: 10, alignItems: 'center', width: '100%', textAlign: 'left', padding: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', opacity: e.start.slice(0, 10) < today ? 0.55 : 1, transition: 'opacity 200ms' }}>
            <span style={{ width: 50, flex: 'none', fontSize: 'var(--fs-xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{e.allDay ? 'All day' : (localTime(e.start, tz) || 'All day')}</span>
            <Poster type={e.type} src={e.posterUrl} width={38} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-strong)', fontSize: 'var(--fs-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chipTitle(e)}</span>
              <span style={{ display: 'block', fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.releaseKind === 'episode' ? (e.episodeTitle || '') : chipMeta(e, tz)}</span>
            </span>
            <TypePill type={e.type} />
          </button>
        ))}
      </div>
    </aside>
  );
}

/* ---------------- MONTH (mobile agenda) ----------------
   On phones the 7-col grid is unusable, so render the month as a scrollable
   list grouped by date — only days that actually have (visible) events. */
function MonthAgenda({ cursor, events, today, onSelect, activeTypes, tz }) {
  const ym = ymd(cursor).slice(0, 7);
  const evs = events
    .filter((e) => activeTypes.includes(e.type) && e.start.slice(0, 7) === ym)
    .slice()
    .sort((a, b) => a.start.localeCompare(b.start));
  const byDay = new Map();
  for (const e of evs) {
    const k = e.start.slice(0, 10);
    let a = byDay.get(k); if (!a) { a = []; byDay.set(k, a); }
    a.push(e);
  }
  const days = [...byDay.keys()];
  return (
    <div className="bracket-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflowY: 'auto', paddingBottom: 8 }}>
      {days.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', padding: 'var(--space-10) var(--space-4)' }}>Nothing scheduled in {MONTHS[cursor.getUTCMonth()]}.</div>
      )}
      {days.map((ds) => {
        const d = fromYmd(ds);
        const isToday = ds === today;
        return (
          <div key={ds}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, padding: '0 2px' }}>
              <span style={{ fontSize: 'var(--fs-xl)', fontWeight: 800, color: isToday ? 'var(--accent)' : 'var(--text-strong)', fontVariantNumeric: 'tabular-nums' }}>{d.getUTCDate()}</span>
              <span style={{ fontSize: 'var(--fs-xs)', textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)', color: 'var(--text-muted)', fontWeight: 600 }}>{d.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' })}</span>
              {isToday && <Badge tone="brand">Today</Badge>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {byDay.get(ds).map((e) => (
                <button key={e.id} onClick={() => onSelect(e.itemId)} style={{ flexShrink: 0, position: 'relative', overflow: 'hidden', display: 'flex', gap: 10, alignItems: 'center', textAlign: 'left', padding: '8px 8px 8px 11px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', width: '100%' }}>
                  <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: TYPE_BAR[e.type] || TYPE_BAR.movie }} />
                  {!e.allDay && localTime(e.start, tz) && <span style={{ width: 44, flex: 'none', fontSize: 'var(--fs-2xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{localTime(e.start, tz)}</span>}
                  <Poster type={e.type} src={e.posterUrl} width={34} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-strong)', fontSize: 'var(--fs-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chipTitle(e)}</span>
                    <span style={{ display: 'block', fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.releaseKind === 'episode' ? (e.episodeTitle || '') : chipMeta(e)}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

window.BracketKit = Object.assign(window.BracketKit || {}, { MonthGrid, MonthAgenda, WeekGrid, DayAgenda, DayPanel, MONTHS, addMonths, ymd, fromYmd, mondayIndex });
