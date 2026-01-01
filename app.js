// ============================================================
// PRINTFARM MINI APP — CORE LOGIC
// ============================================================

const tg = window.Telegram.WebApp;
tg.expand();

// ⚠️ ВАЖНО: URL твоего FastAPI (из bot.py)
const API_BASE = "https://YOUR_BACKEND_DOMAIN"; 
// пример: https://printfarm-production.up.railway.app

const content = document.getElementById("content");
const userStatus = document.getElementById("user-status");

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  setUserInfo();
  loadPrinters();
});

// ------------------------------------------------------------
// AUTH HEADER
// ------------------------------------------------------------

function authHeaders() {
  return {
    "Authorization": tg.initData,
    "Content-Type": "application/json"
  };
}

// ------------------------------------------------------------
// USER INFO
// ------------------------------------------------------------

function setUserInfo() {
  if (!tg.initDataUnsafe || !tg.initDataUnsafe.user) return;

  const u = tg.initDataUnsafe.user;
  userStatus.innerText = `👤 ${u.first_name}`;
}

// ------------------------------------------------------------
// API HELPER
// ------------------------------------------------------------

async function api(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: authHeaders(),
    ...options
  });

  if (!res.ok) {
    throw new Error("API error");
  }

  return await res.json();
}

// ------------------------------------------------------------
// LOAD PRINTERS
// ------------------------------------------------------------

async function loadPrinters() {
  setActiveTab(0);
  content.innerHTML = `<div class="empty">Загрузка…</div>`;

  try {
    const printers = await api("/printers");

    if (!printers.length) {
      content.innerHTML = `
        <div class="empty fade-in">
          <h2>🖨 Нет принтеров</h2>
          <p>Добавь принтер через бота</p>
        </div>
      `;
      return;
    }

    content.innerHTML = "";
    printers.forEach(renderPrinterCard);

  } catch (e) {
    content.innerHTML = `<div class="empty">Ошибка загрузки</div>`;
  }
}

// ------------------------------------------------------------
// RENDER PRINTER CARD
// ------------------------------------------------------------

function renderPrinterCard(printer) {
  const card = document.createElement("div");
  card.className = "card fade-in";

  const statusClass = printer.status.toLowerCase();

  card.innerHTML = `
    <div class="card-header">
      <img class="card-image"
           src="${printer.image_url || 'https://placehold.co/200x200'}" />

      <div>
        <div class="card-title">${printer.name}</div>
        <div class="card-subtitle">
          ${printer.brand} ${printer.model_name}
        </div>
      </div>
    </div>

    <div class="status ${statusClass}">
      ${statusLabel(printer.status)}
    </div>

    ${printer.status === "BUSY" ? progressBar() : ""}

    <button class="button"
      onclick="printerAction(${printer.id}, '${printer.status}')">
      ${printerButtonText(printer.status)}
    </button>
  `;

  content.appendChild(card);
}

// ------------------------------------------------------------
// STATUS HELPERS
// ------------------------------------------------------------

function statusLabel(status) {
  switch (status) {
    case "FREE": return "🟢 Свободен";
    case "BUSY": return "🔵 Печать";
    case "PAUSED": return "⏸ Пауза";
    case "REPAIR": return "🔴 Ремонт";
    default: return status;
  }
}

function printerButtonText(status) {
  switch (status) {
    case "FREE": return "▶️ Начать печать";
    case "BUSY": return "✅ Завершить печать";
    case "PAUSED": return "▶️ Продолжить";
    case "REPAIR": return "🔧 С ремонта";
    default: return "Открыть";
  }
}

function progressBar() {
  return `
    <div class="progress">
      <div class="progress-inner" style="width: 40%"></div>
    </div>
  `;
}

// ------------------------------------------------------------
// PRINTER ACTION
// ------------------------------------------------------------

async function printerAction(printerId, status) {
  try {
    if (status === "BUSY") {
      await api(`/printers/finish?printer_id=${printerId}`, {
        method: "POST"
      });
      tg.showAlert("Печать завершена");
      loadPrinters();
    } else {
      tg.showAlert("Действие выполняется в боте");
    }
  } catch {
    tg.showAlert("Ошибка");
  }
}

// ------------------------------------------------------------
// QUEUE (PLACEHOLDER)
// ------------------------------------------------------------

async function loadQueue() {
  setActiveTab(1);
  content.innerHTML = `
    <div class="empty fade-in">
      <h2>📋 Очередь</h2>
      <p>Управляется автоматически</p>
    </div>
  `;
}

// ------------------------------------------------------------
// MODELS (PLACEHOLDER)
// ------------------------------------------------------------

async function loadModels() {
  setActiveTab(2);
  content.innerHTML = `
    <div class="empty fade-in">
      <h2>📦 Модели</h2>
      <p>Загружай STL через бота</p>
    </div>
  `;
}

