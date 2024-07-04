// Import necessary Firebase modules
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

// Function to check user role
async function checkUserRole(uid) {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
        return userDoc.data().role;
    } else {
        console.error('No such document!');
        return null;
    }
}

// Event listener for employer login form submission
const employerLoginForm = document.querySelector(".employer-login-form");

employerLoginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = employerLoginForm.querySelector('input[name="email"]').value;
    const password = employerLoginForm.querySelector('input[name="password"]').value;

    try {
        // Sign in employer with email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if the logged-in user is an employer
        const role = await checkUserRole(user.uid);
        if (role === 'employer') {
            console.log('Employer logged in successfully');
            // Optionally, redirect to employer dashboard
            // window.location.href = 'employer-dashboard.html';
        } else {
            console.error('User is not an employer');
            alert('You are not authorized to log in as an employer.');
        }
    } catch (error) {
        console.error('Error logging in:', error.message);
        alert('Error logging in: ' + error.message);
    }
});
