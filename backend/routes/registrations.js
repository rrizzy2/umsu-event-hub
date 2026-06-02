// ── Registrations Routes ──────────────────────
const express = require('express');
const router = express.Router();
const db = require('../models/db');
const QRCode = require('qrcode');
const path = require('path');
const { authenticate, adminOnly } = require(path.join(__dirname, '../middleware/auth'));

// Generate registration number
function generateRegNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `UMSU-${y}${m}-${rand}`;
}

// POST /api/registrations - Register for event
router.post('/', authenticate, async (req, res) => {
  try {
    const { event_id, name, npm, faculty, email, phone } = req.body;
    if (!event_id) return res.status(400).json({ success: false, message: 'Event ID wajib diisi.' });

    // Check event exists and has quota
    const [events] = await db.execute('SELECT * FROM events WHERE id = ? AND status = "published"', [event_id]);
    if (!events.length) return res.status(404).json({ success: false, message: 'Event tidak ditemukan.' });

    const event = events[0];
    if (event.registered_count >= event.max_quota) {
      return res.status(400).json({ success: false, message: 'Kuota event sudah penuh.' });
    }

    // Check already registered
    const [existing] = await db.execute('SELECT id FROM registrations WHERE user_id = ? AND event_id = ?', [req.user.id, event_id]);
    if (existing.length) return res.status(400).json({ success: false, message: 'Anda sudah terdaftar pada event ini.' });

    const regNumber = generateRegNumber();

    // Generate QR Code
    const qrData = JSON.stringify({ reg: regNumber, user: req.user.id, event: event_id });
    const qrCode = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });

    const [result] = await db.execute(
      `INSERT INTO registrations (user_id, event_id, registration_number, name, npm, faculty, email, phone, qr_code) VALUES (?,?,?,?,?,?,?,?,?)`,
      [req.user.id, event_id, regNumber, name || req.user.name, npm || req.user.npm, faculty || req.user.faculty, email || req.user.email, phone, qrCode]
    );

    // Update registered count
    await db.execute('UPDATE events SET registered_count = registered_count + 1 WHERE id = ?', [event_id]);

    // Create notification
    await db.execute(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'success')`,
      [req.user.id, 'Pendaftaran Berhasil!', `Anda berhasil mendaftar event: ${event.title}. Nomor registrasi: ${regNumber}`]
    );

    res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil!',
      data: { id: result.insertId, registration_number: regNumber, qr_code: qrCode, event }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/registrations/my - My registrations
router.get('/my', authenticate, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT r.*, e.title as event_title, e.start_date, e.end_date, e.location, e.poster_url, e.category, e.is_online
       FROM registrations r JOIN events e ON r.event_id = e.id
       WHERE r.user_id = ? ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/registrations/:id - Get single registration (with ticket)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT r.*, e.title as event_title, e.start_date, e.end_date, e.location, e.poster_url, e.organizer, e.category, e.is_online, e.meeting_link
       FROM registrations r JOIN events e ON r.event_id = e.id
       WHERE r.id = ? AND r.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Registrasi tidak ditemukan.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/registrations/event/:eventId - Admin: list registrations for an event
router.get('/event/:eventId', authenticate, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT r.*, u.avatar FROM registrations r JOIN users u ON r.user_id = u.id WHERE r.event_id = ? ORDER BY r.created_at`,
      [req.params.eventId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PATCH /api/registrations/:id/attend - Admin: mark attendance via QR
router.patch('/:id/attend', authenticate, adminOnly, async (req, res) => {
  try {
    await db.execute('UPDATE registrations SET attended = 1, attended_at = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Kehadiran peserta berhasil dicatat.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/registrations/scan - Scan QR and mark attendance
router.post('/scan', authenticate, adminOnly, async (req, res) => {
  try {
    const { qr_data } = req.body;
    const parsed = JSON.parse(qr_data);
    const [rows] = await db.execute('SELECT * FROM registrations WHERE registration_number = ?', [parsed.reg]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'QR Code tidak valid.' });

    await db.execute('UPDATE registrations SET attended = 1, attended_at = NOW() WHERE id = ?', [rows[0].id]);
    res.json({ success: true, message: 'Kehadiran berhasil dicatat!', data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'QR Code tidak valid.' });
  }
});

module.exports = router;