// File: santwoo_project/backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;
    // Check for token in Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]; // Get token from "Bearer <token>"

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Add user from payload to request object
            // We are not fetching user from DB here for performance,
            // but you could if you need fresh user data on every request.
            req.user = {
                userId: decoded.userId,
                santwooName: decoded.santwooName
            };
            next();
        } catch (error) {
            console.error('Token verification failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token.' });
    }
};

module.exports = { protect };
