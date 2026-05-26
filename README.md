# SmartWallet — Personal Finance Dashboard

A minimalist, client-side web application for **personal finance management** built during the summer internship at **ASEM, Faculty of Information Technology and Economic Statistics**.

SmartWallet helps users record their income and expenses, visualize spending by category, and stay on top of a monthly budget — all without a backend, using `localStorage` for persistence.

## Features

* **Transaction Recording** — add income/expense entries with amount, category, date and description.
* **Real-time Balance** — total balance, monthly income and monthly expenses are recomputed on every change.
* **Monthly Budget** — set a budget limit and visually track progress (green / warning / over-budget states).
* **Category Filtering** — filter transactions by All / Income / Expense.
* **Charts** — interactive doughnut chart for expenses by category and a 6-month bar chart for income vs expenses (powered by [Chart.js](https://www.chartjs.org/)).
* **Delete Transactions** — remove entries added by mistake with a confirmation prompt.
* **Local Persistence** — data is stored in the browser via `localStorage`; no server required.
* **Responsive UI** — works on desktop, tablet and mobile resolutions.

## Tech Stack

* **HTML5** — semantic page structure.
* **CSS3** — custom design system with CSS variables, gradients and glassmorphism.
* **JavaScript (ES6+)** — vanilla JS, no frameworks.
* **Chart.js** — data visualization (loaded from CDN).
* **Git & GitHub** — versioning.
* **GitHub Pages** — deployment.

## Project Structure

```
SmartWallet/
├── index.html      # Markup and layout
├── style.css       # Styles, design tokens, responsive rules
├── script.js       # Application logic, storage, charts
└── README.md       # Project documentation
```

## Running Locally

The project requires no build step and no backend.

```bash
git clone https://github.com/mihain007/SmartWallet.git
cd SmartWallet
# Open index.html directly in your browser, or serve it:
python3 -m http.server 8080
# Then visit http://localhost:8080
```

## Live Demo

GitHub Pages: `https://mihain007.github.io/SmartWallet/`

## Team

* **Fediuc Vadim** — Project organization, Trello/Gantt planning, JavaScript application logic.
* **Cheptene Mihai** — Frontend visualizations, charts, QA.

## License

Educational project, ASEM 2026.
