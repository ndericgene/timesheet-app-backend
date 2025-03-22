const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { verifyToken } = require('../auth/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (username, email, password, role)
       VALUES ($1, $2, $3, $4) RETURNING id, username, email, role`,
      [username, email, hashedPassword, role || 'employee']
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user (by username OR email)
console.log("Login request received:", req.body);
router.post('/login', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const field = username ? 'username' : 'email';
    const value = username || email;

    const userResult = await pool.query(
      `SELECT * FROM users WHERE ${field} = $1`,
      [value]
    );

    const user = userResult.rows[0];

    if (!user || !user.password_hash) {
      console.warn('Login failed: user not found or missing password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.warn('Login failed: invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user's profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, username, email, role FROM users WHERE id = $1',
      [req.user.userId]
    );
    res.json(user.rows[0]);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Unable to fetch profile' });
  }
});

module.exports = router;
