const API_BASE = "https://relative-joyce-3dprintable-b0155a87.koyeb.app"
/**
 * PrintFarm Mini App v2.6.7
 * Telegram Native 2026 Design
 */

const API_BASE = "https://relative-joyce-3dprintable-b0155a87.koyeb.app";
const USE_MOCK = false;
const VERSION = "2.6.7";

// ===================== STATE =====================

let state = {
    user: null,
    printers: [],
    models: [],
    orders: [],
    currentTab: 'printers',
    sortMode: 'free'
};

const tg = window.Telegram?.WebApp;

// ===================== ICONS (SVG) =====================

const Icons = {
    printer: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="6" y="9" width="12" height="10" rx="1"/>
        <path d="M6 14h12"/>
        <rect x="8" y="4" width="8" height="5" rx="1"/>
        <circle cx="17" cy="11" r="1" fill="currentColor"/>
    </svg>`,
    
    model: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
    </svg>`,
    
    order: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 12l2 2 4-4"/>
    </svg>`,
    
    user: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
    </svg>`,
    
    cube: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 2L2 7v10l10 5 10-5V7l-10-5z"/>
        <path d="M12 22V12"/>
        <path d="M2 7l10 5"/>
        <path d="M22 7l-10 5"/>
    </svg>`
};

// ===================== BRAND COLORS =====================

const brandColors = {
    'Creality': '#009688',
    'Anycubic': '#2196f3',
    'Prusa': '#ff9800',
    'Bambu Lab': '#4caf50',
    'Voron': '#9c27b0',
    'Elegoo': '#f44336',
    'Artillery': '#ff5722',
    'QIDI': '#3f51b5',
    'Flashforge': '#00bcd4'
};

// ===================== INIT =====================

function init() {
    if (tg) {
        tg.ready();
        tg.expand();
        applyTheme();
    }
    
    initTabBar();
    initFilter();
    initIcons();
    loadData();
    startAutoRefresh();
}

function applyTheme() {
    if (!tg?.themeParams) return;
    const root = document.documentElement;
    if (tg.themeParams.bg_color) root.style.setProperty('--bg', tg.themeParams.secondary_bg_color || '#f1f2f6');
    if (tg.themeParams.text_color) root.style.setProperty('--text', tg.themeParams.text_color);
    if (tg.themeParams.hint_color) root.style.setProperty('--text-secondary', tg.themeParams.hint_color);
    if (tg.themeParams.button_color) root.style.setProperty('--accent', tg.themeParams.button_color);
}

function initIcons() {
    const tabIcons = {
        'tab-icon-printers': Icons.printer,
        'tab-icon-models': Icons.model,
        'tab-icon-orders': Icons.order
    };
    
    Object.entries(tabIcons).forEach(([id, svg]) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = svg;
    });
    
    ['empty-printers-icon', 'empty-models-icon', 'empty-orders-icon'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = Icons.cube;
    });
}

// ===================== TAB BAR =====================

function initTabBar() {
    document.querySelectorAll('.tabbar-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tab) {
    state.currentTab = tab;
    
    document.querySelectorAll('.tabbar-item').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');
    
    const filterBtn = document.getElementById('filter-btn');
    filterBtn.style.display = tab === 'printers' ? 'flex' : 'none';
}

// ===================== FILTER =====================

function initFilter() {
    const btn = document.getElementById('filter-btn');
    const popover = document.getElementById('filter-popover');
    
    if (!btn || !popover) return;
    
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        popover.classList.toggle('hidden');
    });
    
    document.addEventListener('click', () => {
        popover.classList.add('hidden');
    });
    
    popover.querySelectorAll('.popover-item').forEach(item => {
        item.addEventListener('click', () => {
            state.sortMode = item.dataset.sort;
            popover.querySelectorAll('.popover-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            popover.classList.add('hidden');
            renderPrinters();
        });
    });
}

// ===================== DATA =====================

async function loadData() {
    try {
        const data = await fetchBootstrap();
        state.user = data.user;
        state.printers = data.printers || [];
        state.models = data.models || [];
        state.orders = data.orders || [];
        
        render();
        document.getElementById('loading').classList.add('hidden');
    } catch (e) {
        console.error('Load error:', e);
        showToast('Failed to load data');
        document.getElementById('loading').classList.add('hidden');
    }
}

async function fetchBootstrap() {
    if (USE_MOCK) {
        await delay(300);
        return getMockData();
    }
    
    const res = await fetch(`${API_BASE}/api/bootstrap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg?.initData || '' })
    });
    
    if (!res.ok) throw new Error('API error');
    return res.json();
}

