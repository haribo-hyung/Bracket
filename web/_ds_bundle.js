/* @ds-bundle: {"format":3,"namespace":"BracketDesignSystem_93e078","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Spinner","sourcePath":"components/core/Spinner.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"Modal","sourcePath":"components/feedback/Modal.jsx"},{"name":"Skeleton","sourcePath":"components/feedback/Skeleton.jsx"},{"name":"FilterChip","sourcePath":"components/forms/FilterChip.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"SearchInput","sourcePath":"components/forms/SearchInput.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"EventChip","sourcePath":"components/media/EventChip.jsx"},{"name":"Legend","sourcePath":"components/media/Legend.jsx"},{"name":"Poster","sourcePath":"components/media/Poster.jsx"},{"name":"StatusBadge","sourcePath":"components/media/StatusBadge.jsx"},{"name":"TypePill","sourcePath":"components/media/TypePill.jsx"},{"name":"BottomNav","sourcePath":"components/navigation/BottomNav.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"ViewSwitcher","sourcePath":"components/navigation/ViewSwitcher.jsx"},{"name":"ApiError","sourcePath":"ui_kits/bracket-calendar/api.ts"},{"name":"MOCK_ME","sourcePath":"ui_kits/bracket-calendar/api.ts"},{"name":"MOCK_SETTINGS","sourcePath":"ui_kits/bracket-calendar/api.ts"},{"name":"MOCK_WATCHLIST","sourcePath":"ui_kits/bracket-calendar/api.ts"},{"name":"MOCK_SEARCH","sourcePath":"ui_kits/bracket-calendar/api.ts"}],"sourceHashes":{"components/core/Avatar.jsx":"fd5f86fdd4d9","components/core/Badge.jsx":"53152d3b705f","components/core/Button.jsx":"5146fdbe164a","components/core/Card.jsx":"2c79683f932e","components/core/IconButton.jsx":"54f63b35cd66","components/core/Spinner.jsx":"44128bf1f85c","components/feedback/EmptyState.jsx":"413d6810a73b","components/feedback/Modal.jsx":"0799260f0c72","components/feedback/Skeleton.jsx":"eabca2eb29e8","components/forms/FilterChip.jsx":"0f19f07ad61c","components/forms/Input.jsx":"88ef80163154","components/forms/SearchInput.jsx":"2a0ecfc6136c","components/forms/Select.jsx":"acc05da1c11f","components/forms/Switch.jsx":"c85e01bd1a2c","components/media/EventChip.jsx":"2394b56312b8","components/media/Legend.jsx":"1df2a38309a9","components/media/Poster.jsx":"e17a9fafa20b","components/media/StatusBadge.jsx":"99bd97662813","components/media/TypePill.jsx":"99f229f7eca9","components/navigation/BottomNav.jsx":"e9553afce7a2","components/navigation/Tabs.jsx":"401587e714c6","components/navigation/ViewSwitcher.jsx":"767bef768fcd","ui_kits/bracket-calendar/api.ts":"fc0d37fe5f83","ui_kits/bracket-calendar/app.jsx":"2684d88a160d","ui_kits/bracket-calendar/calendar.jsx":"a6c1fb2e12da","ui_kits/bracket-calendar/data.js":"00ebf8aef3ca","ui_kits/bracket-calendar/modals.jsx":"997f144301ab","ui_kits/bracket-calendar/topbar.jsx":"687a8194e98a"},"inlinedExternals":[],"unexposedExports":[{"name":"api","sourcePath":"ui_kits/bracket-calendar/api.ts"},{"name":"buildEvents","sourcePath":"ui_kits/bracket-calendar/api.ts"}]} */

(() => {

const __ds_ns = (window.BracketDesignSystem_93e078 = window.BracketDesignSystem_93e078 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Bracket Avatar — Plex user avatar with initials fallback.
 */
function Avatar({
  src,
  name = '',
  size = 36,
  style,
  ...props
}) {
  const initials = name.split(' ').map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width: size,
      height: size,
      flex: 'none',
      borderRadius: 'var(--radius-full)',
      overflow: 'hidden',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(150deg, var(--purple-500), var(--purple-800))',
      color: '#fff',
      fontWeight: 'var(--fw-semibold)',
      fontSize: size * 0.4,
      border: '1px solid color-mix(in srgb, #fff 12%, transparent)',
      ...style
    }
  }, props), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : initials || '?');
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Bracket Badge — small rounded-full status pill.
 * tone maps to the semantic palette; `dot` adds a leading indicator.
 */
function Badge({
  children,
  tone = 'neutral',
  dot = false,
  style,
  ...props
}) {
  const tones = {
    brand: {
      c: 'var(--purple-400)'
    },
    neutral: {
      c: 'var(--gray-500)'
    },
    success: {
      c: 'var(--green-500)'
    },
    warning: {
      c: 'var(--amber-500)'
    },
    danger: {
      c: 'var(--red-500)'
    },
    info: {
      c: 'var(--blue-500)'
    }
  };
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '3px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--fs-xs)',
      fontWeight: 'var(--fw-semibold)',
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
      color: '#fff',
      background: `color-mix(in srgb, ${t.c} 82%, transparent)`,
      border: `1px solid color-mix(in srgb, ${t.c} 55%, transparent)`,
      ...style
    }
  }, props), dot ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: '#fff',
      flex: 'none'
    }
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Bracket Button — primary action control.
 * Mirrors the Seerr button: border + 80%-opacity fill that fills in on
 * hover, rounded-sm corners, medium weight, optional leading/trailing icon.
 */
function Button({
  children,
  variant = 'default',
  size = 'md',
  as = 'button',
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  style,
  ...props
}) {
  const palettes = {
    primary: {
      bg: 'color-mix(in srgb, var(--brand) 88%, transparent)',
      bgHover: 'var(--brand)',
      border: 'var(--purple-500)',
      color: 'var(--text-on-brand)'
    },
    secondary: {
      bg: 'var(--surface-2)',
      bgHover: 'var(--surface-3)',
      border: 'var(--border-strong)',
      color: 'var(--text-strong)'
    },
    danger: {
      bg: 'color-mix(in srgb, var(--red-600) 85%, transparent)',
      bgHover: 'var(--red-600)',
      border: 'var(--red-500)',
      color: '#fff'
    },
    success: {
      bg: 'color-mix(in srgb, var(--green-600) 85%, transparent)',
      bgHover: 'var(--green-600)',
      border: 'var(--green-500)',
      color: '#fff'
    },
    ghost: {
      bg: 'transparent',
      bgHover: 'color-mix(in srgb, var(--gray-100) 8%, transparent)',
      border: 'var(--border-strong)',
      color: 'var(--text-strong)'
    },
    default: {
      bg: 'color-mix(in srgb, var(--surface-1) 80%, transparent)',
      bgHover: 'var(--surface-2)',
      border: 'var(--border-strong)',
      color: 'var(--text-body)'
    }
  };
  const sizes = {
    sm: {
      padding: '6px 10px',
      fontSize: 'var(--fs-xs)',
      gap: '6px',
      icon: 14
    },
    md: {
      padding: '8px 16px',
      fontSize: 'var(--fs-sm)',
      gap: '8px',
      icon: 18
    },
    lg: {
      padding: '12px 22px',
      fontSize: 'var(--fs-base)',
      gap: '10px',
      icon: 20
    }
  };
  const p = palettes[variant] || palettes.default;
  const s = sizes[size] || sizes.md;
  const [hover, setHover] = React.useState(false);
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    disabled: as === 'button' ? disabled : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: fullWidth ? 'flex' : 'inline-flex',
      width: fullWidth ? '100%' : 'auto',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      padding: s.padding,
      fontSize: s.fontSize,
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--fw-medium)',
      lineHeight: 1.2,
      whiteSpace: 'nowrap',
      color: p.color,
      background: hover && !disabled ? p.bgHover : p.bg,
      border: `1px solid ${p.border}`,
      borderRadius: 'var(--radius-sm)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
      textDecoration: 'none',
      ...style
    }
  }, props), iconLeft ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: s.icon,
      height: s.icon
    }
  }, iconLeft) : null, /*#__PURE__*/React.createElement("span", null, children), iconRight ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: s.icon,
      height: s.icon
    }
  }, iconRight) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Bracket Card — surface container with border + shadow.
 * The base building block for modals, panels, list rows.
 */
