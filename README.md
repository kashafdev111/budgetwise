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
 *Coming soon*

## Running locally

1. Clone this repo
2. Create a [Firebase project](https://console.firebase.google.com) with Authentication (Email/Password) and Firestore enabled
3. Paste your Firebase config into `firebase-init.js`
4. Open `index.html` with a local server (e.g. VS Code's Live Server extension)

## Screenshots

*(Add a few screenshots here — Dashboard, Add Expense, History, and the chatbot open)*

## Author

Built by [Kashaf Noor](https://www.linkedin.com/in/kashaf-noor-129700325/)
