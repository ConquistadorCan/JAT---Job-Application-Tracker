// ─── Date Picker ──────────────────────────────────────────────────────────────

const DP_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DP_WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

let dpYear = null;
let dpMonth = null;
let dpPanel = null;

function dpTodayISO() {
  return new Date().toISOString().split("T")[0];
}

function formatDDMMYYYY(isoStr) {
  if (!isoStr) return "";
  const [y, m, d] = isoStr.split("-");
  return `${d}/${m}/${y}`;
}

function setDatePickerValue(isoDate) {
  document.getElementById("field-date").value = isoDate;
  const display = document.getElementById("field-date-display");
  if (isoDate) {
    display.textContent = formatDDMMYYYY(isoDate);
    display.classList.remove("text-cb-400", "dark:text-cb-500");
    display.classList.add("text-cb-900", "dark:text-cb-100");
  } else {
    display.textContent = "DD/MM/YYYY";
    display.classList.remove("text-cb-900", "dark:text-cb-100");
    display.classList.add("text-cb-400", "dark:text-cb-500");
  }
}

function dpRenderCalendar() {
  const today = dpTodayISO();
  const selectedISO = document.getElementById("field-date").value;

  document.getElementById("dp-month-year").textContent =
    `${DP_MONTHS[dpMonth]} ${dpYear}`;

  const grid = document.getElementById("dp-grid");
  grid.innerHTML = "";

  // Weekday headers
  DP_WEEKDAYS.forEach((d) => {
    const el = document.createElement("div");
    el.className = "dp-weekday";
    el.textContent = d;
    grid.appendChild(el);
  });

  // First weekday offset (Mon = 0)
  const firstDayOfWeek = new Date(dpYear, dpMonth, 1).getDay();
  const startOffset = (firstDayOfWeek + 6) % 7;
  for (let i = 0; i < startOffset; i++) {
    grid.appendChild(document.createElement("div"));
  }

  const daysInMonth = new Date(dpYear, dpMonth + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const mm = String(dpMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const isoDate = `${dpYear}-${mm}-${dd}`;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = day;

    if (isoDate === selectedISO) {
      btn.className = "dp-day dp-day-selected";
    } else if (isoDate === today) {
      btn.className = "dp-day dp-day-today";
    } else {
      btn.className = "dp-day dp-day-normal";
    }

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      setDatePickerValue(isoDate);
      dpClose();
      // Clear error state on trigger
      const trigger = document.getElementById("field-date-trigger");
      trigger.classList.remove("border-red-400", "focus:ring-red-400");
      trigger.classList.add("border-cb-200", "focus:ring-cb-400");
      document.getElementById("error-date").classList.add("hidden");
    });

    grid.appendChild(btn);
  }
}

function dpOpen() {
  if (!dpPanel) {
    dpPanel = dpCreatePanel();
    document.body.appendChild(dpPanel);
  }

  const val = document.getElementById("field-date").value;
  const ref = val ? new Date(val + "T00:00:00") : new Date();
  dpYear = ref.getFullYear();
  dpMonth = ref.getMonth();

  const trigger = document.getElementById("field-date-trigger");
  const rect = trigger.getBoundingClientRect();

  dpPanel.style.left = rect.left + "px";
  dpPanel.style.top = rect.bottom + 4 + "px";
  dpPanel.style.minWidth = Math.max(rect.width, 264) + "px";
  dpPanel.classList.remove("hidden");

  dpRenderCalendar();

  // Overflow guards
  const pr = dpPanel.getBoundingClientRect();
  if (pr.right > window.innerWidth - 8) {
    dpPanel.style.left =
      Math.max(8, window.innerWidth - pr.width - 8) + "px";
  }
  if (pr.bottom > window.innerHeight - 8) {
    dpPanel.style.top = rect.top - pr.height - 4 + "px";
  }
}

function dpClose() {
  if (dpPanel) dpPanel.classList.add("hidden");
}

function dpCreatePanel() {
  const panel = document.createElement("div");
  panel.id = "datepicker-panel";
  panel.className = "dp-panel hidden";
  panel.innerHTML = `
    <div class="dp-header">
      <button type="button" id="dp-prev" class="dp-nav-btn">&#8249;</button>
      <span id="dp-month-year" class="dp-month-label"></span>
      <button type="button" id="dp-next" class="dp-nav-btn">&#8250;</button>
    </div>
    <div id="dp-grid" class="dp-grid"></div>
  `;

  panel.querySelector("#dp-prev").addEventListener("click", (e) => {
    e.stopPropagation();
    dpMonth--;
    if (dpMonth < 0) { dpMonth = 11; dpYear--; }
    dpRenderCalendar();
  });

  panel.querySelector("#dp-next").addEventListener("click", (e) => {
    e.stopPropagation();
    dpMonth++;
    if (dpMonth > 11) { dpMonth = 0; dpYear++; }
    dpRenderCalendar();
  });

  // Prevent clicks inside panel from bubbling to document (which closes it)
  panel.addEventListener("click", (e) => e.stopPropagation());

  return panel;
}

function initDatePicker() {
  const trigger = document.getElementById("field-date-trigger");
  if (!trigger) return;

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (dpPanel && !dpPanel.classList.contains("hidden")) {
      dpClose();
    } else {
      dpOpen();
    }
  });
}

// Close on outside click
document.addEventListener("click", () => dpClose());

document.addEventListener("DOMContentLoaded", initDatePicker);