function Card({
  children,
  padded = true,
  interactive = false,
  style,
  ...props
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => interactive && setHover(true),
    onMouseLeave: () => interactive && setHover(false),
    style: {
      background: 'var(--surface-1)',
      border: `1px solid ${hover ? 'var(--border-strong)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)',
      boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
      padding: padded ? 'var(--space-5)' : 0,
      transition: 'box-shadow var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
      cursor: interactive ? 'pointer' : 'default',
      ...style
    }
  }, props), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Bracket IconButton — square, icon-only control for toolbars & nav.
 * Used for prev/next, today, close, settings.
 */
function IconButton({
  children,
  label,
  variant = 'default',
  size = 'md',
  active = false,
  disabled = false,
  style,
  ...props
}) {
  const sizes = {
    sm: 30,
    md: 38,
    lg: 44
  };
  const dim = sizes[size] || sizes.md;
  const [hover, setHover] = React.useState(false);
  const palettes = {
    default: {
      bg: hover ? 'var(--surface-2)' : 'transparent',
      color: 'var(--text-body)',
      border: 'var(--border)'
    },
    solid: {
      bg: hover ? 'var(--surface-3)' : 'var(--surface-2)',
      color: 'var(--text-strong)',
      border: 'var(--border-strong)'
    },
    brand: {
      bg: hover ? 'var(--brand-hover)' : 'var(--brand)',
      color: '#fff',
      border: 'var(--purple-500)'
    }
  };
  const p = active ? {
    bg: 'var(--brand-soft)',
    color: 'var(--accent)',
    border: 'color-mix(in srgb, var(--brand) 50%, transparent)'
  } : palettes[variant] || palettes.default;
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": label,
    title: label,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: dim,
      height: dim,
      flex: 'none',
      color: p.color,
      background: p.bg,
      border: `1px solid ${p.border}`,
      borderRadius: 'var(--radius-sm)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transition: 'background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out)',
      ...style
    }
  }, props), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: Math.round(dim * 0.5),
      height: Math.round(dim * 0.5)
    }
  }, children));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Spinner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Bracket Spinner — indeterminate loading ring (Seerr-style).
 */
function Spinner({
  size = 40,
  style,
  ...props
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      color: 'var(--text-body)',
      ...style
    }
  }, props), /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 38 38",
    stroke: "currentColor"
  }, /*#__PURE__*/React.createElement("g", {
    fill: "none",
    fillRule: "evenodd"
  }, /*#__PURE__*/React.createElement("g", {
    transform: "translate(1 1)",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("circle", {
    strokeOpacity: ".4",
    cx: "18",
    cy: "18",
    r: "18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M36 18c0-9.94-8.06-18-18-18"
  }, /*#__PURE__*/React.createElement("animateTransform", {
    attributeName: "transform",
    type: "rotate",
    from: "0 18 18",
    to: "360 18 18",
    dur: "0.9s",
    repeatCount: "indefinite"
  }))))));
}
Object.assign(__ds_scope, { Spinner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Spinner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Bracket EmptyState — friendly empty / zero-data panel.
 */
function EmptyState({
  icon = '🛋️',
  title,
  body,
  action,
  style,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: 'var(--space-12) var(--space-6)',
      gap: 'var(--space-3)',
      ...style
    }
  }, props), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: 'var(--radius-full)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 30,
      background: 'var(--brand-soft)',
      border: '1px solid color-mix(in srgb, var(--brand) 40%, transparent)'
    }
  }, icon), title && /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--fs-xl)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-strong)'
    }
  }, title), body && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: 360,
      color: 'var(--text-muted)',
      fontSize: 'var(--fs-sm)',
      lineHeight: 'var(--lh-normal)'
    }
  }, body), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-2)'
    }
  }, action));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Bracket Modal — centered dialog with overlay + scale-in transition.
 * Pair with the detail view; pass `footer` for action buttons.
 */
function Modal({
  open = true,
  onClose,
  title,
  subtitle,
  backdrop,
  children,
  footer,
  width = 640,
  style,
  ...props
}) {
  React.useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-4)',
      background: 'var(--overlay)',
      backdropFilter: 'var(--blur-sm)',
      WebkitBackdropFilter: 'var(--blur-sm)',
      animation: 'bracket-fade var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("div", _extends({
    onClick: e => e.stopPropagation(),
    role: "dialog",
    "aria-modal": "true",
    style: {
      position: 'relative',
      width: '100%',
      maxWidth: width,
      maxHeight: '90vh',
      overflow: 'auto',
      background: 'var(--surface-1)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-xl)',
      animation: 'bracket-pop var(--dur-slow) var(--ease-out)',
      ...style
    }
  }, props), /*#__PURE__*/React.createElement("style", null, `@keyframes bracket-fade{from{opacity:0}to{opacity:1}}@keyframes bracket-pop{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}`), backdrop && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: '0 0 auto 0',
      height: 200,
      overflow: 'hidden',
      borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: backdrop,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface-1) 35%, transparent) 0%, var(--surface-1) 100%)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      padding: 'var(--space-6)'
    }
  }, (title || subtitle) && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 'var(--space-4)'
    }
  }, title && /*#__PURE__*/React.createElement("h2", {
    className: "bracket-gradient-text",
    style: {
      fontSize: 'var(--fs-2xl)',
      fontWeight: 'var(--fw-bold)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      color: 'var(--text-muted)',
      fontSize: 'var(--fs-sm)'
    }
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-body)',
      fontSize: 'var(--fs-sm)',
      lineHeight: 'var(--lh-normal)'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 'var(--space-2)',
      marginTop: 'var(--space-6)'
    }
  }, footer))));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Modal.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Skeleton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Bracket Skeleton — shimmer placeholder for loading states.
 */
function Skeleton({
  width = '100%',
  height = 16,
  radius = 'var(--radius-sm)',
  style,
  ...props
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'block',
      width,
      height,
      borderRadius: radius,
      background: 'linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%)',
      backgroundSize: '200% 100%',
      animation: 'bracket-shimmer 1.4s ease-in-out infinite',
      ...style
    }
  }, props), /*#__PURE__*/React.createElement("style", null, `@keyframes bracket-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`));
}
Object.assign(__ds_scope, { Skeleton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Skeleton.jsx", error: String((e && e.message) || e) }); }

// components/forms/FilterChip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Bracket FilterChip — selectable pill for watchlist filters
 * (All / Movies / TV / Anime / Upcoming).
 */
function FilterChip({
  children,
  selected = false,
  count,
  onClick,
  style,
  ...props
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '5px 12px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--fs-sm)',
      fontWeight: 'var(--fw-medium)',
      lineHeight: 1.3,
      color: selected ? 'var(--text-on-brand)' : 'var(--text-body)',
      background: selected ? 'var(--brand)' : hover ? 'var(--surface-2)' : 'transparent',
      border: `1px solid ${selected ? 'var(--purple-500)' : 'var(--border-strong)'}`,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'all var(--dur-base) var(--ease-out)',
      ...style
    }
  }, props), children, count != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11px',
      fontWeight: 'var(--fw-semibold)',
      fontVariantNumeric: 'tabular-nums',
      padding: '0 6px',
      borderRadius: 'var(--radius-full)',
      background: selected ? 'color-mix(in srgb, #fff 22%, transparent)' : 'var(--surface-3)',
      color: selected ? '#fff' : 'var(--text-muted)'
    }
  }, count));
}
Object.assign(__ds_scope, { FilterChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/FilterChip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Bracket Input — text field on the dark surface palette.
 */
function Input({
  iconLeft,
  invalid = false,
  style,
  ...props
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      width: '100%'
    }
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 10,
      width: 16,
      height: 16,
      color: 'var(--text-faint)',
      pointerEvents: 'none',
      display: 'inline-flex'
    }
  }, iconLeft), /*#__PURE__*/React.createElement("input", _extends({
    onFocus: e => {
      setFocus(true);
      props.onFocus?.(e);
    },
    onBlur: e => {
      setFocus(false);
      props.onBlur?.(e);
    },
    style: {
      width: '100%',
      boxSizing: 'border-box',
      padding: iconLeft ? '9px 12px 9px 34px' : '9px 12px',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-strong)',
      background: 'var(--surface-2)',
      border: `1px solid ${invalid ? 'var(--red-500)' : focus ? 'var(--purple-400)' : 'var(--border-strong)'}`,
      borderRadius: 'var(--radius-sm)',
      outline: 'none',
      boxShadow: focus ? '0 0 0 3px var(--ring)' : 'none',
      transition: 'border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
      ...style
    }
  }, props)));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/SearchInput.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SearchGlyph = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  style: {
    width: '100%',
    height: '100%'
  }
}, /*#__PURE__*/React.createElement("circle", {
  cx: "11",
  cy: "11",
  r: "7"
}), /*#__PURE__*/React.createElement("path", {
  d: "M21 21l-4.3-4.3"
}));

/**
 * Bracket SearchInput — Input preset with a search glyph and search type.
 */
function SearchInput({
  placeholder = 'Search movies, shows, anime…',
  ...props
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Input, _extends({
    type: "search",
    iconLeft: /*#__PURE__*/React.createElement(SearchGlyph, null),
    placeholder: placeholder
  }, props));
}
Object.assign(__ds_scope, { SearchInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SearchInput.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Bracket Select — styled native select with a custom chevron.
 */
function Select({
  children,
  style,
  ...props
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    onFocus: e => {
      setFocus(true);
      props.onFocus?.(e);
    },
    onBlur: e => {
      setFocus(false);
      props.onBlur?.(e);
    },
    style: {
      width: '100%',
      boxSizing: 'border-box',
      appearance: 'none',
      WebkitAppearance: 'none',
      padding: '9px 34px 9px 12px',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-strong)',
      background: 'var(--surface-2)',
      border: `1px solid ${focus ? 'var(--purple-400)' : 'var(--border-strong)'}`,
      borderRadius: 'var(--radius-sm)',
      outline: 'none',
      cursor: 'pointer',
      boxShadow: focus ? '0 0 0 3px var(--ring)' : 'none',
      transition: 'border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
      ...style
    }
  }, props), children), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--text-faint)",
    strokeWidth: "2",
    style: {
      position: 'absolute',
      right: 11,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 15,
      height: 15,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 9l6 6 6-6"
  })));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Bracket Switch — settings toggle (dark/light, default filters).
 */
function Switch({
  checked = false,
  onChange,
  disabled = false,
  label,
  style,
  ...props
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    role: "switch",
    "aria-checked": checked,
    "aria-label": label,
    disabled: disabled,
    onClick: () => !disabled && onChange?.(!checked),
    style: {
      position: 'relative',
      width: 42,
      height: 24,
      flex: 'none',
      borderRadius: 'var(--radius-full)',
      border: 'none',
      padding: 0,
      background: checked ? 'var(--brand)' : 'var(--surface-3)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background var(--dur-base) var(--ease-out)',
      ...style
    }
  }, props), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 3,
      left: checked ? 21 : 3,
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: 'var(--shadow-sm)',
      transition: 'left var(--dur-base) var(--ease-out)'
    }
  }));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/media/Legend.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const ITEMS = [{
  type: 'movie',
  c: 'var(--type-movie)',
  glyph: '🎬',
  label: 'Movie'
}, {
  type: 'tv',
  c: 'var(--type-tv)',
  glyph: '📺',
  label: 'TV'
}, {
  type: 'anime',
  c: 'var(--type-anime)',
  glyph: '🍥',
  label: 'Anime'
}];

/**
 * Bracket Legend — calendar color key with optional toggle behaviour.
 */
function Legend({
  active,
  onToggle,
  style,
  ...props
}) {
  const isActive = t => !active || active.includes(t);
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      flexWrap: 'wrap',
      ...style
    }
  }, props), ITEMS.map(it => {
    const on = isActive(it.type);
    return /*#__PURE__*/React.createElement("button", {
      key: it.type,
      onClick: onToggle ? () => onToggle(it.type) : undefined,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--fs-xs)',
        fontWeight: 'var(--fw-medium)',
        color: on ? 'var(--text-body)' : 'var(--text-faint)',
        background: on ? 'var(--surface-2)' : 'transparent',
        border: `1px solid ${on ? 'var(--border)' : 'transparent'}`,
        cursor: onToggle ? 'pointer' : 'default',
        opacity: on ? 1 : 0.55,
        transition: 'all var(--dur-base) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10,
        height: 10,
        borderRadius: '3px',
        background: it.c,
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, it.glyph), it.label);
  }));
}
Object.assign(__ds_scope, { Legend });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/media/Legend.jsx", error: String((e && e.message) || e) }); }

// components/media/Poster.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const GRADIENTS = {
  movie: 'linear-gradient(150deg, #7c3aed, #2a0f60)',
  tv: 'linear-gradient(150deg, #38bdf8, #0c4a6e)',
  anime: 'linear-gradient(150deg, #f472b6, #831843)'
};
const GLYPH = {
  movie: '🎬',
  tv: '📺',
  anime: '🍥'
};

/**
 * Bracket Poster — the 2:3 visual anchor used everywhere.
 * Falls back to a typed gradient + glyph when no artwork is set.
 */
function Poster({
  src,
  title = '',
  type = 'movie',
  width = 60,
  radius = 'var(--radius-md)',
  style,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width,
      aspectRatio: 'var(--poster-ratio)',
      flex: 'none',
      borderRadius: radius,
      overflow: 'hidden',
      background: GRADIENTS[type] || GRADIENTS.movie,
      boxShadow: 'var(--shadow-md)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: width * 0.34,
      position: 'relative',
      ...style
    },
    title: title
  }, props), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: title,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.9
    }
  }, GLYPH[type] || '🎬'));
}
Object.assign(__ds_scope, { Poster });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/media/Poster.jsx", error: String((e && e.message) || e) }); }

// components/media/EventChip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TYPE_C = {
  movie: 'var(--type-movie)',
  tv: 'var(--type-tv)',
  anime: 'var(--type-anime)'
};
const TYPE_GLYPH = {
  movie: '🎬',
  tv: '📺',
  anime: '🍥'
};

/**
 * Bracket EventChip — a single release plotted on the calendar.
 * Compact month-grid variant: poster thumb + title + optional S#E# meta.
 * The left rail is color-coded by media type.
 */
function EventChip({
  title,
  type = 'movie',
  poster,
  meta,
  time,
  dense = false,
  onClick,
  style,
  ...props
}) {
  const [hover, setHover] = React.useState(false);
  const c = TYPE_C[type] || TYPE_C.movie;
  return /*#__PURE__*/React.createElement("button", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: dense ? '6px' : '8px',
      width: '100%',
      textAlign: 'left',
      padding: dense ? '3px 6px 3px 4px' : '4px 8px 4px 5px',
      background: hover ? 'var(--surface-3)' : 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderLeft: `3px solid ${c}`,
      borderRadius: 'var(--radius-xs)',
      cursor: 'pointer',
      overflow: 'hidden',
      transition: 'background var(--dur-fast) var(--ease-out)',
      ...style
    }
  }, props), !dense && (poster ? /*#__PURE__*/React.createElement(__ds_scope.Poster, {
    src: poster,
    type: type,
    width: 20,
    radius: "3px",
    style: {
      boxShadow: 'none'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      flex: 'none',
      textAlign: 'center',
      fontSize: 14,
      lineHeight: 1
    },
    "aria-hidden": "true"
  }, TYPE_GLYPH[type] || '🎬')), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      flex: 1,
      lineHeight: 1.2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-xs)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-strong)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, title), meta && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '10px',
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-mono)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, meta)), time && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '10px',
      color: 'var(--text-faint)',
      flex: 'none',
      fontFamily: 'var(--font-mono)'
    }
  }, time));
}
Object.assign(__ds_scope, { EventChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/media/EventChip.jsx", error: String((e && e.message) || e) }); }

// components/media/StatusBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STATUS = {
  library: {
    c: 'var(--status-library)',
    label: 'In Library'
  },
  requested: {
    c: 'var(--status-requested)',
    label: 'Requested'
  },
  announced: {
    c: 'var(--status-announced)',
    label: 'Announced'
  },
  released: {
    c: 'var(--status-released)',
    label: 'Released'
  }
};

/**
 * Bracket StatusBadge — watchlist item lifecycle status.
 * In Library (green) · Requested (purple) · Announced (amber) · Released (blue)
 */
function StatusBadge({
  status = 'announced',
  label,
  style,
  ...props
}) {
  const s = STATUS[status] || STATUS.announced;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '3px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--fs-xs)',
      fontWeight: 'var(--fw-semibold)',
      lineHeight: 1.4,
      color: '#fff',
      whiteSpace: 'nowrap',
      background: `color-mix(in srgb, ${s.c} 82%, transparent)`,
      border: `1px solid color-mix(in srgb, ${s.c} 55%, transparent)`,
      ...style
    }
  }, props), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: '#fff',
      flex: 'none'
    }
  }), label || s.label);
}
Object.assign(__ds_scope, { StatusBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/media/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// components/media/TypePill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const MAP = {
  movie: {
    c: 'var(--type-movie)',
    glyph: '🎬',
    label: 'Movie'
  },
  tv: {
    c: 'var(--type-tv)',
    glyph: '📺',
    label: 'TV'
  },
  anime: {
    c: 'var(--type-anime)',
    glyph: '🍥',
    label: 'Anime'
  }
};

/**
 * Bracket TypePill — the Movie / TV / Anime color-coded label.
 */
function TypePill({
  type = 'movie',
  showGlyph = true,
  label,
  style,
  ...props
}) {
  const m = MAP[type] || MAP.movie;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '2px 9px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--fs-xs)',
      fontWeight: 'var(--fw-semibold)',
      lineHeight: 1.5,
      color: m.c,
      background: `color-mix(in srgb, ${m.c} 16%, transparent)`,
      border: `1px solid color-mix(in srgb, ${m.c} 45%, transparent)`,
      whiteSpace: 'nowrap',
      ...style
    }
  }, props), showGlyph ? /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, m.glyph) : null, label || m.label);
}
Object.assign(__ds_scope, { TypePill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/media/TypePill.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BottomNav.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Bracket BottomNav — mobile bottom navigation bar.
 * items: [{ key, label, icon }]. Hidden on desktop in the kit.
 */
function BottomNav({
  items = [],
  active,
  onChange,
  style,
  ...props
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({
    style: {
      display: 'flex',
      alignItems: 'stretch',
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--blur-md)',
      WebkitBackdropFilter: 'var(--blur-md)',
      borderTop: '1px solid var(--border)',
      ...style
    }
  }, props), items.map(it => {
    const on = it.key === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.key,
      onClick: () => onChange?.(it.key),
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        padding: '8px 0',
        minHeight: 'var(--tap-min)',
        border: 'none',
        background: 'transparent',
        color: on ? 'var(--accent)' : 'var(--text-muted)',
        fontSize: '10px',
        fontWeight: 'var(--fw-medium)',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        transition: 'color var(--dur-base) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 22,
        height: 22,
        display: 'inline-flex'
      }
    }, it.icon), it.label);
  }));
}
Object.assign(__ds_scope, { BottomNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BottomNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Bracket Tabs — underline tab bar for settings sections etc.
 */
function Tabs({
  value,
  onChange,
  tabs = [],
  style,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: 'flex',
      gap: 4,
      borderBottom: '1px solid var(--border)',
      ...style
    }
  }, props), tabs.map(t => {
    const on = t.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: t.value,
      role: "tab",
      "aria-selected": on,
      onClick: () => onChange?.(t.value),
      style: {
        padding: '10px 14px',
        border: 'none',
        background: 'transparent',
        fontSize: 'var(--fs-sm)',
        fontWeight: on ? 'var(--fw-semibold)' : 'var(--fw-medium)',
        fontFamily: 'var(--font-sans)',
        color: on ? 'var(--text-strong)' : 'var(--text-muted)',
        borderBottom: `2px solid ${on ? 'var(--brand)' : 'transparent'}`,
        marginBottom: -1,
        cursor: 'pointer',
        transition: 'color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)'
      }
    }, t.label);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/ViewSwitcher.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Bracket ViewSwitcher — segmented control for Day / Week / Month.
 */
function ViewSwitcher({
  value = 'month',
  onChange,
  options,
  style,
  ...props
}) {
  const opts = options || [{
    value: 'day',
    label: 'Day'
  }, {
    value: 'week',
    label: 'Week'
  }, {
    value: 'month',
    label: 'Month'
  }];
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: 'inline-flex',
      padding: 3,
      gap: 2,
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      ...style
    }
  }, props), opts.map(o => {
    const on = o.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o.value,
      role: "tab",
      "aria-selected": on,
      onClick: () => onChange?.(o.value),
      style: {
        padding: '6px 16px',
        borderRadius: 'calc(var(--radius-sm) - 2px)',
        border: 'none',
        fontSize: 'var(--fs-sm)',
        fontWeight: 'var(--fw-medium)',
        fontFamily: 'var(--font-sans)',
        color: on ? 'var(--text-on-brand)' : 'var(--text-muted)',
        background: on ? 'var(--brand)' : 'transparent',
        boxShadow: on ? 'var(--shadow-sm)' : 'none',
        cursor: 'pointer',
        transition: 'all var(--dur-base) var(--ease-out)'
      }
    }, o.label);
  }));
}
Object.assign(__ds_scope, { ViewSwitcher });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/ViewSwitcher.jsx", error: String((e && e.message) || e) }); }

// ui_kits/bracket-calendar/api.ts
try { (() => {
/* ============================================================
 * Bracket — typed API client  (api.ts)
 * happysofa.org release-calendar
 *
 * All UI reads data through THIS module. Mock data is returned
 * now; swap `USE_MOCK = false` and the fetch() bodies below for
 * the real backend later — the typed contract stays identical.
 *
 * Endpoints
 *   GET  /api/me                         -> Me
 *   GET  /api/watchlist                  -> WatchlistItem[]
 *   GET  /api/calendar?start=&end=&types=-> CalendarEvent[]
 *   GET  /api/search?q=                  -> SearchResult[]
 *   POST /api/watchlist                  -> WatchlistItem    (add)
 *   DELETE /api/watchlist/:id            -> { ok: true }     (remove)
 *   GET  /api/settings                   -> Settings
 *   PUT  /api/settings                   -> Settings
 * ============================================================ */

/* ---------------- Core types (PART A) ---------------- */

/** Watchlist lifecycle, mirrored from the Seerr availability model. */

/** A release plotted on the calendar. */

/* ---------------- Client ---------------- */

const USE_MOCK = true;
const BASE = '/api';
async function http(path, init) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...init
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json();
}
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}
const api = {
  me: () => USE_MOCK ? delay(MOCK_ME) : http('/me'),
  watchlist: () => USE_MOCK ? delay(MOCK_WATCHLIST) : http('/watchlist'),
  calendar: (start, end, types) => {
    if (USE_MOCK) {
      const evs = buildEvents(MOCK_WATCHLIST).filter(e => {
        const inRange = e.start.slice(0, 10) >= start && e.start.slice(0, 10) <= end;
        const typeOk = !types || types.includes(e.type);
        return inRange && typeOk;
      });
      return delay(evs);
    }
    const q = new URLSearchParams({
      start,
      end,
      ...(types ? {
        types: types.join(',')
      } : {})
    });
    return http(`/calendar?${q}`);
  },
  search: q => {
    if (USE_MOCK) {
      const hits = MOCK_SEARCH.filter(r => r.title.toLowerCase().includes(q.toLowerCase()));
      return delay(hits, 280);
    }
    return http(`/search?q=${encodeURIComponent(q)}`);
  },
  addToWatchlist: (tmdbId, type) => USE_MOCK ? delay({
    ok: true
  }) : http('/watchlist', {
    method: 'POST',
    body: JSON.stringify({
      tmdbId,
      type
    })
  }),
  removeFromWatchlist: id => USE_MOCK ? delay({
    ok: true
  }) : http(`/watchlist/${id}`, {
    method: 'DELETE'
  }),
  settings: () => USE_MOCK ? delay(MOCK_SETTINGS) : http('/settings'),
  saveSettings: s => USE_MOCK ? delay(s) : http('/settings', {
    method: 'PUT',
    body: JSON.stringify(s)
  })
};
function delay(value, ms = 420) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

/** Flatten watchlist releases into calendar events. */
function buildEvents(items) {
  const out = [];
  for (const it of items) {
    for (const r of it.releases) {
      const isEp = r.kind === 'episode';
      out.push({
        id: `${it.id}-${r.kind}-${r.date}-${r.episode ?? ''}`,
        itemId: it.id,
        type: it.type,
        title: it.title,
        posterUrl: it.posterUrl,
        start: r.date,
        allDay: !isEp,
        releaseKind: r.kind,
        label: isEp ? `S${r.season}E${r.episode}${r.episodeTitle ? ' · ' + r.episodeTitle : ''}` : r.kind.charAt(0).toUpperCase() + r.kind.slice(1)
      });
    }
  }
  return out.sort((a, b) => a.start.localeCompare(b.start));
}

/* ---------------- Mock data ---------------- */
/* 18 titles across movie / tv / anime and every status. Dates are
 * anchored around June 2026 so the calendar always has content. */

const MOCK_ME = {
  id: 'u_1',
  plexUsername: 'avery',
  displayName: 'Avery Quinn',
  isAdmin: true
};
const MOCK_SETTINGS = {
  defaultView: 'month',
  timezone: 'Europe/London',
  theme: 'dark',
  defaultTypes: ['movie', 'tv', 'anime']
};
const MOCK_WATCHLIST = [
// ---- Movies ----
m('mv_1', 1001, 'Dune: Part Three', 2026, 'announced', 'Paul Atreides leads the Fremen in a holy war across the Imperium.', [{
  kind: 'theatrical',
  date: '2026-06-19'
}, {
  kind: 'digital',
  date: '2026-08-04'
}]), m('mv_2', 1002, 'The Batman: Part II', 2026, 'announced', 'The Dark Knight uncovers deeper corruption beneath Gotham.', [{
  kind: 'theatrical',
  date: '2026-06-26'
}]), m('mv_3', 1003, 'Avatar: Fire and Ash', 2025, 'library', 'The Sully family faces the aggressive Ash People of Pandora.', [{
  kind: 'theatrical',
  date: '2025-12-19'
}, {
  kind: 'digital',
  date: '2026-06-10'
}, {
  kind: 'physical',
  date: '2026-06-24'
}]), m('mv_4', 1004, 'Mickey 18', 2026, 'requested', 'An expendable worker keeps getting reprinted on a frozen colony world.', [{
  kind: 'digital',
  date: '2026-06-13'
}]), m('mv_5', 1005, 'Wicked: For Good', 2025, 'released', 'Elphaba and Glinda confront the cost of their choices in Oz.', [{
  kind: 'theatrical',
  date: '2025-11-21'
}, {
  kind: 'digital',
  date: '2026-06-06'
}]), m('mv_6', 1006, 'Project Hail Mary', 2026, 'announced', 'A lone astronaut wakes with amnesia on a mission to save the sun.', [{
  kind: 'theatrical',
  date: '2026-06-30'
}]),
// ---- TV ----
tv('tv_1', 2001, 'Severance', 2026, 'library', 'The refiners of Lumon edge closer to the truth about their severed lives.', [3, [['2026-06-12', 7, 'Cold Harbor'], ['2026-06-19', 8, 'The Reunion']]]), tv('tv_2', 2002, 'The Last of Us', 2026, 'library', 'Ellie and Abby cross paths in a brutal Seattle.', [2, [['2026-06-15', 4, 'Day One'], ['2026-06-22', 5, 'Feast']]]), tv('tv_3', 2003, 'Andor', 2026, 'released', 'The road to rebellion narrows for Cassian Andor.', [2, [['2026-06-09', 11, 'Who Are You?'], ['2026-06-16', 12, 'Jedha, Kyber, Erso']]]), tv('tv_4', 2004, 'House of the Dragon', 2026, 'announced', 'The Dance of the Dragons consumes the Seven Kingdoms.', [3, [['2026-06-28', 1, 'A Son for a Son']]]), tv('tv_5', 2005, 'The Bear', 2026, 'requested', 'Carmy and the crew chase a star while the kitchen frays.', [4, [['2026-06-18', 1, 'Soup'], ['2026-06-18', 2, 'Worms']]]), tv('tv_6', 2006, 'Foundation', 2026, 'library', 'Hari Seldon\u2019s plan unfolds across centuries of galactic decline.', [3, [['2026-06-13', 6, 'The Sinister Equation']]]),
// ---- Anime ----
an('an_1', 3001, 'Frieren: Beyond Journey\u2019s End', 2026, 'library', 'An elf mage reckons with mortality long after the demon king falls.', [1, [['2026-06-14', 28, 'A Real Hero'], ['2026-06-21', 29, 'The Land Where Souls Rest']]]), an('an_2', 3002, 'Jujutsu Kaisen', 2026, 'library', 'The Culling Game forces sorcerers into a lethal nationwide ritual.', [3, [['2026-06-11', 2, 'Premature Death'], ['2026-06-18', 3, 'Bath']]]), an('an_3', 3003, 'Chainsaw Man', 2026, 'announced', 'Denji balances devil-hunting with the simplest of dreams.', [2, [['2026-06-25', 1, 'The Hero of the Reze']]]), an('an_4', 3004, 'Solo Leveling', 2026, 'requested', 'The world\u2019s weakest hunter awakens a power that only he can level up.', [3, [['2026-06-17', 1, 'Arise, Again']]]), an('an_5', 3005, 'Demon Slayer: Infinity Castle', 2026, 'announced', 'The Hashira descend into Muzan\u2019s shifting fortress.', [{
  kind: 'theatrical',
  date: '2026-06-20'
}]), an('an_6', 3006, 'Spy x Family', 2026, 'library', 'The Forgers keep up their cover while peace hangs by a thread.', [3, [['2026-06-16', 9, 'Operation Strix'], ['2026-06-23', 10, 'The Hot-Spring Hideout']]])];

/* ---- mock-builder helpers ---- */
function m(id, tmdbId, title, year, status, overview, releases) {
  return base(id, tmdbId, 'movie', title, year, status, overview, releases);
}
function tv(id, tmdbId, title, year, status, overview, season) {
  return base(id, tmdbId, 'tv', title, year, status, overview, episodes(season));
}
function an(id, tmdbId, title, year, status, overview, season) {
  const rel = Array.isArray(season[0]) || typeof season[0] === 'number' ? episodes(season) : season;
  return base(id, tmdbId, 'anime', title, year, status, overview, rel);
}
function episodes([season, eps]) {
  return eps.map(([date, episode, episodeTitle]) => ({
    kind: 'episode',
    date: `${date}T21:00:00`,
    season,
    episode,
    episodeTitle
  }));
}
function base(id, tmdbId, type, title, year, status, overview, releases) {
  const sorted = [...releases].sort((a, b) => a.date.localeCompare(b.date));
  const now = '2026-06-18';
  const next = sorted.find(r => r.date.slice(0, 10) >= now);
  return {
    id,
    tmdbId,
    type,
    title,
    year,
    overview,
    status,
    releases: sorted,
    nextDate: next?.date,
    seerrUrl: `https://seerr.happysofa.org/${type === 'movie' ? 'movie' : 'tv'}/${tmdbId}`,
    addedAt: '2026-05-01'
  };
}
const MOCK_SEARCH = [{
  tmdbId: 4001,
  type: 'movie',
  title: 'Blade Runner 2099',
  year: 2026,
  overview: 'A new replicant uprising decades after the Wallace era.',
  onWatchlist: false
}, {
  tmdbId: 4002,
  type: 'tv',
  title: 'Silo',
  year: 2026,
  overview: 'Ten thousand live underground, forbidden to ask why.',
  onWatchlist: false
}, {
  tmdbId: 4003,
  type: 'anime',
  title: 'One Piece',
  year: 2026,
  overview: 'Luffy and the Straw Hats chase the legendary treasure.',
  onWatchlist: false
}, {
  tmdbId: 4004,
  type: 'movie',
  title: 'Dune: Part Three',
  year: 2026,
  overview: 'Paul Atreides leads the Fremen in a holy war.',
  onWatchlist: true
}];
Object.assign(__ds_scope, { ApiError, api, buildEvents, MOCK_ME, MOCK_SETTINGS, MOCK_WATCHLIST, MOCK_SEARCH });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bracket-calendar/api.ts", error: String((e && e.message) || e) }); }

// ui_kits/bracket-calendar/app.jsx
try { (() => {
/* Bracket kit — app orchestrator */
const {
  Spinner
} = window.BracketDesignSystem_93e078;
const {
  TopBar,
  MonthGrid,
  WeekGrid,
  DayAgenda,
  MONTHS,
  DetailModal,
  WatchlistDrawer,
  SettingsModal,
  AuthGate
} = window.BracketKit;
const D = window.BracketData;
function ymd2(d) {
  return d.toISOString().slice(0, 10);
}
function mondayIdx(d) {
  return (d.getUTCDay() + 6) % 7;
}
function rangeLabel(view, cursor) {
  if (view === 'month') return `${MONTHS[cursor.getUTCMonth()]} ${cursor.getUTCFullYear()}`;
  if (view === 'day') return cursor.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });
  const start = new Date(cursor);
  start.setUTCDate(cursor.getUTCDate() - mondayIdx(cursor));
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  const sm = start.toLocaleDateString('en-GB', {
    month: 'short',
    timeZone: 'UTC'
  });
  const em = end.toLocaleDateString('en-GB', {
    month: 'short',
    timeZone: 'UTC'
  });
  return `${start.getUTCDate()} ${sm} – ${end.getUTCDate()} ${em} ${end.getUTCFullYear()}`;
}
function App() {
  const [authed, setAuthed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [view, setView] = React.useState(D.settings.defaultView);
  const [cursor, setCursor] = React.useState(new Date(D.NOW + 'T00:00:00Z'));
  const [activeTypes, setActiveTypes] = React.useState([...D.settings.defaultTypes]);
  const [watchlist, setWatchlist] = React.useState(D.watchlist);
  const [drawer, setDrawer] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [detailId, setDetailId] = React.useState(null);
  const [settings, setSettings] = React.useState(D.settings);
  const [compact, setCompact] = React.useState(false);
  const today = D.NOW;
  const events = React.useMemo(() => D.buildEvents(watchlist).filter(e => activeTypes.includes(e.type)), [watchlist, activeTypes]);
  const detailItem = watchlist.find(i => i.id === detailId);
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 1100px)');
    const on = () => setCompact(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const signIn = () => {
    setLoading(true);
    setTimeout(() => {
      setAuthed(true);
      setLoading(false);
    }, 900);
  };
  const step = dir => {
    const c = new Date(cursor);
    if (view === 'month') c.setUTCMonth(c.getUTCMonth() + dir);else if (view === 'week') c.setUTCDate(c.getUTCDate() + dir * 7);else c.setUTCDate(c.getUTCDate() + dir);
    setCursor(c);
  };
  const toggleType = t => setActiveTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const removeItem = id => {
    setWatchlist(w => w.filter(i => i.id !== id));
    setDetailId(null);
  };
  const addItem = r => {
    const id = 'new_' + r.tmdbId;
    setWatchlist(w => w.find(i => i.tmdbId === r.tmdbId) ? w : [...w, {
      id,
      tmdbId: r.tmdbId,
      type: r.type,
      title: r.title,
      year: r.year,
      overview: r.overview,
      status: 'requested',
      releases: [{
        kind: r.type === 'movie' ? 'theatrical' : 'episode',
        date: '2026-07-04' + (r.type === 'movie' ? '' : 'T21:00:00'),
        season: 1,
        episode: 1,
        episodeTitle: 'Premiere'
      }],
      nextDate: '2026-07-04',
      seerrUrl: `https://seerr.happysofa.org/${r.type === 'movie' ? 'movie' : 'tv'}/${r.tmdbId}`,
      addedAt: today
    }]);
  };
  if (!authed) {
    if (loading) return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app-gradient)'
      }
    }, /*#__PURE__*/React.createElement(Spinner, {
      size: 56
    }));
    return /*#__PURE__*/React.createElement(AuthGate, {
      onSignIn: signIn
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-app-gradient)'
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    view: view,
    onView: setView,
    label: rangeLabel(view, cursor),
    onPrev: () => step(-1),
    onNext: () => step(1),
    onToday: () => setCursor(new Date(today + 'T00:00:00Z')),
    activeTypes: activeTypes,
    onToggleType: toggleType,
    onOpenWatchlist: () => setDrawer(true),
    onOpenSettings: () => setSettingsOpen(true),
    me: D.me,
    compact: compact
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      minHeight: 0,
      padding: 'var(--space-5)'
    }
  }, view === 'month' && /*#__PURE__*/React.createElement(MonthGrid, {
    cursor: cursor,
    events: events,
    today: today,
    onSelect: setDetailId
  }), view === 'week' && /*#__PURE__*/React.createElement(WeekGrid, {
    cursor: cursor,
    events: events,
    today: today,
    onSelect: setDetailId
  }), view === 'day' && /*#__PURE__*/React.createElement(DayAgenda, {
    cursor: cursor,
    events: events,
    today: today,
    onSelect: setDetailId
  })), detailItem && /*#__PURE__*/React.createElement(DetailModal, {
    item: detailItem,
    onClose: () => setDetailId(null),
    onRemove: removeItem
  }), /*#__PURE__*/React.createElement(WatchlistDrawer, {
    open: drawer,
    onClose: () => setDrawer(false),
    items: watchlist,
    onSelect: id => {
      setDrawer(false);
      setDetailId(id);
    },
    search: D.search,
    onAdd: addItem
  }), /*#__PURE__*/React.createElement(SettingsModal, {
    open: settingsOpen,
    onClose: () => setSettingsOpen(false),
    settings: settings,
    onChange: setSettings
  }));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bracket-calendar/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/bracket-calendar/calendar.jsx
