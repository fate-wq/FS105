// Import necessary Firebase modules
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmailnpx, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
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

// Create a Google provider instance
const provider = new GoogleAuthProvider();

// Trigger Google sign-in using popup
signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    // The signed-in user info
    const user = result.user;
    console.log('Signed-in user:', user);
  })
  .catch((error) => {
    // Handle errors here (e.g., user cancels sign-in, error from the provider)
    console.error('Error signing in with Google:', error.message);
  });

// Function to show a popup message
function showPopup(message) {
    // Replace this with your own popup implementation
    alert(message);
  }
  
  // Set up the auth state change listener
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      const displayName = user.displayName || 'User';
      showPopup(`${displayName} is signed in`);
    } else {
      // User is signed out
      showPopup('User is signed out');
    }
  });

// Event listener for forgot password form submission
const forgotPasswordForm = document.querySelector(".forgot-password-form");

forgotPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = forgotPasswordForm.querySelector('input[name="email"]').value;

    try {
        // Send password reset email
        await sendPasswordReset(email);
    } catch (error) {
        console.error('Error processing forgot password request:', error.message);
        alert('Error: ' + error.message);
    }
});

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
