// Import necessary Firebase modules
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Import getFirestore for Firestore operations

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
const db = getFirestore(app); // Initialize Firestore instance

// Event listener for login form submission
const loginForm = document.querySelector(".login-form");

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = loginForm.querySelector('input[name="email"]').value;
    const password = loginForm.querySelector('input[name="password"]').value;

    try {
        // Sign in user with email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Optionally, you may want to redirect the user to a different page upon successful login
        // window.location.href = 'profile.html';
        
        // Example: Retrieve user data from Firestore after successful login
        // const userDoc = await getDoc(doc(db, 'users', user.uid));
        // console.log('User data from Firestore:', userDoc.data());

        // Display success message to the user
        const successMessage = document.createElement('p');
        successMessage.textContent = 'Login successful!';
        successMessage.style.color = 'green';
        loginForm.appendChild(successMessage);

    } catch (error) {
        console.error('Error signing in:', error.message);
        // Display error message to the user (e.g., through an alert or on the form)
    }
});
