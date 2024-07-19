const express = require('express');
const db = require('../config/firebase'); // Update with the path to your firebase.js
const { setData, updateUserData, populateUserData } = require('../controllers/dataController');

const router = express.Router();


// Application process route
router.get('/applicationProcess', async (req, res) => {
    const { userId } = req.session;

    try {
        const userData = await getUserData(userId);
        res.render('applicationProcess', { title: 'Application Process', userData });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/applicationProcess', (req, res) => {
    const { availabilityDays } = req.body;
    // Handle the data received from the form
    // Save the data to your database or perform necessary actions
    res.send('Application submitted successfully!');
});


// Additional routes for setting and updating data
router.post('/data', setData);
router.post('/updateProfile', updateUserData);

router.post('/populateData',populateUserData);


module.exports = router;
