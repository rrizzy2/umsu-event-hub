const express = require('express');
const router = express.Router();
const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, npm, email, password, faculty, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.execute(
      'INSERT INTO users (name, npm, email, password, faculty, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [name, npm, email, hashedPassword, faculty, phone]
    );
    
    const token = jwt.sign({ id: result.insertId, role: 'mahasiswa' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ success: true, token, user: { id: result.insertId, name, email, role: 'mahasiswa' } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ? OR npm = ?', [email, email]);
    
    if (!rows.length) return res.status(400).json({ success: false, message: 'User tidak ditemukan.' });
    
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Password salah.' });
    
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role, npm: user.npm, faculty: user.faculty } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;