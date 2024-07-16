require("dotenv").config();
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

function verifyJWTToken(req, res, next) {
    const token = req.cookies.access_token;
    // Allow requests without a token to pass through
    if (!token) {
        req.userId = null;
        return next(); // Move to the next middleware
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to authenticate token' });
        }
        req.userId = decoded.userId; // Store the user ID in the request object
        next();
    });
}

module.exports = verifyJWTToken;
