// ============================================
// BudgetWise Assistant — rule-based chatbot
// Reads live expense/budget data, no external API needed.
// ============================================

let botExpenses = [];
let botBudget = 0;

// Called from script.js every time data changes
window.refreshChatbotContext = function (expenses, budget) {
  botExpenses = expenses || [];
  botBudget = budget || 0;
};

function formatPKR(v) {
  return Math.round(v).toLocaleString("en-PK") + " PKR";
}

function currentMonthExpenses() {
  const monthInput = document.getElementById("month");
  const month = monthInput ? monthInput.value : new Date().toISOString().slice(0, 7);
  return botExpenses.filter((e) => e.month === month);
}

function totalsByCategory(list) {
  const totals = {};
  list.forEach((e) => (totals[e.category] = (totals[e.category] || 0) + e.amount));
  return totals;
}

// Maps recognized words/phrases to the actual category name used in the app.
// Includes common synonyms so the bot understands natural phrasing, not just
// the exact category label.
const CATEGORY_SYNONYMS = {
  Food: ["food", "groceries", "grocery", "eating", "restaurant", "restaurants"],
  Transport: ["transport", "transportation", "fuel", "petrol", "gas", "uber", "taxi", "cab", "fare"],
  Bills: ["bills", "bill", "electricity", "utility", "utilities", "internet", "phone bill", "rent"],
  Shopping: ["shopping", "clothes", "clothing"],
  Health: ["health", "medicine", "medicines", "medical", "doctor", "hospital", "pharmacy", "medication"],
  Entertainment: ["entertainment", "movie", "movies", "netflix", "fun", "games", "gaming"],
  Other: ["other", "misc", "miscellaneous"],
};

function answerQuestion(raw) {
  const q = raw.toLowerCase().trim();
  const list = currentMonthExpenses();
  const grand = list.reduce((s, e) => s + e.amount, 0);

  if (!q) return "Ask me something like \"how much did I spend on food?\" or \"am I over budget?\"";

  // Greetings
  if (/^(hi|hello|hey)\b/.test(q)) {
    return "Hey! I can tell you about your spending this month — try \"total spent\" or \"biggest expense category\".";
  }

  // Category-specific spend (checks the category name itself plus its synonyms)
  const askedCategory = Object.keys(CATEGORY_SYNONYMS).find((cat) =>
    CATEGORY_SYNONYMS[cat].some((word) => q.includes(word))
  );
  if (askedCategory) {
    const spent = list.filter((e) => e.category === askedCategory).reduce((s, e) => s + e.amount, 0);
    if (spent === 0) return `You haven't logged any ${askedCategory} expenses this month yet.`;
    return `You've spent ${formatPKR(spent)} on ${askedCategory} this month.`;
  }

  // Budget status
  if (q.includes("over budget") || q.includes("under budget") || q.includes("budget left") || q.includes("remaining")) {
    if (!botBudget) return "You haven't set a monthly budget yet — add one in the Summary panel and I can track it for you.";
    const diff = botBudget - grand;
    if (diff < 0) return `You're ${formatPKR(Math.abs(diff))} over your ${formatPKR(botBudget)} budget this month.`;
    return `You're within budget — ${formatPKR(diff)} left out of ${formatPKR(botBudget)}.`;
  }

  // Total spend
  if (q.includes("total") || q.includes("how much") && !askedCategory) {
    if (list.length === 0) return "No expenses logged for this month yet.";
    return `Total spent this month: ${formatPKR(grand)} across ${list.length} expense${list.length === 1 ? "" : "s"}.`;
  }

  // Biggest category
  if (q.includes("biggest") || q.includes("most") || q.includes("highest")) {
    const totals = totalsByCategory(list);
    const keys = Object.keys(totals);
    if (keys.length === 0) return "No expenses logged for this month yet.";
    const top = keys.reduce((a, b) => (totals[a] > totals[b] ? a : b));
    return `Your biggest category this month is ${top} at ${formatPKR(totals[top])}.`;
  }

  // Count
  if (q.includes("how many")) {
    return `You've logged ${list.length} expense${list.length === 1 ? "" : "s"} this month.`;
  }

  // Tip / advice
  if (q.includes("tip") || q.includes("advice") || q.includes("save")) {
    const totals = totalsByCategory(list);
    const keys = Object.keys(totals);
    if (keys.length === 0) return "Log a few expenses first and I can point out where you could cut back.";
    const top = keys.reduce((a, b) => (totals[a] > totals[b] ? a : b));
    return `${top} is your top spending category (${formatPKR(totals[top])}) — that's usually the best place to look for savings first.`;
  }

  return "I'm not sure about that yet — try \"total spent\", \"food expenses\", \"am I over budget\", or \"give me a tip\".";
}

// ---- Widget wiring ----
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("chatbot-toggle");
  const panel = document.getElementById("chatbot-panel");
  const closeBtn = document.getElementById("chatbot-close");
  const messagesEl = document.getElementById("chatbot-messages");
  const form = document.getElementById("chatbot-form");
  const input = document.getElementById("chatbot-input");

  if (!toggle || !panel || !form) return;

  toggle.addEventListener("click", () => {
    panel.classList.toggle("open");
    if (panel.classList.contains("open") && messagesEl.children.length === 0) {
      addMessage("bot", "Hi! I'm your BudgetWise assistant. Ask me about your spending 🙂");
    }
  });
  closeBtn.addEventListener("click", () => panel.classList.remove("open"));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMessage("user", text);
    input.value = "";
    setTimeout(() => addMessage("bot", answerQuestion(text)), 300);
  });

  function addMessage(sender, text) {
    const div = document.createElement("div");
    div.className = `chat-msg ${sender}`;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
});
