/* Groups – Doxis Business Studio prototype (vanilla JS, no build step). */
(function () {
  'use strict';

  var D = window.GROUP_DATA;
  var TYPE_LABEL = { user: 'User', role: 'Role', unit: 'Unit' };
  var TYPE_ICON = { user: 'user-01', role: 'shield-01', unit: 'building-07' };
  var POOL = { users: 'user', roles: 'role', units: 'unit' };
  var TAB_LABEL = { users: 'Users', roles: 'Roles', units: 'Units' };

  /* Organization size: 'small' lists everyone and filters while typing;
     'large' starts empty and only searches when the search is submitted (search icon or Enter), to avoid a backend request per keystroke (set window.ORG_SIZE in the HTML file). */
  var LARGE = window.ORG_SIZE === 'large';
  var nextId = 0;
  var state = {
    groups: D.groups.map(function (g) {
      return { id: nextId++, name: g[0], ref: g[1], members: g[2].map(function (m) { return { name: m[0], type: m[1] }; }) };
    }),
    selId: 0, gq: '', mq: '', tab: 'users', pq: '',
    modal: null, toast: null, pqRun: null, letter: null, jobsOpen: false, navOpen: false, searchOpen: false
  };

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function icon(name, size, cls) {
    size = size || 20;
    return '<svg class="icon ' + (cls || '') + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (window.ICONS[name] || '') + '"/></svg>';
  }
  /* Clear button for search fields: shown when the field has text */
  function clearBtn(key) {
    return state[key] ? '<button type="button" class="clear-x" data-action="clear-input" data-v="' + key + '" aria-label="Clear search" title="Clear">' + icon('x-close', 14) + '</button>' : '';
  }
  function wbr(s) { return esc(s).replace(/_/g, '_<wbr>'); }
  var toastTimer = null;
  function set(patch) {
    if ('toast' in patch && patch.toast !== state.toast) {
      clearTimeout(toastTimer);
      if (patch.toast) toastTimer = setTimeout(function () { set({ toast: null }); }, 8000); // notifications close on their own after 8s
    }
    Object.assign(state, patch); render();
  }
  function snapshot() { return JSON.parse(JSON.stringify(state.groups)); }
  function cmp(a, b) { return a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0; }
  function sel() { return state.groups.filter(function (g) { return g.id === state.selId; })[0] || null; }
  function isMember(g, name, type) { return g && g.members.some(function (m) { return m.name === name && m.type === type; }); }

  /* ---------- shell (same as Agent jobs) ---------- */
  function viewTopbar() {
    return '' +
      '<header class="topbar">' +
        '<button class="menu-btn" data-action="nav-toggle" aria-label="Open menu" aria-expanded="' + state.navOpen + '">' + icon('menu-01') + '</button>' +
        '<a class="brand" href="index.html" aria-label="Doxis Business Studio home"><img src="assets/doxis-logo.svg" alt="Doxis"><span>Business Studio</span></a>' +
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
      var items = g.items.filter(function (it) { return it[0].charAt(0) !== '>' || state.jobsOpen; }).map(function (it) {
        var sub = it[0].charAt(0) === '>';
        var label = sub ? it[0].slice(1) : it[0];
        if (label === 'Jobs') {
          // Expandable section: toggles its sub pages
          return '<div class="nav-item"><a href="#" data-action="jobs-toggle" aria-expanded="' + state.jobsOpen + '">' + icon(it[1], 20, 'lead') +
            '<span class="label">Jobs</span>' + icon(state.jobsOpen ? 'chevron-up' : 'chevron-down', 16, 'trail') + '</a></div>';
        }
        var cur = label === window.PAGE;
        var href = (window.NAV_LINKS && window.NAV_LINKS[label]) || '#';
        return '<div class="nav-item' + (sub ? ' sub' : '') + '"><a href="' + href + '"' + (cur ? ' aria-current="page"' : '') + '>' +
          (sub ? '' : icon(it[1], 20, 'lead')) + '<span class="label">' + esc(label) + '</span>' +
          (it[2] ? icon(it[2], 16, 'trail') : '') + '</a></div>';
      }).join('');
      return '<div class="nav-group">' + (g.title ? '<div class="nav-title">' + esc(g.title) + '</div>' : '') + items + '</div>';
    }).join('');
    return '<nav class="sidebar' + (state.navOpen ? ' open' : '') + '" aria-label="Main"><div>' + groups + '</div>' +
      '<div class="sidebar-bottom"><div class="nav-item"><a href="#">' + icon('layout-left', 20, 'lead') + '<span class="label">Minimize menu</span></a></div></div></nav>' +
      '<button class="nav-scrim' + (state.navOpen ? ' open' : '') + '" data-action="nav-toggle" tabindex="-1" aria-label="Close menu"></button>';
  }

  /* ---------- page pieces ---------- */
  function viewList() {
    var q = state.gq.trim().toLowerCase();
    var list = state.groups.slice().sort(function (a, b) { return cmp(a.name, b.name); })
      .filter(function (g) { return !q || g.name.toLowerCase().indexOf(q) >= 0; });
    var items = list.map(function (g) {
      var cur = g.id === state.selId;
      return '<button type="button" class="g-item" data-action="select-group" data-v="' + g.id + '" aria-current="' + cur + '">' +
        '<span class="grow">' + wbr(g.name) + '</span><span class="n" aria-label="' + g.members.length + ' members">' + g.members.length + '</span></button>';
    }).join('');
    return '<section class="card g-list" aria-label="Groups">' +
      '<div class="g-head"><h2>Groups</h2><span class="count">' + state.groups.length + '</span></div>' +
      '<div class="g-pad"><label class="input-icon">' + icon('search-lg') + '<input type="text" data-input="gq" value="' + esc(state.gq) + '" placeholder="Search groups" aria-label="Search groups">' + clearBtn('gq') + '</label></div>' +
      '<div class="scroll-y g-items" data-scroll="list">' + (items || '<div class="g-none">No groups match “' + esc(state.gq) + '”.</div>') + '</div>' +
    '</section>';
  }

  function viewDetail() {
    var g = sel();
    if (!g) {
      return '<section class="card g-detail" aria-label="Group details"><div class="g-empty">' +
        '<div class="featured">' + icon('users-01', 24) + '</div><strong>No group selected</strong><span>Select a group on the left, or create a new one.</span></div></section>';
    }
    var q = state.mq.trim().toLowerCase();
    var members = g.members.slice().sort(function (a, b) { return cmp(who(a.name, a.type).primary, who(b.name, b.type).primary); })
      .filter(function (m) { var w = who(m.name, m.type); return matchesAll(q, [m.name, w.primary, w.secondary, TYPE_LABEL[m.type]]); });
    var rows = members.map(function (m) {
      return '<div class="g-tr g-row">' +
        '<div class="g-name"><span class="type-ic ' + m.type + '">' + icon(TYPE_ICON[m.type], 16) + '</span>' + (function () { var w = who(m.name, m.type); return '<span class="nm2"><span title="' + esc(w.hint) + '">' + esc(w.primary) + '</span>' + (w.secondary ? '<small title="' + esc(w.secondary) + '">' + esc(w.secondary) + '</small>' : '') + '</span>'; })() + '</div>' +
        '<div>' + TYPE_LABEL[m.type] + '</div>' +
        '<div class="act"><button type="button" class="g-remove" data-action="remove-member" data-v="' + esc(m.name) + '" data-t="' + m.type + '" aria-label="Remove ' + esc(m.name) + ' from ' + esc(g.name) + '" title="Remove from group">' + icon('x-close', 20) + '</button></div>' +
      '</div>';
    }).join('');
    var body;
    if (!g.members.length) {
      body = '<div class="g-empty"><div class="featured">' + icon('user-plus-01', 24) + '</div><strong>No members yet</strong>' +
        '<span>Drag users, roles or units from the panel on the right into this area, or select + next to a name.</span></div>';
    } else if (!members.length) {
      body = '<div class="g-empty"><div class="featured">' + icon('search-lg', 24) + '</div><strong>No members found</strong>' +
        '<span>No user, role or unit in this group matches “' + esc(state.mq) + '”.</span>' +
        '<button type="button" class="btn" data-action="clear-mq">Clear search</button></div>';
    } else {
      body = '<div class="g-tr g-thead" role="row"><div>Name</div><div>Type</div><div class="act"><span class="sr-only">Remove</span></div></div>' + rows;
    }
    return '<section class="card g-detail" aria-label="Group details" data-drop="1">' +
      '<div class="gd-head"><div class="titles"><h2>' + wbr(g.name) + '</h2>' +
        (g.ref ? '<p class="ref">' + icon('link-04', 16) + '<span>Referenced by the application <strong>' + esc(g.ref) + '</strong></span></p>' : '<p class="ref">Not referenced by any application</p>') +
      '</div><div class="acts">' +
        '<button type="button" class="btn btn-icon" data-action="edit-open" aria-label="Edit group" title="Edit group">' + icon('edit-02') + '</button>' +
        '<button type="button" class="btn btn-icon danger" data-action="delete-open" aria-label="Delete group" title="Delete group">' + icon('trash-01') + '</button>' +
      '</div></div>' +
      '<div class="gd-bar"><label class="field-search">' + icon('search-lg') + '<input type="text" data-input="mq" value="' + esc(state.mq) + '" placeholder="Search for user, role or unit" aria-label="Search members">' + clearBtn('mq') + '</label>' +
        '<span class="total"><strong>' + g.members.length + '</strong> assigned</span></div>' +
      '<div class="scroll-y g-table" data-scroll="members">' + body + '</div>' +
      '<div class="drop-hint" aria-hidden="true">' + icon('user-plus-01') + 'Drop to add to ' + esc(g.name) + '</div>' +
    '</section>';
  }

  /* Display name + secondary line for a pool entry (Figma: sidepanel.fig "Add to rights") */
  /* Word-order independent search: every word of the query must appear somewhere
     in the entry (name, username, email or type), so "becker anna" finds Anna Becker. */
  function matchesAll(query, fields) {
    var words = String(query || '').toLowerCase().split(/[\s,;]+/).filter(Boolean);
    if (!words.length) return true;
    var hay = fields.join(' ').toLowerCase();
    return words.every(function (w) { return hay.indexOf(w) >= 0; });
  }

  function who(name, type) {
    // People: name on top, "username · email" below. Technical accounts: the name is the username.
    if (type !== 'user') return { primary: name, secondary: '', hint: name };
    var at = name.indexOf('@');
    if (at < 0) return { primary: name, secondary: '', hint: name + ' (technical user)' };
    var parts = name.slice(0, at).split(/[._-]/);
    var person = parts.map(function (p) { return p.charAt(0).toUpperCase() + p.slice(1); }).join(' ');
    var username = (parts[0].charAt(0) + parts.slice(1).join('')).toLowerCase(); // sample usernames: first initial + last name
    return { primary: person, secondary: username + ' · ' + name, hint: name };
  }

  function viewAdd() {
    var g = sel();
    var type = POOL[state.tab];
    var q = (LARGE ? (state.pqRun || '') : state.pq).trim().toLowerCase();
    var waiting = LARGE && !q; // large organizations: nothing is listed until a search runs
    var entries = waiting ? [] : D[state.tab].map(function (n) { var w = who(n, type); return { name: n, primary: w.primary, secondary: w.secondary, hint: w.hint }; })
      .filter(function (e) { return matchesAll(q, [e.name, e.primary, e.secondary]); })
      .sort(function (a, b) { return cmp(a.primary, b.primary); });
    var byLetter = {};
    entries.forEach(function (e) { var l = e.primary.charAt(0).toUpperCase(); (byLetter[l] = byLetter[l] || []).push(e); });
    var letters = Object.keys(byLetter).sort();
    var tabs = ['users', 'roles', 'units'].map(function (t) {
      return '<button type="button" role="tab" class="tab" aria-selected="' + (state.tab === t) + '" data-action="tab" data-v="' + t + '">' + TAB_LABEL[t] + '</button>';
    }).join('');
    var list = letters.map(function (l) {
      return '<div class="az-sec" data-letter="' + l + '"><div class="az-head">' + l + '</div>' + byLetter[l].map(function (e) {
        var added = isMember(g, e.name, type);
        var can = !!g && !added;
        return '<div class="pool-item' + (added ? ' added' : '') + '"' + (can ? ' draggable="true" data-drag="' + esc(e.name) + '" data-t="' + type + '"' : '') + '>' +
          '<svg class="grip" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="6" cy="3.5" r="1.25"/><circle cx="6" cy="8" r="1.25"/><circle cx="6" cy="12.5" r="1.25"/><circle cx="10" cy="3.5" r="1.25"/><circle cx="10" cy="8" r="1.25"/><circle cx="10" cy="12.5" r="1.25"/></svg>' +
          '<span class="txt"><span class="pri" title="' + esc(e.hint) + '">' + esc(e.primary) + '</span>' +
            (e.secondary ? '<span class="sec" title="' + esc(e.secondary) + '">' + esc(e.secondary) + '</span>' : '') + '</span>' +
          (added ? '<span class="pool-added" title="Already in the group">' + icon('check', 16) + '<span class="sr-only">Added</span></span>'
            : (can ? '<button type="button" class="pool-add" data-action="add-member" data-v="' + esc(e.name) + '" data-t="' + type + '" aria-label="Add ' + esc(e.primary) + ' to ' + esc(g.name) + '" title="Add">' + icon('plus-circle', 16) + '</button>' : '')) +
        '</div>';
      }).join('') + '</div>';
    }).join('');
    var single = { users: 'user', roles: 'role', units: 'unit' }[state.tab];
    var plural = { users: 'users', roles: 'roles', units: 'units' }[state.tab];
    var body;
    if (waiting) {
      body = '<div class="ga-empty"><div class="featured">' + icon('search-lg', 24) + '</div><strong>Search for ' + plural + '</strong>' +
        '<span>Enter a name' + (state.tab === 'users' ? ', username or email' : '') + ', then press Enter or select the search icon.</span></div>';
    } else if (!list) {
      body = '<div class="ga-empty"><div class="featured">' + icon('search-lg', 24) + '</div><strong>No ' + plural + ' found</strong>' +
        '<span>No ' + single + ' matches “' + esc(LARGE ? state.pqRun : state.pq) + '”. Check the spelling or try another search.</span></div>';
    } else {
      body = (LARGE ? '<div class="ga-count" role="status">' + entries.length + (entries.length === 1 ? ' result' : ' results') + ' for “' + esc(state.pqRun) + '”</div>' : '') + list;
    }
    var searchField = '<label class="input-icon">' + icon('search-lg') + '<input type="' + (LARGE ? 'search' : 'text') + '" data-input="pq" value="' + esc(state.pq) + '" placeholder="Search" aria-label="Search for ' + single + '"' + (LARGE ? ' enterkeyhint="search"' : '') + '>' + clearBtn('pq') + '</label>';
    var search = LARGE
      ? '<form class="ga-search" data-form="pool" role="search"><div class="input-icon ga-field">' +
          // Same look as the Figma search field; the leading search icon is also the submit button
          '<button type="submit" class="ga-go" aria-label="Search" title="Search">' + icon('search-lg') + '</button>' +
          '<input type="search" data-input="pq" value="' + esc(state.pq) + '" placeholder="Search" aria-label="Search for ' + single + '" enterkeyhint="search">' + clearBtn('pq') + '</div></form>'
      : searchField;
    var az = letters.length > 1 ? '<nav class="az-index" aria-label="Jump to letter">' + letters.map(function (l) {
      var on = (letters.indexOf(state.letter) >= 0 ? state.letter : letters[0]) === l;
      return '<button type="button" class="az" data-action="jump" data-v="' + l + '" aria-label="Jump to ' + l + '"' + (on ? ' aria-current="true"' : '') + '>' + l + '</button>';
    }).join('') + '</nav>' : '';
    return '<section class="card g-add" aria-label="Add to group">' +
      '<div class="ga-head"><h2>Add to group</h2><p>Drag an entry into the table or select Add.</p></div>' +
      '<div class="tabs tabs-sm" role="tablist" aria-label="Member type">' + tabs + '</div>' +
      search +
      '<div class="ga-list">' +
        '<div class="scroll-y pool" data-scroll="pool">' + body + '</div>' +
        az +
      '</div>' +
    '</section>';
  }

  function viewModal() {
    var m = state.modal;
    if (!m) return '';
    var g = sel();
    var body, foot;
    if (m.kind === 'delete') {
      body = '<div class="featured danger">' + icon('trash-01', 24) + '</div>' +
        '<div><h2 id="modal-title">Delete group “' + esc(g.name) + '”?</h2>' +
        '<p>' + (g.ref ? 'The application ' + esc(g.ref) + ' references this group. ' : '') +
        (g.members.length ? 'Its ' + g.members.length + (g.members.length === 1 ? ' member loses' : ' members lose') + ' the access the group grants.' : 'The group has no members.') + '</p></div>';
      foot = '<button type="button" class="btn" data-action="modal-close">Cancel</button>' +
        '<button type="button" class="btn btn-danger" data-action="modal-submit">Delete group</button>';
    } else {
      var create = m.kind === 'create';
      body = '<div class="featured">' + icon(create ? 'users-01' : 'edit-02', 24) + '</div>' +
        '<div><h2 id="modal-title">' + (create ? 'Create group' : 'Edit group') + '</h2>' +
        '<p>' + (create ? 'Groups bundle users, roles and units so you can grant access in one place.' : 'Rename the group. Applications that reference it keep working.') + '</p></div>' +
        '<label class="field"><span>Name</span><input class="input" type="text" data-input="modalValue" value="' + esc(m.value) + '" placeholder="e.g. Contract_Reviewers"' + (m.error ? ' aria-invalid="true" aria-describedby="modal-err"' : '') + '></label>' +
        (m.error ? '<span class="err" id="modal-err">' + esc(m.error) + '</span>' : '');
      foot = '<button type="button" class="btn" data-action="modal-close">Cancel</button>' +
        '<button type="button" class="btn btn-primary" data-action="modal-submit">' + (create ? 'Create group' : 'Save changes') + '</button>';
    }
    return '<button class="overlay" data-action="modal-close" tabindex="-1" aria-label="Close dialog"></button>' +
      '<div class="modal-wrap"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
        '<div class="modal-body">' + body + '<button type="button" class="close" data-action="modal-close" aria-label="Close">' + icon('x-close') + '</button></div>' +
        '<div class="modal-foot">' + foot + '</div>' +
      '</div></div>';
  }

  function viewToast() {
    var t = state.toast;
    if (!t) return '';
    return '<div class="toast" role="status">' + icon('check-circle', 20, 'ok') +
      '<div class="body"><strong>' + esc(t.title) + '</strong>' + (t.text ? '<span>' + esc(t.text) + '</span>' : '') +
      '<div class="acts"><button class="link-btn gray" data-action="toast-dismiss">Dismiss</button>' +
      (t.prev ? '<button class="link-btn" data-action="undo">Undo</button>' : '') + '</div></div>' +
      '<button class="close" data-action="toast-dismiss" aria-label="Close">' + icon('x-close', 20) + '</button></div>';
  }

  /* ---------- render ---------- */
  var root = document.getElementById('app');

  function render() {
    var a = document.activeElement;
    var key = a && a.getAttribute && a.getAttribute('data-input');
    var caret = key && typeof a.selectionStart === 'number' ? a.selectionStart : null;
    var scrolls = {};
    root.querySelectorAll('[data-scroll]').forEach(function (el) { scrolls[el.getAttribute('data-scroll')] = el.scrollTop; });

    root.innerHTML = viewTopbar() +
      '<div class="layout">' + viewSidebar() +
        '<main class="main">' +
          '<div class="page-header"><div class="page-title"><h1>Groups</h1><p>Display and management of groups, including assignment of users or units</p></div>' +
            '<button class="btn btn-primary" data-action="create-open">' + icon('plus') + '<span>Create group</span></button></div>' +
          '<div class="content"><div class="groups-layout">' + viewList() + viewDetail() + viewAdd() + '</div></div>' +
        '</main>' +
      '</div>' + viewModal() + viewToast();

    root.querySelectorAll('[data-scroll]').forEach(function (el) {
      var k = el.getAttribute('data-scroll');
      if (scrolls[k] != null) el.scrollTop = scrolls[k];
    });
    if (key) {
      var el = root.querySelector('[data-input="' + key + '"]');
      if (el) { el.focus(); if (caret != null) el.setSelectionRange(caret, caret); }
    }
  }

  /* ---------- actions ---------- */
  function addMember(name, type) {
    var g = sel();
    if (!g || isMember(g, name, type)) return;
    g.members.push({ name: name, type: type });
    set({ toast: null }); // no notification: the new row in the table and the check in the panel confirm the add
  }

  function submitModal() {
    var m = state.modal;
    var g = sel();
    if (m.kind === 'delete') {
      var prev = snapshot();
      var prevSel = state.selId;
      var sorted = state.groups.slice().sort(function (a, b) { return cmp(a.name, b.name); });
      var idx = sorted.indexOf(g);
      var next = sorted[idx + 1] || sorted[idx - 1];
      state.groups = state.groups.filter(function (x) { return x !== g; });
      return set({ modal: null, selId: next ? next.id : null, mq: '', toast: { title: 'Group “' + g.name + '” deleted', prev: prev, prevSel: prevSel } });
    }
    var name = (m.value || '').trim();
    if (!name) return set({ modal: Object.assign({}, m, { error: 'Enter a name for the group.' }) });
    var taken = state.groups.some(function (x) { return x.name.toLowerCase() === name.toLowerCase() && (m.kind === 'create' || x !== g); });
    if (taken) return set({ modal: Object.assign({}, m, { error: 'A group with this name already exists.' }) });
    if (m.kind === 'create') {
      var ng = { id: nextId++, name: name, ref: '', members: [] };
      state.groups.push(ng);
      return set({ modal: null, selId: ng.id, gq: '', mq: '', toast: { title: 'Group “' + name + '” created', text: 'Add users, roles or units from the panel on the right.' } });
    }
    var prev2 = snapshot();
    var old = g.name;
    g.name = name;
    set({ modal: null, toast: old === name ? null : { title: 'Group renamed to “' + name + '”', prev: prev2 } });
  }

  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-action]');
    if (!t) return;
    var v = t.getAttribute('data-v');
    var g = sel();
    switch (t.getAttribute('data-action')) {
      case 'jobs-toggle': e.preventDefault(); return set({ jobsOpen: !state.jobsOpen });
      case 'nav-toggle': return set({ navOpen: !state.navOpen });
      case 'search-toggle': return set({ searchOpen: !state.searchOpen });
      case 'select-group': return set({ selId: +v, mq: '', navOpen: false });
      case 'tab': { set({ tab: v, pq: '', pqRun: null, letter: null }); var pl = root.querySelector('[data-scroll="pool"]'); if (pl) pl.scrollTop = 0; return; }
      case 'jump': {
        var list = root.querySelector('[data-scroll="pool"]');
        var sec = list && list.querySelector('[data-letter="' + v + '"]');
        if (sec) list.scrollTop = sec.offsetTop - list.offsetTop;
        return markLetter(v);
      }
      case 'add-member': return addMember(v, t.getAttribute('data-t'));
      case 'remove-member': {
        var prev = snapshot();
        var type = t.getAttribute('data-t');
        g.members = g.members.filter(function (m) { return !(m.name === v && m.type === type); });
        return set({ toast: { title: who(v, type).primary + ' removed from ' + g.name, text: 'The ' + TYPE_LABEL[type].toLowerCase() + ' no longer has the group’s access.', prev: prev } });
      }
      case 'clear-mq': return set({ mq: '' });
      case 'clear-input': {
        var cp = {}; cp[v] = '';
        if (v === 'pq') { cp.pqRun = null; cp.letter = null; }
        set(cp);
        var inp = root.querySelector('[data-input="' + v + '"]'); if (inp) inp.focus();
        return;
      }
      case 'create-open': return openModal({ kind: 'create', value: '' });
      case 'edit-open': return openModal({ kind: 'edit', value: g.name });
      case 'delete-open': return openModal({ kind: 'delete' });
      case 'modal-close': return set({ modal: null });
      case 'modal-submit': return submitModal();
      case 'toast-dismiss': return set({ toast: null });
      case 'undo': {
        var tt = state.toast;
        var restored = tt.prev;
        var selId = tt.prevSel != null ? tt.prevSel : state.selId;
        if (!restored.some(function (x) { return x.id === selId; })) selId = restored.length ? restored[0].id : null;
        return set({ groups: restored, selId: selId, toast: null });
      }
    }
  });

  /* A–Z index: highlight the letter of the section at the top of the list */
  function markLetter(l) {
    state.letter = l;
    root.querySelectorAll('.az').forEach(function (b) {
      if (b.getAttribute('data-v') === l) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
  }
  root.addEventListener('scroll', function (e) {
    var list = e.target;
    if (!list.getAttribute || list.getAttribute('data-scroll') !== 'pool') return;
    var cur = null;
    list.querySelectorAll('[data-letter]').forEach(function (sec) { if (sec.offsetTop - list.offsetTop <= list.scrollTop + 1) cur = sec.getAttribute('data-letter'); });
    if (cur && cur !== state.letter && list.scrollTop + list.clientHeight < list.scrollHeight - 2) markLetter(cur);
  }, true);

  function openModal(m) {
    set({ modal: m });
    var input = root.querySelector('.modal [data-input="modalValue"]');
    if (input) { input.focus(); input.select(); }
    else { var b = root.querySelector('.modal [data-action="modal-close"].btn'); if (b) b.focus(); }
  }

  // Large organizations: run the search on Enter, not while typing
  root.addEventListener('submit', function (e) {
    if (e.target.getAttribute('data-form') !== 'pool') return;
    e.preventDefault();
    var q = state.pq.trim();
    set({ pqRun: q || null, letter: null });
    var pl = root.querySelector('[data-scroll="pool"]'); if (pl) pl.scrollTop = 0;
  });

  root.addEventListener('input', function (e) {
    var key = e.target.getAttribute('data-input');
    if (!key) return;
    if (key === 'modalValue') { state.modal.value = e.target.value; if (state.modal.error) { state.modal.error = null; render(); } return; }
    var p = {}; p[key] = e.target.value;
    // Large organizations: no search while typing (each search is a backend request); clearing the field resets the list
    if (LARGE && key === 'pq' && !e.target.value.trim()) p.pqRun = null;
    set(p);
  });

  /* Drag users, roles or units from the right panel into the group */
  var dragging = null;
  root.addEventListener('dragstart', function (e) {
    var it = e.target.closest && e.target.closest('[data-drag]');
    if (!it) return;
    dragging = { name: it.getAttribute('data-drag'), type: it.getAttribute('data-t') };
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', dragging.name);
    it.classList.add('dragging');
  });
  root.addEventListener('dragend', function (e) {
    if (e.target.classList) e.target.classList.remove('dragging');
    var z = root.querySelector('.g-detail'); if (z) z.classList.remove('is-drop');
    dragging = null;
  });
  root.addEventListener('dragover', function (e) {
    var z = e.target.closest && e.target.closest('[data-drop]');
    if (!z || !dragging) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    z.classList.add('is-drop');
  });
  root.addEventListener('dragleave', function (e) {
    var z = e.target.closest && e.target.closest('[data-drop]');
    if (z && !z.contains(e.relatedTarget)) z.classList.remove('is-drop');
  });
  root.addEventListener('drop', function (e) {
    var z = e.target.closest && e.target.closest('[data-drop]');
    if (!z || !dragging) return;
    e.preventDefault();
    var d = dragging; dragging = null;
    addMember(d.name, d.type);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (state.modal) return set({ modal: null });
      if (state.navOpen) return set({ navOpen: false });
    }
    if (e.key === 'Enter' && state.modal && e.target.getAttribute && e.target.getAttribute('data-input') === 'modalValue') {
      e.preventDefault();
      submitModal();
    }
  });

  render();
})();
