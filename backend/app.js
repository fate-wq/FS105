const express = require('express');
const session = require('express-session');
const adminRoutes = require('./src/routes/adminRoutes');
const path = require('path');
const bodyParser = require('body-parser'); //test
const stripe = require('stripe')('sk_test_51PTh7q2MEKdQenEdI00THxdyf7gUJqggpG9eDQETeNSd4CfKqMqRKexlulHnUfxdA45DjxzADftnEWweR2Zu6haR00KlqEzdwP');
const { getJobs } = require('./src/controllers/dataController');
const verifyJWTToken = require('./src/middleware/auth'); // Import the middleware
const { realtimedb } = require('./src/config/firebaseAdmin'); // Import Firebase Admin configuration

const app = express();
const cookieParser = require('cookie-parser');
require("dotenv").config();

app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Import routes
const dataRoutes = require('./src/routes/dataRoutes');
const authRoutes = require('./src/routes/authRoutes');


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Use secure: true in production
  }));

app.use(adminRoutes);


// Use routes
app.use('/api', dataRoutes);
app.use('/', authRoutes);

app.use(verifyJWTToken); // Use the JWT verification middleware

app.use((req, res, next) => {
    res.locals.userId = req.userId; // Pass user ID to EJS templates
    res.locals.userRole = req.role; // Pass user role to EJS templates
    res.locals.isLoggedIn = !!req.userId; // Set isLoggedIn based on req.userId
    next();
});

// Dummy function to store session data in Firebase
async function storeSessionData(userId, startTime, endTime, duration, isLoggedIn) {
    try {
        const sessionsRef = realtimedb.ref('sessions');
        const userSessionsRef = sessionsRef.child(userId);

        // Push session data based on login status
        if (isLoggedIn) {
            await userSessionsRef.child('logged-in').push({
                startTime: startTime,
                endTime: endTime,
                duration: duration
            });
        } else {
            await userSessionsRef.child('non-logged-in').push({
                startTime: startTime,
                endTime: endTime,
                duration: duration
            });
        }
        console.log(`Session data stored for ${isLoggedIn ? 'logged-in' : 'non-logged-in'} user:`, { userId, startTime, endTime, duration });
    } catch (error) {
        console.error('Error storing session data:', error);
    }
}

// Middleware to track session start time for all users
app.use((req, res, next) => {
    if (!req.session.startTime) {
        req.session.startTime = new Date(); // Set session start time
        console.log("Session started on " + req.session.startTime);
    }
    next();
});


app.get('/', verifyJWTToken, async (req, res) => {
    try {
        const isLoggedIn = !!req.userId;
        const jobs = await getJobs(req.query || {});
        if (!jobs) {
            throw new Error("No jobs found");
        }

        if (!isLoggedIn && req.session.startTime) {
            const currentTime = new Date();
            const sessionDuration = currentTime - new Date(req.session.startTime);
            const userId = req.sessionID;
            await storeSessionData(userId, req.session.startTime, currentTime, sessionDuration, false);
            req.session.startTime = null;
        }

        const userRole = req.role; // Get the user role from the request
        console.log(`Rendering index page: ${isLoggedIn ? 'Logged in' : 'Not logged in'} as ${userRole}`);

        if (userRole === 'employer') {
            res.render('employerDash', { title: 'WerkPay - Employer', jobs, isLoggedIn, userRole });
        } else {
            res.render('index', { title: 'WerkPay', jobs, isLoggedIn, userRole });
        }
    } catch (error) {
        console.error("Error rendering index:", error);
        res.status(500).send("Error rendering index page");
    }
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'WerkPay Login' });
});

// Logout route
app.get('/logout', (req, res) => {
    // Store session end time and duration for logged-in users
    if (req.userId) {
        const currentTime = new Date();
        const sessionDuration = currentTime - new Date(req.session.startTime);
        const userId = req.userId; // Use actual user ID for logged-in users
        storeSessionData(userId, req.session.startTime, currentTime, sessionDuration, true);
        console.log(`Session duration for logged-in user stored: ${sessionDuration}ms`);
    }

    // Clear session data and cookies upon logout
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out.');
        }
        res.locals.userId = null;
        res.locals.isLoggedIn = false;
        res.clearCookie('access_token'); // Clear any token-related cookies
        console.log("User logged out and session destroyed");
        res.redirect('/');
    });
});





app.get('/loginUser', (req, res) => {
    res.render('loginUser', { title: 'Login User' });
});

app.get('/createUserProfile', (req, res) => {
    res.render('createUserProfile', { title: 'Create Profile' });
});

app.get('/welcomeEmployer', (req, res) => {
    res.render('welcomeEmployer', { title: 'Employer Login' });
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

app.get('/stripe', (req, res) => {
    const quantity = parseInt(req.query.quantity);
    const productId = req.query.product;
    const totalAmount = quantity * 23;

    res.render('stripe', {
        title: 'Complete Your Purchase',
        totalAmount: totalAmount,
        quantity: quantity,
        productId: productId
    });
});

app.get('/loginEmployer', (req, res) => {
    res.render('loginEmployer', {
        title: 'Employer Login',
    });
});

app.get('/employerSignUp', (req, res) => {
    res.render('employerSignUp', {
        title: 'Employer SignUp',
    });
});

app.get('/cancel', (req, res) => {
    res.render('cancel', {
        title: 'Payment Cancelled',
    });
});

app.get('/success', async (req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    res.render('success', {
        title: 'Payment Successful',
        amount: session.amount_total / 100,
        currency: session.currency,
    });
});

// all the post

app.post('/jobPosting', (req, res) => {
    const jobData = req.body;
    // Handle the job data, save it to the database, etc.
    console.log(jobData); // For debugging purposes
    // Send a JSON response indicating success
    res.json({ message: 'Job posting received' });
});

app.post('/resume', (req, res) => {
    const resumeData = req.body;
    // Handle the resume data, save it to the database, etc.
    console.log(resumeData); // For debugging purposes
    res.json({ message: 'Resume updated successfully' }); // Send JSON response
});

// stripe payment

const products = [
    {
      id: 1,
      price: 2300 // Price in cents for Stripe (e.g., $23.00)
    },

  ];

  app.post('/create-payment-intent', async (req, res) => {
    const { productId, quantity } = req.body;

    // Find the product by ID
    const product = products.find(p => p.id === parseInt(productId));

    if (!product) {
        return res.status(400).send({ error: 'Invalid product ID' });
    }

    const amount = product.price * quantity;

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card'],
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
    });
});

app.post('/create-checkout-session', async (req, res) => {
    const { quantity, productId } = req.body;

    // Retrieve the product details based on the productId
    const product = {
        id: 1,
        title: "Yellow Safety Helmet",
        price: 2300 // Price in cents
    };

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'sgd',
                    product_data: {
                        name: product.title,
                    },
                    unit_amount: product.price,
                },
                quantity: quantity,
            }],
            mode: 'payment',
            success_url: 'https://yourdomain.com/success',
            cancel_url: 'https://yourdomain.com/cancel',
        });

        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