try { (() => {
/* Bracket kit — calendar views (Month / Week / Day) */
const {
  EventChip,
  Badge,
  Poster,
  TypePill
} = window.BracketDesignSystem_93e078;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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
function eventsFor(events, dayStr) {
  return events.filter(e => e.start.slice(0, 10) === dayStr);
}
function fmtTime(iso) {
  const t = iso.slice(11, 16);
  if (!t) return '';
  let [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'p' : 'a';
  h = h % 12 || 12;
  return m ? `${h}:${String(m).padStart(2, '0')}${ap}` : `${h}${ap}`;
}

/* ---------------- MONTH ---------------- */
function MonthGrid({
  cursor,
  events,
  today,
  onSelect
}) {
  const first = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), 1));
  const start = new Date(first);
  start.setUTCDate(1 - mondayIndex(first));
  const cells = Array.from({
    length: 42
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
      height: '100%',
      background: 'var(--surface-1)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
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
      color: 'var(--text-faint)'
    }
  }, d))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      gridAutoRows: '1fr',
      flex: 1
    }
  }, cells.map((d, i) => {
    const ds = ymd(d);
    const inMonth = d.getUTCMonth() === curMonth;
    const isToday = ds === today;
    const evs = eventsFor(events, ds);
    const shown = evs.slice(0, 3);
    const more = evs.length - shown.length;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        borderRight: i % 7 !== 6 ? '1px solid var(--border)' : 'none',
        borderBottom: i < 35 ? '1px solid var(--border)' : 'none',
        padding: 5,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        background: inMonth ? 'transparent' : 'color-mix(in srgb, var(--surface-sunken) 45%, transparent)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1px 3px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--fs-xs)',
        fontWeight: isToday ? 700 : 500,
        color: isToday ? '#fff' : inMonth ? 'var(--text-body)' : 'var(--text-faint)',
        background: isToday ? 'var(--brand)' : 'transparent',
        width: 20,
        height: 20,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, d.getUTCDate())), shown.map(e => /*#__PURE__*/React.createElement(EventChip, {
      key: e.id,
      title: e.title,
      type: e.type,
      poster: e.posterUrl,
      meta: e.label,
      dense: true,
      onClick: () => onSelect(e.itemId)
    })), more > 0 && /*#__PURE__*/React.createElement("button", {
      onClick: () => onSelect(shown[0].itemId),
      style: {
        background: 'none',
        border: 'none',
        textAlign: 'left',
        padding: '1px 6px',
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--text-muted)',
        cursor: 'pointer'
      }
    }, "+", more, " more"));
  })));
}

