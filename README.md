# Expenses: Salary & Expense Tracker

A dynamic, front-end dashboard built for the Prodesk IT Week 2 Internship Assignment. 

This project was built entirely with **Vanilla JavaScript** (no frameworks) and tackles the **Level 3 (Advanced)** requirements. It allows users to track their salary, add expenses, visualize their remaining balance, convert currencies in real-time, and export PDF reports.

👉 **[[Live Demo Link Here](https://prodesk-it-expenses.vercel.app/)]**

---

## 📸 Screenshots

![Expenses Dashboard View](/screenshots/image.png)
*The main dashboard featuring real-time remaining balance, expense list, and Chart.js integration.*

---

## ✨ Features Built (Meeting Assignment Requirements)

### Level 1: Core Logic & DOM Manipulation
*   **Dynamic Inputs:** Form fields for Total Salary, Expense Name, and Expense Amount.
*   **Real-Time Math:** Instantly calculates and displays: `Total Salary - Total Expenses = Remaining Balance`.
*   **Validation:** Prevents users from submitting empty inputs or negative expense amounts.

### Level 2: Data Persistence & UI
*   **LocalStorage Integration:** Salary and expense data are serialized (`JSON.stringify`) and saved to the browser. The dashboard perfectly reconstructs itself upon page refresh.
*   **Delete Functionality:** Users can click "Delete" on any expense, which instantly removes it from the DOM, updates the local storage, recalculates the balance, and updates the pie chart.
*   **Data Visualization:** Integrated **Chart.js** via CDN to render a dynamic Pie Chart showing the ratio of "Remaining Balance" vs. individual expenses.

### Level 3: Advanced APIs & Libraries
*   **Live Currency Converter:** A dropdown allows users to switch between INR (₹), USD ($), and EUR (€). Integrated the **Frankfurter API** to fetch live exchange rates and instantly update all visible numbers and symbols.
*   **PDF Export:** Utilized the **jsPDF** library to generate and download a custom-formatted `manual-table.pdf` report of the user's current expenses and remaining balance.
*   **Budget Alert:** If the "Remaining Balance" drops below 10% of the initial salary, the balance text turns **red** and triggers a browser alert to warn the user.

---

## 🌟 Extra Features & Optimizations (Beyond Requirements)

In addition to the requested features, I implemented several advanced real-world logic patterns:

*   **Localization "Base Value" Pattern:** To make the currency converter mathematically sound, I stored the base values (INR) in HTML `data-baseValue` attributes. This ensures that no matter how many times the user switches currencies, the underlying math remains perfectly accurate without precision loss.
*   **Smart Input Toggling:** The expense inputs and the "Add" button are completely disabled until the user provides a valid initial salary, preventing buggy states where expenses are added to a zero balance.
*   **DOM Performance Optimization:** Used `document.createDocumentFragment()` when reloading the stored expenses list on page load. This minimizes DOM reflows and repaints, a crucial best practice for larger applications.
*   **Dynamic Chart Re-rendering:** When the user switches currencies or deletes an item, the Chart.js instance is dynamically updated (`chart.update()`) instead of destroying and recreating the `<canvas>` element entirely.

---

## 🛠️ Tech Stack

*   **HTML5 & CSS3** (Clean, responsive layout without frameworks)
*   **Vanilla JavaScript** (ES6+, DOM Manipulation, Async/Await)
*   **Chart.js** (Data Visualization)
*   **jsPDF** (PDF Generation)
*   **Frankfurter API** (Live Currency Exchange Rates)

---

## 🚀 Running Locally

If you'd like to clone and run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourdevharsh/expenses.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Expenses
   ```
3. Run this command in terminal:
   ```bash
   npm run dev
   ```
4. Open in browser


Designed and developed by Harsh for Prodesk IT Week 2 Mission.