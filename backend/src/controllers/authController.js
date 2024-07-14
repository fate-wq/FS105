const { 
    auth,
    createUserWithEmailAndPassword, 
    sendEmailVerification,
    signInWithEmailAndPassword
} = require('../config/firebase');

let userPassword = null;

class FirebaseAuthController {
    async registerUser(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(422).json({
                email: "Email is required",
                password: "Password is required",
            });
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
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
                    const idToken = await userCredential.user.getIdToken();
                    console.log('Email:', user.emailVerified);

                    // Set the cookie with the idToken
                    res.cookie('access_token', idToken, {
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
            const idToken = await userCredential.user.getIdToken();
            if (idToken) {
                res.cookie('access_token', idToken, {
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