/* ---------------- WEEK ---------------- */
function WeekGrid({
  cursor,
  events,
  today,
  onSelect
}) {
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
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      gap: 8,
      height: '100%'
    }
  }, days.map((d, i) => {
    const ds = ymd(d);
    const isToday = ds === today;
    const evs = eventsFor(events, ds).sort((a, b) => Number(a.allDay) - Number(b.allDay) || a.start.localeCompare(b.start));
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "bracket-scroll",
      style: {
        background: 'var(--surface-1)',
        border: `1px solid ${isToday ? 'color-mix(in srgb, var(--brand) 55%, transparent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 10px',
        borderBottom: '1px solid var(--border)',
        flex: 'none',
        background: isToday ? 'var(--brand-soft)' : 'transparent'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 'var(--fs-xs)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--ls-wide)',
        color: 'var(--text-faint)',
        fontWeight: 600
      }
    }, DOW[i]), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 'var(--fs-xl)',
        fontWeight: 700,
        color: isToday ? 'var(--accent)' : 'var(--text-strong)'
      }
    }, d.getUTCDate())), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        overflowY: 'auto'
      }
    }, evs.length === 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: 'var(--text-faint)',
        padding: 6
      }
    }, "\u2014"), evs.map(e => /*#__PURE__*/React.createElement(EventChip, {
      key: e.id,
      title: e.title,
      type: e.type,
      poster: e.posterUrl,
      meta: e.label,
      time: e.allDay ? null : fmtTime(e.start),
      onClick: () => onSelect(e.itemId)
    }))));
  }));
}

/* ---------------- DAY ---------------- */
function DayAgenda({
  cursor,
  events,
  today,
  onSelect
}) {
  const ds = ymd(cursor);
  const evs = eventsFor(events, ds).sort((a, b) => Number(a.allDay) - Number(b.allDay) || a.start.localeCompare(b.start));
  const allDay = evs.filter(e => e.allDay);
  const timed = evs.filter(e => !e.allDay);
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
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 64,
      flex: 'none',
      fontSize: 'var(--fs-sm)',
      fontFamily: 'var(--font-mono)',
      color: 'var(--text-muted)'
    }
  }, e.allDay ? 'All day' : fmtTime(e.start)), /*#__PURE__*/React.createElement(Poster, {
    type: e.type,
    poster: e.posterUrl,
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
  }, e.title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-muted)'
    }
  }, e.label)), /*#__PURE__*/React.createElement(TypePill, {
    type: e.type
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: "bracket-scroll",
    style: {
      maxWidth: 720,
      margin: '0 auto',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      overflowY: 'auto',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement(Section, {
    title: "All day",
    count: allDay.length
  }, allDay.map(e => /*#__PURE__*/React.createElement(Row, {
    key: e.id,
    e: e
  }))), /*#__PURE__*/React.createElement(Section, {
    title: "Episodes & screenings",
    count: timed.length
  }, timed.map(e => /*#__PURE__*/React.createElement(Row, {
    key: e.id,
    e: e
  }))));
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
      color: 'var(--text-faint)',
      fontWeight: 600
    }
  }, title), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, count)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, count ? children : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-faint)'
    }
  }, "Nothing here.")));
}
window.BracketKit = Object.assign(window.BracketKit || {}, {
  MonthGrid,
  WeekGrid,
  DayAgenda,
  MONTHS,
  addMonths,
  ymd,
  fromYmd,
  mondayIndex
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bracket-calendar/calendar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/bracket-calendar/data.js
try { (() => {
/* Bracket UI kit — runtime mock data (plain-JS mirror of api.ts).
 * The shipping app reads the typed api.ts client; this powers the
 * static click-through kit. window.BracketData exposes the same shapes. */
(function () {
  const NOW = '2026-06-18';
  function base(id, tmdbId, type, title, year, status, overview, releases) {
    const sorted = [...releases].sort((a, b) => a.date.localeCompare(b.date));
    const next = sorted.find(r => r.date.slice(0, 10) >= NOW);
    return {
      id,
      tmdbId,
      type,
      title,
      year,
      overview,
      status,
      releases: sorted,
      nextDate: next ? next.date : undefined,
      seerrUrl: `https://seerr.happysofa.org/${type === 'movie' ? 'movie' : 'tv'}/${tmdbId}`,
      addedAt: '2026-05-01'
    };
  }
  const mv = (id, t, title, y, s, o, r) => base(id, t, 'movie', title, y, s, o, r);
  function eps(season, list) {
    return list.map(([date, episode, episodeTitle]) => ({
      kind: 'episode',
      date: `${date}T21:00:00`,
      season,
      episode,
      episodeTitle
    }));
  }
  const tv = (id, t, title, y, s, o, season, list) => base(id, t, 'tv', title, y, s, o, eps(season, list));
  const an = (id, t, title, y, s, o, rel) => base(id, t, 'anime', title, y, s, o, rel);
  const WATCHLIST = [mv('mv_1', 1001, 'Dune: Part Three', 2026, 'announced', 'Paul Atreides leads the Fremen in a holy war across the Imperium as the spice melange reshapes the galaxy.', [{
    kind: 'theatrical',
    date: '2026-06-19'
  }, {
    kind: 'digital',
    date: '2026-08-04'
  }]), mv('mv_2', 1002, 'The Batman: Part II', 2026, 'announced', 'The Dark Knight uncovers deeper corruption beneath Gotham\u2019s flooded streets.', [{
    kind: 'theatrical',
    date: '2026-06-26'
  }]), mv('mv_3', 1003, 'Avatar: Fire and Ash', 2025, 'library', 'The Sully family faces the aggressive Ash People in a new corner of Pandora.', [{
    kind: 'theatrical',
    date: '2025-12-19'
  }, {
    kind: 'digital',
    date: '2026-06-10'
  }, {
    kind: 'physical',
    date: '2026-06-24'
  }]), mv('mv_4', 1004, 'Mickey 18', 2026, 'requested', 'An expendable worker keeps getting reprinted on a frozen colony world.', [{
    kind: 'digital',
    date: '2026-06-13'
  }]), mv('mv_5', 1005, 'Wicked: For Good', 2025, 'released', 'Elphaba and Glinda confront the cost of their choices in the land of Oz.', [{
    kind: 'theatrical',
    date: '2025-11-21'
  }, {
    kind: 'digital',
    date: '2026-06-06'
  }]), mv('mv_6', 1006, 'Project Hail Mary', 2026, 'announced', 'A lone astronaut wakes with amnesia on a desperate mission to save the sun.', [{
    kind: 'theatrical',
    date: '2026-06-30'
  }]), tv('tv_1', 2001, 'Severance', 2026, 'library', 'The refiners of Lumon edge closer to the truth about their severed lives.', 3, [['2026-06-12', 7, 'Cold Harbor'], ['2026-06-19', 8, 'The Reunion']]), tv('tv_2', 2002, 'The Last of Us', 2026, 'library', 'Ellie and Abby cross paths in a brutal, rain-soaked Seattle.', 2, [['2026-06-15', 4, 'Day One'], ['2026-06-22', 5, 'Feast']]), tv('tv_3', 2003, 'Andor', 2026, 'released', 'The road to open rebellion narrows for Cassian Andor.', 2, [['2026-06-09', 11, 'Who Are You?'], ['2026-06-16', 12, 'Jedha, Kyber, Erso']]), tv('tv_4', 2004, 'House of the Dragon', 2026, 'announced', 'The Dance of the Dragons consumes the Seven Kingdoms.', 3, [['2026-06-28', 1, 'A Son for a Son']]), tv('tv_5', 2005, 'The Bear', 2026, 'requested', 'Carmy and the crew chase a star while the kitchen frays at the edges.', 4, [['2026-06-18', 1, 'Soup'], ['2026-06-18', 2, 'Worms']]), tv('tv_6', 2006, 'Foundation', 2026, 'library', 'Hari Seldon\u2019s plan unfolds across centuries of galactic decline.', 3, [['2026-06-13', 6, 'The Sinister Equation']]), an('an_1', 3001, 'Frieren: Beyond Journey\u2019s End', 2026, 'library', 'An elf mage reckons with mortality long after the demon king falls.', eps(1, [['2026-06-14', 28, 'A Real Hero'], ['2026-06-21', 29, 'The Land Where Souls Rest']])), an('an_2', 3002, 'Jujutsu Kaisen', 2026, 'library', 'The Culling Game forces sorcerers into a lethal nationwide ritual.', eps(3, [['2026-06-11', 2, 'Premature Death'], ['2026-06-18', 3, 'Bath']])), an('an_3', 3003, 'Chainsaw Man', 2026, 'announced', 'Denji balances devil-hunting with the simplest of dreams.', eps(2, [['2026-06-25', 1, 'The Hero of the Reze Arc']])), an('an_4', 3004, 'Solo Leveling', 2026, 'requested', 'The world\u2019s weakest hunter awakens a power only he can level up.', eps(3, [['2026-06-17', 1, 'Arise, Again']])), an('an_5', 3005, 'Demon Slayer: Infinity Castle', 2026, 'announced', 'The Hashira descend into Muzan\u2019s shifting fortress.', [{
    kind: 'theatrical',
    date: '2026-06-20'
  }]), an('an_6', 3006, 'Spy x Family', 2026, 'library', 'The Forgers keep up their cover while world peace hangs by a thread.', eps(3, [['2026-06-16', 9, 'Operation Strix'], ['2026-06-23', 10, 'The Hot-Spring Hideout']]))];
  function buildEvents(items) {
    const out = [];
    for (const it of items) {
      for (const r of it.releases) {
        const isEp = r.kind === 'episode';
        out.push({
          id: `${it.id}-${r.kind}-${r.date}-${r.episode || ''}`,
          itemId: it.id,
          type: it.type,
          title: it.title,
          posterUrl: it.posterUrl,
          start: r.date,
          allDay: !isEp,
          releaseKind: r.kind,
          label: isEp ? `S${r.season}E${r.episode}${r.episodeTitle ? ' \u00b7 ' + r.episodeTitle : ''}` : r.kind.charAt(0).toUpperCase() + r.kind.slice(1)
        });
      }
    }
    return out.sort((a, b) => a.start.localeCompare(b.start));
  }
  const SEARCH = [{
    tmdbId: 4001,
    type: 'movie',
    title: 'Blade Runner 2099',
    year: 2026,
    overview: 'A new replicant uprising decades after the Wallace era.',
    onWatchlist: false
  }, {
    tmdbId: 4002,
    type: 'tv',
    title: 'Silo',
    year: 2026,
    overview: 'Ten thousand live underground, forbidden to ask why.',
    onWatchlist: false
  }, {
    tmdbId: 4003,
    type: 'anime',
    title: 'One Piece',
    year: 2026,
    overview: 'Luffy and the Straw Hats chase the legendary One Piece.',
    onWatchlist: false
  }, {
    tmdbId: 4005,
    type: 'tv',
    title: 'Fallout',
    year: 2026,
    overview: 'A vault dweller ventures into the irradiated wasteland.',
    onWatchlist: false
  }];
  window.BracketData = {
    me: {
      id: 'u_1',
      plexUsername: 'avery',
      displayName: 'Avery Quinn',
      isAdmin: true
    },
    settings: {
      defaultView: 'month',
      timezone: 'Europe/London',
      theme: 'dark',
      defaultTypes: ['movie', 'tv', 'anime']
    },
    watchlist: WATCHLIST,
    events: buildEvents(WATCHLIST),
    search: SEARCH,
    buildEvents,
    NOW
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bracket-calendar/data.js", error: String((e && e.message) || e) }); }

// ui_kits/bracket-calendar/modals.jsx
try { (() => {
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
  EmptyState,
  Legend
} = window.BracketDesignSystem_93e078;
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
  onRemove
}) {
  if (!item) return null;
  return /*#__PURE__*/React.createElement(Modal, {
    open: true,
    onClose: onClose,
    width: 620
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(Poster, {
    type: item.type,
    src: item.posterUrl,
    width: 108,
    radius: "var(--radius-md)",
    style: {
      boxShadow: 'var(--shadow-xl)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
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
  }, item.year, " \xB7 TMDB #", item.tmdbId), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-body)',
      fontSize: 'var(--fs-sm)',
      lineHeight: 'var(--lh-normal)',
      marginTop: 10
    }
  }, item.overview))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--fs-xs)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--ls-wide)',
      color: 'var(--text-faint)',
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
  }, item.releases.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '9px 12px',
      background: 'var(--surface-2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-body)',
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, r.kind === 'episode' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      color: 'var(--accent)',
      fontWeight: 600
    }
  }, "S", r.season, "E", r.episode), r.episodeTitle) : /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, RELEASE_LABEL[r.kind])), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-mono)'
    }
  }, prettyDate(r.date)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 20,
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: () => onRemove(item.id)
  }, "Remove from Watchlist"), /*#__PURE__*/React.createElement(Button, {
    as: "a",
    href: item.seerrUrl,
    target: "_blank",
    rel: "noreferrer",
    variant: "primary",
    iconRight: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      style: {
        width: '100%',
        height: '100%'
      }
    }, /*#__PURE__*/React.createElement("path", {
      d: "M7 17L17 7M9 7h8v8"
    }))
  }, "Open in Seerr")));
}

