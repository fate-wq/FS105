const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_51PTh7q2MEKdQenEdI00THxdyf7gUJqggpG9eDQETeNSd4CfKqMqRKexlulHnUfxdA45DjxzADftnEWweR2Zu6haR00KlqEzdwP');

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
