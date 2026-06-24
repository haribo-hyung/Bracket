(function(){
/* Bracket kit — top app bar */
const {
  IconButton,
  ViewSwitcher,
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
  reset: Icon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M3 3v5h5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
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
  logout: Icon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 17l5-5-5-5M21 12H9"
  })))
};
function MenuItem({
  icon,
  label,
  onClick,
  danger
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: '100%',
      padding: '9px 10px',
      background: 'none',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      color: danger ? 'var(--red-400)' : 'var(--text-body)',
      cursor: 'pointer',
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
      width: 18,
      height: 18,
      flex: 'none'
    }
  }, icon), label);
}
function TopBar({
  view,
  onView,
  label,
  onPrev,
  onNext,
  onToday,
  onOpenWatchlist,
  onOpenSettings,
  onLogout,
  me,
  compact,
  viewport
}) {
  const [menu, setMenu] = React.useState(false);
  const menuRef = React.useRef(null);
  React.useEffect(() => {
    if (!menu) return;
    const onDown = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false);
    };
    const onKey = e => {
      if (e.key === 'Escape') setMenu(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  // "Day" is hidden everywhere now — the day view is reached by tapping a date
  // (inline panel on mobile, side flyout on tablet/desktop).
  const vs = /*#__PURE__*/React.createElement(ViewSwitcher, {
    value: view,
    onChange: onView,
    options: [{
      value: 'week',
      label: 'Week'
    }, {
      value: 'month',
      label: 'Month'
    }]
  });
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: compact ? 'var(--space-2)' : 'var(--space-4)',
      padding: compact ? '0 var(--space-3)' : '0 var(--space-5)',
      height: 'var(--nav-h)',
      flex: 'none',
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--blur-md)',
      WebkitBackdropFilter: 'var(--blur-md)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      overflowX: compact ? 'auto' : 'visible',
      overflowY: 'visible'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "/assets/brand/happysofa-sofa.jpg",
    alt: "happysofa",
    style: {
      width: compact ? 30 : 34,
      height: compact ? 30 : 34,
      borderRadius: 'var(--radius-md)',
      objectFit: 'cover',
      boxShadow: 'var(--shadow-sm)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: compact ? 18 : 22,
      fontWeight: 800,
      letterSpacing: 'var(--ls-tight)',
      color: 'var(--accent)'
    }
  }, "Bracket"), viewport && /*#__PURE__*/React.createElement("span", {
    title: "Responsive viewport (dev only)",
    style: {
      marginLeft: 4,
      padding: '2px 8px',
      borderRadius: 'var(--radius-full)',
      border: '1px dashed var(--amber-500)',
      color: 'var(--amber-400)',
      background: 'color-mix(in srgb, var(--amber-500) 12%, transparent)',
      fontSize: 'var(--fs-2xs)',
      fontWeight: 700,
      fontFamily: 'var(--font-mono)',
      whiteSpace: 'nowrap',
      textTransform: 'uppercase',
      letterSpacing: 'var(--ls-wide)'
    }
  }, viewport)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), vs, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Watchlist",
    variant: "solid",
    onClick: onOpenWatchlist
  }, Icons.list), /*#__PURE__*/React.createElement("div", {
    ref: menuRef,
    style: {
      position: 'relative',
      marginLeft: 4,
      paddingLeft: 12,
      borderLeft: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setMenu(v => !v),
    "aria-label": "Account menu",
    "aria-haspopup": "true",
    "aria-expanded": menu,
    title: me.displayName,
    style: {
      background: 'none',
      border: 'none',
      padding: 0,
      margin: 0,
      cursor: 'pointer',
      borderRadius: 'var(--radius-full)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: me.displayName,
    size: 36
  })), menu && /*#__PURE__*/React.createElement("div", {
    role: "menu",
    style: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: 0,
      zIndex: 31,
      minWidth: 210,
      background: 'var(--surface-1)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-xl)',
      padding: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 10px',
      borderBottom: '1px solid var(--border)',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-sm)',
      fontWeight: 600,
      color: 'var(--text-strong)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, me.displayName), me.plexUsername && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-2xs)',
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-mono)'
    }
  }, me.plexUsername)), /*#__PURE__*/React.createElement(MenuItem, {
    icon: Icons.gear,
    label: "Settings",
    onClick: () => {
      setMenu(false);
      onOpenSettings();
    }
  }), /*#__PURE__*/React.createElement(MenuItem, {
    icon: Icons.logout,
    label: "Log out",
    danger: true,
    onClick: () => {
      setMenu(false);
      onLogout();
    }
  })))));
}
window.BracketKit = Object.assign(window.BracketKit || {}, {
  TopBar,
  Icons
});

})();