/* ---------------- WATCHLIST DRAWER ---------------- */
function WatchlistDrawer({
  open,
  onClose,
  items,
  onSelect,
  search,
  onAdd
}) {
  const [filter, setFilter] = React.useState('All');
  const [q, setQ] = React.useState('');
  const [adding, setAdding] = React.useState(false);
  if (!open) return null;
  const counts = {
    All: items.length,
    Movies: items.filter(i => i.type === 'movie').length,
    TV: items.filter(i => i.type === 'tv').length,
    Anime: items.filter(i => i.type === 'anime').length,
    Upcoming: items.filter(i => i.nextDate).length
  };
  const typeMap = {
    Movies: 'movie',
    TV: 'tv',
    Anime: 'anime'
  };
  let list = items;
  if (filter === 'Upcoming') list = items.filter(i => i.nextDate);else if (typeMap[filter]) list = items.filter(i => i.type === typeMap[filter]);
  if (q) list = list.filter(i => i.title.toLowerCase().includes(q.toLowerCase()));
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 40,
      background: 'var(--overlay)',
      backdropFilter: 'var(--blur-sm)',
      WebkitBackdropFilter: 'var(--blur-sm)',
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'bracket-fade .18s ease'
    }
  }, /*#__PURE__*/React.createElement("style", null, `@keyframes bracket-fade{from{opacity:0}to{opacity:1}}@keyframes bracket-slide{from{transform:translateX(100%)}to{transform:translateX(0)}}`), /*#__PURE__*/React.createElement("aside", {
    onClick: e => e.stopPropagation(),
    className: "bracket-scroll",
    style: {
      width: 'var(--drawer-w)',
      maxWidth: '92vw',
      height: '100%',
      background: 'var(--surface-1)',
      borderLeft: '1px solid var(--border)',
      boxShadow: 'var(--shadow-xl)',
      display: 'flex',
      flexDirection: 'column',
      animation: 'bracket-slide .26s var(--ease-out)'
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
    variant: adding ? 'default' : 'primary',
    onClick: () => setAdding(v => !v)
  }, adding ? 'Done' : '+ Add title')), adding ? /*#__PURE__*/React.createElement(AddPanel, {
    search: search,
    items: items,
    onAdd: onAdd
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SearchInput, {
    placeholder: "Filter your watchlist\u2026",
    value: q,
    onChange: e => setQ(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap',
      marginTop: 12
    }
  }, ['All', 'Movies', 'TV', 'Anime', 'Upcoming'].map(f => /*#__PURE__*/React.createElement(FilterChip, {
    key: f,
    selected: filter === f,
    count: counts[f],
    onClick: () => setFilter(f)
  }, f))))), /*#__PURE__*/React.createElement("div", {
    className: "bracket-scroll",
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: 'var(--space-4)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, list.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "\uD83D\uDD0D",
    title: "No matches",
    body: "Try a different filter or search term."
  }) : list.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    onClick: () => onSelect(it.id),
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      textAlign: 'left',
      padding: 8,
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)',
      background: 'var(--surface-2)',
      cursor: 'pointer',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement(Poster, {
    type: it.type,
    src: it.posterUrl,
    width: 44
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
  }, it.title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center',
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(StatusBadge, {
    status: it.status
  })), it.nextDate && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 11,
      color: 'var(--text-muted)',
      marginTop: 5,
      fontFamily: 'var(--font-mono)'
    }
  }, "Next \xB7 ", prettyDate(it.nextDate))))))));
}
function AddPanel({
  search,
  items,
  onAdd
}) {
  const [q, setQ] = React.useState('');
  const have = new Set(items.map(i => i.tmdbId));
  const results = q ? search.filter(r => r.title.toLowerCase().includes(q.toLowerCase())) : search;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SearchInput, {
    placeholder: "Search movies, shows, anime\u2026",
    value: q,
    onChange: e => setQ(e.target.value),
    autoFocus: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, results.map(r => {
    const added = have.has(r.tmdbId);
    return /*#__PURE__*/React.createElement("div", {
      key: r.tmdbId,
      style: {
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        padding: 8,
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement(Poster, {
      type: r.type,
      width: 36
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
        fontSize: 'var(--fs-sm)'
      }
    }, r.title), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: 'var(--text-muted)'
      }
    }, r.year, " \xB7 ", r.type)), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: added ? 'default' : 'primary',
      disabled: added,
      onClick: () => onAdd(r)
    }, added ? 'Added' : 'Add'));
  })));
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
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: 'var(--text-strong)',
      fontSize: 'var(--fs-sm)'
    }
  }, label), hint && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
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
  }, "London (GMT+1)"), /*#__PURE__*/React.createElement("option", {
    value: "America/New_York"
  }, "New York (EDT)"), /*#__PURE__*/React.createElement("option", {
    value: "America/Los_Angeles"
  }, "Los Angeles (PDT)"), /*#__PURE__*/React.createElement("option", {
    value: "Asia/Tokyo"
  }, "Tokyo (JST)"))), /*#__PURE__*/React.createElement(Field, {
    label: "Theme"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
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
  }, /*#__PURE__*/React.createElement(Legend, {
    active: settings.defaultTypes,
    onToggle: toggleType
  })));
}

