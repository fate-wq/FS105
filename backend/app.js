require('dotenv').config({ path: '/Users/eunice/Library/CloudStorage/GoogleDrive-sofox.kaka@gmail.com/My Drive/1.EUNICE/2.FSD/5. FS105/FS105/.env' });

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


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Use secure: true in production
  }));

// Middleware to pass user info to all EJS templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Import routes
const dataRoutes = require('./src/routes/dataRoutes');
const authRoutes = require('./src/routes/authRoutes');


app.use(adminRoutes);


// Use routes
app.use('/api', dataRoutes);
app.use('/', authRoutes);

app.use(verifyJWTToken); // Use the JWT verification middleware

app.use((req, res, next) => {
    res.locals.userId = req.userId; // Pass user ID to EJS templates
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

// Fetch jobs data and render the index template
app.get('/', verifyJWTToken, async (req, res) => {
    try {
        const isLoggedIn = req.userId ? true : false;
        const jobs = await getJobs(req.query || {});
        if (!jobs) {
            throw new Error("No jobs found");
        }

        // Calculate session duration for non-logged-in users
        if (!isLoggedIn && req.session.startTime) {
            const currentTime = new Date();
            const sessionDuration = currentTime - new Date(req.session.startTime);
            const userId = req.sessionID; // Use session ID as user ID for non-logged-in users
            await storeSessionData(userId, req.session.startTime, currentTime, sessionDuration, false);
            console.log(`Session duration for non-logged-in user stored: ${sessionDuration}ms`);
            req.session.startTime = null; // Reset session start time
        }

        console.log(`Rendering index page: ${isLoggedIn ? 'Logged in' : 'Not logged in'}`);
        res.render('index', { title: 'WerkPay', jobs, isLoggedIn });
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

app.get('/cancel', async (req, res) => {
    const { userId, credits } = req.query;

    try {
        // Roll back the credits update
        await pool.query('UPDATE employerCredits SET credits = credits - ? WHERE uenNo = (SELECT uenNo FROM employerProfile WHERE id = ?)', [credits, userId]);
        res.render('cancel', { title: 'Payment Cancelled' });
    } catch (error) {
        console.error('Error handling payment cancellation:', error);
        res.status(500).send('An error occurred while processing your cancellation.');
    }
});


app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('session_cookie_name');
        res.redirect('/');
    });
});

// all the post

app.post('/jobPosting', async (req, res) => {
    const jobData = req.body;
    const user = req.session.user;

    try {
        console.log('Received job posting data:', jobData);

        await pool.query('INSERT INTO jobPostings SET ?', {
            userId: user.id,
            jobTitle: jobData.jobTitle,
            workingLocation: jobData.workingLocation,
            workingHours: jobData.workingHours,
            employmentType: jobData.employmentType,
            workingDaysPerWeek: jobData.workingDaysPerWeek,
            paidBreak: jobData.paidBreak,
            breakDuration: jobData.breakDuration,
            hourlyRate: jobData.hourlyRate,
            flatRate: jobData.flatRate,
            weekdayRate: jobData.weekdayRate,
            weekendRate: jobData.weekendRate,
            workingPeriodDays: jobData.workingPeriodDays,
            dateOfCommencement: jobData.dateOfCommencement,
            jobDescription1: jobData.jobDescription1,
            jobDescription2: jobData.jobDescription2,
            jobDescription3: jobData.jobDescription3,
            jobDescription4: jobData.jobDescription4,
            jobDescription5: jobData.jobDescription5,
            jobRequirement1: jobData.jobRequirement1,
            jobRequirement2: jobData.jobRequirement2,
            jobRequirement3: jobData.jobRequirement3,
        });

        console.log('Job posting inserted into the database');
        res.redirect('/employerDash');
    } catch (error) {
        console.error('Error posting job:', error);
        res.status(500).send('Internal Server Error');
    }
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

// app.post('/create-checkout-session', async (req, res) => {
//     const { quantity, productId } = req.body;

//     // Retrieve the product details based on the productId
//     const product = {
//         id: 1,
//         title: "Yellow Safety Helmet",
//         price: 2300 // Price in cents
//     };

//     try {
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ['card'],
//             line_items: [{
//                 price_data: {
//                     currency: 'sgd',
//                     product_data: {
//                         name: product.title,
//                     },
//                     unit_amount: product.price,
//                 },
//                 quantity: quantity,
//             }],
//             mode: 'payment',
//             success_url: 'https://yourdomain.com/success',
//             cancel_url: 'https://yourdomain.com/cancel',
//         });

//         res.json({ id: session.id });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

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
        // Check employerProfile
        const [employerRows] = await pool.query('SELECT * FROM employerProfile WHERE repEmail = ?', [email]);
        if (employerRows.length > 0) {
            const user = employerRows[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                // Fetch job credits for employer
                const [creditRows] = await pool.query('SELECT credits FROM employerCredits WHERE uenNo = ?', [user.uenNo]);
                const credits = creditRows.length > 0 ? creditRows[0].credits : 0;
                req.session.user = { ...user, credits };
                return res.json({ message: 'Login successful', redirectUrl: '/employerDash' });
            }
        }

        // Check jobseekerProfile
        const [jobseekerRows] = await pool.query('SELECT * FROM jobseekerProfile WHERE jobseekerEmail = ?', [email]);
        if (jobseekerRows.length > 0) {
            const user = jobseekerRows[0];
            const isMatch = await bcrypt.compare(password, user.jobseekerPassword);
            if (isMatch) {
                req.session.user = user;
                return res.json({ message: 'Login successful', redirectUrl: '/jobListing' });
            }
        }

        // If no match found in both tables
        res.status(401).json({ message: 'Invalid email or password' });
    } catch (error) {
        console.error('Error fetching job credits:', error);
        next(error);
    }
});

