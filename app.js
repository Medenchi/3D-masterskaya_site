// ===================== CONFIGURATION =====================

const API_BASE = "https://relative-joyce-3dprintable-b0155a87.koyeb.app"; // Replace with your backend URL
const USE_MOCK = false; // Set to false in production

// ===================== ICON DRAWING =====================

const IconDrawer = {
    colors: {
        primary: '#2481cc',
        success: '#4caf50',
        warning: '#ffc107',
        danger: '#f44336',
        busy: '#2196f3',
        gray: '#999999',
        white: '#ffffff',
        dark: '#333333'
    },

    drawPrinter(ctx, x, y, size, color = null) {
        const c = color || this.colors.primary;
        ctx.strokeStyle = c;
        ctx.fillStyle = c;
        ctx.lineWidth = 2;
        
        // Frame
        ctx.strokeRect(x + 2, y + size * 0.3, size - 4, size * 0.65);
        // Build plate
        ctx.fillRect(x + 4, y + size * 0.55, size - 8, 3);
        // Extruder
        ctx.fillRect(x + size * 0.35, y + size * 0.25, size * 0.3, size * 0.15);
        // Gantry
        ctx.beginPath();
        ctx.moveTo(x + 4, y + size * 0.3);
        ctx.lineTo(x + size - 4, y + size * 0.3);
        ctx.stroke();
    },

    drawModel(ctx, x, y, size, color = null) {
        const c = color || this.colors.primary;
        const half = size / 2;
        
        // 3D cube
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.moveTo(x + half * 0.5, y + half);
        ctx.lineTo(x + size - half * 0.5, y + half);
        ctx.lineTo(x + size - half * 0.5, y + size);
        ctx.lineTo(x + half * 0.5, y + size);
        ctx.closePath();
        ctx.fill();
        
        // Top face (lighter)
        ctx.fillStyle = this.lighten(c, 30);
        ctx.beginPath();
        ctx.moveTo(x + half * 0.5, y + half);
        ctx.lineTo(x + half, y + half * 0.4);
        ctx.lineTo(x + size, y + half * 0.4);
        ctx.lineTo(x + size - half * 0.5, y + half);
        ctx.closePath();
        ctx.fill();
        
        // Right face (darker)
        ctx.fillStyle = this.darken(c, 30);
        ctx.beginPath();
        ctx.moveTo(x + size - half * 0.5, y + half);
        ctx.lineTo(x + size, y + half * 0.4);
        ctx.lineTo(x + size, y + size - half * 0.5);
        ctx.lineTo(x + size - half * 0.5, y + size);
        ctx.closePath();
        ctx.fill();
    },

    drawStatusFree(ctx, x, y, size) {
        ctx.fillStyle = this.colors.success;
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Checkmark
        ctx.strokeStyle = this.colors.white;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + size * 0.25, y + size * 0.5);
        ctx.lineTo(x + size * 0.4, y + size * 0.7);
        ctx.lineTo(x + size * 0.75, y + size * 0.3);
        ctx.stroke();
    },

    drawStatusBusy(ctx, x, y, size) {
        ctx.fillStyle = this.colors.busy;
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Play icon
        ctx.fillStyle = this.colors.white;
        ctx.beginPath();
        ctx.moveTo(x + size * 0.35, y + size * 0.25);
        ctx.lineTo(x + size * 0.75, y + size * 0.5);
        ctx.lineTo(x + size * 0.35, y + size * 0.75);
        ctx.closePath();
        ctx.fill();
    },

    drawStatusPaused(ctx, x, y, size) {
        ctx.fillStyle = this.colors.warning;
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Pause bars
        ctx.fillStyle = this.colors.dark;
        ctx.fillRect(x + size * 0.3, y + size * 0.25, size * 0.15, size * 0.5);
        ctx.fillRect(x + size * 0.55, y + size * 0.25, size * 0.15, size * 0.5);
    },

    drawStatusRepair(ctx, x, y, size) {
        ctx.fillStyle = this.colors.danger;
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Wrench
        ctx.strokeStyle = this.colors.white;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + size * 0.3, y + size * 0.3, size * 0.15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + size * 0.4, y + size * 0.4);
        ctx.lineTo(x + size * 0.7, y + size * 0.7);
        ctx.stroke();
    },

    drawRuler(ctx, x, y, size) {
        ctx.strokeStyle = this.colors.gray;
        ctx.fillStyle = this.colors.gray;
        ctx.lineWidth = 1.5;
        
        // Ruler body
        ctx.strokeRect(x, y + size * 0.35, size, size * 0.3);
        // Tick marks
        for (let i = 0; i <= 4; i++) {
            const tx = x + (size * i) / 4;
            ctx.beginPath();
            ctx.moveTo(tx, y + size * 0.35);
            ctx.lineTo(tx, y + size * 0.5);
            ctx.stroke();
        }
    },

    drawClock(ctx, x, y, size) {
        ctx.strokeStyle = this.colors.gray;
        ctx.lineWidth = 1.5;
        
        // Circle
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2 - 2, 0, Math.PI * 2);
        ctx.stroke();
        
        // Hands
        const cx = x + size/2;
        const cy = y + size/2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, cy - size * 0.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + size * 0.2, cy);
        ctx.stroke();
    },

    drawBrandIcon(ctx, x, y, size, brand) {
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
        
        const color = brandColors[brand] || '#666666';
        
        // Rounded rectangle background
        ctx.fillStyle = color;
        this.roundRect(ctx, x, y, size, size, size * 0.2);
        ctx.fill();
        
        // Brand initial
        ctx.fillStyle = this.colors.white;
        ctx.font = `bold ${size * 0.5}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(brand[0].toUpperCase(), x + size/2, y + size/2);
    },

    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    },

    lighten(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `rgb(${R}, ${G}, ${B})`;
    },

    darken(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `rgb(${R}, ${G}, ${B})`;
    }
};

// ===================== MOCK DATA =====================

const MOCK_DATA = {
    user: {
        id: 1,
        telegram_id: 123456789,
        username: "test_user",
        first_name: "Тестовый",
        plan: "PRO",
        paid_until: "2025-12-31T23:59:59Z",
        created_at: "2024-01-01T00:00:00Z"
    },
    printers: [
        {
            id: 1, name: "Creality #1", status: "BUSY", brand: "Creality", model_name: "Ender 3 V2",
            bed_x: 220, bed_y: 220, bed_z: 250, image_url: null,
            current_item_name: "Держатель для телефона", current_estimated_time: 4.5,
            last_start: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), duration_hours: 4.5
        },
        {
            id: 2, name: "Bambu #1", status: "FREE", brand: "Bambu Lab", model_name: "P1S",
            bed_x: 256, bed_y: 256, bed_z: 256, image_url: null,
            current_item_name: null, current_estimated_time: null, last_start: null, duration_hours: 0
        },
        {
            id: 3, name: "Prusa MK4", status: "PAUSED", brand: "Prusa", model_name: "MK4",
            bed_x: 250, bed_y: 210, bed_z: 220, image_url: null,
            current_item_name: "Корпус для Arduino", current_estimated_time: 6.0,
            last_start: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), duration_hours: 6.0
        },
        {
            id: 4, name: "Voron 2.4", status: "BUSY", brand: "Voron", model_name: "V2.4 300",
            bed_x: 300, bed_y: 300, bed_z: 280, image_url: null,
            current_item_name: "Настольная ваза", current_estimated_time: 8.0,
            last_start: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), duration_hours: 8.0
        },
        {
            id: 5, name: "Anycubic #1", status: "FREE", brand: "Anycubic", model_name: "Kobra 2",
            bed_x: 220, bed_y: 220, bed_z: 250, image_url: null,
            current_item_name: null, current_estimated_time: null, last_start: null, duration_hours: 0
        },
        {
            id: 6, name: "K1 Max", status: "REPAIR", brand: "Creality", model_name: "K1 Max",
            bed_x: 300, bed_y: 300, bed_z: 300, image_url: null,
            current_item_name: null, current_estimated_time: null, last_start: null, duration_hours: 0
        },
        {
            id: 7, name: "Elegoo N4", status: "BUSY", brand: "Elegoo", model_name: "Neptune 4",
            bed_x: 225, bed_y: 225, bed_z: 265, image_url: null,
            current_item_name: "Крышка для банки", current_estimated_time: 2.0,
            last_start: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), duration_hours: 2.0
        },
        {
            id: 8, name: "Ender 5+", status: "FREE", brand: "Creality", model_name: "Ender 5 Plus",
            bed_x: 350, bed_y: 350, bed_z: 400, image_url: null,
            current_item_name: null, current_estimated_time: null, last_start: null, duration_hours: 0
        },
        {
            id: 9, name: "Mini Prusa", status: "BUSY", brand: "Prusa", model_name: "Mini+",
            bed_x: 180, bed_y: 180, bed_z: 180, image_url: null,
            current_item_name: "Брелок", current_estimated_time: 0.5,
            last_start: new Date(Date.now() - 0.3 * 60 * 60 * 1000).toISOString(), duration_hours: 0.5
        },
        {
            id: 10, name: "X1 Carbon", status: "FREE", brand: "Bambu Lab", model_name: "X1C",
            bed_x: 256, bed_y: 256, bed_z: 256, image_url: null,
            current_item_name: null, current_estimated_time: null, last_start: null, duration_hours: 0
        },
        {
            id: 11, name: "QIDI Max", status: "PAUSED", brand: "QIDI", model_name: "X-Max 3",
            bed_x: 325, bed_y: 325, bed_z: 315, image_url: null,
            current_item_name: "Большая статуэтка", current_estimated_time: 24.0,
            last_start: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), duration_hours: 24.0
        },
        {
            id: 12, name: "Artillery SW", status: "FREE", brand: "Artillery", model_name: "Sidewinder X2",
            bed_x: 300, bed_y: 300, bed_z: 400, image_url: null,
            current_item_name: null, current_estimated_time: null, last_start: null, duration_hours: 0
        }
    ],
    models: [
        { id: 1, item_name: "Держатель для телефона.stl", estimated_time: 4.5, size_x: 120, size_y: 80, size_z: 15, volume: 45000, created_at: "2024-03-01T10:00:00Z" },
        { id: 2, item_name: "Корпус для Arduino.stl", estimated_time: 6.0, size_x: 100, size_y: 70, size_z: 40, volume: 85000, created_at: "2024-03-02T11:00:00Z" },
        { id: 3, item_name: "Настольная ваза.stl", estimated_time: 8.0, size_x: 150, size_y: 150, size_z: 200, volume: 120000, created_at: "2024-03-03T12:00:00Z" },
        { id: 4, item_name: "Крышка для банки.stl", estimated_time: 2.0, size_x: 80, size_y: 80, size_z: 20, volume: 25000, created_at: "2024-03-04T13:00:00Z" },
        { id: 5, item_name: "Брелок.stl", estimated_time: 0.5, size_x: 40, size_y: 30, size_z: 5, volume: 3000, created_at: "2024-03-05T14:00:00Z" },
        { id: 6, item_name: "Большая статуэтка.stl", estimated_time: 24.0, size_x: 200, size_y: 150, size_z: 300, volume: 450000, created_at: "2024-03-06T15:00:00Z" },
        { id: 7, item_name: "Шестерёнка M3.stl", estimated_time: 1.0, size_x: 30, size_y: 30, size_z: 10, volume: 5000, created_at: "2024-03-07T16:00:00Z" },
        { id: 8, item_name: "Кронштейн для камеры.stl", estimated_time: 3.5, size_x: 90, size_y: 60, size_z: 45, volume: 35000, created_at: "2024-03-08T17:00:00Z" },
        { id: 9, item_name: "Подставка для наушников.stl", estimated_time: 5.0, size_x: 180, size_y: 120, size_z: 250, volume: 95000, created_at: "2024-03-09T18:00:00Z" },
        { id: 10, item_name: "Органайзер для стола.stl", estimated_time: 7.0, size_x: 200, size_y: 150, size_z: 100, volume: 180000, created_at: "2024-03-10T19:00:00Z" },
        { id: 11, item_name: "Колпачок для ручки.stl", estimated_time: 0.3, size_x: 15, size_y: 15, size_z: 25, volume: 2000, created_at: "2024-03-11T20:00:00Z" },
        { id: 12, item_name: "Подставка для книг.stl", estimated_time: 4.0, size_x: 140, size_y: 100, size_z: 180, volume: 75000, created_at: "2024-03-12T21:00:00Z" },
        { id: 13, item_name: "Фигурка дракона.stl", estimated_time: 12.0, size_x: 180, size_y: 120, size_z: 220, volume: 250000, created_at: "2024-03-13T22:00:00Z" },
        { id: 14, item_name: "Коробка с крышкой.stl", estimated_time: 2.5, size_x: 100, size_y: 100, size_z: 50, volume: 40000, created_at: "2024-03-14T23:00:00Z" }
    ]
};

// ===================== STATE =====================

let state = {
    user: null,
    printers: [],
    models: [],
    currentTab: 'printers',
    sortOrder: 'small',
    isLoading: true
};

// ===================== TELEGRAM WEBAPP =====================

const tg = window.Telegram?.WebApp;

function initTelegram() {
    if (tg) {
        tg.ready();
        tg.expand();
        
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
        document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
        document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f0f0f0');
    }
}

// ===================== API =====================

async function fetchBootstrap() {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_DATA;
    }
    
    const initData = tg?.initData || '';
    const response = await fetch(`${API_BASE}/api/bootstrap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData })
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }
    
    return response.json();
}

