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
  toggleExpInputs(false);
}

if (localStorage.getItem("expenses")) {
  const frag = document.createDocumentFragment();

  expenses = JSON.parse(localStorage.getItem("expenses"));
  let storedExpense = 0;

  expenses.forEach((expense) => {
    const liEl = document.createElement("li");
    liEl.className = "expItem";

    liEl.innerHTML = `<span>${expense[0]}</span> <span>${expense[1]}</span> <button class="deleteItemBtn">Delete</button>`;
    storedExpense += expense[1];

    frag.appendChild(liEl);
  });

  totalExpense = storedExpense;
  expListEl.appendChild(frag);

  remainBal.innerText = `${Number(salaryAmtEl.innerText) - totalExpense}`;
} else {
  remainBal.innerText = `${Number(salaryAmtEl.innerText)}`;
}

// LISTEN & UPDATE FOR SALARY INPUT
salaryInpEl.addEventListener("input", () => {
  let salaryValue = Number(salaryInpEl.value);

  if (salaryValue > 0) {
    salaryAmtEl.innerText = `${salaryValue}`;
    saveSalaryInStorage(salaryValue);
    toggleExpInputs(false);
  } else {
    salaryAmtEl.innerText = `0`;
    deleteSalaryFromStorage();
    toggleExpInputs(true);
  }
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

  const liEl = document.createElement("li");
  liEl.className = "expItem";

  liEl.innerHTML = `<span>${expNameValue}</span> <span>${expAmtValue}</span> <button class="deleteItemBtn">Delete</button>`;

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

expListEl.addEventListener("click", (e) => {
  if (e.target.classList.contains("deleteItemBtn")) {
    const liEl = e.target.closest("li");

    const delExpName = liEl.children[0].innerText;
    const delExpAmt = Number(liEl.children[1].innerText);

    expenses = JSON.parse(localStorage.getItem("expenses"));

    for (let i = 0; i < expenses.length; i++) {
      if (expenses[i][0] == delExpName && expenses[i][1] == delExpAmt) {
        expenses.splice(i, 1);
        break;
      }
    }

    totalExpense -= delExpAmt;

    remainBal.innerText = `${Number(salaryAmtEl.innerText) - totalExpense}`;

    if (expenses.length == 0) {
      localStorage.removeItem("expenses");
    } else {
      localStorage.setItem("expenses", JSON.stringify(expenses));
    }

    expListEl.removeChild(liEl);
  }
});

const chartCanvas = document.getElementById("chart");

console.log(expenses);

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
  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(newData);

  chart.update();
}
