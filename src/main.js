import "./style.css";

/* ELEMENTS SELECTION */
// SALARY & EXPENSE AMOUNT
const salaryAmtEl = document.getElementById("salaryAmt");
const remainBal = document.getElementById("totalExp");
// INPUTS
const salaryInpEl = document.getElementById("salaryInp");
const expNameInpEl = document.getElementById("expNameInp");
const expAmtInpEl = document.getElementById("expAmtInp");
// BUTTON TO ADD EXPENSES
const addExpBtnEl = document.getElementById("addExpBtn");
// LIST OF EXPENSES
const expListEl = document.getElementById("expList");

let expenses = [];
let totalExpense = 0;

let currentRate = 1;
let currentCurrency = "INR";

currentCurrency = document.getElementById("currencySelect").value;
if (currentCurrency !== "INR") {
  currentRate = await getRate("INR", currentCurrency);
}

if (localStorage.getItem("salary")) {
  salaryAmtEl.innerText = localStorage.getItem("salary");
  salaryAmtEl.setAttribute(
    "data-baseValue",
    `${localStorage.getItem("salary")}`,
  );
  toggleExpInputs(false);
}

if (localStorage.getItem("expenses")) {
  const frag = document.createDocumentFragment();

  expenses = JSON.parse(localStorage.getItem("expenses"));
  let storedExpense = 0;

  expenses.forEach((expense) => {
    const liEl = document.createElement("li");
    liEl.className = "expItem";

    liEl.innerHTML = `<span>${expense[0]}</span> <span class="currencySign">₹</span> <span class="convertible" data-baseValue="${expense[1]}">${expense[1]}</span> <button class="deleteItemBtn">Delete</button>`;
    storedExpense += expense[1];

    frag.appendChild(liEl);
  });

  totalExpense = storedExpense;
  expListEl.appendChild(frag);

  remainBal.setAttribute(
    "data-baseValue",
    `${Number(salaryAmtEl.getAttribute("data-baseValue")) - totalExpense}`,
  );
  remainBal.innerText = `${Number(salaryAmtEl.getAttribute("data-baseValue")) - totalExpense}`;
} else {
  remainBal.innerText = `${Number(salaryAmtEl.innerText)}`;
  remainBal.setAttribute("data-baseValue", `${Number(salaryAmtEl.innerText)}`);
}

updateColor();

// LISTEN & UPDATE FOR SALARY INPUT
salaryInpEl.addEventListener("input", () => {
  let salaryValue = Number(salaryInpEl.value);

  if (salaryValue > 0) {
    let baseSalaryValue = Number((salaryValue / currentRate).toFixed(2));
    salaryAmtEl.setAttribute("data-baseValue", `${baseSalaryValue}`);
    salaryAmtEl.innerText = `${salaryValue}`;

    saveSalaryInStorage(baseSalaryValue);
    toggleExpInputs(false);
  } else {
    salaryAmtEl.innerText = `0`;
    salaryAmtEl.setAttribute("data-baseValue", "0");
    deleteSalaryFromStorage();
    toggleExpInputs(true);
  }

  remainBal.setAttribute(
    "data-baseValue",
    `${Number(salaryAmtEl.getAttribute("data-baseValue")) - totalExpense}`,
  );
  remainBal.innerText =
    Number(salaryAmtEl.getAttribute("data-baseValue")) - totalExpense;

  updateColor();
  refreshUI();
});

function saveSalaryInStorage(value) {
  localStorage.setItem("salary", `${value}`);
}

function deleteSalaryFromStorage() {
  localStorage.removeItem("salary");
}

// FUNCTION TO TOGGLE INPUTS DISABILITY
function toggleExpInputs(isEnabled) {
  expNameInpEl.disabled = isEnabled;
  expAmtInpEl.disabled = isEnabled;
  if (isEnabled) {
    expNameInpEl.value = "";
    expAmtInpEl.value = "";
  }
}

expNameInpEl.addEventListener("input", () => {
  validateExpenseInputs();
});

expAmtInpEl.addEventListener("input", () => {
  validateExpenseInputs();
});

function validateExpenseInputs() {
  if (Number(expAmtInpEl.value) < 1 || !expNameInpEl.value) {
    addExpBtnEl.disabled = true;
  } else {
    addExpBtnEl.disabled = false;
  }
}

addExpBtnEl.addEventListener("click", async (e) => {
  e.preventDefault();

  let expNameValue = expNameInpEl.value;
  let expAmtValue = Number(expAmtInpEl.value);

  let baseExpAmtValue = Number((expAmtValue / currentRate).toFixed(2));

  totalExpense = Number((totalExpense + baseExpAmtValue).toFixed(2));

  remainBal.setAttribute(
    "data-baseValue",
    `${Number(salaryAmtEl.getAttribute("data-baseValue")) - totalExpense}`,
  );

  await refreshUI();
  updateColor();
  alerForBal();

  const liEl = document.createElement("li");
  liEl.className = "expItem";

  liEl.innerHTML = `<span>${expNameValue}</span> <span class="currencySign">${symbols[currentCurrency]}</span> <span class="convertible" data-baseValue="${baseExpAmtValue}">${(baseExpAmtValue * currentRate).toFixed(2)}</span> <button class="deleteItemBtn">Delete</button>`;

  expListEl.appendChild(liEl);

  if (localStorage.getItem("expenses")) {
    expenses = JSON.parse(localStorage.getItem("expenses"));
  }

  expenses.push([expNameValue, baseExpAmtValue]);

  localStorage.setItem("expenses", JSON.stringify(expenses));

  addDataToChart(pieChart, expNameValue, baseExpAmtValue);

  expNameInpEl.value = "";
  expAmtInpEl.value = "";
  validateExpenseInputs();
});

