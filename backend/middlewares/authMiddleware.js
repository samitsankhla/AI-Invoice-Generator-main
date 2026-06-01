const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        console.log('Verifying token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded:', { id: decoded.id });
        
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            console.log('User not found for decoded ID:', decoded.id);
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        console.log('User found:', { id: user._id, email: user.email });
        req.user = user; // This will have _id field
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

module.exports = { protect };