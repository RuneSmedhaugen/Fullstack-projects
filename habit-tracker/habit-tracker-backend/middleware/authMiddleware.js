const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({message: 'auth header missing'});
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({message: 'no token'});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: 'Token invalid or missing user ID' });
        }

        req.user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({message: 'invalid token', error: err.message});
    }
};

module.exports = authMiddleware;