/* Bracket design-system patches — re-defines a few bundle components on
   window.BracketDesignSystem_93e078 with accessibility/contrast/perf fixes that
   can't be made inside the precompiled _ds_bundle.js. Loaded AFTER the bundle
   and BEFORE the kit .jsx files, so kit destructuring picks up these versions.
   Remove this <script> tag to fully revert. */
(function () {
  const DS = window.BracketDesignSystem_93e078;
  if (!DS) return;

  /* --- Poster: lazy-load + async decode (artwork is the heaviest payload) --- */
  const GRADIENTS = {
    movie: 'linear-gradient(150deg, #7c3aed, #2a0f60)',
    tv: 'linear-gradient(150deg, #38bdf8, #0c4a6e)',
    anime: 'linear-gradient(150deg, #f472b6, #831843)',
  };
  const GLYPH = { movie: '🎬', tv: '📺', anime: '🍥' };
  function Poster({ src, title = '', type = 'movie', width = 60, radius = 'var(--radius-md)', style, ...props }) {
    return (
      <div style={{ width, aspectRatio: 'var(--poster-ratio)', flex: 'none', borderRadius: radius, overflow: 'hidden', background: GRADIENTS[type] || GRADIENTS.movie, boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: width * 0.34, position: 'relative', ...style }} title={title} {...props}>
        {src
          ? <img src={src} alt={title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span aria-hidden="true" style={{ opacity: 0.9 }}>{GLYPH[type] || '🎬'}</span>}
      </div>
    );
  }

  /* --- TypePill: pull the label toward the theme's strong text so it's legible
         in both dark and light themes (was raw hue → low contrast on light). --- */
  const TMAP = {
    movie: { c: 'var(--type-movie)', glyph: '🎬', label: 'Movie' },
    tv: { c: 'var(--type-tv)', glyph: '📺', label: 'Series' },
    anime: { c: 'var(--type-anime)', glyph: '🍥', label: 'Anime' },
  };
  function TypePill({ type = 'movie', showGlyph = true, label, style, ...props }) {
    const m = TMAP[type] || TMAP.movie;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 9px', borderRadius: 'var(--radius-full)', fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-semibold)', lineHeight: 1.5, color: `color-mix(in srgb, ${m.c} 72%, var(--text-strong))`, background: `color-mix(in srgb, ${m.c} 20%, transparent)`, border: `1px solid color-mix(in srgb, ${m.c} 50%, transparent)`, whiteSpace: 'nowrap', ...style }} {...props}>
        {showGlyph ? <span aria-hidden="true">{m.glyph}</span> : null}
        {label || m.label}
      </span>
    );
  }

  /* --- StatusBadge / Badge: near-opaque fill + text-shadow so white text keeps
         contrast over the lighter tones (amber/sky) and on the light theme. --- */
  const STATUS = {
    library: { c: 'var(--status-library)', label: 'In Library' },
    requested: { c: 'var(--status-requested)', label: 'Requested' },
    announced: { c: 'var(--status-announced)', label: 'Announced' },
    released: { c: 'var(--status-released)', label: 'Released' },
  };
  const WHITE_ON_COLOR = { color: '#fff', textShadow: '0 1px 1.5px rgba(0,0,0,0.35)' };
  function StatusBadge({ status = 'announced', label, style, ...props }) {
    const s = STATUS[status] || STATUS.announced;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-semibold)', lineHeight: 1.4, whiteSpace: 'nowrap', ...WHITE_ON_COLOR, background: `color-mix(in srgb, ${s.c} 92%, transparent)`, border: `1px solid color-mix(in srgb, ${s.c} 60%, transparent)`, ...style }} {...props}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', flex: 'none', boxShadow: '0 0 2px rgba(0,0,0,0.3)' }} />
        {label || s.label}
      </span>
    );
  }
  const TONES = {
    brand: 'var(--purple-400)', neutral: 'var(--gray-500)', success: 'var(--green-500)',
    warning: 'var(--amber-500)', danger: 'var(--red-500)', info: 'var(--blue-500)',
  };
  function Badge({ children, tone = 'neutral', dot = false, style, ...props }) {
    const c = TONES[tone] || TONES.neutral;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-semibold)', lineHeight: 1.4, whiteSpace: 'nowrap', ...WHITE_ON_COLOR, background: `color-mix(in srgb, ${c} 92%, transparent)`, border: `1px solid color-mix(in srgb, ${c} 60%, transparent)`, ...style }} {...props}>
        {dot ? <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', flex: 'none' }} /> : null}
        {children}
      </span>
    );
  }

  /* --- Spinner: announce loading to assistive tech --- */
  function Spinner({ size = 40, style, ...props }) {
    return (
      <span role="status" aria-label="Loading" aria-live="polite" style={{ display: 'inline-flex', color: 'var(--text-body)', ...style }} {...props}>
        <svg width={size} height={size} viewBox="0 0 38 38" stroke="currentColor" aria-hidden="true">
          <g fill="none" fillRule="evenodd"><g transform="translate(1 1)" strokeWidth="2">
            <circle strokeOpacity=".4" cx="18" cy="18" r="18" />
            <path d="M36 18c0-9.94-8.06-18-18-18"><animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s" repeatCount="indefinite" /></path>
          </g></g>
        </svg>
      </span>
    );
  }

  /* --- Modal: focus trap + initial focus + restore focus on close --- */
  const FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
  function Modal({ open = true, onClose, title, subtitle, backdrop, children, footer, width = 640, style, ...props }) {
    const ref = React.useRef(null);
    const prevFocus = React.useRef(null);
    React.useEffect(() => {
      if (!open) return;
      prevFocus.current = document.activeElement;
      const node = ref.current;
      const list = () => Array.from(node ? node.querySelectorAll(FOCUSABLE) : []).filter((el) => el.offsetParent !== null);
      const first = list()[0];
      (first || node) && (first || node).focus({ preventScroll: true });
      const onKey = (e) => {
        if (e.key === 'Escape') { onClose && onClose(); return; }
        if (e.key !== 'Tab') return;
        const f = list();
        if (!f.length) { e.preventDefault(); node && node.focus(); return; }
        const a = f[0], b = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
        else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
      };
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('keydown', onKey);
        const p = prevFocus.current;
        if (p && p.focus) p.focus({ preventScroll: true });
      };
    }, [open, onClose]);
    if (!open) return null;
    return (
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)', background: 'var(--overlay)', backdropFilter: 'var(--blur-sm)', WebkitBackdropFilter: 'var(--blur-sm)', animation: 'bracket-fade var(--dur-base) var(--ease-out)' }}>
        <div ref={ref} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabIndex={-1} style={{ position: 'relative', width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto', outline: 'none', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', animation: 'bracket-pop var(--dur-slow) var(--ease-out)', ...style }} {...props}>
          <style>{`@keyframes bracket-fade{from{opacity:0}to{opacity:1}}@keyframes bracket-pop{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}`}</style>
          {onClose && (
            <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 10, right: 10, zIndex: 3, width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-muted)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          )}
          {backdrop && (
            <div style={{ position: 'absolute', inset: '0 0 auto 0', height: 200, overflow: 'hidden', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0' }}>
              <img src={backdrop} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface-1) 35%, transparent) 0%, var(--surface-1) 100%)' }} />
            </div>
          )}
          <div style={{ position: 'relative', padding: 'var(--space-6)' }}>
            {(title || subtitle) && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                {title && <h2 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 'var(--fw-bold)', background: 'linear-gradient(115deg, #a78bfa 0%, #c4b5fd 60%, #e9d5ff 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>{title}</h2>}
                {subtitle && <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>{subtitle}</p>}
              </div>
            )}
            <div style={{ color: 'var(--text-body)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-normal)' }}>{children}</div>
            {footer && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>{footer}</div>}
          </div>
        </div>
      </div>
    );
  }

  Object.assign(DS, { Poster, TypePill, StatusBadge, Badge, Spinner, Modal });
})();
