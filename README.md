# BudgetWise

A full-stack monthly expense tracker built with vanilla JavaScript and Firebase — real user accounts, live data sync, and a built-in spending assistant.

## Features

- **Secure authentication** — email/password signup and login via Firebase Authentication, including password reset
- **Real-time data sync** — expenses and budgets stored per-account in Firestore, synced live across sessions
- **Per-month budgets** — set a different budget for each month and track it independently
- **Category breakdown** — visual pie chart plus a click-to-expand list showing exactly which expenses make up each category
- **Monthly history** — see budget vs. actual spend and savings for every past month, not just the current one
- **Built-in spending assistant** — ask natural questions like *"how much did I spend on food"* or *"am I over budget"* and get instant answers, no external API required
- **Toast notifications** — instant feedback on every add, update, and delete
- **Locked-down backend** — Firestore security rules ensure each user can only ever access their own data

## Tech stack

- HTML, CSS, JavaScript (no frameworks)
- Firebase Authentication
- Cloud Firestore
- Chart.js

## Live Demo
https://budgetwise-a2ffa.web.app

## Running locally

1. Clone this repo
2. Create a [Firebase project](https://console.firebase.google.com) with Authentication (Email/Password) and Firestore enabled
3. Paste your Firebase config into `firebase-init.js`
4. Open `index.html` with a local server (e.g. VS Code's Live Server extension)

## Screenshots
<img width="1328" height="638" alt="login page" src="https://github.com/user-attachments/assets/c1594f44-1186-43e6-9a18-0a732ab27798" />
<img width="1345" height="641" alt="Dashboard" src="https://github.com/user-attachments/assets/4eeafe12-f428-4a9a-b672-12437d5e32ee" />
<img width="1352" height="639" alt="Expenses" src="https://github.com/user-attachments/assets/31e2af6d-ca8e-4dea-9e39-bbc3c8786042" />
<img width="1357" height="644" alt="Expense History" src="https://github.com/user-attachments/assets/999460ef-484a-47da-900a-1480833b055f" />

## Author

Built by [Kashaf Noor](https://www.linkedin.com/in/kashaf-noor-129700325/)