app.get('/success', async (req, res) => {
    const { session_id, userId, credits } = req.query;

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {
            console.log('Payment successful, retrieving company name for userId:', userId);

            const [companyRows] = await pool.query('SELECT repComName FROM employerProfile WHERE uenNo = ?', [userId]);
            const companyName = companyRows.length > 0 ? companyRows[0].repComName : null;

            console.log('Retrieved company name:', companyName);

            if (companyName) {
                const timestamp = new Date();
                console.log('Inserting into employerCredits:', { userId, credits, companyName, timestamp });
                await pool.query('INSERT INTO employerCredits (uenNo, credits, companyName, timestamp) VALUES (?, ?, ?, ?)', [userId, credits, companyName, timestamp]);
            } else {
                console.error('Company name not found for userId:', userId);
            }

            // Fetch updated user information
            const [userRows] = await pool.query('SELECT * FROM employerProfile WHERE uenNo = ?', [userId]);
            if (userRows.length > 0) {
                const user = userRows[0];
                // Update session user with new credits
                const [creditRows] = await pool.query('SELECT SUM(credits) AS totalCredits FROM employerCredits WHERE uenNo = ?', [user.uenNo]);
                const newCredits = creditRows.length > 0 ? creditRows[0].totalCredits || 0 : 0;
                req.session.user = { ...user, credits: newCredits };
                console.log('Updated session user:', req.session.user);
            }
        }

        res.redirect('/employerDash');
    } catch (error) {
        console.error('Error handling success:', error);
        res.status(500).send('An error occurred while processing your payment.');
    }
});

