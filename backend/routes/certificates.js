// ── Certificates Routes ───────────────────────
const express = require('express');
const router = express.Router();
const db = require('../models/db');
const PDFDocument = require('pdfkit');
const path = require('path');
const { authenticate, adminOnly } = require(path.join(__dirname, '../middleware/auth'));

function generateCertNumber() {
  const now = new Date();
  return `CERT-UMSU-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}-${Math.floor(Math.random()*900000+100000)}`;
}

// POST /api/certificates/generate/:eventId - Admin generate certs for all attended
router.post('/generate/:eventId', authenticate, adminOnly, async (req, res) => {
  try {
    const [regs] = await db.execute(
      'SELECT r.*, u.name FROM registrations r JOIN users u ON r.user_id = u.id WHERE r.event_id = ? AND r.attended = 1',
      [req.params.eventId]
    );

    let generated = 0;
    for (const reg of regs) {
      const existing = await db.execute('SELECT id FROM certificates WHERE registration_id = ?', [reg.id]);
      if (existing[0].length) continue;

      const certNum = generateCertNumber();
      await db.execute(
        'INSERT INTO certificates (registration_id, user_id, event_id, certificate_number) VALUES (?,?,?,?)',
        [reg.id, reg.user_id, req.params.eventId, certNum]
      );

      await db.execute(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Sertifikat Tersedia!', ?, 'success')`,
        [reg.user_id, `Sertifikat kehadiran Anda sudah tersedia. Nomor: ${certNum}`]
      );
      generated++;
    }

    res.json({ success: true, message: `${generated} sertifikat berhasil digenerate.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/certificates/my - My certificates
router.get('/my', authenticate, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT c.*, e.title as event_title, e.start_date, e.organizer FROM certificates c JOIN events e ON c.event_id = e.id WHERE c.user_id = ? ORDER BY c.issued_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/certificates/:id/download - Download certificate as PDF
router.get('/:id/download', authenticate, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT c.*, u.name as user_name, e.title as event_title, e.start_date, e.organizer FROM certificates c
       JOIN users u ON c.user_id = u.id JOIN events e ON c.event_id = e.id
       WHERE c.id = ? AND c.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Sertifikat tidak ditemukan.' });

    const cert = rows[0];
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=sertifikat-${cert.certificate_number}.pdf`);
    doc.pipe(res);

    // PDF Design
    doc.rect(0, 0, 841, 595).fill('#0B4F8C');
    doc.rect(20, 20, 801, 555).fill('#ffffff');
    doc.rect(30, 30, 781, 535).lineWidth(3).stroke('#F7941D');

    doc.fillColor('#0B4F8C').fontSize(28).font('Helvetica-Bold')
       .text('UNIVERSITAS MUHAMMADIYAH SUMATERA UTARA', 0, 60, { align: 'center' });

    doc.fillColor('#F7941D').fontSize(18).font('Helvetica')
       .text('UMSU EVENT HUB', 0, 95, { align: 'center' });

    doc.fillColor('#333').fontSize(16).font('Helvetica')
       .text('SERTIFIKAT KEHADIRAN', 0, 140, { align: 'center' });

    doc.fillColor('#555').fontSize(12).font('Helvetica')
       .text('Diberikan kepada:', 0, 185, { align: 'center' });

    doc.fillColor('#0B4F8C').fontSize(32).font('Helvetica-Bold')
       .text(cert.user_name, 0, 205, { align: 'center' });

    doc.moveTo(200, 250).lineTo(641, 250).lineWidth(1).stroke('#F7941D');

    doc.fillColor('#333').fontSize(12).font('Helvetica')
       .text('Telah berpartisipasi dalam:', 0, 265, { align: 'center' });

    doc.fillColor('#0B4F8C').fontSize(20).font('Helvetica-Bold')
       .text(cert.event_title, 60, 285, { align: 'center', width: 721 });

    const date = new Date(cert.start_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    doc.fillColor('#555').fontSize(12).font('Helvetica')
       .text(`Diselenggarakan pada: ${date}`, 0, 325, { align: 'center' });

    doc.fillColor('#888').fontSize(10)
       .text(`Nomor Sertifikat: ${cert.certificate_number}`, 0, 460, { align: 'center' });

    doc.fillColor('#888').fontSize(9)
       .text(`Dikeluarkan oleh ${cert.organizer || 'UMSU EVENT HUB'} | ${new Date(cert.issued_at).toLocaleDateString('id-ID')}`, 0, 475, { align: 'center' });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});
module.exports = router;