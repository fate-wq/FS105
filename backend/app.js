const express = require('express');
const path = require('path');

const app = express();
const cookieParser = require('cookie-parser');
require("dotenv").config();

app.use(express.json())
app.use(cookieParser())

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Import routes
const dataRoutes = require('./src/routes/dataRoutes');

// Use routes
app.use('/api', dataRoutes);

app.get('/', (req, res) => {
    res.render('index', { title: 'WerkPay' });
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.get('/loginUser', (req, res) => {
    res.render('loginUser', { title: 'Login User' });
});


app.get('/createUserProfile', (req, res) => {
    res.render('createUserProfile', { title: 'Create Profile' });
});

app.get('/createEMProfile', (req, res) => {
    res.render('createEMProfile', { title: 'Create Employer Profile' });
});

app.get('/updateProfile', (req, res) => {
    res.render('updateProfile', { title: 'Update Profile' });
});

app.get('/jobPosting', (req, res) => {
    res.render('jobPosting', { title: 'Job Posting' });
});

app.get('/jobListing', (req, res) => {
    res.render('jobListing', { title: 'Job Listing' });
});

app.get('/jobApplication', (req, res) => {
    res.render('jobApplication', { title: 'Job Applied' });
});

app.get('/jobAccepted', (req, res) => {
    res.render('jobAccepted', { title: 'Job Accepted' });
});

app.get('/jobBlacklisted', (req, res) => {
    res.render('jobBlacklisted', { title: 'Job Blacklisted' });
});

app.get('/attendance', (req, res) => {
    res.render('attendance', { title: 'Attendance Clocking' });
});

app.get('/eWallet', (req, res) => {
    res.render('eWallet', { title: 'eWallet' });
});

app.get('/ePay', (req, res) => {
    res.render('ePay', { title: 'ePay' });
});

app.get('/eTrans', (req, res) => {
    res.render('eTrans', { title: 'eTransactions' });
});

app.get('/eCurrency', (req, res) => {
    res.render('eCurrency', { title: 'eCurrency' });
});

app.get('/employerDash', (req, res) => {
    res.render('employerDash', { title: 'Employer Dashboard' });
});

app.get('/jobCredit', (req, res) => {
    res.render('jobCredit', { title: 'Purchase Job Credit' });
});

app.get('/paymentApproval', (req, res) => {
    res.render('paymentApproval', { title: 'Payments Approval' });
});

app.get('/liveJob', (req, res) => {
    res.render('liveJob', { title: 'Live Job' });
});

app.get('/completedJob', (req, res) => {
    res.render('completedJob', { title: 'Completed Job' });
});

app.get('/jobPosted', (req, res) => {
    res.render('jobPosted', { title: 'Total Job Posted' });
});

app.get('/applicationReview', (req, res) => {
    res.render('applicationReview', { title: 'Application Processed' });
});

app.get('/adminDash', (req, res) => {
    res.render('adminDash', { title: 'Admin Dashboard' });
});

app.get('/paymentProcess', (req, res) => {
    res.render('paymentProcess', { title: 'Process of Payment' });
});

app.get('/allJobPosted', (req, res) => {
    res.render('allJobPosted', { title: 'Management of Job Ads' });
});

app.get('/allUEN', (req, res) => {
    res.render('allUEN', { title: 'Management of UENs' });
});

app.get('/allEmployer', (req, res) => {
    res.render('allEmployer', { title: 'Management of Employer' });
});

app.get('/allJobseeker', (req, res) => {
    res.render('allJobseeker', { title: 'Management of Jobseeker' });
});

app.get('/resume', (req, res) => {
    res.render('resume', { title: 'Update Resume' });
});

app.get('/shop', (req, res) => {
    res.render('shop', { title: 'Shop' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