/* ---------------- AUTH GATE ---------------- */
function AuthGate({
  onSignIn
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'var(--bg-app-gradient)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
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
    src: "../../assets/brand/happysofa-sofa.jpg",
    alt: "happysofa",
    style: {
      width: 84,
      height: 84,
      borderRadius: 'var(--radius-xl)',
      objectFit: 'cover',
      boxShadow: 'var(--shadow-lg)',
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
    className: "bracket-gradient-text"
  }, "Bracket")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 'var(--fs-sm)',
      lineHeight: 'var(--lh-normal)',
      marginBottom: 24
    }
  }, "Your happysofa release calendar. Track every movie, show and anime on your watchlist \u2014 by the date it actually drops."), /*#__PURE__*/React.createElement(Button, {
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
  }, "Sign in with Plex"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-faint)',
      fontSize: 12,
      marginTop: 16
    }
  }, "Private community \xB7 invite only")));
}
window.BracketKit = Object.assign(window.BracketKit || {}, {
  DetailModal,
  WatchlistDrawer,
  SettingsModal,
  AuthGate
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bracket-calendar/modals.jsx", error: String((e && e.message) || e) }); }

// ui_kits/bracket-calendar/topbar.jsx
try { (() => {
/* Bracket kit — top app bar */
const {
  IconButton,
  ViewSwitcher,
  Legend,
  Avatar,
  Button
} = window.BracketDesignSystem_93e078;
const Icon = (paths, vb = '0 0 24 24') => /*#__PURE__*/React.createElement("svg", {
  viewBox: vb,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: {
    width: '100%',
    height: '100%'
  }
}, paths);
const Icons = {
  chevL: Icon(/*#__PURE__*/React.createElement("path", {
    d: "M15 6l-6 6 6 6"
  })),
  chevR: Icon(/*#__PURE__*/React.createElement("path", {
    d: "M9 6l6 6-6 6"
  })),
  cal: Icon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "18",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 10h18M8 2v4M16 2v4"
  }))),
  list: Icon(/*#__PURE__*/React.createElement("path", {
    d: "M5 3h14a1 1 0 011 1v17l-8-4-8 4V4a1 1 0 011-1z"
  })),
  gear: Icon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"
  }))),
  search: Icon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 21l-4.3-4.3"
  })))
};
function TopBar({
  view,
  onView,
  label,
  onPrev,
  onNext,
  onToday,
  activeTypes,
  onToggleType,
  onOpenWatchlist,
  onOpenSettings,
  me,
  compact
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      padding: '0 var(--space-5)',
      height: 'var(--nav-h)',
      flex: 'none',
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--blur-md)',
      WebkitBackdropFilter: 'var(--blur-md)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/brand/happysofa-sofa.jpg",
    alt: "happysofa",
    style: {
      width: 34,
      height: 34,
      borderRadius: 'var(--radius-md)',
      objectFit: 'cover',
      boxShadow: 'var(--shadow-sm)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "bracket-gradient-text",
    style: {
      fontSize: 22,
      fontWeight: 800,
      letterSpacing: 'var(--ls-tight)'
    }
  }, "Bracket")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginLeft: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "default",
    size: "sm",
    onClick: onToday
  }, "Today"), /*#__PURE__*/React.createElement(IconButton, {
    label: "Previous",
    onClick: onPrev
  }, Icons.chevL), /*#__PURE__*/React.createElement(IconButton, {
    label: "Next",
    onClick: onNext
  }, Icons.chevR), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'var(--fs-xl)',
      fontWeight: 700,
      color: 'var(--text-strong)',
      marginLeft: 6,
      whiteSpace: 'nowrap'
    }
  }, label)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), !compact && /*#__PURE__*/React.createElement(Legend, {
    active: activeTypes,
    onToggle: onToggleType,
    style: {
      flexWrap: 'nowrap'
    }
  }), /*#__PURE__*/React.createElement(ViewSwitcher, {
    value: view,
    onChange: onView
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Watchlist",
    variant: "solid",
    onClick: onOpenWatchlist
  }, Icons.list), /*#__PURE__*/React.createElement(IconButton, {
    label: "Settings",
    variant: "solid",
    onClick: onOpenSettings
  }, Icons.gear), /*#__PURE__*/React.createElement(Avatar, {
    name: me.displayName,
    size: 36
  })));
}
window.BracketKit = Object.assign(window.BracketKit || {}, {
  TopBar,
  Icons
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bracket-calendar/topbar.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Spinner = __ds_scope.Spinner;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Skeleton = __ds_scope.Skeleton;

__ds_ns.FilterChip = __ds_scope.FilterChip;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.SearchInput = __ds_scope.SearchInput;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.EventChip = __ds_scope.EventChip;

__ds_ns.Legend = __ds_scope.Legend;

__ds_ns.Poster = __ds_scope.Poster;

__ds_ns.StatusBadge = __ds_scope.StatusBadge;

__ds_ns.TypePill = __ds_scope.TypePill;

__ds_ns.BottomNav = __ds_scope.BottomNav;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.ViewSwitcher = __ds_scope.ViewSwitcher;

__ds_ns.ApiError = __ds_scope.ApiError;

__ds_ns.MOCK_ME = __ds_scope.MOCK_ME;

__ds_ns.MOCK_SETTINGS = __ds_scope.MOCK_SETTINGS;

__ds_ns.MOCK_WATCHLIST = __ds_scope.MOCK_WATCHLIST;

__ds_ns.MOCK_SEARCH = __ds_scope.MOCK_SEARCH;

})();
