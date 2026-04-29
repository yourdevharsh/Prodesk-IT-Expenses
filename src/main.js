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

if (localStorage.getItem("salary")) {
  salaryAmtEl.innerText = localStorage.getItem("salary");
  salaryAmtEl.setAttribute("data-baseValue", `${localStorage.getItem("salary")}`);
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

  remainBal.innerText = `${Number(salaryAmtEl.innerText) - totalExpense}`;
  remainBal.setAttribute("data-baseValue" , `${Number(salaryAmtEl.innerText) - totalExpense}`);
} else {
  remainBal.innerText = `${Number(salaryAmtEl.innerText)}`;
  remainBal.setAttribute("data-baseValue", `${Number(salaryAmtEl.innerText)}`);
}

updateColor();

// LISTEN & UPDATE FOR SALARY INPUT
salaryInpEl.addEventListener("input", () => {
  let salaryValue = Number(salaryInpEl.value);

  if (salaryValue > 0) {
    salaryAmtEl.innerText = `${salaryValue}`;
    salaryAmtEl.setAttribute("data-baseValue", `${salaryValue}`);
    saveSalaryInStorage(salaryValue);
    toggleExpInputs(false);
  } else {
    salaryAmtEl.innerText = `0`;
    salaryAmtEl.setAttribute("data-baseValue", "0");
    deleteSalaryFromStorage();
    toggleExpInputs(true);
  }

  remainBal.innerText = Number(salaryAmtEl.innerText) - totalExpense;
  remainBal.setAttribute("data-baseValue", `${Number(salaryAmtEl.innerText) - totalExpense}`);
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

addExpBtnEl.addEventListener("click", (e) => {
  e.preventDefault();

  let expNameValue = expNameInpEl.value;
  let expAmtValue = expAmtInpEl.value;

  totalExpense += Number(expAmtValue);
  remainBal.innerText = Number(salaryAmtEl.innerText) - totalExpense;
  remainBal.setAttribute("data-baseValue", `${Number(salaryAmtEl.innerText) - totalExpense}`);

  updateColor();

  const liEl = document.createElement("li");
  liEl.className = "expItem";

  liEl.innerHTML = `<span>${expNameValue}</span> <span class="currencySign">₹</span> <span class="convertible" data-baseValue="${expAmtValue}">${expAmtValue}</span> <button class="deleteItemBtn">Delete</button>`;

  expListEl.appendChild(liEl);

  if (localStorage.getItem("expenses")) {
    expenses = JSON.parse(localStorage.getItem("expenses"));
  }

  expenses.push([expNameValue, Number(expAmtValue)]);

  localStorage.setItem("expenses", JSON.stringify(expenses));

  addDataToChart(pieChart, expNameValue, expAmtValue);

  expNameInpEl.value = "";
  expAmtInpEl.value = "";
  validateExpenseInputs();
});

function updateColor() {
  if (Number(remainBal.innerText) < 0.1*Number(salaryAmtEl.innerText)) {
    remainBal.style.color = "red";
    alert("Warning: Budget is too low!");
  } else {
    remainBal.style.color = "black";
  }
}

expListEl.addEventListener("click", (e) => {
  if (e.target.classList.contains("deleteItemBtn")) {
    const liEl = e.target.closest("li");

    const delExpName = liEl.children[0].innerText;
    const delExpAmt = Number(liEl.children[2].innerText);

    expenses = JSON.parse(localStorage.getItem("expenses"));

    for (let i = 0; i < expenses.length; i++) {
      if (expenses[i][0] == delExpName && expenses[i][1] == delExpAmt) {
        expenses.splice(i, 1);
        break;
      }
    }

    totalExpense -= delExpAmt;

    remainBal.innerText = `${Number(salaryAmtEl.innerText) - totalExpense}`;
    remainBal.setAttribute("data-baseValue", `${Number(salaryAmtEl.innerText) - totalExpense}`);

    deleteFromChart(pieChart, delExpName, delExpAmt);

    if (expenses.length == 0) {
      localStorage.removeItem("expenses");
    } else {
      localStorage.setItem("expenses", JSON.stringify(expenses));
    }

    expListEl.removeChild(liEl);

    updateColor();
  }
});

/* PIE CHART */

const chartCanvas = document.getElementById("chart");

const pieChart = new Chart(chartCanvas, {
  type: "pie",
  data: {
    labels: ["Remaining"].concat([...expenses.map((expense) => expense[0])]),
    datasets: [
      {
        label: "Amount",
        data: [Number(remainBal.innerText)].concat([
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

function addDataToChart(chart, label, newData) {
  chart.data.labels.shift();
  chart.data.labels.unshift("Remaining");
  chart.data.datasets[0].data.shift();
  chart.data.datasets[0].data.unshift(Number(remainBal.innerText));
  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(newData);

  chart.update();
}

function deleteFromChart(chart, label, value) {
  let labels = [...chart.data.labels];
  let data = [...chart.data.datasets[0].data];
  labels[0] = "Remaining";
  data[0] = Number(remainBal.innerText);
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

/* GENERATE PDF REPORT */

const genPdfBtn = document.getElementById("genPdfBtn");

genPdfBtn.addEventListener("click", () => {
  if (expenses.length == 0) {
    return;
  }

  const report = new window.jspdf.jsPDF();

  const startX = 10;
  const startY = 20;
  const cellWidth = 40;
  const cellHeight = 10;

  const tableData = expenses.map(expense => [expense[0], String(expense[1])]);
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
    const response = await fetch(`https://api.frankfurter.dev/v2/rate/${to}/${from}`);
    const data = await response.json();
    const rate = data["rate"];
    return rate;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
  }
}

const currncySelectEl = document.getElementById('currencySelect');

const signs = document.querySelectorAll(".currencySign");
const symbols = { "INR": "₹", "USD": "$", "EUR": "€" };

currncySelectEl.addEventListener("input", async (e) => {
  const newCurrency = e.target.value;
  
  let rate = 1;

  if (newCurrency != "INR") {
    rate = await getRate("INR", newCurrency);
  }

  const convertibles =  document.querySelectorAll(".convertible");
  
  convertibles.forEach((conv) => {
    const baseValue = Number(conv.getAttribute("data-baseValue"));
    const converted = baseValue * rate;

    conv.innerText = converted.toFixed(2);
  });

  signs.forEach(s => s.innerText = symbols[newCurrency]);
});