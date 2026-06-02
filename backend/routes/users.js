// ── Users Routes ──────────────────────────────
const express = require('express');
const router = express.Router();
const db = require('../models/db');
const path = require('path');
const { authenticate, adminOnly } = require(path.join(__dirname, '../middleware/auth'));

// GET /api/users/profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, npm, email, phone, faculty, prodi, avatar, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PUT /api/users/profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, faculty, prodi, avatar } = req.body;
    await db.execute(
      'UPDATE users SET name=?, phone=?, faculty=?, prodi=?, avatar=? WHERE id=?',
      [name, phone, faculty, prodi, avatar, req.user.id]
    );
    res.json({ success: true, message: 'Profil berhasil diupdate.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;