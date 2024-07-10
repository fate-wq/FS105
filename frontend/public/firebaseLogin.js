// Import necessary Firebase modules
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmailnpx, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
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
     
    }
  });

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

// Function to send password reset email
async function sendPasswordReset(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        console.log('Password reset email sent successfully');
        alert('Password reset email sent successfully. Check your email inbox for further instructions.');
    } catch (error) {
        console.error('Error sending password reset email:', error.message);
        alert('Error sending password reset email: ' + error.message);
    }
}

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

// Event listener for sign-up form submission
const signUpForm = document.querySelector(".sign-up-form");

signUpForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = signUpForm.querySelector('input[name="username"]').value;
    const email = signUpForm.querySelector('input[name="email"]').value;
    const password = signUpForm.querySelector('input[name="password"]').value;

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
        alert(passwordError);
        return;
    }

    try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user data with role
        await storeUserData(user.uid, username, email, 'user');

        console.log('User signed up successfully');
        // Optionally, you may want to redirect the user to a verification page
        // window.location.href = 'verification.html';
    } catch (error) {
        console.error('Error signing up:', error.message);
        alert('Error signing up: ' + error.message);
    }
});

// Function to handle logout
export function logout() {
    signOut(auth).then(() => {
        // Sign-out successful.
        console.log('User signed out');
    }).catch((error) => {
        // An error happened.
        console.error('Error signing out:', error);
        // Optionally, add UI feedback (e.g., show an error message)
        alert('Error signing out. Please try again.');
    });
}
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', logout);
}