async function printerAction(printerId, action) {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const printer = state.printers.find(p => p.id === printerId);
        if (printer) {
            switch (action) {
                case 'pause':
                    printer.status = 'PAUSED';
                    break;
                case 'resume':
                    printer.status = 'BUSY';
                    break;
                case 'finish':
                    printer.status = 'FREE';
                    printer.current_item_name = null;
                    printer.last_start = null;
                    break;
                case 'repair':
                    printer.status = 'REPAIR';
                    printer.current_item_name = null;
                    break;
                case 'repair_done':
                    printer.status = 'FREE';
                    break;
            }
        }
        return { success: true };
    }
    
    const initData = tg?.initData || '';
    const response = await fetch(`${API_BASE}/api/printer/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, printer_id: printerId, action })
    });
    
    if (!response.ok) {
        throw new Error('Action failed');
    }
    
    return response.json();
}

// ===================== UTILS =====================

function getStatusText(status) {
    const texts = {
        'FREE': 'Свободен',
        'BUSY': 'Печатает',
        'PAUSED': 'Пауза',
        'REPAIR': 'Ремонт'
    };
    return texts[status] || status;
}

function calculateProgress(lastStart, durationHours) {
    if (!lastStart || !durationHours) return 0;
    
    const startTime = new Date(lastStart).getTime();
    const now = Date.now();
    const elapsed = (now - startTime) / (1000 * 60 * 60);
    const progress = Math.min(100, (elapsed / durationHours) * 100);
    
    return Math.round(progress * 10) / 10;
}

function formatTimeLeft(lastStart, durationHours) {
    if (!lastStart || !durationHours) return '';
    
    const startTime = new Date(lastStart).getTime();
    const now = Date.now();
    const elapsed = (now - startTime) / (1000 * 60 * 60);
    const remaining = Math.max(0, durationHours - elapsed);
    
    if (remaining >= 1) {
        const hours = Math.floor(remaining);
        const minutes = Math.round((remaining % 1) * 60);
        return `${hours}ч ${minutes}мин`;
    } else {
        return `${Math.round(remaining * 60)}мин`;
    }
}

function formatSize(x, y, z) {
    if (!x || !y || !z) return null;
    return `${Math.round(x)}x${Math.round(y)}x${Math.round(z)}`;
}

function formatTime(hours) {
    if (!hours) return '—';
    if (hours < 1) {
        return `${Math.round(hours * 60)} мин`;
    }
    return `${hours.toFixed(1)} ч`;
}

// ===================== SORTING =====================

function sortPrinters(printers, order) {
    return [...printers].sort((a, b) => {
        const areaA = (a.bed_x || 0) * (a.bed_y || 0);
        const areaB = (b.bed_x || 0) * (b.bed_y || 0);
        return order === 'small' ? areaA - areaB : areaB - areaA;
    });
}

function sortModels(models, order) {
    return [...models].sort((a, b) => {
        const volA = (a.size_x || 0) * (a.size_y || 0) * (a.size_z || 0);
        const volB = (b.size_x || 0) * (b.size_y || 0) * (b.size_z || 0);
        
        if (volA === 0 && volB === 0) return 0;
        if (volA === 0) return 1;
        if (volB === 0) return -1;
        
        return order === 'small' ? volA - volB : volB - volA;
    });
}

// ===================== ICON INITIALIZATION =====================

function initIcons() {
    // Header icon
    const headerCanvas = document.getElementById('header-icon');
    if (headerCanvas) {
        const ctx = headerCanvas.getContext('2d');
        IconDrawer.drawPrinter(ctx, 2, 2, 28, '#ffffff');
    }
    
    // Stat icons
    document.querySelectorAll('.stat-icon').forEach(canvas => {
        const ctx = canvas.getContext('2d');
        const icon = canvas.dataset.icon;
        switch(icon) {
            case 'total':
                IconDrawer.drawPrinter(ctx, 2, 2, 20, IconDrawer.colors.gray);
                break;
            case 'busy':
                IconDrawer.drawStatusBusy(ctx, 2, 2, 20);
                break;
            case 'free':
                IconDrawer.drawStatusFree(ctx, 2, 2, 20);
                break;
            case 'models':
                IconDrawer.drawModel(ctx, 2, 2, 20, IconDrawer.colors.primary);
                break;
        }
    });
    
    // Tab icons
    document.querySelectorAll('.tab-icon-canvas').forEach(canvas => {
        const ctx = canvas.getContext('2d');
        const icon = canvas.dataset.icon;
        if (icon === 'printer') {
            IconDrawer.drawPrinter(ctx, 0, 0, 20, IconDrawer.colors.gray);
        } else if (icon === 'model') {
            IconDrawer.drawModel(ctx, 0, 0, 20, IconDrawer.colors.gray);
        }
    });
    
    // Sort icon
    const sortCanvas = document.getElementById('sort-icon-canvas');
    if (sortCanvas) {
        const ctx = sortCanvas.getContext('2d');
        IconDrawer.drawRuler(ctx, 0, 0, 16);
    }
    
    // Empty state icons
    const emptyPrinter = document.getElementById('empty-printer-icon');
    if (emptyPrinter) {
        const ctx = emptyPrinter.getContext('2d');
        IconDrawer.drawPrinter(ctx, 8, 8, 48, IconDrawer.colors.gray);
    }
    
    const emptyModel = document.getElementById('empty-model-icon');
    if (emptyModel) {
        const ctx = emptyModel.getContext('2d');
        IconDrawer.drawModel(ctx, 8, 8, 48, IconDrawer.colors.gray);
    }
}

// ===================== RENDER =====================

function renderStats() {
    const total = state.printers.length;
    const busy = state.printers.filter(p => p.status === 'BUSY').length;
    const free = state.printers.filter(p => p.status === 'FREE').length;
    const models = state.models.length;
    
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-busy').textContent = busy;
    document.getElementById('stat-free').textContent = free;
    document.getElementById('stat-models').textContent = models;
}

function renderPlanBadge() {
    const badge = document.getElementById('plan-badge');
    if (!state.user) return;
    
    badge.textContent = state.user.plan;
    badge.className = 'plan-badge';
    
    if (state.user.plan === 'PRO') {
        badge.classList.add('pro');
    } else if (state.user.plan === 'STUDIO') {
        badge.classList.add('studio');
    }
}

function renderPrinters() {
    const container = document.getElementById('printers-list');
    const emptyState = document.getElementById('printers-empty');
    
    const sortedPrinters = sortPrinters(state.printers, state.sortOrder);
    
    if (sortedPrinters.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    container.innerHTML = sortedPrinters.map((printer, index) => {
        const progress = calculateProgress(printer.last_start, printer.duration_hours);
        const timeLeft = formatTimeLeft(printer.last_start, printer.duration_hours);
        const bedSize = `${printer.bed_x}x${printer.bed_y}x${printer.bed_z}`;
        
        let progressHtml = '';
        if ((printer.status === 'BUSY' || printer.status === 'PAUSED') && printer.current_item_name) {
            progressHtml = `
                <div class="print-progress">
                    <div class="print-model-name">
                        <canvas class="inline-icon" data-draw="printer-small" width="16" height="16"></canvas>
                        <span>${escapeHtml(printer.current_item_name)}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-info">
                        <span>${progress}%</span>
                        <span>${timeLeft ? `Осталось: ${timeLeft}` : ''}</span>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="printer-card" data-printer-id="${printer.id}">
                <div class="printer-header">
                    <canvas class="printer-brand-icon" data-brand="${printer.brand}" width="48" height="48"></canvas>
                    <div class="printer-info">
                        <div class="printer-name">${escapeHtml(printer.name)}</div>
                        <div class="printer-model">${escapeHtml(printer.brand)} ${escapeHtml(printer.model_name)}</div>
                        <div class="printer-bed">
                            <canvas class="inline-icon" data-draw="ruler" width="14" height="14"></canvas>
                            ${bedSize} мм
                        </div>
                    </div>
                    <div class="status-badge ${printer.status.toLowerCase()}">${getStatusText(printer.status)}</div>
                </div>
                ${progressHtml}
            </div>
        `;
    }).join('');
    
    // Draw brand icons
    container.querySelectorAll('.printer-brand-icon').forEach(canvas => {
        const ctx = canvas.getContext('2d');
        const brand = canvas.dataset.brand;
        IconDrawer.drawBrandIcon(ctx, 0, 0, 48, brand);
    });
    
    // Draw inline icons
    container.querySelectorAll('.inline-icon').forEach(canvas => {
        const ctx = canvas.getContext('2d');
        const draw = canvas.dataset.draw;
        if (draw === 'printer-small') {
            IconDrawer.drawPrinter(ctx, 0, 0, 16, IconDrawer.colors.busy);
        } else if (draw === 'ruler') {
            IconDrawer.drawRuler(ctx, 0, 0, 14);
        }
    });
    
    // Add click handlers
    container.querySelectorAll('.printer-card').forEach(card => {
        card.addEventListener('click', () => {
            const printerId = parseInt(card.dataset.printerId);
            showPrinterSheet(printerId);
        });
    });
}

function renderModels() {
    const container = document.getElementById('models-list');
    const emptyState = document.getElementById('models-empty');
    
    const sortedModels = sortModels(state.models, state.sortOrder);
    
    if (sortedModels.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    container.innerHTML = sortedModels.map(model => {
        const size = formatSize(model.size_x, model.size_y, model.size_z);
        const time = formatTime(model.estimated_time);
        
        return `
            <div class="model-card" data-model-id="${model.id}">
                <div class="model-header">
                    <canvas class="model-icon-canvas" width="40" height="40"></canvas>
                    <div class="model-info">
                        <div class="model-name">${escapeHtml(model.item_name)}</div>
                        <div class="model-details">
                            ${size ? `<span class="model-detail"><canvas class="micro-icon" data-draw="ruler" width="12" height="12"></canvas> ${size} мм</span>` : ''}
                            <span class="model-detail"><canvas class="micro-icon" data-draw="clock" width="12" height="12"></canvas> ${time}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Draw model icons
    container.querySelectorAll('.model-icon-canvas').forEach(canvas => {
        const ctx = canvas.getContext('2d');
        IconDrawer.drawModel(ctx, 4, 4, 32, IconDrawer.colors.primary);
    });
    
    // Draw micro icons
    container.querySelectorAll('.micro-icon').forEach(canvas => {
        const ctx = canvas.getContext('2d');
        const draw = canvas.dataset.draw;
        if (draw === 'ruler') {
            IconDrawer.drawRuler(ctx, 0, 0, 12);
        } else if (draw === 'clock') {
            IconDrawer.drawClock(ctx, 0, 0, 12);
        }
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===================== BOTTOM SHEET =====================

function showPrinterSheet(printerId) {
    const printer = state.printers.find(p => p.id === printerId);
    if (!printer) return;
    
    const sheet = document.getElementById('bottom-sheet');
    const body = document.getElementById('bottom-sheet-body');
    
    const progress = calculateProgress(printer.last_start, printer.duration_hours);
    const timeLeft = formatTimeLeft(printer.last_start, printer.duration_hours);
    const bedSize = `${printer.bed_x}x${printer.bed_y}x${printer.bed_z}`;
    
    let progressHtml = '';
    if ((printer.status === 'BUSY' || printer.status === 'PAUSED') && printer.current_item_name) {
        progressHtml = `
            <div class="sheet-progress">
                <div class="sheet-progress-header">
                    <span class="sheet-progress-model">${escapeHtml(printer.current_item_name)}</span>
                    <span class="sheet-progress-percent">${progress}%</span>
                </div>
                <div class="sheet-progress-bar">
                    <div class="sheet-progress-fill" style="width: ${progress}%"></div>
                </div>
                ${timeLeft ? `<div class="sheet-progress-time">Осталось: ${timeLeft}</div>` : ''}
            </div>
        `;
    }
    
    let actionsHtml = '';
    switch (printer.status) {
        case 'FREE':
            actionsHtml = `
                <button class="sheet-btn sheet-btn-danger" data-action="repair">
                    <canvas class="btn-icon" data-draw="repair" width="18" height="18"></canvas> На ремонт
                </button>
            `;
            break;
        case 'BUSY':
            actionsHtml = `
                <button class="sheet-btn sheet-btn-warning" data-action="pause">
                    <canvas class="btn-icon" data-draw="pause" width="18" height="18"></canvas> Пауза
                </button>
                <button class="sheet-btn sheet-btn-success" data-action="finish">
                    <canvas class="btn-icon" data-draw="finish" width="18" height="18"></canvas> Завершить печать
                </button>
            `;
            break;
        case 'PAUSED':
            actionsHtml = `
                <button class="sheet-btn sheet-btn-primary" data-action="resume">
                    <canvas class="btn-icon" data-draw="resume" width="18" height="18"></canvas> Продолжить
                </button>
                <button class="sheet-btn sheet-btn-success" data-action="finish">
                    <canvas class="btn-icon" data-draw="finish" width="18" height="18"></canvas> Завершить печать
                </button>
            `;
            break;
        case 'REPAIR':
            actionsHtml = `
                <button class="sheet-btn sheet-btn-success" data-action="repair_done">
                    <canvas class="btn-icon" data-draw="finish" width="18" height="18"></canvas> Снять с ремонта
                </button>
            `;
            break;
    }
    
    body.innerHTML = `
        <div class="sheet-header">
            <canvas class="sheet-brand-icon" data-brand="${printer.brand}" width="56" height="56"></canvas>
            <div>
                <div class="sheet-title">${escapeHtml(printer.name)}</div>
                <div class="sheet-subtitle">${escapeHtml(printer.brand)} ${escapeHtml(printer.model_name)}</div>
            </div>
        </div>
        
        <div class="sheet-stats">
            <div class="sheet-stat">
                <div class="sheet-stat-value">${bedSize}</div>
                <div class="sheet-stat-label">Размер стола (мм)</div>
            </div>
            <div class="sheet-stat">
                <div class="sheet-stat-value">${getStatusText(printer.status)}</div>
                <div class="sheet-stat-label">Статус</div>
            </div>
        </div>
        
        ${progressHtml}
        
        <div class="sheet-actions">
            ${actionsHtml}
            <button class="sheet-btn sheet-btn-secondary" data-action="close">
                Закрыть
            </button>
        </div>
    `;
    
    // Draw brand icon
    const brandCanvas = body.querySelector('.sheet-brand-icon');
    if (brandCanvas) {
        const ctx = brandCanvas.getContext('2d');
        IconDrawer.drawBrandIcon(ctx, 0, 0, 56, printer.brand);
    }
    
    // Draw button icons
    body.querySelectorAll('.btn-icon').forEach(canvas => {
        const ctx = canvas.getContext('2d');
        const draw = canvas.dataset.draw;
        ctx.clearRect(0, 0, 18, 18);
        switch(draw) {
            case 'pause':
                IconDrawer.drawStatusPaused(ctx, 0, 0, 18);
                break;
            case 'resume':
                IconDrawer.drawStatusBusy(ctx, 0, 0, 18);
                break;
            case 'finish':
                IconDrawer.drawStatusFree(ctx, 0, 0, 18);
                break;
            case 'repair':
                IconDrawer.drawStatusRepair(ctx, 0, 0, 18);
                break;
        }
    });
    
    // Add action handlers
    body.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const action = btn.dataset.action;
            
            if (action === 'close') {
                hideSheet();
                return;
            }
            
            btn.disabled = true;
            btn.style.opacity = '0.6';
            
            try {
                await printerAction(printerId, action);
                showToast(getActionMessage(action));
                hideSheet();
                
                if (!USE_MOCK) {
                    await loadData();
                }
                
                renderPrinters();
                renderStats();
            } catch (error) {
                console.error('Action error:', error);
                showToast('Ошибка. Попробуйте снова.');
            } finally {
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        });
    });
    
    sheet.classList.remove('hidden');
    
    // Close on overlay click
    sheet.querySelector('.bottom-sheet-overlay').onclick = hideSheet;
}

