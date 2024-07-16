require('dotenv').config({ path: '/Users/eunice/Library/CloudStorage/GoogleDrive-sofox.kaka@gmail.com/My Drive/1.EUNICE/2.FSD/5. FS105/FS105/.env' });

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_51PTh7q2MEKdQenEdI00THxdyf7gUJqggpG9eDQETeNSd4CfKqMqRKexlulHnUfxdA45DjxzADftnEWweR2Zu6haR00KlqEzdwP');
const { getJobs } = require('./src/controllers/dataController');
const pool = require('./src/config/sql');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const app = express();
const cookieParser = require('cookie-parser');

app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));

console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Pass:', process.env.EMAIL_PASS ? 'Loaded' : 'Not Loaded');

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend/public')));

// MySQL session store options
const sessionStore = new MySQLStore({}, pool);

// Import routes
const dataRoutes = require('./src/routes/dataRoutes');
const authRoutes = require('./src/routes/authRoutes');

// Use routes
app.use('/api', dataRoutes);
app.use('/', authRoutes);

// Configure session middleware
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Generate random password

function generateRandomPassword() {
    return crypto.randomBytes(8).toString('hex'); // 16 characters long
}

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Fetch jobs data and render the index template
app.get('/', async (req, res) => {
    try {
        const jobs = await getJobs(req.query || {}); // Pass query parameters or an empty object
        if (!jobs) {
            throw new Error("No jobs found"); // Handle empty jobs array
        }

        res.render('index', { title: 'WerkPay', jobs });
    } catch (error) {
        console.error("Error rendering index:", error);
        res.status(500).send("Error rendering index page");
    }
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'WerkPay Login' });
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

app.get('/createEMProfile', (req, res) => {
    res.render('createEMProfile', { title: 'Create Employer Profile' });
});


// create the employer account 

app.post('/createEMProfile', async (req, res, next) => {
    const { uen, repComName, nameRep, mobile, email, userRole } = req.body;
    try {
        const [rows] = await pool.query('SELECT COUNT(*) AS count FROM employerProfile');
        const serialNumber = rows[0].count + 1;

        // Generate random password and hash it
        const randomPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
    
        await pool.query(
            'INSERT INTO employerProfile (serialNumber, uenNo, repComName, repName, repMobile, repEmail, repRole, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [serialNumber, uen, repComName, nameRep, mobile, email, userRole, hashedPassword]
        );

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your WerkPay Account Password',
            text: `Hello ${nameRep},\n\nYour WerkPay account has been created.\n\nYour temporary password is: ${randomPassword}\n\nPlease log in and change your password immediately.\n\nThank you,\nWerkPay Team`
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.error('Error sending email:', error);
            }
            console.log('Email sent:', info.response);
        });
    
        res.redirect('/createEMProfile?message=Profile created successfully. Please check your email for the temporary password.');
    } catch (error) {
        console.error('Error creating employer profile:', error);
        next(error);
    }
});

// Authentication function
async function authenticateUser(email, password) {
    const [rows] = await pool.query('SELECT * FROM employerProfile WHERE repEmail = ?', [email]);
    const user = rows[0];
    if (user && await bcrypt.compare(password, user.password)) {
    return user;
    } else {
    return null;
    }
}


// to be commented out, only for eunice testing:

app.post('/loginUser', async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const [employerRows] = await pool.query('SELECT * FROM employerProfile WHERE repEmail = ?', [email]);
        const [jobseekerRows] = await pool.query('SELECT * FROM jobseekerProfile WHERE jobseekerEmail = ?', [email]);

        let user = null;
        let userRole = null;

        if (employerRows.length > 0) {
            user = employerRows[0];
            userRole = user.repRole;
        } else if (jobseekerRows.length > 0) {
            user = jobseekerRows[0];
            userRole = user.jobseekerUserRole;
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        req.session.user = user;
        let redirectUrl = '/jobListing';

        if (userRole === 'Admin') {
            redirectUrl = '/adminDash';
        } else if (userRole === 'Employer') {
            redirectUrl = '/employerDash';
        }

        return res.json({ message: 'Login successful', redirectUrl }); // Send JSON response
    } catch (error) {
        next(error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
