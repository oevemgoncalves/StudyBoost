// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js"; // 🔥 novo

const firebaseConfig = {
    apiKey: "AIzaSyCAT2np1aHpOkhp6XawkaLPCCWA16YB5Zk",
    authDomain: "studyboost-1580e.firebaseapp.com",
    projectId: "studyboost-1580e",
    storageBucket: "studyboost-1580e.appspot.com",
    messagingSenderId: "19586810213",
    appId: "1:19586810213:web:9ac2b8fbdaa8af6165618c",
    measurementId: "G-447MD4J72C"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app); // 🔥 novo

export { auth, db }; // 🔥 exporte o db também
