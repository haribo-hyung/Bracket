/* Bracket browser API client — talks to bracket-api at same-origin /api.
 * Replaces the mock data.js. Exposes window.BracketApi + helpers. */
(function () {
  const BASE = '/api';
  async function http(path, init) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(BASE + path, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: ctrl.signal,
        ...(init || {}),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        const err = new Error(body || res.statusText);
        err.status = res.status;
        throw err;
      }
      if (res.status === 204) return null;
      return res.json();
    } catch (e) {
      if (e.name === 'AbortError') { const err = new Error('Request timed out'); err.status = 0; throw err; }
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  /* Flatten watchlist releases[] into calendar events (mirrors api.ts buildEvents). */
  function buildEvents(items) {
    const out = [];
    for (const it of items || []) {
      for (const r of it.releases || []) {
        const isEp = r.kind === 'episode';
        out.push({
          id: `${it.id}-${r.kind}-${r.date}-${r.episode ?? ''}`,
          itemId: it.id, type: it.type, title: it.title, posterUrl: it.posterUrl,
          start: r.date, allDay: !isEp, releaseKind: r.kind,
          season: r.season, episode: r.episode, episodeTitle: r.episodeTitle,
          label: isEp
            ? `S${r.season}E${r.episode}${r.episodeTitle ? ' · ' + r.episodeTitle : ''}`
            : r.kind.charAt(0).toUpperCase() + r.kind.slice(1),
        });
      }
    }
    return out.sort((a, b) => a.start.localeCompare(b.start));
  }

  window.BracketApi = {
    me: () => http('/me'),
    settings: () => http('/settings'),
    saveSettings: (s) => http('/settings', { method: 'PUT', body: JSON.stringify(s) }),
    watchlist: (past, future) => http('/watchlist' + (past != null ? `?past=${past}&future=${future}` : '')),
    search: (q, page) => http('/search?q=' + encodeURIComponent(q) + (page ? '&page=' + page : '')),
    add: (tmdbId, type) => http('/watchlist', { method: 'POST', body: JSON.stringify({ tmdbId, type }) }),
    remove: (id) => http('/watchlist/' + encodeURIComponent(id), { method: 'DELETE' }),
    authPin: () => http('/auth/plex/pin'),
    authPoll: (pinId) => http('/auth/plex/callback?pinId=' + pinId, { method: 'POST' }),
    logout: () => http('/auth/logout', { method: 'POST' }),
    importSeerr: () => http('/import/seerr', { method: 'POST' }),
    discover: () => http('/discover'),
    requestMedia: (tmdbId, type) => http('/request', { method: 'POST', body: JSON.stringify({ tmdbId, type }) }),
    setupStatus: () => http('/setup/status'),
    setupTest: (body) => http('/setup/test', { method: 'POST', body: JSON.stringify(body) }),
    setupDiscover: (body) => http('/setup/discover', { method: 'POST', body: JSON.stringify(body) }),
    setupSave: (body) => http('/setup/save', { method: 'POST', body: JSON.stringify(body) }),
  };
  window.BracketBuildEvents = buildEvents;
  window.BracketToday = new Date().toISOString().slice(0, 10);
})();
