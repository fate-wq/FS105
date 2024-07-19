require("dotenv").config();
const { 
    db,
    auth,
    createUserWithEmailAndPassword, 
    sendEmailVerification,
    signInWithEmailAndPassword
} = require('../config/firebase');
const { ref, set } = require('firebase/database');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

let userPassword = null;

function generateJWTToken(userId) {
    return jwt.sign({ userId }, secretKey);
}

class FirebaseAuthController {
    async registerUser(req, res) {
        const { username,email, password } = req.body;
        if (!email || !password) {
            return res.status(422).json({
                email: "Email is required",
                password: "Password is required",
            });
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            const userRef = ref(db, `users/${auth.currentUser.uid}`); // Correct way to get reference
            await set(userRef, {
                email,
                username,
                createdAt: new Date().toISOString()
            });
            userPassword = password; // Store the password temporarily
            const actionCodeSettings = {
                url: `http://localhost:3000/verify-email?email=${encodeURIComponent(email)}&mode=verifyEmail`,
                handleCodeInApp: true,
            };
            
            await sendEmailVerification(auth.currentUser, actionCodeSettings);
            res.status(201).redirect('/registrationSuccess');
        } catch (error) {
            const errorMessage = error.message || "An error occurred while registering user";
            res.status(500).json({ error: errorMessage });
        }
    }

    async verifyEmail(req, res) {
        const { mode, email } = req.query;
        console.log('Verification request received with mode:', mode);
        
        if (mode === 'verifyEmail') {
            console.log('Processing email verification...');
            try {
                // Reload the user to get the latest state
                await auth.currentUser.reload();
                const user = auth.currentUser;

                // Check if the email is verified
                if (user && user.emailVerified) {
                    // User's email is verified, sign them in again to get the idToken
                    const userCredential = await signInWithEmailAndPassword(auth, user.email, userPassword);
                    const userId = userCredential.user.uid; // Get user ID
                    const token = generateJWTToken(userId); // Generate JWT token
                    console.log('Email:', user.emailVerified);

                    // Set the cookie with the idToken
                    res.cookie('access_token', token, {
                        httpOnly: true
                    });
                    res.redirect('/');
                } else {
                    res.status(403).json({ error: 'Email not verified' });
                }
            } catch (error) {
                console.error('Error verifying email:', error);
                res.status(500).json({ error: 'Error verifying email' });
            }
        } else {
            console.error('Invalid verification mode');
            res.status(400).json({ error: 'Invalid verification request' });
        }
    }
    async loginUser(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(422).json({
                email: "Email is required",
                password: "Password is required",
            });
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid; // Get user ID
            const token = generateJWTToken(userId); // Generate JWT token
            if (token) {
                res.cookie('access_token', token, {
                    httpOnly: true
                });
                res.redirect('/');
            } else {
                res.status(500).json({ error: "Internal Server Error" });
            }
        } catch (error) {
            console.error(error);
            const errorMessage = error.message || "An error occurred while logging in";
            res.status(500).json({ error: errorMessage });
        }
    }
}


module.exports = new FirebaseAuthController();