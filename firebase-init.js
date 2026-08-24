// ============================================
// FIREBASE INITIALIZATION
// ============================================
// 1. Go to https://console.firebase.google.com
// 2. Create a project (e.g. "BudgetWise")
// 3. Project Settings > General > "Your apps" > Add app > Web (</> icon)
// 4. Copy the config object Firebase gives you and paste it below
// 5. In the Firebase console, enable:
//    - Authentication > Sign-in method > Email/Password (toggle ON)
//    - Firestore Database > Create database (start in "test mode" for now,
//      we'll lock it down with security rules before you launch anywhere public)
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyCzo-TuU2m3hiTbx8bFHTEiHRBxCmya0cM",
  authDomain: "budgetwise-a2ffa.firebaseapp.com",
  projectId: "budgetwise-a2ffa",
  storageBucket: "budgetwise-a2ffa.firebasestorage.app",
  messagingSenderId: "779660209708",
  appId: "1:779660209708:web:424e4eb3ecfa1ee70e6b89",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
