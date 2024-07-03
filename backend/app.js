const express = require('express');
const path = require('path');

const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend/public')));

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
