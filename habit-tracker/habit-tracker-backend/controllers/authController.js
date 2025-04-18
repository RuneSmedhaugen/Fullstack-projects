const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const pool = require('../models/db');

// Register a new user
exports.register = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // Check if the email is already in use by querying the database
        const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert the new user into the database with the hashed password and salt
        const result = await pool.query(
            'INSERT INTO users (username, password_hash, password_salt, email) VALUES ($1, $2, $3, $4) RETURNING id',
            [username, hashedPassword, salt, email]
        );

        res.status(201).json({ userId: result.rows[0].id, message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Login
exports.login = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const userQuery = email ? 
            pool.query('SELECT * FROM users WHERE email = $1', [email]) : 
            pool.query('SELECT * FROM users WHERE username = $1', [username]);

        const result = await userQuery;

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];

        // Compare the hashed password with the one provided by the user
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Wrong password, try again' });
        }

        // If login is successful, create a JWT token with user data
        const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });

        // Return the token and a success message
        res.json({ token, message: 'Login successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