function updateColor() {
  const baseRemain = Number(remainBal.getAttribute("data-baseValue"));
  const baseSalary = Number(salaryAmtEl.getAttribute("data-baseValue"));

  if (baseRemain < 0.1 * baseSalary) {
    remainBal.style.color = "red";
  } else {
    remainBal.style.color = "black";
  }
}

function alerForBal() {
  if (Number(remainBal.innerText) < 0.1 * Number(salaryAmtEl.innerText)) {
    alert("Warning: Balance is too low!");
  }
}

expListEl.addEventListener("click", async (e) => {
  if (e.target.classList.contains("deleteItemBtn")) {
    const liEl = e.target.closest("li");

    const delExpName = liEl.children[0].innerText;
    const delExpAmtBase = Number(
      liEl.querySelector(".convertible").getAttribute("data-baseValue"),
    );

    expenses = JSON.parse(localStorage.getItem("expenses"));

    for (let i = 0; i < expenses.length; i++) {
      if (expenses[i][0] == delExpName && expenses[i][1] == delExpAmtBase) {
        expenses.splice(i, 1);
        break;
      }
    }

    totalExpense = Number((totalExpense - delExpAmtBase).toFixed(2));

    remainBal.setAttribute(
      "data-baseValue",
      `${Number(salaryAmtEl.getAttribute("data-baseValue")) - totalExpense}`,
    );

    await refreshUI();

    deleteFromChart(pieChart, delExpName, delExpAmtBase);

    if (expenses.length == 0) {
      localStorage.removeItem("expenses");
    } else {
      localStorage.setItem("expenses", JSON.stringify(expenses));
    }

    expListEl.removeChild(liEl);

    updateColor();
  }
});

function refreshUI() {
  const convertibles = document.querySelectorAll(".convertible");

  convertibles.forEach((conv) => {
    const base = Number(conv.getAttribute("data-baseValue"));
    conv.innerText = (base * currentRate).toFixed(2);
  });

  document
    .querySelectorAll(".currencySign")
    .forEach((s) => (s.innerText = symbols[currentCurrency]));

  const baseSalary = Number(salaryAmtEl.getAttribute("data-baseValue") || 0);
  const baseRemaining = baseSalary - totalExpense;

  salaryAmtEl.innerText = (baseSalary * currentRate).toFixed(2);
  remainBal.innerText = (baseRemaining * currentRate).toFixed(2);

  updateColor();
}

/* PIE CHART */

const chartCanvas = document.getElementById("chart");

const pieChart = new Chart(chartCanvas, {
  type: "pie",
  data: {
    labels: ["Remaining"].concat([...expenses.map((expense) => expense[0])]),
    datasets: [
      {
        label: "Amount",
        data: [Number(remainBal.getAttribute("data-baseValue"))].concat([
          ...expenses.map((expense) => expense[1]),
        ]),
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

function addDataToChart(chart, label, baseData) {
  chart.data.labels.shift();
  chart.data.labels.unshift("Remaining");
  chart.data.datasets[0].data.shift();
  chart.data.datasets[0].data.unshift(
    Number(remainBal.getAttribute("data-baseValue")) * currentRate,
  );

  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(baseData * currentRate);

  chart.update();
}

function deleteFromChart(chart, label, value) {
  let labels = [...chart.data.labels];
  let data = [...chart.data.datasets[0].data];
  labels[0] = "Remaining";
  data[0] = Number(remainBal.getAttribute("data-baseValue"));
  for (let i = 1; i < labels.length; i++) {
    if (label == labels[i] && value == data[i]) {
      labels.splice(i, 1);
      data.splice(i, 1);
    }
  }

  chart.data.labels = labels;
  chart.data.datasets[0].data = data;

  chart.update();
}

function updateChartCurrency() {
  const remainingBase = Number(remainBal.getAttribute("data-baseValue"));
  let newData = [remainingBase * currentRate];

  expenses.forEach((expense) => {
    newData.push(expense[1] * currentRate);
  });

  pieChart.data.datasets[0].data = newData;
  pieChart.update();
}

/* GENERATE PDF REPORT */

const genPdfBtn = document.getElementById("genPdfBtn");

genPdfBtn.addEventListener("click", () => {
  if (expenses.length == 0) {
    alert("No report to be shown.");
    return;
  }

  const report = new window.jspdf.jsPDF();

  report.text("Expense Report", 10, 20);

  const startX = 10;
  const startY = 30;
  const cellWidth = 40;
  const cellHeight = 10;

  const tableData = expenses.map((expense) => [expense[0], String((expense[1] * currentRate).toFixed(2))]);
  tableData.push(["Remaining", `${remainBal.innerText}`]);
  const rows = tableData;

  rows.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const x = startX + colIndex * cellWidth;
      const y = startY + rowIndex * cellHeight;

      report.rect(x, y, cellWidth, cellHeight);

      report.text(cell, x + 2, y + 7);
    });
  });

  report.save("manual-table.pdf");
});

/* RATE CONVERSION */

async function getRate(to, from) {
  try {
    const response = await fetch(
      `https://api.frankfurter.dev/v2/rate/${to}/${from}`,
    );
    const data = await response.json();
    const rate = data["rate"];
    return rate;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
  }
}

const currencySelectEl = document.getElementById("currencySelect");

const signs = document.querySelectorAll(".currencySign");
const symbols = { INR: "₹", USD: "$", EUR: "€" };

currencySelectEl.addEventListener("input", async (e) => {
  currentCurrency = e.target.value;

  if (currentCurrency != "INR") {
    currentRate = await getRate("INR", currentCurrency);
  } else {
    currentRate = 1;
  }

  refreshUI();
  updateChartCurrency();
});
