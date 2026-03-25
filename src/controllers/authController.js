const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    console.log("[DEBUG] Register route hit. Expected email and password. Received Body:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            email,
            password: hashedPassword,
        });

        await user.save();

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '30d',
        });

        res.status(201).json({ token, message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '30d',
        });

        res.status(200).json({ token, message: 'Login successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
    }
};

const BlacklistedToken = require('../models/BlacklistedToken');

exports.logout = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];

        const blacklistedToken = new BlacklistedToken({ token });
        await blacklistedToken.save();

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during logout', error: error.message });
    }
};