function hideSheet() {
    document.getElementById('bottom-sheet').classList.add('hidden');
}

function getActionMessage(action) {
    const messages = {
        'pause': 'Печать приостановлена',
        'resume': 'Печать продолжена',
        'finish': 'Печать завершена',
        'repair': 'Отправлен на ремонт',
        'repair_done': 'Ремонт завершён'
    };
    return messages[action] || 'Готово';
}

// ===================== TOAST =====================

let toastTimeout = null;

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    
    toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// ===================== TABS =====================

function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            state.currentTab = tabName;
        });
    });
}

function initSortToggle() {
    const btn = document.getElementById('sort-btn');
    const text = document.getElementById('sort-text');
    
    if (!btn || !text) {
        console.warn('Sort toggle elements not found');
        return;
    }
    
    btn.addEventListener('click', () => {
        state.sortOrder = state.sortOrder === 'small' ? 'large' : 'small';
        text.textContent = state.sortOrder === 'small' ? 'Маленькие' : 'Большие';
        
        renderPrinters();
        renderModels();
    });
}

// ===================== DATA LOADING =====================

async function loadData() {
    try {
        const data = await fetchBootstrap();
        state.user = data.user;
        state.printers = data.printers;
        state.models = data.models;
        
        renderPlanBadge();
        renderStats();
        renderPrinters();
        renderModels();
        
        state.isLoading = false;
        document.getElementById('loading').classList.add('hidden');
    } catch (error) {
        console.error('Load error:', error);
        showToast('Ошибка загрузки данных');
        document.getElementById('loading').classList.add('hidden');
    }
}

// ===================== AUTO REFRESH =====================

let refreshInterval = null;

function startAutoRefresh() {
    refreshInterval = setInterval(async () => {
        if (document.visibilityState === 'visible' && !state.isLoading) {
            try {
                const data = await fetchBootstrap();
                state.user = data.user;
                state.printers = data.printers;
                state.models = data.models;
                
                renderStats();
                renderPrinters();
                renderModels();
            } catch (error) {
                console.error('Refresh error:', error);
            }
        }
    }, 30000);
}

// ===================== INIT =====================

document.addEventListener('DOMContentLoaded', () => {
    initTelegram();
    initIcons();
    initTabs();
    initSortToggle();
    loadData();
    startAutoRefresh();
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        loadData();
    }
});
