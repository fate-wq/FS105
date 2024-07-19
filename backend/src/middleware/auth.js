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

            console.error('Failed to authenticate token', err); // Log the error
            req.userId = null; // Clear the userId if there's an error
            return next(); // Continue processing the request);
        }
        req.userId = decoded.userId; // Store the user ID in the request object
        next();
    });
}

module.exports = verifyJWTToken;
