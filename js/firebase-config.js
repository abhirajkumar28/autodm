// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBi05pN0jrYC5iOJCR87yonOylpbAtlDlE",
  authDomain: "",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
