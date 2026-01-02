// =====================================================
// PrintFarm Mini App — app.js (PART 1 / 2)
// Base, API, printers, UI
// =====================================================

const tg = window.Telegram.WebApp;
tg.ready();

const initData = tg.initData;

fetch("http://localhost:8000/auth/telegram", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    initData: initData
  })
})
.then(res => res.json())
.then(user => {
  console.log("Авторизован как:", user);
  // user.telegram_id
  // user.plan
});

// -----------------------------------------------------
// INIT
// -----------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  if (tg.initDataUnsafe?.user) {
    const u = tg.initDataUnsafe.user;
    userStatus.textContent = `👤 ${u.first_name}`;
  }
  loadPrinters();
});

// -----------------------------------------------------
// API
// -----------------------------------------------------

function api(path, options = {}) {
  return fetch(API_BASE + path, {
    headers: {
      "Authorization": tg.initData,
      "Content-Type": "application/json"
    },
    ...options
  }).then(async r => {
    if (!r.ok) throw new Error("API error");
    return r.json();
  });
}

// -----------------------------------------------------
// UI HELPERS
// -----------------------------------------------------

function setActiveTab(index) {
  document.querySelectorAll(".bottom-nav button")
    .forEach((b, i) => b.classList.toggle("active", i === index));
}

function statusLabel(status) {
  return {
    FREE: "🟢 Свободен",
    BUSY: "🔵 Печать",
    PAUSED: "⏸ Пауза",
    REPAIR: "🔴 Ремонт"
  }[status] || status;
}

function actionLabel(status) {
  return {
    FREE: "▶️ Начать печать",
    BUSY: "✅ Завершить печать",
    PAUSED: "▶️ Продолжить",
    REPAIR: "🔧 С ремонта"
  }[status] || "Открыть";
}

// -----------------------------------------------------
// PRINTERS LIST
// -----------------------------------------------------

async function loadPrinters() {
  setActiveTab(0);
  content.innerHTML = `<div class="empty">Загрузка принтеров…</div>`;

  try {
    const printers = await api("/printers");

    if (!printers.length) {
      content.innerHTML = `
        <div class="empty fade-in">
          <h2>🖨 Принтеров нет</h2>
          <p>Добавь принтер через бота</p>
        </div>`;
      return;
    }

    content.innerHTML = "";
    printers.forEach(p => content.appendChild(renderPrinter(p)));

  } catch (e) {
    content.innerHTML = `<div class="empty">Ошибка загрузки</div>`;
  }
}

// -----------------------------------------------------
// PRINTER CARD
// -----------------------------------------------------

function renderPrinter(p) {
  const card = document.createElement("div");
  card.className = "card fade-in";

  card.innerHTML = `
    <div class="card-header">
      <img class="card-image"
        src="${p.image_url || "https://placehold.co/200"}">

      <div>
        <div class="card-title">${p.name}</div>
        <div class="card-subtitle">
          ${p.brand} ${p.model_name}
        </div>
      </div>
    </div>

    <div class="status ${p.status.toLowerCase()}">
      ${statusLabel(p.status)}
    </div>

    ${p.status === "BUSY" ? renderProgress() : ""}

    <button class="button"
      onclick="printerAction(${p.id}, '${p.status}')">
      ${actionLabel(p.status)}
    </button>
  `;

  return card;
}

function renderProgress() {
  // MVP — фейковый процент
  return `
    <div class="progress">
      <div class="progress-inner" style="width:40%"></div>
    </div>
  `;
}

// -----------------------------------------------------
// PRINTER ACTIONS
// -----------------------------------------------------

async function printerAction(printerId, status) {
  try {
    if (status === "BUSY") {
      await api(`/printers/finish?printer_id=${printerId}`, {
        method: "POST"
      });
      tg.showAlert("Печать завершена");
      loadPrinters();
      return;
    }

    tg.showAlert("Это действие выполняется через бота");

  } catch (e) {
    tg.showAlert("Ошибка выполнения");
  }
}

// -----------------------------------------------------
// QUEUE TAB (placeholder, logic in part 2)
// -----------------------------------------------------

