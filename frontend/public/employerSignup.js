// Import necessary Firebase modules
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
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
async function storeUserData(uid, username, email, role) {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
        username: username,
        email: email,
        role: role
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
        special: /[!@#$%^&*(),.?":{}|<>]/
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
    if (!regex.special.test(password)) {
        return "Password should contain at least one special character.";
    }
    return null;
}

// Event listener for employer sign-up form submission
const employerSignUpForm = document.querySelector(".employer-sign-up-form");

employerSignUpForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = employerSignUpForm.querySelector('input[name="username"]').value;
    const email = employerSignUpForm.querySelector('input[name="email"]').value;
    const password = employerSignUpForm.querySelector('input[name="password"]').value;

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
        alert(passwordError);
        return;
    }

    try {
        // Create employer with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store employer data with role
        await storeUserData(user.uid, username, email, 'employer');

        console.log('Employer signed up successfully');
        // Optionally, you may want to redirect the employer to a verification page
        // window.location.href = 'verification.html';
    } catch (error) {
        console.error('Error signing up:', error.message);
        alert('Error signing up: ' + error.message);
    }
});
