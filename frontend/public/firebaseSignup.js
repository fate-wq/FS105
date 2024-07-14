// Import necessary Firebase modules
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCyiY1Os2gQqye3mnmynA6aHzPdrp7nV5w",
    authDomain: "fs105-61c8e.firebaseapp.com",
    projectId: "fs105-61c8e",
    storageBucket: "fs105-61c8e.appspot.com",
    messagingSenderId: "1074062677808",
    appId: "1:1074062677808:web:4a45569328d4b89e9f5af5",
    measurementId: "G-EKJEDP6V6D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Function to store user data in Firestore (example)
async function storeUserData(uid, username, email) {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
        username: username,
        email: email
    });
    console.log('User data stored in Firestore');
}

// Function to validate password strength
function validatePassword(password) {
    const minLength = 8;
    const regex = {
        lower: /[a-z]/,
        upper: /[A-Z]/,
        digit: /\d/,
    };

    if (password.length < minLength) {
        return "Password is too short. It should be at least 8 characters long.";
    }
    if (!regex.lower.test(password)) {
        return "Password should contain at least one lowercase letter.";
    }
    if (!regex.upper.test(password)) {
        return "Password should contain at least one uppercase letter.";
    }
    if (!regex.digit.test(password)) {
        return "Password should contain at least one digit.";
    }
    return null;
}


// Event listener for sign-up form submission
const signUpForm = document.querySelector(".sign-up-form");

signUpForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = signUpForm.querySelector('input[name="username"]').value;
    const email = signUpForm.querySelector('input[name="email"]').value;
    const password = signUpForm.querySelector('input[name="password"]').value;

    // Validate password strength
    if (!isValidPassword(password)) {
        console.error('Password does not meet the strength requirements.');
        alert('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character.');
        return;
    }

    try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user data in Firestore
        await storeUserData(user.uid, username, email);

        // Optionally, you may want to redirect the user to a verification page
        // window.location.href = 'verification.html';
    } catch (error) {
        console.error('Error signing up:', error.message);
        alert('Error signing up: ' + error.message);
    }
});
