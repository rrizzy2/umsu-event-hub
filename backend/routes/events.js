// ── Events Routes ─────────────────────────────
const express = require('express');
const router = express.Router();
const db = require('../models/db');
const path = require('path');
const { authenticate, adminOnly } = require(path.join(__dirname, '../middleware/auth'));

// GET /api/events - List events with filters
router.get('/', async (req, res) => {
  try {
    const { category, faculty, search, is_online, price_type, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let where = ["e.status = 'published'"];
    let params = [];

    if (category) { where.push('e.category = ?'); params.push(category); }
    if (faculty) { where.push('e.faculty = ?'); params.push(faculty); }
    if (is_online !== undefined) { where.push('e.is_online = ?'); params.push(is_online); }
    if (price_type === 'free') { where.push('e.price = 0'); }
    if (price_type === 'paid') { where.push('e.price > 0'); }
    if (search) { where.push('(e.title LIKE ? OR e.description LIKE ? OR e.organizer LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [events] = await db.execute(
      `SELECT e.*, u.name as creator_name FROM events e LEFT JOIN users u ON e.created_by = u.id ${whereStr} ORDER BY e.start_date ASC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) as total FROM events e ${whereStr}`, params
    );

    res.json({ success: true, data: events, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/events/stats
router.get('/stats', async (req, res) => {
  try {
    const [[stats]] = await db.execute(`
      SELECT 
        COUNT(*) as total_events,
        SUM(registered_count) as total_peserta,
        SUM(CASE WHEN status='published' AND start_date <= NOW() AND end_date >= NOW() THEN 1 ELSE 0 END) as event_berlangsung,
        SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as event_selesai
      FROM events
    `);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/events/calendar?year=2025&month=8
router.get('/calendar', async (req, res) => {
  try {
    const { year, month } = req.query;
    const [events] = await db.execute(
      `SELECT id, title, start_date, end_date, category, is_online FROM events WHERE status='published' AND YEAR(start_date) = ? AND MONTH(start_date) = ? ORDER BY start_date`,
      [year || new Date().getFullYear(), month || new Date().getMonth() + 1]
    );
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/events/:slug
router.get('/:slug', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT e.*, u.name as creator_name FROM events e LEFT JOIN users u ON e.created_by = u.id WHERE e.slug = ? AND e.status = 'published'`,
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Event tidak ditemukan.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/events - Admin create event
router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { title, description, category, organizer, faculty, poster_url, start_date, end_date, location, maps_url, is_online, meeting_link, price, max_quota, speakers, benefits, requirements, status } = req.body;

    // Generate slug
    const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${slugBase}-${Date.now()}`;

    const [result] = await db.execute(
      `INSERT INTO events (title, slug, description, category, organizer, faculty, poster_url, start_date, end_date, location, maps_url, is_online, meeting_link, price, max_quota, speakers, benefits, requirements, status, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [title, slug, description, category, organizer, faculty, poster_url, start_date, end_date, location, maps_url, is_online ? 1 : 0, meeting_link, price || 0, max_quota || 100, speakers, benefits, requirements, status || 'draft', req.user.id]
    );

    res.status(201).json({ success: true, message: 'Event berhasil dibuat!', id: result.insertId, slug });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PUT /api/events/:id - Admin update event
router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const fields = ['title','description','category','organizer','faculty','poster_url','start_date','end_date','location','maps_url','is_online','meeting_link','price','max_quota','speakers','benefits','requirements','status'];
    const updates = [];
    const values = [];

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(req.body[f]);
      }
    });

    if (!updates.length) return res.status(400).json({ success: false, message: 'Tidak ada data yang diupdate.' });

    values.push(req.params.id);
    await db.execute(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ success: true, message: 'Event berhasil diupdate.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE /api/events/:id - Admin delete event
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await db.execute('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Event berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;