// ------------------------------------------------------------
// NAV ACTIVE STATE
// ------------------------------------------------------------

function setActiveTab(index) {
  document.querySelectorAll(".bottom-nav button")
    .forEach((btn, i) => {
      btn.classList.toggle("active", i === index);
    });
}
// ============================================================
// PRINTER DETAILS VIEW
// ============================================================

function openPrinterDetails(printer) {
  content.innerHTML = `
    <div class="card fade-in">
      <div class="card-header">
        <img class="card-image"
             src="${printer.image_url || 'https://placehold.co/300x300'}" />

        <div>
          <div class="card-title">${printer.name}</div>
          <div class="card-subtitle">
            ${printer.brand} ${printer.model_name}
          </div>
        </div>
      </div>

      <div class="status ${printer.status.toLowerCase()}">
        ${statusLabel(printer.status)}
      </div>

      ${printer.status === "BUSY" ? detailedProgress(printer) : ""}

      <div style="margin-top:16px">
        ${detailsButtons(printer)}
      </div>
    </div>

    <button class="button secondary"
      onclick="loadPrinters()">
      ⬅️ Назад к ферме
    </button>
  `;
}
function detailedProgress(printer) {
  // MVP: фейковый прогресс (потом можно реальный)
  const percent = 40;

  return `
    <div class="progress" style="margin-top:16px">
      <div class="progress-inner" style="width:${percent}%"></div>
    </div>

    <div style="margin-top:8px; font-size:14px; color:var(--tg-hint)">
      ⏱ Печать выполняется…
    </div>
  `;
}
function detailsButtons(printer) {
  switch (printer.status) {
    case "FREE":
      return `
        <button class="button"
          onclick="tg.showAlert('Запуск печати — через бота')">
          ▶️ Начать печать
        </button>
      `;

    case "BUSY":
      return `
        <button class="button"
          onclick="finishFromDetails(${printer.id})">
          ✅ Завершить печать
        </button>

        <button class="button secondary"
          onclick="tg.showAlert('Пауза — через бота')">
          ⏸ Пауза
        </button>
      `;

    case "REPAIR":
      return `
        <button class="button"
          onclick="tg.showAlert('Снятие с ремонта — через бота')">
          🔧 С ремонта
        </button>
      `;

    default:
      return "";
  }
}
async function finishFromDetails(printerId) {
  try {
    await api(`/printers/finish?printer_id=${printerId}`, {
      method: "POST"
    });
    tg.showAlert("Печать завершена");
    loadPrinters();
  } catch {
    tg.showAlert("Ошибка завершения");
  }
}
// ============================================================
// LOAD USER MODELS
// ============================================================

async function loadModels() {
  setActiveTab(2);
  content.innerHTML = `<div class="empty">Загрузка моделей…</div>`;

  try {
    const models = await api("/models");

    if (!models.length) {
      content.innerHTML = `
        <div class="empty fade-in">
          <h2>📦 Нет моделей</h2>
          <p>Загрузи STL через бота</p>
        </div>
      `;
      return;
    }

    content.innerHTML = "";
    models.forEach(renderModelCard);

  } catch {
    content.innerHTML = `<div class="empty">Ошибка загрузки</div>`;
  }
}
function renderModelCard(model) {
  const card = document.createElement("div");
  card.className = "card fade-in";

  card.innerHTML = `
    <div class="card-title">${model.item_name}</div>
    <div class="card-subtitle">
      ⏱ ~${model.estimated_time} ч
    </div>

    <button class="button"
      onclick="choosePrinterForModel(${model.id})">
      ➕ В очередь
    </button>
  `;

  content.appendChild(card);
}
async function choosePrinterForModel(modelId) {
  try {
    const printers = await api("/printers");

    const freePrinters = printers.filter(
      p => p.status === "FREE"
    );

    if (!freePrinters.length) {
      tg.showAlert("Нет свободных принтеров");
      return;
    }

    content.innerHTML = `
      <div class="empty fade-in">
        <h2>🖨 Выбери принтер</h2>
      </div>
    `;

    freePrinters.forEach(p => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div class="card-title">${p.name}</div>
        <div class="card-subtitle">
          ${p.brand} ${p.model_name}
        </div>

        <button class="button"
          onclick="addToQueue(${p.id}, ${modelId})">
          ▶️ Поставить в очередь
        </button>
      `;

      content.appendChild(card);
    });

  } catch {
    tg.showAlert("Ошибка загрузки принтеров");
  }
        }
function renderModelCard(model) {
  const card = document.createElement("div");
  card.className = "card fade-in";

  card.innerHTML = `
    <div class="card-title">${model.item_name}</div>
    <div class="card-subtitle">
      ⏱ ~${model.estimated_time} ч
    </div>

    <button class="button"
      onclick="choosePrinterForModel(${model.id})">
      ➕ В очередь
    </button>
  `;

  content.appendChild(card);
}
