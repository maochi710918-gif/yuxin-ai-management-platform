(() => {
  'use strict';

  const STORAGE_KEY = 'yuxin-ai-portal-v1';
  const workspaces = {
    plant: { name: '服務廠' },
    department: { name: '服務部' }
  };
  const iconOptions = {
    chart: '▥', service: '◆', analytics: '◫', team: '♟', radar: '◎', capacity: '▤',
    csi: '★', meeting: '▦', seat: '⌑', link: '↗', briefcase: '▣', tool: '⚙'
  };
  const defaultState = {
    dataVersion: 3,
    categories: [
      { id: 'company', name: '公司損益與營運' },
      { id: 'service', name: '服務部損益與營運' },
      { id: 'people', name: '專案與人員管理' },
      { id: 'admin', name: '客戶滿意度與行政工具' }
    ],
    entries: [
      { id: 'company-pl', name: '裕信汽車損益儀表板', url: 'https://maochi710918-gif.github.io/yuxin-pl-dashboard/', workspaceId: 'department', categoryId: 'company', description: '快速查看公司整體損益與營運資訊。', icon: 'chart', active: true },
      { id: 'service-pl', name: '裕信服務部損益儀表板', url: 'https://maochi710918-gif.github.io/yuxin-service-pl-dashboard/', workspaceId: 'department', categoryId: 'service', description: '集中掌握服務部損益與營運概況。', icon: 'chart', active: true },
      { id: 'service-dashboard', name: '裕信服務部營運儀表板', url: 'https://maochi710918-gif.github.io/yuxin-service-dashboard/', workspaceId: 'department', categoryId: 'service', description: '開啟服務部日常營運資訊入口。', icon: 'service', active: true },
      { id: 'aftersales', name: '售後服務分析儀表板', url: 'https://es-aftersales-dashboard-20261013.aptplume64.chatgpt.site/', workspaceId: 'department', categoryId: 'service', description: '查閱售後服務相關分析內容。', icon: 'analytics', active: true },
      { id: 'team-tracker', name: '團隊任務追蹤', url: 'https://team-tracker-wheat.vercel.app/dashboard', workspaceId: 'department', categoryId: 'people', description: '追蹤團隊工作項目與專案執行進度。', icon: 'team', active: true },
      { id: 'tech-radar', name: '技師績效雷達', url: 'https://maochi710918-gif.github.io/tech-performance-radar/', workspaceId: 'department', categoryId: 'people', description: '檢視技師績效雷達與相關資訊。', icon: 'radar', active: true },
      { id: 'capacity', name: '服務量能儀表板', url: 'https://maochi710918-gif.github.io/ys-service-capacity-dashboard/app/index.html#/board', workspaceId: 'department', categoryId: 'people', description: '掌握服務量能與工作配置資訊。', icon: 'capacity', active: true },
      { id: 'csi', name: 'CSI 服務滿意度儀表板', url: 'https://maochi710918-gif.github.io/csi-service-dashboard/', workspaceId: 'department', categoryId: 'admin', description: '查看 CSI 客戶服務滿意度資訊。', icon: 'csi', active: true },
      { id: 'meeting', name: '會議室預約管理', url: 'https://maochi710918-gif.github.io/yuxin-meeting-room-booking/', workspaceId: 'department', categoryId: 'admin', description: '查詢與管理公司會議室預約。', icon: 'meeting', active: true },
      { id: 'seat', name: '座位管理系統', url: 'https://maochi710918-gif.github.io/seat-manager/', workspaceId: 'department', categoryId: 'admin', description: '管理辦公座位配置與使用資訊。', icon: 'seat', active: true },
      { id: 'plant-daily-performance', name: '日業績分析儀表板', url: 'https://maochi710918-gif.github.io/yuxin-service-dashboard/', workspaceId: 'plant', categoryId: 'service', description: '查看服務廠每日業績與營運績效資訊。', icon: 'analytics', active: true },
      { id: 'plant-csi', name: 'CSI 服務滿意度儀表板', url: 'https://maochi710918-gif.github.io/csi-service-dashboard/', workspaceId: 'plant', categoryId: 'admin', description: '查看服務廠 CSI 客戶服務滿意度資訊。', icon: 'csi', active: true },
      { id: 'plant-tech-capacity', name: '技師-績效量能儀表板', url: 'https://maochi710918-gif.github.io/tech-performance-radar/', workspaceId: 'plant', categoryId: 'people', description: '檢視服務廠技師績效與量能資訊。', icon: 'radar', active: true },
      { id: 'plant-service-capacity', name: '服專/出納-服務量能儀表板', url: 'https://maochi710918-gif.github.io/ys-service-capacity-dashboard/app/index.html#/board', workspaceId: 'plant', categoryId: 'people', description: '掌握服專與出納的服務量能及工作配置。', icon: 'capacity', active: true }
    ],
    favorites: [], recent: [], layout: 'grid'
  };

  let state = loadState();
  let currentWorkspace = null;
  let filters = { view: 'all', categoryId: 'all', query: '' };
  let confirmAction = null;
  let pendingAdminAction = null;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (stored?.categories && stored?.entries) {
        const normalized = normalizeState({ ...structuredClone(defaultState), ...stored, dataVersion: stored.dataVersion || 1 });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        return normalized;
      }
    } catch (error) { console.warn('Unable to load local data', error); }
    return normalizeState(structuredClone(defaultState));
  }
  function normalizeState(data) {
    data.entries = data.entries.map(entry => ({ ...entry, workspaceId: entry.workspaceId || 'department' }));
    if (data.dataVersion < 2) {
      const additions = defaultState.entries.filter(entry => ['plant-daily-performance', 'plant-csi'].includes(entry.id) && !data.entries.some(item => item.id === entry.id));
      data.entries.push(...structuredClone(additions));
      data.dataVersion = 2;
    }
    if (data.dataVersion < 3) {
      const additions = defaultState.entries.filter(entry => ['plant-tech-capacity', 'plant-service-capacity'].includes(entry.id) && !data.entries.some(item => item.id === entry.id));
      data.entries.push(...structuredClone(additions));
      data.dataVersion = 3;
    }
    return data;
  }
  function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function uid(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
  function escapeHtml(value = '') { return value.replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
  function categoryName(id) { return state.categories.find(category => category.id === id)?.name || '未分類'; }
  function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 2400); }
  function passwordHash(value) { let hash = 2166136261; for (const char of value) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); } return (hash >>> 0).toString(16); }
  function requireAdmin(action) {
    pendingAdminAction = action;
    $('#passwordForm').reset(); clearErrors(); $('#togglePassword').textContent = '顯示'; $('#adminPassword').type = 'password';
    $('#passwordModal').showModal(); setTimeout(() => $('#adminPassword').focus(), 50);
  }

  function renderLandingCounts() {
    $('#plantEntryCount').textContent = state.entries.filter(entry => entry.active && entry.workspaceId === 'plant').length;
    $('#departmentEntryCount').textContent = state.entries.filter(entry => entry.active && entry.workspaceId === 'department').length;
  }

  function selectWorkspace(workspaceId) {
    if (!workspaces[workspaceId]) return;
    currentWorkspace = workspaceId;
    filters = { view: 'all', categoryId: 'all', query: '' };
    $('#searchInput').value = '';
    $$('[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === 'all'));
    $('#entryLanding').hidden = true;
    $('#portalShell').hidden = false;
    $('#topbarActions').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    render();
  }

  function showWorkspaceLanding() {
    currentWorkspace = null;
    $('#entryLanding').hidden = false;
    $('#portalShell').hidden = true;
    $('#topbarActions').hidden = true;
    renderLandingCounts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function render() {
    renderLandingCounts();
    if (!currentWorkspace) return;
    const active = state.entries.filter(entry => entry.active && entry.workspaceId === currentWorkspace);
    $('#pageTitle').textContent = `${workspaces[currentWorkspace].name} AI 數位管理平台`;
    $('#activeCount').textContent = active.length;
    $('#categoryCount').textContent = state.categories.length;
    $('#favoriteCount').textContent = state.favorites.filter(id => active.some(entry => entry.id === id)).length;
    $('#allBadge').textContent = active.length;
    $('#favoriteBadge').textContent = state.favorites.filter(id => active.some(entry => entry.id === id)).length;
    $('#recentBadge').textContent = state.recent.filter(item => active.some(entry => entry.id === item.id)).length;
    renderCategories(active);
    renderPortals(active);
    renderAdminEntries();
    renderAdminCategories();
    updateFormSelects();
  }

  function renderCategories(active) {
    const counts = Object.fromEntries(state.categories.map(cat => [cat.id, active.filter(entry => entry.categoryId === cat.id).length]));
    $('#categoryStrip').innerHTML = `<button class="category-chip ${filters.categoryId === 'all' ? 'active' : ''}" data-category="all">全部 <span>${active.length}</span></button>` +
      state.categories.map(cat => `<button class="category-chip ${filters.categoryId === cat.id ? 'active' : ''}" data-category="${cat.id}">${escapeHtml(cat.name)} <span>${counts[cat.id]}</span></button>`).join('');
  }

  function getVisibleEntries(active) {
    let entries = [...active];
    if (filters.view === 'favorites') entries = entries.filter(entry => state.favorites.includes(entry.id));
    if (filters.view === 'recent') {
      const order = new Map(state.recent.map((item, i) => [item.id, i]));
      entries = entries.filter(entry => order.has(entry.id)).sort((a, b) => order.get(a.id) - order.get(b.id));
    }
    if (filters.categoryId !== 'all') entries = entries.filter(entry => entry.categoryId === filters.categoryId);
    if (filters.query) {
      const q = filters.query.toLocaleLowerCase('zh-Hant');
      entries = entries.filter(entry => `${entry.name} ${entry.description} ${categoryName(entry.categoryId)}`.toLocaleLowerCase('zh-Hant').includes(q));
    }
    return entries;
  }

  function renderPortals(active) {
    const visible = getVisibleEntries(active);
    const container = $('#portalSections');
    container.classList.toggle('list-layout', state.layout === 'list');
    const groups = filters.view === 'recent'
      ? [{ id: 'recent', name: '最近使用', entries: visible }]
      : state.categories.map(category => ({ ...category, entries: visible.filter(entry => entry.categoryId === category.id) })).filter(group => group.entries.length);
    container.innerHTML = groups.map(group => `<section class="portal-section"><div class="section-head"><h2>${escapeHtml(group.name)}</h2><span>${group.entries.length} 個入口</span></div><div class="portal-grid">${group.entries.map(cardTemplate).join('')}</div></section>`).join('');
    const isWorkspaceEmpty = !active.length && filters.view === 'all' && filters.categoryId === 'all' && !filters.query;
    $('#emptyTitle').textContent = isWorkspaceEmpty ? `${workspaces[currentWorkspace].name}尚未建立入口` : '找不到符合條件的入口';
    $('#emptyText').textContent = isWorkspaceEmpty ? '可由管理者使用「新增入口」建立第一個系統入口。' : '請調整搜尋關鍵字、分類或檢視條件。';
    $('#clearFiltersBtn').hidden = isWorkspaceEmpty;
    $('#emptyState').hidden = visible.length > 0;
  }

  function cardTemplate(entry) {
    const favorite = state.favorites.includes(entry.id);
    return `<article class="portal-card" data-id="${entry.id}">
      <div class="card-top"><div class="portal-icon" aria-hidden="true">${iconOptions[entry.icon] || iconOptions.link}</div><button class="favorite-btn ${favorite ? 'active' : ''}" data-action="favorite" title="${favorite ? '取消收藏' : '加入收藏'}" aria-label="${favorite ? '取消收藏' : '加入收藏'}">${favorite ? '★' : '☆'}</button></div>
      <div class="card-body"><h3>${escapeHtml(entry.name)}</h3><span class="card-category">${escapeHtml(categoryName(entry.categoryId))}</span><p>${escapeHtml(entry.description)}</p></div>
      <div class="card-actions"><a class="open-btn" href="${escapeHtml(entry.url)}" target="_blank" rel="noopener noreferrer" data-action="open">開啟系統 ↗</a><button class="edit-btn" data-action="edit" title="編輯入口" aria-label="編輯 ${escapeHtml(entry.name)}">✎</button></div>
    </article>`;
  }

  function renderAdminEntries() {
    const entries = state.entries.filter(entry => entry.workspaceId === currentWorkspace);
    $('#adminEntries').innerHTML = entries.map((entry, index) => `<div class="admin-item" draggable="true" data-id="${entry.id}">
      <span class="drag-handle" title="拖曳排序">⠿</span><span class="portal-icon">${iconOptions[entry.icon] || iconOptions.link}</span>
      <div class="admin-info"><strong>${escapeHtml(entry.name)}</strong><small><span class="status-dot ${entry.active ? '' : 'off'}"></span>${entry.active ? '啟用' : '已停用'} · ${escapeHtml(categoryName(entry.categoryId))} · ${workspaces[entry.workspaceId].name}</small></div>
      <div class="admin-controls"><button class="mini-btn" data-admin-action="up" ${index === 0 ? 'disabled' : ''} title="上移">↑</button><button class="mini-btn" data-admin-action="down" ${index === entries.length - 1 ? 'disabled' : ''} title="下移">↓</button><label class="switch" title="${entry.active ? '停用' : '啟用'}入口"><input type="checkbox" data-admin-action="toggle" ${entry.active ? 'checked' : ''}><span></span></label><button class="mini-btn" data-admin-action="edit" title="編輯">✎</button><button class="mini-btn danger" data-admin-action="delete" title="刪除">×</button></div>
    </div>`).join('');
  }

  function renderAdminCategories() {
    $('#adminCategories').innerHTML = state.categories.map((category, index) => `<div class="admin-item" data-id="${category.id}">
      <span class="drag-handle">≡</span><span class="portal-icon">▤</span><div class="admin-info"><strong>${escapeHtml(category.name)}</strong><small>${state.entries.filter(entry => entry.workspaceId === currentWorkspace && entry.categoryId === category.id).length} 個入口</small></div>
      <div class="admin-controls"><button class="mini-btn" data-category-action="up" ${index === 0 ? 'disabled' : ''}>↑</button><button class="mini-btn" data-category-action="down" ${index === state.categories.length - 1 ? 'disabled' : ''}>↓</button><button class="mini-btn" data-category-action="edit">✎</button><button class="mini-btn danger" data-category-action="delete">×</button></div>
    </div>`).join('');
  }

  function updateFormSelects() {
    const select = $('#entryCategory');
    const current = select.value;
    select.innerHTML = `<option value="">請選擇分類</option>` + state.categories.map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`).join('');
    if (state.categories.some(cat => cat.id === current)) select.value = current;
    const iconSelect = $('#entryIcon');
    if (!iconSelect.options.length) iconSelect.innerHTML = Object.entries(iconOptions).map(([value, icon]) => `<option value="${value}">${icon} ${value}</option>`).join('');
  }

  function openEntryModal(entry = null) {
    $('#entryForm').reset(); clearErrors(); updateFormSelects();
    $('#entryModalTitle').textContent = entry ? '修改入口' : '新增入口'; $('#entryId').value = entry?.id || '';
    if (entry) { $('#entryName').value = entry.name; $('#entryUrl').value = entry.url; $('#entryWorkspace').value = entry.workspaceId || 'department'; $('#entryCategory').value = entry.categoryId; $('#entryIcon').value = entry.icon || 'link'; $('#entryDescription').value = entry.description; }
    else { $('#entryWorkspace').value = currentWorkspace || 'department'; $('#entryIcon').value = 'link'; if (filters.categoryId !== 'all') $('#entryCategory').value = filters.categoryId; }
    $('#entryModal').showModal(); setTimeout(() => $('#entryName').focus(), 50);
  }

  function validateEntry() {
    clearErrors(); const data = { name: $('#entryName').value.trim(), url: $('#entryUrl').value.trim(), workspaceId: $('#entryWorkspace').value, categoryId: $('#entryCategory').value, icon: $('#entryIcon').value, description: $('#entryDescription').value.trim() };
    let valid = true;
    [['#entryName', data.name, '請輸入入口名稱'], ['#entryWorkspace', data.workspaceId, '請選擇入口歸屬'], ['#entryCategory', data.categoryId, '請選擇分類'], ['#entryDescription', data.description, '請輸入用途說明']].forEach(([selector, value, message]) => { if (!value) { setError(selector, message); valid = false; } });
    if (!data.url) { setError('#entryUrl', '請輸入完整網址'); valid = false; }
    else { try { const parsed = new URL(data.url); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(); } catch { setError('#entryUrl', '網址格式不正確，請輸入以 http:// 或 https:// 開頭的完整網址'); valid = false; } }
    $('#formAlert').hidden = valid; if (!valid) $('#formAlert').textContent = '請修正標示的欄位後再儲存。'; return valid ? data : null;
  }
  function setError(selector, message) { const input = $(selector); input.closest('.field').classList.add('invalid'); input.closest('.field').querySelector('.error').textContent = message; }
  function clearErrors() { $$('.field').forEach(field => field.classList.remove('invalid')); $$('.error').forEach(error => error.textContent = ''); $('#formAlert').hidden = true; }

  function move(array, from, to) { if (to < 0 || to >= array.length) return; const [item] = array.splice(from, 1); array.splice(to, 0, item); saveState(); render(); }
  function moveEntryWithinWorkspace(id, offset) {
    const entries = state.entries.filter(entry => entry.workspaceId === currentWorkspace);
    const position = entries.findIndex(entry => entry.id === id);
    const other = entries[position + offset];
    if (!other) return;
    const from = state.entries.findIndex(entry => entry.id === id);
    const to = state.entries.findIndex(entry => entry.id === other.id);
    [state.entries[from], state.entries[to]] = [state.entries[to], state.entries[from]];
    saveState(); render();
  }
  function askConfirm(text, action) { $('#confirmText').textContent = text; confirmAction = action; $('#confirmLayer').hidden = false; $('#confirmCancel').focus(); }
  function closeConfirm() { $('#confirmLayer').hidden = true; confirmAction = null; }

  document.addEventListener('click', event => {
    const card = event.target.closest('.portal-card');
    if (card && event.target.closest('[data-action]')) {
      const action = event.target.closest('[data-action]').dataset.action; const entry = state.entries.find(item => item.id === card.dataset.id);
      if (action === 'favorite') { state.favorites = state.favorites.includes(entry.id) ? state.favorites.filter(id => id !== entry.id) : [...state.favorites, entry.id]; saveState(); render(); showToast(state.favorites.includes(entry.id) ? '已加入我的收藏' : '已取消收藏'); }
      if (action === 'edit') requireAdmin(() => openEntryModal(entry));
      if (action === 'open') { state.recent = [{ id: entry.id, at: Date.now() }, ...state.recent.filter(item => item.id !== entry.id)].slice(0, 10); saveState(); render(); }
    }
    const chip = event.target.closest('[data-category]'); if (chip) { filters.categoryId = chip.dataset.category; render(); }
    const view = event.target.closest('[data-view]'); if (view) { filters.view = view.dataset.view; $$('[data-view]').forEach(btn => btn.classList.toggle('active', btn === view)); render(); }
    const layout = event.target.closest('[data-layout]'); if (layout) { state.layout = layout.dataset.layout; $$('[data-layout]').forEach(btn => btn.classList.toggle('active', btn === layout)); saveState(); render(); }
    if (event.target.closest('.modal-close')) event.target.closest('dialog').close();
  });

  $$('[data-workspace]').forEach(button => button.addEventListener('click', () => selectWorkspace(button.dataset.workspace)));
  $('#switchWorkspaceBtn').addEventListener('click', showWorkspaceLanding);
  $('.brand').addEventListener('click', event => { event.preventDefault(); showWorkspaceLanding(); });
  $('#addBtn').addEventListener('click', () => requireAdmin(() => openEntryModal()));
  $('#adminAddBtn').addEventListener('click', () => { $('#manageModal').close(); openEntryModal(); });
  $('#manageBtn').addEventListener('click', () => requireAdmin(() => { render(); $('#manageModal').showModal(); }));
  $('#clearFiltersBtn').addEventListener('click', () => { filters = { view: 'all', categoryId: 'all', query: '' }; $('#searchInput').value = ''; $$('[data-view]').forEach(btn => btn.classList.toggle('active', btn.dataset.view === 'all')); render(); });
  $('#searchInput').addEventListener('input', event => { filters.query = event.target.value.trim(); render(); });
  document.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#searchInput').focus(); } if (event.key === 'Escape' && !$('#confirmLayer').hidden) closeConfirm(); });

  $('#entryForm').addEventListener('submit', event => {
    event.preventDefault(); const data = validateEntry(); if (!data) return; const id = $('#entryId').value;
    if (id) { const entry = state.entries.find(item => item.id === id); Object.assign(entry, data); showToast('入口已更新'); }
    else { state.entries.push({ id: uid('portal'), ...data, active: true }); showToast('入口已新增'); }
    saveState(); $('#entryModal').close(); render();
  });

  $('#passwordForm').addEventListener('submit', event => {
    event.preventDefault(); const password = $('#adminPassword').value;
    if (!password) return setError('#adminPassword', '請輸入管理密碼');
    if (passwordHash(password) !== '144417d5') { setError('#adminPassword', '密碼錯誤，請重新輸入'); $('#adminPassword').select(); return; }
    const action = pendingAdminAction; pendingAdminAction = null; $('#passwordModal').close(); showToast('管理密碼驗證成功'); action?.();
  });
  $('#togglePassword').addEventListener('click', () => { const input = $('#adminPassword'); const showing = input.type === 'text'; input.type = showing ? 'password' : 'text'; $('#togglePassword').textContent = showing ? '顯示' : '隱藏'; $('#togglePassword').setAttribute('aria-label', showing ? '顯示密碼' : '隱藏密碼'); input.focus(); });
  $('#passwordModal').addEventListener('close', () => { pendingAdminAction = null; });

  $$('.admin-tabs button').forEach(button => button.addEventListener('click', () => { $$('.admin-tabs button').forEach(btn => btn.classList.toggle('active', btn === button)); $('#entriesPanel').hidden = button.dataset.adminTab !== 'entries'; $('#categoriesPanel').hidden = button.dataset.adminTab !== 'categories'; }));
  $('#adminEntries').addEventListener('click', event => {
    const button = event.target.closest('[data-admin-action]'); if (!button) return; const row = button.closest('.admin-item'); const index = state.entries.findIndex(entry => entry.id === row.dataset.id); const entry = state.entries[index]; const action = button.dataset.adminAction;
    if (action === 'up') moveEntryWithinWorkspace(entry.id, -1); if (action === 'down') moveEntryWithinWorkspace(entry.id, 1);
    if (action === 'toggle') { entry.active = button.checked; saveState(); render(); showToast(entry.active ? '入口已啟用' : '入口已停用'); }
    if (action === 'edit') { $('#manageModal').close(); openEntryModal(entry); }
    if (action === 'delete') askConfirm(`「${entry.name}」刪除後將無法復原，是否繼續？`, () => { state.entries.splice(index, 1); state.favorites = state.favorites.filter(id => id !== entry.id); state.recent = state.recent.filter(item => item.id !== entry.id); saveState(); render(); showToast('入口已刪除'); });
  });

  let draggedId = null;
  $('#adminEntries').addEventListener('dragstart', event => { const row = event.target.closest('.admin-item'); if (!row) return; draggedId = row.dataset.id; row.classList.add('dragging'); });
  $('#adminEntries').addEventListener('dragend', event => { event.target.closest('.admin-item')?.classList.remove('dragging'); draggedId = null; });
  $('#adminEntries').addEventListener('dragover', event => event.preventDefault());
  $('#adminEntries').addEventListener('drop', event => { event.preventDefault(); const target = event.target.closest('.admin-item'); if (!target || !draggedId || target.dataset.id === draggedId) return; const from = state.entries.findIndex(e => e.id === draggedId); const to = state.entries.findIndex(e => e.id === target.dataset.id); move(state.entries, from, to); });

  $('#addCategoryBtn').addEventListener('click', () => { $('#categoryForm').reset(); $('#categoryId').value = ''; $('#categoryModalTitle').textContent = '新增分類'; $('#categoryModal').showModal(); });
  $('#categoryForm').addEventListener('submit', event => { event.preventDefault(); const name = $('#categoryName').value.trim(); if (!name) { setError('#categoryName', '請輸入分類名稱'); return; } const id = $('#categoryId').value; if (id) state.categories.find(cat => cat.id === id).name = name; else state.categories.push({ id: uid('category'), name }); saveState(); $('#categoryModal').close(); render(); showToast(id ? '分類已更新' : '分類已新增'); });
  $('#adminCategories').addEventListener('click', event => {
    const button = event.target.closest('[data-category-action]'); if (!button) return; const row = button.closest('.admin-item'); const index = state.categories.findIndex(cat => cat.id === row.dataset.id); const category = state.categories[index]; const action = button.dataset.categoryAction;
    if (action === 'up') move(state.categories, index, index - 1); if (action === 'down') move(state.categories, index, index + 1);
    if (action === 'edit') { $('#categoryForm').reset(); $('#categoryId').value = category.id; $('#categoryName').value = category.name; $('#categoryModalTitle').textContent = '修改分類'; $('#categoryModal').showModal(); }
    if (action === 'delete') { const count = state.entries.filter(entry => entry.categoryId === category.id).length; if (count) return showToast(`此分類仍有 ${count} 個入口，請先移動或刪除入口`); askConfirm(`確定刪除分類「${category.name}」？`, () => { state.categories.splice(index, 1); saveState(); render(); showToast('分類已刪除'); }); }
  });
  $('#confirmCancel').addEventListener('click', closeConfirm);
  $('#confirmOk').addEventListener('click', () => { const action = confirmAction; closeConfirm(); action?.(); });
  $('#confirmLayer').addEventListener('click', event => { if (event.target === $('#confirmLayer')) closeConfirm(); });

  $$('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); }));
  render();
})();
