// ============================================
// UMSU EVENT HUB - Main Server
// Express.js + MySQL + JWT
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// ── SISTEM PELACAK OTOMATIS BERKAS MIDDLEWARE ──
const lokasiMiddleware = path.join(__dirname, 'middleware', 'auth.js');
console.log("\n=============================================");
console.log("🔍 ALAMAT YANG DICARI NODE.JS:");
console.log("👉", lokasiMiddleware);
console.log("Apakah file tersebut beneran ada di sana?");
console.log(fs.existsSync(lokasiMiddleware) ? "✅ ADA! (Aman)" : "❌ TIDAK ADA! (Ini Penyebab Errornya)");
console.log("=============================================\n");

// ── Middleware Express ────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Deklarasi Impor Rute (Hanya Boleh Sekali) ─
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const notifRoutes = require('./routes/notifications');
const certRoutes = require('./routes/certificates');

// ── Penggunaan Rute API ───────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notifRoutes);
app.use('/api/certificates', certRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'UMSU EVENT HUB API is running', version: '1.0.0' });
});

// ── 404 Handler ───────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Error Handler ─────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ── Start Server ──────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 UMSU EVENT HUB API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;