app.get('/employerDash', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const uenNo = req.session.user.uenNo;
    
    try {
        const [creditRows] = await pool.query('SELECT SUM(credits) AS totalCredits FROM employerCredits WHERE uenNo = ?', [uenNo]);
        const credits = creditRows.length > 0 ? creditRows[0].totalCredits || 0 : 0;

        const [jobCountRows] = await pool.query('SELECT COUNT(*) AS totalJobs FROM jobPostings WHERE userId = ?', [req.session.user.id]);
        const totalJobs = jobCountRows.length > 0 ? jobCountRows[0].totalJobs : 0;

        res.render('employerDash', { 
            user: { ...req.session.user, credits },
            title: 'Employer Dashboard'
        });
    } catch (error) {
        console.error('Error fetching job credits:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/create-checkout-session', async (req, res) => {
    const { userId, credits } = req.body;
    console.log('Received request to create checkout session for userId:', userId, 'with credits:', credits);

    try {
        // Fetch the company name from the database
        const [companyRows] = await pool.query('SELECT repComName FROM employerProfile WHERE uenNo = ?', [userId]);
        const companyName = companyRows.length > 0 ? companyRows[0].repComName : null;

        console.log('Fetched company name:', companyName);

        if (!companyName) {
            return res.status(400).json({ error: 'Company name not found' });
        }

        // Store the credits in the database with the company name
        const timestamp = new Date();
        const [result] = await pool.query('INSERT INTO employerCredits (uenNo, credits, companyName, timestamp) VALUES (?, ?, ?, ?)', [userId, credits, companyName, timestamp]);

        console.log('Credits inserted into the database:', result);

        // Create the Stripe session
        const amount = credits * 50 * 100; // Amount in cents
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'sgd',
                    product_data: {
                        name: `${credits} Job Credits`,
                    },
                    unit_amount: amount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}&userId=${userId}&credits=${credits}`,
            cancel_url: 'http://localhost:3000/cancel',
        });

        console.log('Stripe Session ID:', session.id);
        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/success', async (req, res) => {
    const { session_id, userId, credits } = req.query;

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {
            console.log('Payment successful, retrieving company name for userId:', userId);

            const [companyRows] = await pool.query('SELECT repComName FROM employerProfile WHERE uenNo = ?', [userId]);
            const companyName = companyRows.length > 0 ? companyRows[0].repComName : null;

            console.log('Retrieved company name:', companyName);

            if (companyName) {
                const timestamp = new Date();
                console.log('Inserting into employerCredits:', { userId, credits, companyName, timestamp });
                await pool.query('INSERT INTO employerCredits (uenNo, credits, companyName, timestamp) VALUES (?, ?, ?, ?)', [userId, credits, companyName, timestamp]);
            } else {
                console.error('Company name not found for userId:', userId);
            }

            // Fetch updated user information
            const [userRows] = await pool.query('SELECT * FROM employerProfile WHERE uenNo = ?', [userId]);
            if (userRows.length > 0) {
                const user = userRows[0];
                // Update session user with new credits
                const [creditRows] = await pool.query('SELECT SUM(credits) AS totalCredits FROM employerCredits WHERE uenNo = ?', [user.uenNo]);
                const newCredits = creditRows.length > 0 ? creditRows[0].totalCredits || 0 : 0;
                req.session.user = { ...user, credits: newCredits };
                console.log('Updated session user:', req.session.user);
            }
        }

        res.redirect('/employerDash');
    } catch (error) {
        console.error('Error handling success:', error);
        res.status(500).send('An error occurred while processing your payment.');
    }
});

app.post('/store-credits', async (req, res) => {
    const { userId, credits } = req.body;
    console.log('Received request to store credits for userId:', userId, 'with credits:', credits);

    try {
        // Fetch the company name from the database
        const [companyRows] = await pool.query('SELECT repComName FROM employerProfile WHERE uenNo = ?', [userId]);
        const companyName = companyRows.length > 0 ? companyRows[0].repComName : null;

        console.log('Fetched company name:', companyName);

        if (!companyName) {
            return res.status(400).json({ success: false, error: 'Company name not found' });
        }

        // Store the credits in the database with the company name
        const timestamp = new Date();
        const [result] = await pool.query('INSERT INTO employerCredits (uenNo, credits, companyName, timestamp) VALUES (?, ?, ?, ?)', [userId, credits, companyName, timestamp]);

        console.log('Credits inserted into the database:', result);
        res.json({ success: true });
    } catch (error) {
        console.error('Error storing credits:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return res.sendStatus(400);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Checkout session completed:', session);
            // Fulfill the purchase... (e.g., update credits in the database)
            updateCredits(session);
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.send();
});

async function updateCredits(session) {
    const { client_reference_id, amount_total } = session;
    let creditsToAdd = 0;

    if (amount_total === 25000) {
        creditsToAdd = 5;
    } else if (amount_total === 50000) {
        creditsToAdd = 10;
    } else if (amount_total === 75000) {
        creditsToAdd = 15;
    }

    if (creditsToAdd > 0) {
        try {
            console.log(`Adding ${creditsToAdd} credits to ${client_reference_id}`);
            await pool.query('UPDATE employerCredits SET status = ?, credits = credits + ? WHERE uenNo = ? AND status = ?', ['completed', creditsToAdd, client_reference_id, 'pending']);
        } catch (error) {
            console.error('Error updating credits:', error);
        }
    }
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
