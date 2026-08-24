//  Constants
const CATEGORY_COLORS = {
  Food: "#FF9AA2",
  Transport: "#9AD3E6",
  Bills: "#FFD3A5",
  Shopping: "#C7CEEA",
  Health: "#A8E6CF",
  Entertainment: "#FFB7B2",
  Other: "#B6E3B6",
};

//  Elements
const budgetInput = document.getElementById("budget");
const nameInput = document.getElementById("expense-name");
const amountInput = document.getElementById("expense-amount");
const categoryInput = document.getElementById("expense-category");
const addBtn = document.getElementById("add-expense");
const cancelEditBtn = document.getElementById("cancel-edit");
const listEl = document.getElementById("expense-list");
const totalEl = document.getElementById("total");
const breakdownEl = document.getElementById("breakdown");
const chartCtx = document.getElementById("expenseChart").getContext("2d");
const monthInput = document.getElementById("month");
const logoutBtn = document.getElementById("logout-btn");
const userEmailEl = document.getElementById("user-email");
const monthlyOverviewEl = document.getElementById("monthly-overview");

//  State
let expenses = [];
let budgets = {}; // { "2026-08": 25000, "2026-07": 20000, ... }
let editId = null;
let currentUser = null;
let unsubscribeExpenses = null;
let unsubscribeBudgets = null;

//  Auth guard — redirect to login if not signed in, otherwise load data
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  if (userEmailEl) userEmailEl.textContent = user.displayName || user.email.split("@")[0];
  listenToBudgets();
  listenToExpenses();
});

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => (window.location.href = "login.html"));
  });
}

//  Chart
const chart = new Chart(chartCtx, {
  type: "pie",
  data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
  options: { responsive: true, plugins: { legend: { position: "bottom" } } },
});

//  Format
function formatPKR(v) {
  return Math.round(v).toLocaleString("en-PK") + " PKR";
}

function monthLabel(monthStr) {
  const [y, m] = monthStr.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

//  Toast notifications
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add("toast-show"), 10);
  setTimeout(() => {
    toast.classList.remove("toast-show");
    setTimeout(() => toast.remove(), 250);
  }, 2600);
}

//  Firestore refs
function expensesRef() {
  return db.collection("users").doc(currentUser.uid).collection("expenses");
}
function budgetsRef() {
  return db.collection("users").doc(currentUser.uid).collection("budgets");
}

//  Live-load expenses from Firestore (real-time updates)
function listenToExpenses() {
  if (unsubscribeExpenses) unsubscribeExpenses();
  unsubscribeExpenses = expensesRef()
    .orderBy("createdAt", "desc")
    .onSnapshot((snapshot) => {
      expenses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      renderAll();
    });
}

//  Live-load budgets — one document per month, e.g. budgets/2026-08 { amount: 25000 }
function listenToBudgets() {
  if (unsubscribeBudgets) unsubscribeBudgets();
  unsubscribeBudgets = budgetsRef().onSnapshot((snapshot) => {
    budgets = {};
    snapshot.docs.forEach((doc) => {
      budgets[doc.id] = doc.data().amount;
    });
    // Don't overwrite the box while the user is actively typing in it.
    if (document.activeElement !== budgetInput) {
      budgetInput.value = budgets[monthInput.value] ?? "";
    }
    renderAll();
  });
}

//  Save the budget for whichever month is currently selected
async function saveBudget() {
  const month = monthInput.value;
  const raw = budgetInput.value.trim();

  if (raw === "") {
    await budgetsRef().doc(month).delete().catch(() => {});
    return;
  }

  const value = Number(raw);
  if (isNaN(value)) return;

  await budgetsRef().doc(month).set({ amount: value });
  showToast(`Budget set for ${monthLabel(month)}`);
}

