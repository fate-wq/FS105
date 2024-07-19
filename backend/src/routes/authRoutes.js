const express = require('express');
const router = express.Router();
const firebaseAuthController = require('../controllers/authController');

// Route for user registration
router.post('/register', firebaseAuthController.registerUser);

router.post('/employerRegister',firebaseAuthController.registerEmployer);

// Route for registration success
router.get('/registrationSuccess', (req, res) => {
    res.render('registrationSuccess');
});

// Route for verifying email after Firebase action
router.get('/verify-email', firebaseAuthController.verifyEmail);

// Route for verifying email after Firebase action
router.get('/verify-email-employer', firebaseAuthController.verifyEmailEmployer);

// Route for user login
router.post('/login', firebaseAuthController.loginUser);

router.post('/employerLogin', firebaseAuthController.loginEmployer);

router.post('/storeEmployerUEN',firebaseAuthController.storeEmployerUEN);

module.exports = router;