async function printerAction(printerId, action) {
    if (USE_MOCK) {
        await delay(200);
        const p = state.printers.find(x => x.id === printerId);
        if (p) {
            if (action === 'pause') p.status = 'PAUSED';
            else if (action === 'resume') p.status = 'BUSY';
            else if (action === 'finish') { p.status = 'FREE'; p.current_item_name = null; }
            else if (action === 'repair') { p.status = 'REPAIR'; p.current_item_name = null; }
            else if (action === 'repair_done') p.status = 'FREE';
        }
        return { success: true };
    }
    
    const res = await fetch(`${API_BASE}/api/printer/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg?.initData || '', printer_id: printerId, action })
    });
    
    if (!res.ok) throw new Error('Action failed');
    return res.json();
}

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// ===================== RENDER =====================

function render() {
    renderPrinters();
    renderModels();
    renderOrders();
    renderProfile();
    updateAvatar();
}

function renderPrinters() {
    const list = document.getElementById('printers-list');
    const empty = document.getElementById('printers-empty');
    const count = document.getElementById('printers-count');
    
    let printers = sortPrinters([...state.printers]);
    count.textContent = printers.length;
    
    if (!printers.length) {
        list.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }
    
    empty.classList.add('hidden');
    list.innerHTML = printers.map(p => {
        const color = brandColors[p.brand] || '#666';
        const progress = calcProgress(p);
        const timeLeft = calcTimeLeft(p);
        
        let progressHtml = '';
        if ((p.status === 'BUSY' || p.status === 'PAUSED') && p.current_item_name) {
            progressHtml = `
                <div class="printer-progress">
                    <div class="progress-model">${esc(p.current_item_name)}</div>
                    <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
                    <div class="progress-info">
                        <span>${progress.toFixed(1)}%</span>
                        <span>${timeLeft}</span>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="printer-card" data-id="${p.id}">
                <div class="printer-icon" style="background:${color}">${p.brand[0]}</div>
                <div class="printer-info">
                    <div class="printer-name">${esc(p.name)}</div>
                    <div class="printer-model">${esc(p.brand)} ${esc(p.model_name)} · ${p.bed_x}×${p.bed_y}</div>
                    ${progressHtml}
                </div>
                <div class="printer-status ${p.status.toLowerCase()}">${getStatusText(p.status)}</div>
            </div>
        `;
    }).join('');
    
    list.querySelectorAll('.printer-card').forEach(card => {
        card.addEventListener('click', () => showPrinterSheet(parseInt(card.dataset.id)));
    });
}

function sortPrinters(printers) {
    const statusOrder = { FREE: 0, BUSY: 1, PAUSED: 2, REPAIR: 3 };
    
    switch (state.sortMode) {
        case 'free':
            return printers.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        case 'busy':
            return printers.sort((a, b) => statusOrder[b.status] - statusOrder[a.status]);
        case 'fast':
            return printers.sort((a, b) => (a.bed_x * a.bed_y) - (b.bed_x * b.bed_y));
        case 'slow':
            return printers.sort((a, b) => (b.bed_x * b.bed_y) - (a.bed_x * a.bed_y));
        case 'name':
            return printers.sort((a, b) => a.name.localeCompare(b.name));
        default:
            return printers;
    }
}

function renderModels() {
    const list = document.getElementById('models-list');
    const empty = document.getElementById('models-empty');
    const count = document.getElementById('models-count');
    
    count.textContent = state.models.length;
    
    if (!state.models.length) {
        list.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }
    
    empty.classList.add('hidden');
    list.innerHTML = state.models.map(m => {
        const size = m.size_x ? `${m.size_x.toFixed(0)}×${m.size_y.toFixed(0)}×${m.size_z.toFixed(0)}mm` : '';
        const time = `${m.estimated_time.toFixed(1)}h`;
        const meta = [size, time].filter(Boolean).join(' · ');
        
        return `
            <div class="model-card">
                <div class="model-icon">${Icons.cube}</div>
                <div class="model-info">
                    <div class="model-name">${esc(m.item_name)}</div>
                    <div class="model-meta">${meta}</div>
                </div>
            </div>
        `;
    }).join('');
}

function renderOrders() {
    const list = document.getElementById('orders-list');
    const empty = document.getElementById('orders-empty');
    const count = document.getElementById('orders-count');
    
    count.textContent = state.orders.length;
    
    if (!state.orders.length) {
        list.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }
    
    empty.classList.add('hidden');
    list.innerHTML = state.orders.map(o => {
        const progress = o.quantity_needed > 0 ? (o.quantity_done / o.quantity_needed * 100) : 0;
        
        return `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-title">${esc(o.title)}</div>
                    <div class="order-progress-text">${o.quantity_done}/${o.quantity_needed}</div>
                </div>
                ${o.item_name ? `<div class="order-model">${esc(o.item_name)}</div>` : ''}
                <div class="order-bar"><div class="order-bar-fill" style="width:${progress}%"></div></div>
            </div>
        `;
    }).join('');
}

function renderProfile() {
    if (!state.user) return;
    
    const avatar = document.getElementById('profile-avatar');
    const name = document.getElementById('profile-name');
    const id = document.getElementById('profile-id');
    const plan = document.getElementById('profile-plan');
    const limitFill = document.getElementById('limit-fill');
    const limitText = document.getElementById('limit-text');
    
    const userData = tg?.initDataUnsafe?.user;
    const displayName = userData?.first_name || state.user.first_name || 'User';
    const initial = displayName[0].toUpperCase();
    
    if (userData?.photo_url) {
        avatar.innerHTML = `<img src="${userData.photo_url}" alt="">`;
    } else {
        avatar.textContent = initial;
    }
    
    name.textContent = displayName;
    id.textContent = `ID: ${state.user.telegram_id}`;
    
    const planName = state.user.plan || 'FREE';
    plan.textContent = planName;
    plan.className = 'settings-value plan-badge ' + planName.toLowerCase();
    
    const limits = { FREE: 1, PRO: 5, STUDIO: 999 };
    const limit = limits[planName] || 1;
    const printerCount = state.printers.length;
    const percent = Math.min(100, (printerCount / limit) * 100);
    
    limitFill.style.width = `${percent}%`;
    limitText.textContent = limit >= 999 ? `${printerCount}/∞` : `${printerCount}/${limit}`;
}

function updateAvatar() {
    const tabAvatar = document.getElementById('tab-avatar');
    const userData = tg?.initDataUnsafe?.user;
    
    if (userData?.photo_url) {
        tabAvatar.innerHTML = `<img src="${userData.photo_url}" alt="">`;
    } else {
        tabAvatar.innerHTML = Icons.user;
    }
}

// ===================== SHEET =====================

function showPrinterSheet(printerId) {
    const printer = state.printers.find(p => p.id === printerId);
    if (!printer) return;
    
    const sheet = document.getElementById('sheet');
    const body = document.getElementById('sheet-body');
    const color = brandColors[printer.brand] || '#666';
    
    const progress = calcProgress(printer);
    const timeLeft = calcTimeLeft(printer);
    
    let progressHtml = '';
    if ((printer.status === 'BUSY' || printer.status === 'PAUSED') && printer.current_item_name) {
        progressHtml = `
            <div class="sheet-stat" style="grid-column: span 2">
                <div class="sheet-stat-label">${esc(printer.current_item_name)}</div>
                <div style="margin-top:8px">
                    <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
                    <div class="progress-info" style="margin-top:4px">
                        <span>${progress.toFixed(1)}%</span>
                        <span>${timeLeft}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    let actionsHtml = '';
    switch (printer.status) {
        case 'FREE':
            actionsHtml = `<button class="sheet-btn danger" data-action="repair">Set Repair</button>`;
            break;
        case 'BUSY':
            actionsHtml = `
                <button class="sheet-btn warning" data-action="pause">Pause</button>
                <button class="sheet-btn success" data-action="finish">Finish</button>
            `;
            break;
        case 'PAUSED':
            actionsHtml = `
                <button class="sheet-btn primary" data-action="resume">Resume</button>
                <button class="sheet-btn success" data-action="finish">Finish</button>
            `;
            break;
        case 'REPAIR':
            actionsHtml = `<button class="sheet-btn success" data-action="repair_done">End Repair</button>`;
            break;
    }
    
    body.innerHTML = `
        <div class="sheet-header">
            <div class="sheet-icon" style="background:${color}">${printer.brand[0]}</div>
            <div>
                <div class="sheet-title">${esc(printer.name)}</div>
                <div class="sheet-subtitle">${esc(printer.brand)} ${esc(printer.model_name)}</div>
            </div>
        </div>
        
        <div class="sheet-stats">
            <div class="sheet-stat">
                <div class="sheet-stat-value">${printer.bed_x}×${printer.bed_y}×${printer.bed_z}</div>
                <div class="sheet-stat-label">Bed size (mm)</div>
            </div>
            <div class="sheet-stat">
                <div class="sheet-stat-value">${getStatusText(printer.status)}</div>
                <div class="sheet-stat-label">Status</div>
            </div>
            ${progressHtml}
        </div>
        
        <div class="sheet-actions">
            ${actionsHtml}
            <button class="sheet-btn secondary" data-action="close">Close</button>
        </div>
    `;
    
    body.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const action = btn.dataset.action;
            if (action === 'close') return hideSheet();
            
            btn.disabled = true;
            try {
                await printerAction(printerId, action);
                showToast(getActionMessage(action));
                hideSheet();
                if (!USE_MOCK) await loadData();
                render();
            } catch (e) {
                showToast('Error');
            }
            btn.disabled = false;
        });
    });
    
    sheet.classList.remove('hidden');
    sheet.querySelector('.sheet-overlay').onclick = hideSheet;
}