//  Add Expense
async function addExpense(name, amount, category) {
  const month = monthInput.value;
  await expensesRef().add({
    name,
    amount,
    category,
    month,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

//  Totals
function calcTotals(filtered) {
  const totals = {};
  let grand = 0;

  filtered.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
    grand += e.amount;
  });

  return { totals, grand };
}

//  Render List
function renderExpenses() {
  const selectedMonth = monthInput.value;
  listEl.innerHTML = "";

  const filtered = expenses.filter((e) => e.month === selectedMonth);

  if (filtered.length === 0) {
    listEl.innerHTML = "<li>No expenses found</li>";
  }

  filtered.forEach((exp) => {
    const li = document.createElement("li");

    li.innerHTML = `
  <div class="expense-item">
    <span class="text">
      ${exp.name} - ${formatPKR(exp.amount)} (${exp.category})
    </span>
    <div class="actions">
      <button class="edit-btn" onclick="startEdit('${exp.id}')">Edit</button>
      <button class="delete-btn" onclick="deleteExpense('${exp.id}')">Delete</button>
    </div>
  </div>
`;
    listEl.appendChild(li);
  });

  return filtered;
}

//  Summary + Chart (for the selected month)
function renderSummary(filtered) {
  const { totals, grand } = calcTotals(filtered);

  totalEl.textContent = `Total: ${formatPKR(grand)}`;
  breakdownEl.innerHTML = "";

  Object.keys(totals).forEach((cat) => {
    const wrap = document.createElement("div");
    wrap.className = "break-item-wrap";

    const catExpenses = filtered.filter((e) => e.category === cat);

    const header = document.createElement("button");
    header.type = "button";
    header.className = "break-item";
    header.innerHTML = `
      <span>${cat} <span class="break-count">(${catExpenses.length})</span></span>
      <span>${formatPKR(totals[cat])} <span class="break-caret">▾</span></span>
    `;

    const detail = document.createElement("div");
    detail.className = "break-detail";
    detail.innerHTML = catExpenses
      .map((e) => `<div class="break-detail-row"><span>${e.name}</span><span>${formatPKR(e.amount)}</span></div>`)
      .join("");

    header.addEventListener("click", () => {
      detail.classList.toggle("open");
      header.classList.toggle("open");
    });

    wrap.appendChild(header);
    wrap.appendChild(detail);
    breakdownEl.appendChild(wrap);
  });

  chart.data.labels = Object.keys(totals);
  chart.data.datasets[0].data = Object.values(totals);
  chart.data.datasets[0].backgroundColor = Object.keys(totals).map(
    (l) => CATEGORY_COLORS[l] || "#ccc"
  );

  chart.update();

  //  Budget warning
  const budget = Number(budgetInput.value);

  if (budget && grand > budget) {
    totalEl.style.color = "#e0455b";
    totalEl.textContent += "  — Budget Exceeded!";
  } else {
    totalEl.style.color = "";
  }
}

//  Monthly Overview (History page) — every month that has expenses or a budget
function renderMonthlyOverview() {
  if (!monthlyOverviewEl) return;

  const months = new Set([...expenses.map((e) => e.month), ...Object.keys(budgets)]);
  const sorted = [...months].filter(Boolean).sort().reverse();

  if (sorted.length === 0) {
    monthlyOverviewEl.innerHTML = '<p class="empty-note">No history yet — add some expenses to see monthly summaries here.</p>';
    return;
  }

  monthlyOverviewEl.innerHTML = "";

  sorted.forEach((month) => {
    const monthExpenses = expenses.filter((e) => e.month === month);
    const spent = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const budget = budgets[month];

    let statusHtml = '<span class="month-status neutral">No budget set</span>';
    if (budget != null) {
      const diff = budget - spent;
      if (diff >= 0) {
        statusHtml = `<span class="month-status saved">Saved ${formatPKR(diff)}</span>`;
      } else {
        statusHtml = `<span class="month-status over">Over by ${formatPKR(Math.abs(diff))}</span>`;
      }
    }

    const row = document.createElement("div");
    row.className = "month-row";
    row.innerHTML = `
      <span class="month-label">${monthLabel(month)}</span>
      <span class="month-stats">
        <span>Budget: <strong>${budget != null ? formatPKR(budget) : "—"}</strong></span>
        <span>Spent: <strong>${formatPKR(spent)}</strong></span>
      </span>
      ${statusHtml}
    `;
    monthlyOverviewEl.appendChild(row);
  });
}

//  Render All
function renderAll() {
  const filtered = renderExpenses();
  renderSummary(filtered);
  renderMonthlyOverview();
  if (window.refreshChatbotContext) window.refreshChatbotContext(expenses, Number(budgetInput.value));
}

//  Delete
async function deleteExpense(id) {
  await expensesRef().doc(id).delete();
  showToast("Expense deleted", "danger");
}

//  Edit
function startEdit(id) {
  const e = expenses.find((x) => x.id === id);
  if (!e) return;

  editId = id;
  nameInput.value = e.name;
  amountInput.value = e.amount;
  categoryInput.value = e.category;

  addBtn.textContent = "Update Expense";
  cancelEditBtn.style.display = "block";
}

//  Update
async function updateExpense(id, name, amount, category) {
  await expensesRef().doc(id).update({ name, amount, category });
}

//  Button
addBtn.onclick = async () => {
  const name = nameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  if (!name || !category || isNaN(amount) || amount < 100) {
    alert("Please provide a valid expense name, category, and an amount of at least 100 PKR.");
    return;
  }

  if (editId) {
    await updateExpense(editId, name, amount, category);
    editId = null;
    addBtn.textContent = "Add Expense";
    cancelEditBtn.style.display = "none";
    showToast("Expense updated successfully");
  } else {
    await addExpense(name, amount, category);
    showToast("Expense added successfully");
  }

  nameInput.value = "";
  amountInput.value = "";
  categoryInput.value = "";
};

cancelEditBtn.addEventListener("click", () => {
  editId = null;
  addBtn.textContent = "Add Expense";
  cancelEditBtn.style.display = "none";
  nameInput.value = "";
  amountInput.value = "";
  categoryInput.value = "";
});

//  Default month
monthInput.value = new Date().toISOString().slice(0, 7);

//  Events
monthInput.addEventListener("change", () => {
  budgetInput.value = budgets[monthInput.value] ?? "";
  renderAll();
});

budgetInput.addEventListener("blur", saveBudget);
budgetInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") budgetInput.blur();
});

// Live-update the total/chart as you type, without saving on every keystroke
budgetInput.addEventListener("input", () => {
  renderSummary(expenses.filter((e) => e.month === monthInput.value));
});