function loadQueue() {
  setActiveTab(1);
  content.innerHTML = `
    <div class="empty fade-in">
      <h2>📋 Очередь</h2>
      <p>Очередь управляется автоматически</p>
    </div>
  `;
}
// =====================================================
// app.js (PART 2 / 2)
// Models, queue, printer selection
// =====================================================

// -----------------------------------------------------
// MODELS LIST
// -----------------------------------------------------

async function loadModels() {
  setActiveTab(2);
  content.innerHTML = `<div class="empty">Загрузка моделей…</div>`;

  try {
    const models = await api("/models");

    if (!models.length) {
      content.innerHTML = `
        <div class="empty fade-in">
          <h2>📦 Моделей нет</h2>
          <p>Загрузи STL через бота</p>
        </div>`;
      return;
    }

    content.innerHTML = "";
    models.forEach(m => content.appendChild(renderModel(m)));

  } catch (e) {
    content.innerHTML = `<div class="empty">Ошибка загрузки</div>`;
  }
}

// -----------------------------------------------------
// MODEL CARD
// -----------------------------------------------------

function renderModel(m) {
  const card = document.createElement("div");
  card.className = "card fade-in";

  card.innerHTML = `
    <div class="card-title">${m.item_name}</div>
    <div class="card-subtitle">
      ⏱ ~${m.estimated_time} ч
    </div>

    <button class="button"
      onclick="selectPrinterForModel(${m.id})">
      ➕ Поставить в очередь
    </button>
  `;

  return card;
}

// -----------------------------------------------------
// SELECT PRINTER FOR MODEL
// -----------------------------------------------------

async function selectPrinterForModel(modelId) {
  content.innerHTML = `<div class="empty">Загрузка принтеров…</div>`;

  try {
    const printers = await api("/printers");
    const freePrinters = printers.filter(p => p.status === "FREE");

    if (!freePrinters.length) {
      content.innerHTML = `
        <div class="empty fade-in">
          <h2>🖨 Нет свободных принтеров</h2>
          <p>Дождись окончания текущей печати</p>
        </div>`;
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
        <div class="card-header">
          <img class="card-image"
            src="${p.image_url || "https://placehold.co/200"}">

          <div>
            <div class="card-title">${p.name}</div>
            <div class="card-subtitle">
              ${p.brand} ${p.model_name}
            </div>
          </div>
        </div>

        <button class="button"
          onclick="addToQueue(${p.id}, ${modelId})">
          ▶️ Печатать
        </button>
      `;

      content.appendChild(card);
    });

  } catch (e) {
    content.innerHTML = `<div class="empty">Ошибка загрузки</div>`;
  }
}

// -----------------------------------------------------
// ADD TO QUEUE
// -----------------------------------------------------

async function addToQueue(printerId, modelId) {
  try {
    await api("/queue/add", {
      method: "POST",
      body: JSON.stringify({
        printer_id: printerId,
        model_id: modelId
      })
    });

    tg.showAlert("Модель добавлена в очередь");
    loadPrinters();

  } catch (e) {
    tg.showAlert("Ошибка добавления в очередь");
  }
}

// -----------------------------------------------------
// QUEUE VIEW (MVP)
// -----------------------------------------------------

async function loadQueue() {
  setActiveTab(1);
  content.innerHTML = `<div class="empty">Загрузка очереди…</div>`;

  try {
    const queue = await api("/queue");

    if (!queue.length) {
      content.innerHTML = `
        <div class="empty fade-in">
          <h2>📭 Очередь пуста</h2>
          <p>Добавь модель для печати</p>
        </div>`;
      return;
    }

    content.innerHTML = "";
    queue.forEach(q => {
      const card = document.createElement("div");
      card.className = "card fade-in";

      card.innerHTML = `
        <div class="card-title">${q.item_name}</div>
        <div class="card-subtitle">
          🖨 ${q.printer_name} · ${q.status}
        </div>
      `;

      content.appendChild(card);
    });

  } catch (e) {
    content.innerHTML = `<div class="empty">Ошибка загрузки</div>`;
  }
    }