function hideSheet() {
    document.getElementById('sheet').classList.add('hidden');
}

// ===================== UTILS =====================

function calcProgress(printer) {
    if (!printer.last_start || !printer.duration_hours) return 0;
    const start = new Date(printer.last_start).getTime();
    const elapsed = (Date.now() - start) / 3600000;
    return Math.min(100, (elapsed / printer.duration_hours) * 100);
}

function calcTimeLeft(printer) {
    if (!printer.last_start || !printer.duration_hours) return '';
    const start = new Date(printer.last_start).getTime();
    const elapsed = (Date.now() - start) / 3600000;
    const remaining = Math.max(0, printer.duration_hours - elapsed);
    if (remaining >= 1) return `${Math.floor(remaining)}h ${Math.round((remaining % 1) * 60)}m left`;
    return `${Math.round(remaining * 60)}m left`;
}

function getStatusText(status) {
    return { FREE: 'Free', BUSY: 'Printing', PAUSED: 'Paused', REPAIR: 'Repair' }[status] || status;
}

function getActionMessage(action) {
    return { pause: 'Paused', resume: 'Resumed', finish: 'Finished', repair: 'Set to repair', repair_done: 'Repair done' }[action] || 'Done';
}

function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ===================== TOAST =====================

let toastTimer = null;

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ===================== AUTO REFRESH =====================

