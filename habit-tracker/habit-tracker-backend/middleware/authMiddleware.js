const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.log('Authorization header missing');
        return res.status(401).json({ message: 'auth header missing' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        console.log('No token found');
        return res.status(401).json({ message: 'no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        if (!decoded || !decoded.id) {
            console.log('Token invalid or missing user ID');
            return res.status(401).json({ message: 'Token invalid or missing user ID' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        console.log('Error verifying token:', err.message);
        return res.status(401).json({ message: 'invalid token', error: err.message });
    }
};

module.exports = authMiddleware;