const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const pool = require('../models/db');

// Register a new user
exports.register = async (req, res) => {
    const { username, password, email } = req.body; // Extract data from the request body

    try {
        // Check if the email is already in use by querying the database
        const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) { // If email exists, return error
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Generate a salt for password hashing
        const salt = await bcrypt.genSalt(10);
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert the new user into the database with the hashed password and salt
        const result = await pool.query(
            'INSERT INTO users (username, password_hash, password_salt, email) VALUES ($1, $2, $3, $4) RETURNING id',
            [username, hashedPassword, salt, email]
        );

        // Return success message along with the new user's ID
        res.status(201).json({ userId: result.rows[0].id, message: 'User registered successfully' });
    } catch (err) {
        // If there is an error, send a 500 status code and the error message
        res.status(500).json({ error: err.message });
    }
};

// Login
exports.login = async (req, res) => {
    const { username, email, password } = req.body; // Extract data from the request body

    try {
        // Query the database to find the user either by username or email
        const userQuery = email ? 
            pool.query('SELECT * FROM users WHERE email = $1', [email]) : 
            pool.query('SELECT * FROM users WHERE username = $1', [username]);

        // Wait for the result of the query
        const result = await userQuery;

        // If no user is found, return a 404 error
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract the user data from the query result
        const user = result.rows[0];

        // Compare the hashed password with the one provided by the user
        const isMatch = await bcrypt.compare(password, user.password_hash);

        // If the passwords don't match, return an error
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // If login is successful, create a JWT token with user data
        const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });

        // Return the token and a success message
        res.json({ token, message: 'Login successful' });
    } catch (err) {
        // If there is an error, send a 500 status code and the error message
        res.status(500).json({ error: err.message });
    }
};