function startAutoRefresh() {
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            loadData();
        }
    }, 30000);
}

// ===================== MOCK DATA =====================

function getMockData() {
    return {
        user: { id: 1, telegram_id: 123456789, first_name: "User", plan: "PRO" },
        printers: [
            { id: 1, name: "Ender 3 #1", status: "BUSY", brand: "Creality", model_name: "Ender 3 V2", bed_x: 220, bed_y: 220, bed_z: 250, current_item_name: "Phone Stand", last_start: new Date(Date.now() - 2*3600000).toISOString(), duration_hours: 4 },
            { id: 2, name: "Bambu P1S", status: "FREE", brand: "Bambu Lab", model_name: "P1S", bed_x: 256, bed_y: 256, bed_z: 256 },
            { id: 3, name: "Prusa MK4", status: "PAUSED", brand: "Prusa", model_name: "MK4", bed_x: 250, bed_y: 210, bed_z: 220, current_item_name: "Arduino Case", last_start: new Date(Date.now() - 3*3600000).toISOString(), duration_hours: 6 },
            { id: 4, name: "Voron 2.4", status: "BUSY", brand: "Voron", model_name: "V2.4 350", bed_x: 350, bed_y: 350, bed_z: 330, current_item_name: "Large Vase", last_start: new Date(Date.now() - 1*3600000).toISOString(), duration_hours: 8 },
            { id: 5, name: "K1 Max", status: "REPAIR", brand: "Creality", model_name: "K1 Max", bed_x: 300, bed_y: 300, bed_z: 300 },
        ],
        models: [
            { id: 1, item_name: "Phone Stand.stl", estimated_time: 4, size_x: 120, size_y: 80, size_z: 15 },
            { id: 2, item_name: "Arduino Case.stl", estimated_time: 6, size_x: 100, size_y: 70, size_z: 40 },
            { id: 3, item_name: "Vase.stl", estimated_time: 8, size_x: 150, size_y: 150, size_z: 200 },
            { id: 4, item_name: "Keychain.gcode", estimated_time: 0.5, size_x: 40, size_y: 30, size_z: 5 },
        ],
        orders: [
            { id: 1, title: "Phone Stands Order", item_name: "Phone Stand.stl", quantity_needed: 10, quantity_done: 3 },
            { id: 2, title: "Keychains Batch", item_name: "Keychain.gcode", quantity_needed: 50, quantity_done: 12 },
        ]
    };
}

// ===================== START =====================

document.addEventListener('DOMContentLoaded', init);
