// ── Admin Routes ──────────────────────────────
const express = require('express');
const router = express.Router();
const db = require('../models/db');
const path = require('path');
const { authenticate, adminOnly } = require(path.join(__dirname, '../middleware/auth'));

// GET /api/admin/stats
router.get('/stats', authenticate, adminOnly, async (req, res) => {
  try {
    const [[events]] = await db.execute('SELECT COUNT(*) as total FROM events');
    const [[users]] = await db.execute('SELECT COUNT(*) as total FROM users WHERE role = "mahasiswa"');
    const [[regs]] = await db.execute('SELECT COUNT(*) as total FROM registrations');
    const [[active]] = await db.execute("SELECT COUNT(*) as total FROM events WHERE status='published' AND end_date >= NOW()");
    res.json({
      success: true,
      data: { total_events: events.total, total_mahasiswa: users.total, total_registrasi: regs.total, event_aktif: active.total }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/admin/events
router.get('/events', authenticate, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT e.*, u.name as creator_name FROM events e LEFT JOIN users u ON e.created_by = u.id ORDER BY e.created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/admin/users
router.get('/users', authenticate, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, name, npm, email, faculty, role, is_verified, created_at FROM users ORDER BY created_at DESC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PATCH /api/admin/events/:id/status
router.patch('/events/:id/status', authenticate, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    await db.execute('UPDATE events SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: `Status event diubah ke: ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;