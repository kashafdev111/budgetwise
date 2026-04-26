//  Auth check
const user = localStorage.getItem("loggedInUser");
if (!user) {
  window.location.href = "login.html";
}

//  Constants
const STORAGE_KEY = "budgetwise_expenses_v1";

const CATEGORY_COLORS = {
  Food: "#FF9AA2",
  Transport: "#9AD3E6",
  Bills: "#FFD3A5",
  Shopping: "#C7CEEA",
  Other: "#B6E3B6",
};

//  Elements
const searchInput = document.getElementById("search");
const budgetInput = document.getElementById("budget");
const nameInput = document.getElementById("expense-name");
const amountInput = document.getElementById("expense-amount");
const categoryInput = document.getElementById("expense-category");
const addBtn = document.getElementById("add-expense");
const listEl = document.getElementById("expense-list");
const totalEl = document.getElementById("total");
const breakdownEl = document.getElementById("breakdown");
const chartCtx = document.getElementById("expenseChart").getContext("2d");
const monthInput = document.getElementById("month");

// monthInput.value = new Date().toISOString().slice(0, 7);

//  Load data
let expenses = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let editId = null;

//  Load budget
budgetInput.value = localStorage.getItem("budget") || "";

//  Chart
const chart = new Chart(chartCtx, {
  type: "pie",
  data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
  options: { responsive: true, plugins: { legend: { position: "bottom" } } },
});

//  Save
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

//  Format
function formatPKR(v) {
  return v.toLocaleString("en-PK") + " PKR";
}

//  Add Expense
function addExpense(name, amount, category) {
  const month = monthInput.value;

  const expense = {
    id: Date.now(),
    name,
    amount,
    category,
    month,
  };

  expenses.push(expense);
  save();
  renderAll();
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

  const query = searchInput.value.toLowerCase();

  const filtered = expenses.filter((e) =>
    e.month === selectedMonth &&
    e.name.toLowerCase().includes(query)
  );

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
      <button class="edit-btn" onclick="startEdit(${exp.id})">Edit</button>
      <button class="delete-btn" onclick="deleteExpense(${exp.id})">Delete</button>
    </div>
  </div>
`;
    listEl.appendChild(li);
  });

  return filtered;
}

//  Summary + Chart
function renderSummary(filtered) {
  const { totals, grand } = calcTotals(filtered);

  totalEl.textContent = `Total: ${formatPKR(grand)}`;
  breakdownEl.innerHTML = "";

  Object.keys(totals).forEach((cat) => {
    const div = document.createElement("div");
    div.className = "break-item";
    div.innerHTML = `<span>${cat}</span><span>${formatPKR(totals[cat])}</span>`;
    breakdownEl.appendChild(div);
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
    totalEl.style.color = "red";
    totalEl.textContent += "  Budget Exceeded!";
  } else {
    totalEl.style.color = "black";
  }
}

// if (filtered.length === 0) {
//   listEl.innerHTML = "<li> No matching expenses</li>";
// }

//  Render All
function renderAll() {
  const filtered = renderExpenses();
  renderSummary(filtered);
}

//  Delete
function deleteExpense(id) {
  expenses = expenses.filter((e) => e.id !== id);
  save();
  renderAll();
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
}

//  Update
function updateExpense(id, name, amount, category) {
  const e = expenses.find((x) => x.id === id);
  if (!e) return;

  e.name = name;
  e.amount = amount;
  e.category = category;

  save();
  renderAll();
}

//  Button
addBtn.onclick = () => {
  const name = nameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  if (!name || !category || isNaN(amount) || amount <= 0) {
    alert("Please provide valid details.");
    return;
  }

  if (editId) {
    updateExpense(editId, name, amount, category);
    editId = null;
    addBtn.textContent = "Add Expense";
  } else {
    addExpense(name, amount, category);
  }

  nameInput.value = "";
  amountInput.value = "";
  categoryInput.value = "";
};

//  Default month
monthInput.value = new Date().toISOString().slice(0, 7);

//  Events (ONLY ONCE)
monthInput.addEventListener("change", renderAll);
searchInput.addEventListener("input", renderAll);

budgetInput.addEventListener("input", () => {
  localStorage.setItem("budget", budgetInput.value);
  renderAll();
});

//  Start
renderAll();