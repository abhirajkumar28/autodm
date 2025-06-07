// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBi05pN0jrYC5iOJCR87yonOylpbAtlDlE",
  authDomain: "auto-dm-cff03.firebaseapp.com",
  projectId: "auto-dm-cff03",
  storageBucket: "auto-dm-cff03.appspot.com", // Fixed storage bucket URL
  messagingSenderId: "151875777601",
  appId: "1:151875777601:web:911d54c808946053e202c0",
  measurementId: "G-N7BV8YQZTQ" // Fixed typo in measurementId
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Optional: Initialize Analytics if you're using it
// const analytics = firebase.analytics();
