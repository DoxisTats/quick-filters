/* Agent jobs – Doxis Business Studio prototype (vanilla JS, no build step). */
(function () {
  'use strict';

  var META = {
    failed: 'Failed', running: 'Running', queued: 'Queued', success: 'Successful'
  };
  var TAB_LABEL = { all: 'All', running: 'Current', failed: 'Unsuccessful', success: 'Successful' };
  var DEF_NAMES = Array.from(new Set(window.SEED.map(function (r) { return r[1]; }))).sort();
  var FIRST_DEFS = 4;

  var DEFAULT_DRAFT = { defs: {}, tab: 'all', jobType: '', parent: '', dq: '', showAll: false };

  var state = {
    tab: 'all', defs: {}, q: '', grouped: false, sortDesc: true, limit: '10000',
    jobType: '', parent: '',
    selected: {}, open: {}, openGroups: {}, overrides: {},
    defOpen: false, defQ: '', sortOpen: false, filtersOpen: false, draft: null,
    navOpen: false, searchOpen: false, toast: null
  };

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function icon(name, size, cls) {
    size = size || 20;
    return '<svg class="icon ' + (cls || '') + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (window.ICONS[name] || '') + '"/></svg>';
  }
  function fmt(s) { return s ? s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4) + ', ' + s.slice(11) : '–'; }
  function shortFmt(s) { return s.slice(8, 10) + '/' + s.slice(5, 7) + ', ' + s.slice(11, 16); }
  function set(patch) { Object.assign(state, patch); render(); }
  function inTab(j, t) {
    if (t === 'all') return true;
    if (t === 'running') return j.status === 'running' || j.status === 'queued';
    return j.status === t;
  }
  function queue(ids) {
    if (!ids.length) return;
    var prev = state.overrides;
    var next = Object.assign({}, prev);
    ids.forEach(function (id) { next[id] = 'queued'; });
    set({ overrides: next, selected: {}, toast: { title: ids.length + (ids.length === 1 ? ' job queued for restart' : ' jobs queued for restart'), prev: prev } });
  }

  /* ---------- derived data ---------- */
  function compute() {
    var jobs = window.SEED.map(function (r, i) {
      return { id: i, status: state.overrides[i] || r[0], def: r[1], c: r[2], st: r[3], en: r[4], ms: r[5], restarts: r[6], execs: r[7] };
    });
    var defKeys = Object.keys(state.defs);
    var q = state.q.trim().toLowerCase();
    var base = jobs.filter(function (j) {
      if (defKeys.length && !state.defs[j.def]) return false;
      if (q && j.def.toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    var rows = base.filter(function (j) { return inTab(j, state.tab); });
    rows.sort(function (a, b) { return state.sortDesc ? (a.c < b.c ? 1 : -1) : (a.c > b.c ? 1 : -1); });
    var failed = base.filter(function (j) { return j.status === 'failed'; });
    var failingDefs = {};
    failed.forEach(function (j) { failingDefs[j.def] = true; });
    return { jobs: jobs, defKeys: defKeys, q: q, base: base, rows: rows, failed: failed, failingDefs: failingDefs };
  }

  /* ---------- view pieces ---------- */
  function viewTopbar() {
    return '' +
      '<header class="topbar">' +
        '<button class="menu-btn" data-action="nav-toggle" aria-label="Open menu" aria-expanded="' + state.navOpen + '">' + icon('menu-01') + '</button>' +
        '<a class="brand" href="#" aria-label="Doxis Business Studio home"><img src="assets/doxis-logo.svg" alt="Doxis"><span>Business Studio</span></a>' +
        '<label class="topbar-search' + (state.searchOpen ? ' open' : '') + '">' + icon('search-lg') +
          '<input type="search" placeholder="Search" aria-label="Search Business Studio"></label>' +
        '<div class="topbar-actions">' +
          '<div class="icons">' +
            '<button class="icon-btn search-toggle" data-action="search-toggle" aria-label="Search">' + icon('search-lg') + '</button>' +
            '<button class="icon-btn" aria-label="Notifications">' + icon('bell-01') + '</button>' +
            '<button class="icon-btn help-btn" aria-label="Help">' + icon('help-circle') + '</button>' +
          '</div>' +
          '<button class="avatar" aria-label="Account menu"><img src="assets/avatar.jpg" alt=""></button>' +
        '</div>' +
      '</header>';
  }

  function viewSidebar() {
    var groups = window.NAV.map(function (g) {
      var items = g.items.map(function (it) {
        var sub = it[0].charAt(0) === '>';
        var label = sub ? it[0].slice(1) : it[0];
        var cur = label === 'Agents';
        return '<div class="nav-item' + (sub ? ' sub' : '') + '"><a href="#"' + (cur ? ' aria-current="page"' : '') + '>' +
          (sub ? '' : icon(it[1], 20, 'lead')) + '<span class="label">' + esc(label) + '</span>' +
          (it[2] ? icon(it[2], 16, 'trail') : '') + '</a></div>';
      }).join('');
      return '<div class="nav-group">' + (g.title ? '<div class="nav-title">' + esc(g.title) + '</div>' : '') + items + '</div>';
    }).join('');
    return '<nav class="sidebar' + (state.navOpen ? ' open' : '') + '" aria-label="Main"><div>' + groups + '</div>' +
      '<div class="sidebar-bottom"><div class="nav-item"><a href="#">' + icon('layout-left', 20, 'lead') + '<span class="label">Minimize menu</span></a></div></div></nav>' +
      '<button class="nav-scrim' + (state.navOpen ? ' open' : '') + '" data-action="nav-toggle" tabindex="-1" aria-label="Close menu"></button>';
  }

  function viewDefDropdown(d) {
    var n = d.defKeys.length;
    var summary = n === 1 ? d.defKeys[0] : 'Agent definition';
    var dq = state.defQ.trim().toLowerCase();
    var opts = DEF_NAMES.filter(function (name) { return !dq || name.toLowerCase().indexOf(dq) >= 0; }).map(function (name) {
      var count = d.jobs.filter(function (j) { return j.def === name && inTab(j, state.tab) && (!d.q || j.def.toLowerCase().indexOf(d.q) >= 0); }).length;
      var on = !!state.defs[name];
      return '<button type="button" class="pop-item" role="option" aria-selected="' + on + '" data-action="def-toggle" data-v="' + esc(name) + '">' +
        '<span class="cb-fake' + (on ? ' on' : '') + '">' + (on ? icon('check', 12) : '') + '</span>' +
        '<span class="grow">' + esc(name) + '</span><span class="muted">' + count + '</span></button>';
    }).join('');
    var pop = !state.defOpen ? '' :
      '<button class="click-away" data-action="def-open" tabindex="-1" aria-label="Close agent definition list"></button>' +
      '<div class="popover left" style="width:340px;max-width:calc(100vw - 24px)">' +
        '<div class="pop-search"><label>' + icon('search-sm', 16) + '<input type="text" data-input="defQ" value="' + esc(state.defQ) + '" placeholder="Search agent definitions" aria-label="Search agent definitions"></label></div>' +
        '<div class="pop-list" role="listbox" aria-multiselectable="true" aria-label="Agent definitions">' + (opts || '<div class="pop-row" style="color:#717680">No agent definitions found</div>') + '</div>' +
        '<div class="pop-footer"><button class="link-btn gray" data-action="def-clear">Clear</button><button class="link-btn" data-action="def-open">Done</button></div>' +
      '</div>';
    return '<div class="dd">' +
      '<button type="button" class="dd-trigger' + (n ? ' has-value' : '') + '" aria-haspopup="listbox" aria-expanded="' + state.defOpen + '" data-action="def-open">' +
        '<span class="value">' + esc(summary) + '</span>' + (n > 1 ? '<span class="dd-badge">' + n + '</span>' : '') + icon(state.defOpen ? 'chevron-up' : 'chevron-down') +
      '</button>' + pop + '</div>';
  }

  function viewSort() {
    var label = (state.grouped ? 'Agent definition' : 'Creation date') + (state.sortDesc ? ', newest first' : ', oldest first');
    var by = [['list', 'Creation date'], ['grouped', 'Agent definition (grouped)']].map(function (o) {
      var on = (o[0] === 'grouped') === state.grouped;
      return '<button type="button" class="pop-item" role="menuitemradio" aria-checked="' + on + '" data-action="sort-by" data-v="' + o[0] + '"><span class="grow">' + o[1] + '</span>' + (on ? icon('check', 20, 'check') : '') + '</button>';
    }).join('');
    var seq = [['desc', 'Descending', 'arrow-down'], ['asc', 'Ascending', 'arrow-up']].map(function (o) {
      var on = (o[0] === 'desc') === state.sortDesc;
      return '<button type="button" class="pop-item" role="menuitemradio" aria-checked="' + on + '" data-action="seq" data-v="' + o[0] + '">' + icon(o[2], 16, '') + '<span class="grow">' + o[1] + '</span>' + (on ? icon('check', 20, 'check') : '') + '</button>';
    }).join('');
    var pop = !state.sortOpen ? '' :
      '<button class="click-away" data-action="sort-open" tabindex="-1" aria-label="Close sorting"></button>' +
      '<div class="popover right" role="menu" aria-label="Sorting" style="width:280px;padding:4px 0">' +
        '<div class="pop-heading">Sort by</div>' + by + '<div class="pop-divider"></div>' +
        '<div class="pop-heading">Sequence</div>' + seq + '<div class="pop-divider"></div>' +
        '<label class="pop-row"><span>Search restrictions</span><input type="text" inputmode="numeric" data-input="limit" value="' + esc(state.limit) + '"></label>' +
      '</div>';
    return '<div class="dd"><button type="button" class="btn btn-icon' + (state.sortOpen ? ' is-active' : '') + '" aria-haspopup="menu" aria-expanded="' + state.sortOpen + '" aria-label="Sort: ' + label + '" title="Sort: ' + label + '" data-action="sort-open">' + icon('arrows-sort') + '</button>' + pop + '</div>';
  }

  function viewToolbar(d) {
    var tabs = ['all', 'running', 'failed', 'success'].map(function (t) {
      var n = d.base.filter(function (j) { return inTab(j, t); }).length;
      return '<button type="button" class="tab" role="tab" aria-selected="' + (state.tab === t) + '" data-action="tab" data-v="' + t + '">' + TAB_LABEL[t] + '<span class="count">' + n + '</span></button>';
    }).join('');
    return '<div class="toolbar">' +
      '<div class="tabs" role="tablist" aria-label="Filter by status">' + tabs + '</div>' +
      '<div class="toolbar-right">' + viewDefDropdown(d) +
        '<label class="field-search">' + icon('search-lg') + '<input type="text" data-input="q" value="' + esc(state.q) + '" placeholder="Search" aria-label="Search agent definitions"></label>' +
        '<div class="icon-group">' + viewSort() +
          '<button type="button" class="btn btn-icon" aria-label="Refresh" data-action="refresh">' + icon('refresh-cw-05') + '</button>' +
          '<button type="button" class="btn btn-icon' + (state.filtersOpen ? ' is-active' : '') + '" aria-label="Filters" data-action="filters-open">' + icon('filter-funnel-02') + '</button>' +
        '</div>' +
      '</div></div>';
  }

  function viewChips(d) {
    var chips = [];
    if (state.tab !== 'all') chips.push(['Status: ' + TAB_LABEL[state.tab], 'tab']);
    if (d.defKeys.length) chips.push(['Agent definition: ' + d.defKeys.join(', '), 'defs']);
    if (d.q) chips.push(['Name contains "' + state.q.trim() + '"', 'q']);
    if (!chips.length) return '';
    return '<div class="chips">' + chips.map(function (c) {
      return '<span class="chip">' + esc(c[0]) + '<button type="button" aria-label="Remove filter ' + esc(c[0]) + '" data-action="chip-remove" data-v="' + c[1] + '">' + icon('x-close', 12) + '</button></span>';
    }).join('') + '<button class="link-btn" data-action="clear-all">Clear all</button></div>';
  }

  function viewBulk() {
    var n = Object.keys(state.selected).length;
    if (!n) return '';
    return '<div class="bulk"><span class="sel"><strong>' + n + '</strong> items selected</span>' +
      '<button class="link-btn" data-action="restart-selected">' + icon('refresh-cw-05') + 'Restart</button>' +
      '<button class="link-btn" data-action="clear-selection">' + icon('x-close') + 'Clear selection</button></div>';
  }

  function viewRow(j) {
    var sel = !!state.selected[j.id];
    var op = !!state.open[j.id];
    var html = '<div class="row' + (sel ? ' selected' : '') + '">' +
      '<div class="tr data">' +
        '<div class="td cbcell"><input type="checkbox" class="cb" data-action="row-select" data-v="' + j.id + '"' + (sel ? ' checked' : '') + ' aria-label="Select ' + esc(j.def) + ' job created ' + fmt(j.c) + '"></div>' +
        '<div class="td c-status"><span class="badge ' + j.status + '">' + META[j.status] + '</span></div>' +
        '<div class="td ellipsis c-def">' + esc(j.def) + ' [dx4hr]</div>' +
        '<div class="td c-created"><span class="mlabel">Created</span>' + fmt(j.c) + '</div>' +
        '<div class="td num c-run"><span class="mlabel">Run time</span>' + (j.ms == null ? '–' : j.ms + '<span class="mlabel" style="margin:0 0 0 2px">ms</span>') + '</div>' +
        '<div class="td num c-restarts"><span class="mlabel">Restarts</span>' + j.restarts + '</div>' +
        '<div class="td num c-exec"><span class="mlabel">Executions</span>' + j.execs + '</div>' +
        '<div class="td c-actions"><div class="row-actions">' +
          (j.status === 'failed' ? '<button type="button" title="Restart job" aria-label="Restart ' + esc(j.def) + ' job" data-action="row-restart" data-v="' + j.id + '">' + icon('refresh-cw-05', 18) + '</button>' : '') +
          '<button type="button" aria-label="Show details" aria-expanded="' + op + '" data-action="row-open" data-v="' + j.id + '">' + icon(op ? 'chevron-up' : 'chevron-down', 18) + '</button>' +
        '</div></div>' +
      '</div>';
    if (op) {
      html += '<div class="details"><dl>' +
        '<div><dt>Agent job type</dt><dd>CRON-based</dd></div>' +
        '<div><dt>Start date</dt><dd>' + fmt(j.st) + '</dd></div>' +
        '<div><dt>End date</dt><dd>' + fmt(j.en) + '</dd></div>' +
        '<div><dt>Synchronous</dt><dd>No</dd></div>' +
        '<div><dt>Group</dt><dd>–</dd></div>' +
        '<div><dt>Sequence number</dt><dd>–</dd></div>' +
        '<div><dt>Priority</dt><dd>–</dd></div>' +
        '<div class="wide"><dt>Last error</dt><dd>' + (j.status === 'failed' ? '[Error message from job log]' : '–') + '</dd></div>' +
        '</dl><a class="btn-ghost" href="#">View job log</a></div>';
    }
    return html + '</div>';
  }

  function viewTable(d) {
    var rows = d.rows;
    var allSel = rows.length > 0 && rows.every(function (j) { return state.selected[j.id]; });
    var head = '<div class="tr thead" role="row">' +
      '<div class="th cbcell"><input type="checkbox" class="cb" data-action="select-all"' + (allSel ? ' checked' : '') + ' aria-label="Select all visible jobs"></div>' +
      '<div class="th">Status</div><div class="th">Agent definition</div>' +
      '<div class="th"><button class="th-sort" data-action="seq" data-v="' + (state.sortDesc ? 'asc' : 'desc') + '" aria-label="Sort by creation date, currently ' + (state.sortDesc ? 'newest first' : 'oldest first') + '">Creation date' + icon(state.sortDesc ? 'arrow-down' : 'arrow-up', 16) + '</button></div>' +
      '<div class="th num">Run time [ms]</div><div class="th num">Automatic restarts</div><div class="th num">Execution count</div><div class="th"><span class="sr-only">Actions</span></div></div>';

    var body;
    if (!rows.length) {
      body = '<div class="empty"><strong>No agent jobs match these filters</strong><span>Change or clear the filters to see more jobs.</span><button class="btn" data-action="clear-all">Clear filters</button></div>';
    } else if (state.grouped) {
      var order = [], by = {};
      rows.forEach(function (j) { if (!by[j.def]) { by[j.def] = []; order.push(j.def); } by[j.def].push(j); });
      var groups = order.map(function (name) {
        var list = by[name];
        var all = d.jobs.filter(function (j) { return j.def === name; }).sort(function (a, b) { return a.c < b.c ? -1 : 1; });
        return { name: name, list: list, latest: all[all.length - 1], fails: list.filter(function (j) { return j.status === 'failed'; }) };
      }).sort(function (a, b) { return b.fails.length - a.fails.length; });
      body = groups.map(function (g) {
        var open = !!state.openGroups[g.name];
        return '<div class="group-head">' +
          '<button class="toggle" aria-expanded="' + open + '" data-action="group-toggle" data-v="' + esc(g.name) + '">' + icon(open ? 'chevron-down' : 'chevron-right') + esc(g.name) + ' [dx4hr]</button>' +
          '<span class="last">Last run ' + shortFmt(g.latest.c) + '</span>' +
          (g.fails.length ? '<button class="link-btn" data-action="group-restart" data-v="' + esc(g.name) + '">' + icon('refresh-cw-05') + 'Restart ' + g.fails.length + ' failed</button>' : '') +
          '</div>' + (open ? g.list.map(viewRow).join('') : '');
      }).join('');
    } else {
      body = rows.map(viewRow).join('');
    }
    return '<div class="table-wrap"><div class="table">' + head + body + '</div></div>';
  }

  function viewFooter(d) {
    return '<div class="table-footer">' +
      '<label class="per-page">Show <span class="select-sm"><select aria-label="Rows per page"><option>25</option><option>50</option><option>100</option></select>' + icon('chevron-down', 16) + '</span> on page</label>' +
      '<nav class="pagination" aria-label="Pagination">' +
        '<button disabled>' + icon('chevron-left') + 'First</button>' +
        '<span class="page" aria-current="page">1</span>' +
        '<button disabled>Last' + icon('chevron-right') + '</button>' +
      '</nav></div>';
  }

  function seg(field, opts, emptyVal) {
    var dr = state.draft;
    return '<div class="btn-group" role="group">' + opts.map(function (o) {
      var on = dr[field] === o[0];
      return '<button type="button" aria-pressed="' + on + '" data-action="seg" data-field="' + field + '" data-v="' + (on && emptyVal !== null ? emptyVal : o[0]) + '">' + esc(o[1]) + '</button>';
    }).join('') + '</div>';
  }
  function secHead(title, desc, resetField) {
    return '<div class="fsec-head"><div><h3>' + esc(title) + '</h3><p>' + esc(desc) + '</p></div>' +
      (resetField ? '<button class="link-btn" data-action="draft-reset" data-field="' + resetField + '">Reset</button>' : '') + '</div>';
  }

  function viewDrawer() {
    if (!state.filtersOpen) return '';
    var dr = state.draft;
    var dq = dr.dq.trim().toLowerCase();
    var all = DEF_NAMES.filter(function (n) { return !dq || n.toLowerCase().indexOf(dq) >= 0; });
    var shown = (dr.showAll || dq) ? all : all.slice(0, FIRST_DEFS);
    var list = shown.map(function (n) {
      return '<label><input type="checkbox" class="cb" data-action="draft-def" data-v="' + esc(n) + '"' + (dr.defs[n] ? ' checked' : '') + '>' + esc(n) + '</label>';
    }).join('') +
      (shown.length < all.length ? '<button class="link-btn" style="align-self:flex-start" data-action="draft-more">Show ' + (all.length - shown.length) + ' more</button>' : '') +
      (!all.length ? '<span style="color:#717680">No agent definitions found</span>' : '');
    var selects = [['Trigger', 'trigger'], ['Agent Runtime Service', 'Agent Runtime Service'], ['Process class', 'process class']].map(function (f) {
      return '<label class="field"><span>' + f[0] + '</span><span class="select-wrap"><select class="select"><option value="">Select ' + f[1] + '</option><option>[' + f[0] + ']</option></select>' + icon('chevron-down', 16) + '</span></label>';
    }).join('');
    var texts = ['Agent job ID', 'Execution message', 'Task', 'AGENT_EVENT_OBJECT_CLIENT_ID'].map(function (t) {
      return '<label class="field"><span>' + t + '</span><input class="input" type="text" placeholder="' + t + '"></label>';
    }).join('');

    return '<button class="overlay" data-action="filters-close" tabindex="-1" aria-label="Close filters"></button>' +
      '<aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">' +
        '<div class="drawer-head"><h2 id="drawer-title">Filters</h2><p>Apply filters to agent jobs</p>' +
          '<button class="close" data-action="filters-close" aria-label="Close">' + icon('x-close', 20) + '</button></div>' +
        '<div class="drawer-body">' +
          '<label class="select-wrap"><span class="sr-only">Saved filter</span>' + icon('filter-lines', 20, 'lead') +
            '<select class="select with-lead"><option value="">Select saved filter</option><option>[Saved filter]</option></select>' + icon('chevron-down', 16) + '</label>' +
          '<section class="fsec">' + secHead('Status', 'Select the job status.', dr.tab !== 'all' ? 'tab' : '') +
            seg('tab', [['running', 'Current'], ['failed', 'Unsuccessful'], ['success', 'Successful']], 'all') + '</section>' +
          '<section class="fsec">' + secHead('Agent definition', 'Select one or more agent definitions.', Object.keys(dr.defs).length ? 'defs' : '') +
            '<label class="input-icon">' + icon('search-lg') + '<input type="text" data-input="dq" value="' + esc(dr.dq) + '" placeholder="Search" aria-label="Search agent definitions"><span class="kbd" aria-hidden="true">⌘K</span></label>' +
            '<div class="cb-list">' + list + '</div></section>' +
          '<section class="fsec">' + secHead('Agent job type', 'Select the type of agent job.', dr.jobType ? 'jobType' : '') +
            seg('jobType', [['cron', 'CRON-based'], ['other', '[Other job type]']], '') + '</section>' +
          '<section class="fsec">' + secHead('Parent completed', 'Show jobs whose parent job has completed.', dr.parent ? 'parent' : '') +
            seg('parent', [['yes', 'Yes'], ['no', 'No']], '') + '</section>' +
          '<section class="fsec">' + secHead('Source', 'Narrow down by trigger, service and process class.', '') + selects + '</section>' +
          '<section class="fsec">' + secHead('Creation date', 'Select the creation period.', '') +
            '<div class="two-col"><label class="input-icon">' + icon('calendar') + '<input type="date" aria-label="Creation date from"></label>' +
            '<label class="input-icon">' + icon('calendar') + '<input type="date" aria-label="Creation date to"></label></div></section>' +
          '<section class="fsec">' + secHead('ID & search in texts', 'Find jobs by ID or text they contain.', '') + texts + '</section>' +
        '</div>' +
        '<div class="drawer-foot">' +
          '<button class="link-btn">Save filter</button><button class="link-btn gray" data-action="draft-clear">Clear filters</button><span class="spacer"></span>' +
          '<div class="actions"><button class="btn btn-lg" data-action="filters-close">Cancel</button><button class="btn btn-primary btn-lg" data-action="filters-apply">Apply</button></div>' +
        '</div>' +
      '</aside>';
  }

  function viewToast() {
    if (!state.toast) return '';
    var info = !!state.toast.info;
    return '<div class="toast" role="status">' + (info ? icon('alert-circle', 20, 'info') : icon('check-circle', 20, 'ok')) +
      '<div class="body"><strong>' + esc(state.toast.title) + '</strong><span>' +
        (info ? 'There is nothing to restart. Change the filters to include failed jobs.' : 'The jobs will start with the next agent cycle.') + '</span>' +
      '<div class="acts"><button class="link-btn gray" data-action="toast-dismiss">Dismiss</button>' + (info ? '' : '<button class="link-btn" data-action="undo">Undo</button>') + '</div></div>' +
      '<button class="close" data-action="toast-dismiss" aria-label="Close">' + icon('x-close', 20) + '</button></div>';
  }

  /* ---------- render ---------- */
  var root = document.getElementById('app');
  function render() {
    // keep focus + caret on text inputs across re-renders
    var a = document.activeElement;
    var key = a && a.getAttribute && a.getAttribute('data-input');
    var caret = key && typeof a.selectionStart === 'number' ? a.selectionStart : null;

    var d = compute();
    var failedMatching = d.rows.filter(function (j) { return j.status === 'failed'; });
    var banner = d.failed.length ?
      '<div class="banner" role="status">' + icon('alert-circle') +
        '<div class="text"><strong>' + d.failed.length + ' failed jobs across ' + Object.keys(d.failingDefs).length + ' agent definitions.</strong> Latest failure: ' + fmt(d.failed.map(function (j) { return j.c; }).sort().pop()) + '.</div>' +
        (state.grouped ? '<button class="link-btn" data-action="show-list">' + icon('menu-01') + 'Show as list</button>'
          : '<button class="link-btn" data-action="group-failing">' + icon('layers-three-01') + 'Show by agent definition</button>') +
      '</div>' : '';

    root.innerHTML = viewTopbar() +
      '<div class="layout">' + viewSidebar() +
        '<main class="main">' +
          '<div class="page-header"><h1>Agent jobs</h1>' +
            '<button class="btn btn-primary" data-action="restart-matching">' + icon('refresh-cw-05') +
              '<span class="label-long">Restart all that match the filter criteria</span><span class="label-short">Restart ' + failedMatching.length + ' failed jobs</span></button></div>' +
          '<div class="content">' + banner +
            '<section class="card" aria-label="Agent jobs table">' + viewToolbar(d) + viewBulk() + viewTable(d) + viewFooter(d) + '</section>' +
          '</div>' +
        '</main>' +
      '</div>' + viewDrawer() + viewToast();

    if (key) {
      var el = root.querySelector('[data-input="' + key + '"]');
      if (el) { el.focus(); if (caret != null) el.setSelectionRange(caret, caret); }
    }
  }

  /* ---------- events ---------- */
  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-action]');
    if (!t) return;
    var act = t.getAttribute('data-action');
    var v = t.getAttribute('data-v');
    var f = t.getAttribute('data-field');
    var d;
    switch (act) {
      case 'nav-toggle': return set({ navOpen: !state.navOpen });
      case 'search-toggle': return set({ searchOpen: !state.searchOpen });
      case 'tab': return set({ tab: v, selected: {} });
      case 'def-open': return set({ defOpen: !state.defOpen, defQ: '', sortOpen: false });
      case 'def-toggle': d = Object.assign({}, state.defs); if (d[v]) delete d[v]; else d[v] = true; return set({ defs: d, selected: {} });
      case 'def-clear': return set({ defs: {} });
      case 'sort-open': return set({ sortOpen: !state.sortOpen, defOpen: false });
      case 'sort-by': return set({ grouped: v === 'grouped' });
      case 'seq': return set({ sortDesc: v === 'desc' });
      case 'refresh': return render();
      case 'filters-open':
        return set({ filtersOpen: true, sortOpen: false, defOpen: false, draft: { defs: Object.assign({}, state.defs), tab: state.tab, jobType: state.jobType, parent: state.parent, dq: '', showAll: false } });
      case 'filters-close': return set({ filtersOpen: false });
      case 'filters-apply':
        d = state.draft;
        return set({ filtersOpen: false, tab: d.tab, defs: d.defs, jobType: d.jobType, parent: d.parent, selected: {} });
      case 'seg': state.draft[f] = v; return render();
      case 'draft-reset': state.draft[f] = DEFAULT_DRAFT[f] instanceof Object ? {} : DEFAULT_DRAFT[f]; return render();
      case 'draft-clear': state.draft = JSON.parse(JSON.stringify(DEFAULT_DRAFT)); return render();
      case 'draft-more': state.draft.showAll = true; return render();
      case 'draft-def': d = state.draft.defs; if (d[v]) delete d[v]; else d[v] = true; return render();
      case 'chip-remove':
        if (v === 'tab') return set({ tab: 'all' });
        if (v === 'defs') return set({ defs: {} });
        return set({ q: '' });
      case 'clear-all': return set({ tab: 'all', defs: {}, q: '' });
      case 'select-all':
        d = compute();
        var allSel = d.rows.length > 0 && d.rows.every(function (j) { return state.selected[j.id]; });
        var n = {};
        if (!allSel) d.rows.forEach(function (j) { n[j.id] = true; });
        return set({ selected: n });
      case 'row-select': d = Object.assign({}, state.selected); if (d[v]) delete d[v]; else d[v] = true; return set({ selected: d });
      case 'row-open': d = Object.assign({}, state.open); d[v] = !d[v]; return set({ open: d });
      case 'row-restart': return queue([+v]);
      case 'group-toggle': d = Object.assign({}, state.openGroups); d[v] = !d[v]; return set({ openGroups: d });
      case 'group-restart':
        d = compute();
        return queue(d.rows.filter(function (j) { return j.def === v && j.status === 'failed'; }).map(function (j) { return j.id; }));
      case 'restart-matching':
        d = compute();
        var ids = d.rows.filter(function (j) { return j.status === 'failed'; }).map(function (j) { return j.id; });
        if (!ids.length) return set({ toast: { title: 'No failed jobs match the filter criteria', info: true } });
        return queue(ids);
      case 'restart-selected':
        return queue(Object.keys(state.selected).map(Number).filter(function (id) { return (state.overrides[id] || window.SEED[id][0]) === 'failed'; }));
      case 'clear-selection': return set({ selected: {} });
      case 'group-failing':
        d = compute();
        var o = {};
        Object.keys(d.failingDefs).forEach(function (k) { o[k] = true; });
        return set({ grouped: true, tab: 'failed', openGroups: o });
      case 'show-list': return set({ grouped: false });
      case 'toast-dismiss': return set({ toast: null });
      case 'undo': return set({ overrides: state.toast ? state.toast.prev : state.overrides, toast: null });
    }
  });

  root.addEventListener('input', function (e) {
    var key = e.target.getAttribute('data-input');
    if (!key) return;
    if (key === 'dq') { state.draft.dq = e.target.value; return render(); }
    var p = {}; p[key] = e.target.value; set(p);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (state.filtersOpen) return set({ filtersOpen: false });
      if (state.defOpen || state.sortOpen) return set({ defOpen: false, sortOpen: false });
      if (state.navOpen) return set({ navOpen: false });
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && state.filtersOpen) {
      e.preventDefault();
      var el = root.querySelector('[data-input="dq"]');
      if (el) el.focus();
    }
  });

  render();
})();
