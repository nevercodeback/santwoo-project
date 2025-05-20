// File: santwoo_project/backend/routes/authRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Your database connection pool

const router = express.Router();

// --- Input Validation Rules ---
const signupValidationRules = [
    body('firstName').trim().notEmpty().withMessage('First name is required.'),
    body('lastName').trim().notEmpty().withMessage('Last name is required.'),
    body('dateOfBirth').isISO8601().toDate().withMessage('Valid date of birth is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('santwooName').trim().notEmpty().isLength({ min: 3 }).withMessage('SantWoo name must be at least 3 characters long.')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('SantWoo name can only contain letters, numbers, and underscores.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
];

const loginValidationRules = [
    body('emailOrSantwooName').notEmpty().withMessage('Email or SantWoo name is required.'),
    body('password').notEmpty().withMessage('Password is required.')
];

// --- Helper Function to Handle Validation Errors ---
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// --- Route to Check SantWoo Name Availability ---
// GET /api/auth/check-santwooname?name=some_name
router.get('/check-santwooname', async (req, res) => {
    const { name } = req.query;
    if (!name) {
        return res.status(400).json({ message: 'SantWoo name query parameter is required.' });
    }
    try {
        const [rows] = await db.query('SELECT id FROM users WHERE santwoo_name = ?', [name]);
        if (rows.length > 0) {
            return res.status(200).json({ available: false, message: 'SantWoo name is already taken.' });
        }
        return res.status(200).json({ available: true });
    } catch (error) {
        console.error('Error checking SantWoo name:', error);
        res.status(500).json({ message: 'Server error while checking SantWoo name.' });
    }
});


// --- Signup Route ---
// POST /api/auth/signup
router.post('/signup', signupValidationRules, handleValidationErrors, async (req, res) => {
    const { firstName, lastName, dateOfBirth, email, santwooName, password } = req.body;

    try {
        // Check if email or SantWoo name already exists
        const [existingUsers] = await db.query(
            'SELECT email, santwoo_name FROM users WHERE email = ? OR santwoo_name = ?',
            [email, santwooName]
        );

        if (existingUsers.length > 0) {
            const existingEmail = existingUsers.find(u => u.email === email);
            const existingSantwooName = existingUsers.find(u => u.santwoo_name === santwooName);
            if (existingEmail) {
                return res.status(409).json({ message: 'Email already in use.' });
            }
            if (existingSantwooName) {
                return res.status(409).json({ message: 'SantWoo name is already taken.' });
            }
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert new user into the database
        const [result] = await db.query(
            'INSERT INTO users (first_name, last_name, date_of_birth, email, santwoo_name, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, lastName, dateOfBirth, email, santwooName, passwordHash]
        );

        const userId = result.insertId;

        // Generate JWT
        const token = jwt.sign(
            { userId: userId, santwooName: santwooName },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.status(201).json({
            message: 'User created successfully!',
            token,
            userId,
            santwooName
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});

// --- Login Route ---
// POST /api/auth/login
router.post('/login', loginValidationRules, handleValidationErrors, async (req, res) => {
    const { emailOrSantwooName, password } = req.body;

    try {
        // Find user by email or SantWoo name
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ? OR santwoo_name = ?',
            [emailOrSantwooName, emailOrSantwooName]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' }); // User not found
        }

        const user = users[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' }); // Password incorrect
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, santwooName: user.santwoo_name },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Logged in successfully!',
            token,
            userId: user.id,
            santwooName: user.santwoo_name,
            firstName: user.first_name
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

module.exports = router;
