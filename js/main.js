// ============================================
// UMSU EVENT HUB - Main JavaScript
// API Base: http://localhost:5000/api
// ============================================

const API_BASE = 'http://localhost:5000/api';

// ── State ─────────────────────────────────────
let currentUser = null;
let events = [];
let filters = { category: '', faculty: '', search: '', price_type: '', is_online: '' };
let currentPage = 1;

// ── Sample data (for demo without backend) ────
const DEMO_EVENTS = [
  {
    id: 1, title: 'Seminar Nasional Kecerdasan Buatan 2026',
    slug: 'seminar-nasional-kecerdasan-buatan-2026',
    description: 'Seminar nasional membahas perkembangan AI dan penerapannya di industri modern. Dihadiri oleh pakar AI terkemuka dari berbagai universitas dan perusahaan teknologi terkemuka di Indonesia.',
    category: 'seminar', organizer: 'Himpunan Mahasiswa Teknik Informatika UMSU', faculty: 'Teknik',
    start_date: '2026-08-15T08:00:00', end_date: '2026-08-15T17:00:00',
    location: 'Aula Utama Gedung Rektorat UMSU, Medan', is_online: 0, price: 0,
    max_quota: 300, registered_count: 247, status: 'published',
    speakers: 'Dr. Irwansyah, M.Kom|Prof. Ahmad Syukri, Ph.D|Rizky Pratama (Google Indonesia)',
    benefits: 'Sertifikat Nasional|Networking dengan profesional|Materi eksklusif|Makan siang gratis',
    maps_url: 'https://maps.google.com',
    poster_url: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600&q=80'
  },
  {
    id: 2, title: 'Workshop Full Stack Web Development',
    slug: 'workshop-fullstack-web-development',
    description: 'Workshop intensif 2 hari mempelajari HTML, CSS, JavaScript, React, Node.js, dan deployment ke cloud. Cocok untuk mahasiswa yang ingin terjun ke dunia web development profesional.',
    category: 'workshop', organizer: 'UKM Coding UMSU', faculty: 'Teknik',
    start_date: '2026-08-20T08:00:00', end_date: '2026-08-21T17:00:00',
    location: 'Lab Komputer Fakultas Teknik UMSU', is_online: 0, price: 150000,
    max_quota: 50, registered_count: 38, status: 'published',
    speakers: 'Fajar Nugroho, S.Kom (Senior Dev Tokopedia)|Andi Wijaya (Tech Lead Gojek)',
    benefits: 'Sertifikat kelulusan|Project portfolio|Akses materi seumur hidup|Mentoring 1 bulan',
    maps_url: 'https://maps.google.com',
    poster_url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&q=80'
  },
  {
    id: 3, title: 'Webinar Peluang Karir di Era Digital',
    slug: 'webinar-peluang-karir-era-digital',
    description: 'Webinar online membahas peluang karir di bidang teknologi, bisnis digital, dan kreator konten di era Industry 4.0. Gratis untuk semua mahasiswa UMSU.',
    category: 'webinar', organizer: 'BEM Universitas UMSU', faculty: 'Semua Fakultas',
    start_date: '2026-08-25T13:00:00', end_date: '2026-08-25T15:00:00',
    location: 'Online via Zoom', is_online: 1, price: 0,
    max_quota: 500, registered_count: 312, status: 'published',
    speakers: 'Desi Hartati (HRD Manager Shopee)|Bagas Pratama (Content Creator 1M subs)',
    benefits: 'E-sertifikat|Rekaman webinar|E-book gratis',
    meeting_link: 'https://zoom.us/meeting/umsu',
    poster_url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&q=80'
  },
  {
    id: 4, title: 'Kompetisi Desain Grafis UMSU 2026',
    slug: 'kompetisi-desain-grafis-umsu-2026',
    description: 'Kompetisi desain grafis tingkat universitas dengan tema Inovasi untuk Indonesia. Total hadiah Rp 10.000.000 untuk 3 pemenang terbaik.',
    category: 'kompetisi', organizer: 'DKV UMSU & UKM Desain', faculty: 'FISIP',
    start_date: '2026-09-01T08:00:00', end_date: '2026-09-30T17:00:00',
    location: 'Gedung Serbaguna UMSU', is_online: 0, price: 50000,
    max_quota: 200, registered_count: 89, status: 'published',
    speakers: 'Juri: Drs. Hendra Saputra, M.Sn|Ahmad Rizki (Creative Director)',
    benefits: 'Total hadiah Rp 10 juta|Sertifikat kompetisi|Pameran karya|Exposure ke industri',
    poster_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80'
  },
  {
    id: 5, title: 'Festival Seni dan Budaya UMSU 2026',
    slug: 'festival-seni-budaya-umsu-2026',
    description: 'Festival tahunan UMSU menampilkan pertunjukan seni, pameran budaya, dan lomba-lomba seni dari seluruh fakultas. Acara terbuka untuk umum.',
    category: 'festival', organizer: 'UKM Seni UMSU', faculty: 'Semua Fakultas',
    start_date: '2026-09-10T09:00:00', end_date: '2026-09-12T21:00:00',
    location: 'Lapangan Utama Kampus UMSU', is_online: 0, price: 0,
    max_quota: 1000, registered_count: 456, status: 'published',
    benefits: 'Hiburan gratis|Bazaar mahasiswa|Pameran budaya|Pertunjukan malam',
    poster_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80'
  },
  {
    id: 6, title: 'Pelatihan Public Speaking & Leadership',
    slug: 'pelatihan-public-speaking-leadership',
    description: 'Pelatihan intensif untuk meningkatkan kemampuan berbicara di depan umum dan kepemimpinan bagi mahasiswa UMSU.',
    category: 'pelatihan', organizer: 'LDK UMSU', faculty: 'Semua Fakultas',
    start_date: '2026-08-28T08:00:00', end_date: '2026-08-29T17:00:00',
    location: 'Ruang Seminar Lt.3 Gedung A UMSU', is_online: 0, price: 75000,
    max_quota: 80, registered_count: 65, status: 'published',
    speakers: 'Dr. Hasanuddin, M.Pd|Coach Rini Wulandari (Leadership Trainer)',
    benefits: 'Sertifikat pelatihan|Buku panduan|Mentoring|Makan siang 2 hari',
    poster_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80'
  }
];

const DEMO_STATS = { total_events: 24, total_peserta: 3847, event_berlangsung: 6, event_selesai: 18 };

// ── API Helper ────────────────────────────────
async function apiCall(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('umsu_token');
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, opts);
    return await res.json();
  } catch {
    return null; // Fallback to demo mode
  }
}

// ── Auth Functions ────────────────────────────
function getToken() { return localStorage.getItem('umsu_token'); }
function saveAuth(token, user) {
  localStorage.setItem('umsu_token', token);
  localStorage.setItem('umsu_user', JSON.stringify(user));
  currentUser = user;
}
function clearAuth() {
  localStorage.removeItem('umsu_token');
  localStorage.removeItem('umsu_user');
  currentUser = null;
}
function loadStoredUser() {
  const stored = localStorage.getItem('umsu_user');
  if (stored) currentUser = JSON.parse(stored);
}

// ── Toast Notifications ───────────────────────
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
  const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#0B4F8C' };
  const toast = document.createElement('div');
  toast.className = `toast-msg ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type]}" style="color:${colors[type]}"></i><span>${message}</span><i class="fas fa-times ms-auto" style="cursor:pointer;color:#999" onclick="this.parentElement.remove()"></i>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.remove(), 300); }, duration);
}

// ── Category Config ───────────────────────────
const CATEGORIES = {
  seminar: { label: 'Seminar', icon: 'fa-chalkboard-teacher', color: '#0B4F8C' },
  workshop: { label: 'Workshop', icon: 'fa-tools', color: '#F7941D' },
  kompetisi: { label: 'Kompetisi', icon: 'fa-trophy', color: '#ef4444' },
  webinar: { label: 'Webinar', icon: 'fa-video', color: '#6366f1' },
  pelatihan: { label: 'Pelatihan', icon: 'fa-graduation-cap', color: '#10b981' },
  festival: { label: 'Festival', icon: 'fa-music', color: '#ec4899' },
  organisasi: { label: 'Organisasi', icon: 'fa-users', color: '#f59e0b' },
  karir: { label: 'Karir & Magang', icon: 'fa-briefcase', color: '#8b5cf6' }
};

// ── Format Helpers ────────────────────────────
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function formatDateShort(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}
function formatPrice(price) {
  if (!price || price == 0) return '<span class="event-price free"><i class="fas fa-tag me-1"></i>GRATIS</span>';
  return `<span class="event-price">Rp ${Number(price).toLocaleString('id-ID')}</span>`;
}
function formatQuota(reg, max) {
  const pct = Math.min((reg / max) * 100, 100);
  const remaining = max - reg;
  return `<div class="event-quota">
    <div>${remaining > 0 ? remaining + ' kursi tersisa' : 'PENUH'}</div>
    <div class="quota-bar"><div class="quota-fill" style="width:${pct}%"></div></div>
  </div>`;
}

// ── Event Card Renderer ───────────────────────
function renderEventCard(event) {
  const cat = CATEGORIES[event.category] || { label: event.category, icon: 'fa-calendar', color: '#0B4F8C' };
  const imgUrl = event.poster_url || `https://images.unsplash.com/photo-1523580846011?w=600&q=60`;
  return `
    <div class="col-lg-4 col-md-6 mb-4" data-aos="fade-up">
      <div class="event-card h-100" onclick="openEventDetail(${event.id})">
        <div class="event-card-img">
          <img src="${imgUrl}" alt="${event.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1523580846011?w=600&q=60'">
          <span class="event-badge" style="background:${cat.color};color:white"><i class="fas ${cat.icon} me-1"></i>${cat.label}</span>
          <span class="event-type">${event.is_online ? '<i class="fas fa-wifi me-1"></i>Online' : '<i class="fas fa-map-marker-alt me-1"></i>Offline'}</span>
        </div>
        <div class="event-card-body">
          <div class="event-card-organizer"><i class="fas fa-building me-1"></i>${event.organizer || 'UMSU'}</div>
          <div class="event-card-title">${event.title}</div>
          <div class="event-meta">
            <div class="event-meta-item"><i class="fas fa-calendar"></i>${formatDateShort(event.start_date)}</div>
            <div class="event-meta-item"><i class="fas fa-clock"></i>${formatTime(event.start_date)} - ${formatTime(event.end_date)}</div>
            <div class="event-meta-item"><i class="fas fa-map-marker-alt"></i><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px">${event.location}</span></div>
          </div>
          <div class="event-card-footer">
            <div>
              ${formatPrice(event.price)}
              ${formatQuota(event.registered_count, event.max_quota)}
            </div>
            <a href="#" class="btn-detail" onclick="event.stopPropagation();openEventDetail(${event.id})"><i class="fas fa-arrow-right me-1"></i>Detail</a>
          </div>
        </div>
      </div>
    </div>`;
}

// ── Load & Render Events ──────────────────────
async function loadEvents() {
  const grid = document.getElementById('events-grid');
  const loading = document.getElementById('events-loading');
  const empty = document.getElementById('events-empty');
  if (!grid) return;

  if (loading) loading.style.display = 'block';
  grid.innerHTML = '';

  // Try API first, fallback to demo
  let eventsData = DEMO_EVENTS;
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.faculty) params.append('faculty', filters.faculty);
  if (filters.search) params.append('search', filters.search);
  if (filters.price_type) params.append('price_type', filters.price_type);
  params.append('page', currentPage);

  const res = await apiCall(`/events?${params}`);
  if (res && res.success) eventsData = res.data;
  else {
    // Filter demo data locally
    eventsData = DEMO_EVENTS.filter(e => {
      if (filters.category && e.category !== filters.category) return false;
      if (filters.faculty && e.faculty !== filters.faculty) return false;
      if (filters.search && !e.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.price_type === 'free' && e.price > 0) return false;
      if (filters.price_type === 'paid' && e.price == 0) return false;
      return true;
    });
  }

  if (loading) loading.style.display = 'none';

  if (!eventsData.length) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  events = eventsData;
  grid.innerHTML = eventsData.map(renderEventCard).join('');
  if (window.AOS) AOS.refresh();
}

// ── Event Detail Modal ────────────────────────
async function openEventDetail(eventId) {
  const event = events.find(e => e.id == eventId) || DEMO_EVENTS.find(e => e.id == eventId);
  if (!event) return;

  const speakers = event.speakers ? event.speakers.split('|') : [];
  const benefits = event.benefits ? event.benefits.split('|') : [];
  const imgUrl = event.poster_url || 'https://images.unsplash.com/photo-1523580846011?w=800&q=80';
  const cat = CATEGORIES[event.category] || { label: event.category, icon: 'fa-calendar', color: '#0B4F8C' };

  const modal = document.getElementById('eventDetailModal');
  if (!modal) return;

  modal.querySelector('.modal-event-body').innerHTML = `
    <div class="modal-event-poster"><img src="${imgUrl}" alt="${event.title}" style="width:100%;max-height:300px;object-fit:cover;border-radius:12px"></div>
    
    <div class="d-flex align-items-start gap-3 mb-4">
      <div style="flex:1">
        <span class="badge-status badge-${event.category}" style="margin-bottom:8px"><i class="fas ${cat.icon} me-1"></i>${cat.label}</span>
        <h4 style="font-weight:800;color:var(--navy);margin-bottom:4px">${event.title}</h4>
        <p style="color:var(--orange);font-weight:600;font-size:0.9rem"><i class="fas fa-building me-1"></i>${event.organizer || 'UMSU'}</p>
      </div>
      <div style="text-align:right">
        ${event.price == 0 ? '<div class="badge-status badge-confirmed"><i class="fas fa-tag me-1"></i>GRATIS</div>' : `<div style="font-size:1.3rem;font-weight:800;color:var(--navy)">Rp ${Number(event.price).toLocaleString('id-ID')}</div>`}
      </div>
    </div>

    <div class="event-info-row">
      <div class="event-info-icon"><i class="fas fa-align-left"></i></div>
      <div><strong style="font-size:0.85rem">Deskripsi</strong><p style="font-size:0.85rem;color:var(--gray-600);margin-top:4px;line-height:1.7">${event.description}</p></div>
    </div>
    <div class="event-info-row">
      <div class="event-info-icon"><i class="fas fa-calendar-alt"></i></div>
      <div><strong style="font-size:0.85rem">Tanggal & Waktu</strong>
        <p style="font-size:0.85rem;color:var(--gray-600);margin-top:4px">${formatDate(event.start_date)}<br>${formatTime(event.start_date)} – ${formatTime(event.end_date)} WIB</p>
      </div>
    </div>
    <div class="event-info-row">
      <div class="event-info-icon"><i class="fas fa-map-marker-alt"></i></div>
      <div><strong style="font-size:0.85rem">${event.is_online ? 'Platform Online' : 'Lokasi'}</strong>
        <p style="font-size:0.85rem;color:var(--gray-600);margin-top:4px">${event.location}
        ${event.maps_url ? `<br><a href="${event.maps_url}" target="_blank" style="color:var(--navy);font-size:0.8rem"><i class="fas fa-external-link-alt me-1"></i>Buka di Google Maps</a>` : ''}
        ${event.meeting_link ? `<br><a href="${event.meeting_link}" target="_blank" style="color:var(--orange);font-size:0.8rem"><i class="fas fa-video me-1"></i>Join Meeting</a>` : ''}</p>
      </div>
    </div>
    <div class="event-info-row">
      <div class="event-info-icon"><i class="fas fa-users"></i></div>
      <div><strong style="font-size:0.85rem">Kuota Peserta</strong>
        <p style="font-size:0.85rem;color:var(--gray-600);margin-top:4px">${event.registered_count} / ${event.max_quota} peserta terdaftar</p>
        <div class="quota-bar" style="width:100%;margin-top:6px"><div class="quota-fill" style="width:${Math.min((event.registered_count/event.max_quota)*100,100)}%"></div></div>
      </div>
    </div>
    ${speakers.length ? `
    <div class="event-info-row">
      <div class="event-info-icon"><i class="fas fa-microphone"></i></div>
      <div><strong style="font-size:0.85rem">Narasumber</strong>
        <ul style="font-size:0.85rem;color:var(--gray-600);margin-top:4px;padding-left:16px">${speakers.map(s => `<li>${s}</li>`).join('')}</ul>
      </div>
    </div>` : ''}
    ${benefits.length ? `
    <div class="event-info-row">
      <div class="event-info-icon"><i class="fas fa-gift"></i></div>
      <div><strong style="font-size:0.85rem">Yang Anda Dapatkan</strong>
        <div style="margin-top:8px">${benefits.map(b => `<span class="benefit-tag"><i class="fas fa-check me-1"></i>${b}</span>`).join('')}</div>
      </div>
    </div>` : ''}
  `;

  // Set register button
  const regBtn = modal.querySelector('#btn-register-event');
  if (regBtn) {
    regBtn.dataset.eventId = event.id;
    regBtn.dataset.eventTitle = event.title;
    if (event.registered_count >= event.max_quota) {
      regBtn.textContent = 'Kuota Penuh';
      regBtn.disabled = true;
      regBtn.className = 'btn-submit' + ' opacity-50';
    } else {
      regBtn.disabled = false;
      regBtn.innerHTML = '<i class="fas fa-user-plus me-2"></i>Daftar Sekarang';
      regBtn.className = 'btn-submit';
    }
  }

  const bs = new bootstrap.Modal(modal);
  bs.show();
}

// ── Registration Form ─────────────────────────
async function openRegistrationForm(eventId, eventTitle) {
  const modal = document.getElementById('eventDetailModal');
  if (modal) bootstrap.Modal.getInstance(modal)?.hide();

  if (!currentUser) {
    showToast('Silakan login terlebih dahulu untuk mendaftar!', 'warning');
    setTimeout(() => document.getElementById('btn-login-nav')?.click(), 500);
    return;
  }

  const regModal = document.getElementById('registrationModal');
  if (!regModal) return;

  regModal.querySelector('#reg-event-title').textContent = eventTitle;
  regModal.querySelector('#reg-event-id').value = eventId;
  regModal.querySelector('#reg-name').value = currentUser.name || '';
  regModal.querySelector('#reg-npm').value = currentUser.npm || '';
  regModal.querySelector('#reg-faculty').value = currentUser.faculty || '';
  regModal.querySelector('#reg-email').value = currentUser.email || '';

  new bootstrap.Modal(regModal).show();
}

async function submitRegistration(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type=submit]');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Mendaftar...';
  btn.disabled = true;

  const data = {
    event_id: form.querySelector('#reg-event-id').value,
    name: form.querySelector('#reg-name').value,
    npm: form.querySelector('#reg-npm').value,
    faculty: form.querySelector('#reg-faculty').value,
    email: form.querySelector('#reg-email').value,
    phone: form.querySelector('#reg-phone').value
  };

  const res = await apiCall('/registrations', 'POST', data);

  btn.innerHTML = '<i class="fas fa-user-plus me-2"></i>Daftar Sekarang';
  btn.disabled = false;

  if (res && res.success) {
    bootstrap.Modal.getInstance(document.getElementById('registrationModal'))?.hide();
    showTicket(res.data);
    showToast('Pendaftaran berhasil! Tiket Anda sudah dibuat.', 'success');
  } else {
    // Demo mode: generate local ticket
    const regNum = 'UMSU-' + Date.now();
    const demoTicket = {
      registration_number: regNum,
      name: data.name,
      event_title: DEMO_EVENTS.find(e => e.id == data.event_id)?.title || 'Event UMSU',
      event: DEMO_EVENTS.find(e => e.id == data.event_id),
      qr_code: null
    };
    bootstrap.Modal.getInstance(document.getElementById('registrationModal'))?.hide();
    showTicket(demoTicket);
    showToast('Pendaftaran berhasil! (Demo Mode)', 'success');
  }
}

// ── Show Ticket ───────────────────────────────
function showTicket(data) {
  const modal = document.getElementById('ticketModal');
  if (!modal) return;

  const evt = data.event || DEMO_EVENTS.find(e => e.id == data.event_id) || {};
  const qrUrl = data.qr_code || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.registration_number)}`;

  modal.querySelector('.ticket-content').innerHTML = `
    <div class="ticket-card">
      <div class="ticket-header">
        <div class="logo">UMSU <span>EVENT</span> HUB</div>
        <div style="font-size:0.8rem;opacity:0.7;margin-top:4px">Universitas Muhammadiyah Sumatera Utara</div>
        <div style="font-size:1rem;font-weight:700;margin-top:12px">${data.event_title || evt.title || 'Event UMSU'}</div>
      </div>
      <div class="ticket-body">
        <div class="row g-3">
          <div class="col-6">
            <div style="font-size:0.72rem;color:var(--gray-400);font-weight:700;text-transform:uppercase">Peserta</div>
            <div style="font-weight:700;color:var(--navy)">${data.name}</div>
          </div>
          <div class="col-6">
            <div style="font-size:0.72rem;color:var(--gray-400);font-weight:700;text-transform:uppercase">No. Registrasi</div>
            <div class="reg-num" style="font-size:0.9rem">${data.registration_number}</div>
          </div>
          ${evt.start_date ? `
          <div class="col-6">
            <div style="font-size:0.72rem;color:var(--gray-400);font-weight:700;text-transform:uppercase">Tanggal</div>
            <div style="font-weight:600;font-size:0.85rem;color:var(--gray-800)">${formatDateShort(evt.start_date)}</div>
          </div>
          <div class="col-6">
            <div style="font-size:0.72rem;color:var(--gray-400);font-weight:700;text-transform:uppercase">Waktu</div>
            <div style="font-weight:600;font-size:0.85rem;color:var(--gray-800)">${formatTime(evt.start_date)} WIB</div>
          </div>
          ` : ''}
          ${evt.location ? `
          <div class="col-12">
            <div style="font-size:0.72rem;color:var(--gray-400);font-weight:700;text-transform:uppercase">Lokasi</div>
            <div style="font-weight:600;font-size:0.85rem;color:var(--gray-800)">${evt.location}</div>
          </div>
          ` : ''}
        </div>
        <div class="ticket-divider">
          <div class="ticket-circle left"></div>
          <div class="ticket-line"></div>
          <div class="ticket-circle right"></div>
        </div>
      </div>
      <div class="ticket-qr">
        <img src="${qrUrl}" alt="QR Code" style="width:150px;height:150px">
        <div style="font-size:0.75rem;color:var(--gray-400);margin-top:8px">Tunjukkan QR Code ini saat check-in</div>
        <div style="font-size:0.7rem;color:var(--gray-400);margin-top:4px;font-weight:700">${data.registration_number}</div>
      </div>
    </div>
  `;

  new bootstrap.Modal(modal).show();
}

// ── Auth Handlers ─────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type=submit]');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Masuk...';
  btn.disabled = true;

  const email = form.querySelector('#loginEmail').value;
  const password = form.querySelector('#loginPassword').value;

  const res = await apiCall('/auth/login', 'POST', { email, password });

  if (res && res.success) {
    saveAuth(res.token, res.user);
    updateNavAuth();
    bootstrap.Modal.getInstance(document.getElementById('loginModal'))?.hide();
    showToast(`Selamat datang, ${res.user.name.split(' ')[0]}!`, 'success');
  } else {
    // Demo login
    if ((email === 'admin@umsu.ac.id' || email === 'ADMIN001') && password === 'admin123') {
      const user = { id: 1, name: 'Administrator UMSU', email, role: 'admin', faculty: 'Rektorat' };
      saveAuth('demo_admin_token', user);
      updateNavAuth();
      bootstrap.Modal.getInstance(document.getElementById('loginModal'))?.hide();
      showToast('Login berhasil! (Demo Mode)', 'success');
    } else if (password === 'password123') {
      const user = { id: 2, name: 'Mahasiswa UMSU', email, npm: '2101010001', role: 'mahasiswa', faculty: 'Teknik' };
      saveAuth('demo_user_token', user);
      updateNavAuth();
      bootstrap.Modal.getInstance(document.getElementById('loginModal'))?.hide();
      showToast('Login berhasil! (Demo Mode)', 'success');
    } else {
      form.querySelector('#loginAlert').textContent = res?.message || 'Email/NPM atau password salah.';
      form.querySelector('#loginAlert').classList.remove('d-none');
    }
  }

  btn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Masuk';
  btn.disabled = false;
}

async function handleRegister(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type=submit]');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Mendaftar...';
  btn.disabled = true;

  const data = {
    name: form.querySelector('#regName').value,
    npm: form.querySelector('#regNpm').value,
    email: form.querySelector('#regEmail').value,
    password: form.querySelector('#regPassword').value,
    faculty: form.querySelector('#regFaculty').value,
    phone: form.querySelector('#regPhone').value
  };

  const res = await apiCall('/auth/register', 'POST', data);

  if (res && res.success) {
    saveAuth(res.token, res.user);
    updateNavAuth();
    bootstrap.Modal.getInstance(document.getElementById('registerModal'))?.hide();
    showToast('Registrasi berhasil! Selamat datang di UMSU EVENT HUB!', 'success');
  } else {
    // Demo registration
    const user = { id: Date.now(), name: data.name, email: data.email, npm: data.npm, role: 'mahasiswa', faculty: data.faculty };
    saveAuth('demo_token_' + Date.now(), user);
    updateNavAuth();
    bootstrap.Modal.getInstance(document.getElementById('registerModal'))?.hide();
    showToast('Registrasi berhasil! (Demo Mode)', 'success');
  }

  btn.innerHTML = '<i class="fas fa-user-plus me-2"></i>Daftar Sekarang';
  btn.disabled = false;
}

function handleLogout() {
  clearAuth();
  updateNavAuth();
  showToast('Anda berhasil logout.', 'info');
}

function updateNavAuth() {
  const authBtns = document.getElementById('auth-buttons');
  const userMenu = document.getElementById('user-menu');
  const userNameEl = document.getElementById('nav-user-name');
  const userAvatarEl = document.getElementById('nav-user-avatar');

  if (currentUser) {
    if (authBtns) authBtns.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
    if (userNameEl) userNameEl.textContent = currentUser.name.split(' ')[0];
    if (userAvatarEl) {
      userAvatarEl.textContent = currentUser.name.charAt(0).toUpperCase();
    }
    // Update dashboard link
    const dashLink = document.getElementById('nav-dashboard-link');
    if (dashLink) {
      dashLink.href = currentUser.role === 'admin' ? 'admin.html' : 'dashboard.html';
    }
  } else {
    if (authBtns) authBtns.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
  }
}

// ── Dark Mode Toggle ──────────────────────────
function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('umsu_theme', isDark ? 'light' : 'dark');
  const icon = document.querySelector('.theme-toggle i');
  if (icon) icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
}

function loadTheme() {
  const theme = localStorage.getItem('umsu_theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.querySelector('.theme-toggle i');
  if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ── Stats Counter Animation ────────────────────
async function loadStats() {
  const statsEl = {
    total: document.getElementById('stat-total'),
    peserta: document.getElementById('stat-peserta'),
    berlangsung: document.getElementById('stat-berlangsung'),
    selesai: document.getElementById('stat-selesai')
  };
  if (!statsEl.total) return;

  const res = await apiCall('/events/stats');
  const stats = (res && res.success) ? res.data : DEMO_STATS;

  function animateCount(el, target, duration = 1500) {
    if (!el) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = Math.floor(start).toLocaleString('id-ID');
      if (start >= target) clearInterval(timer);
    }, 16);
  }

  animateCount(statsEl.total, stats.total_events);
  animateCount(statsEl.peserta, stats.total_peserta);
  animateCount(statsEl.berlangsung, stats.event_berlangsung);
  animateCount(statsEl.selesai, stats.event_selesai);
}

// ── Calendar ───────────────────────────────────
let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth();

async function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;

  const monthTitle = document.getElementById('calendar-month-title');
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  if (monthTitle) monthTitle.textContent = `${months[calMonth]} ${calYear}`;

  const res = await apiCall(`/events/calendar?year=${calYear}&month=${calMonth + 1}`);
  const calEvents = (res && res.success) ? res.data : DEMO_EVENTS.filter(e => {
    const d = new Date(e.start_date);
    return d.getFullYear() === calYear && d.getMonth() === calMonth;
  });

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();

  const dayHeaders = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  let html = dayHeaders.map(d => `<div class="cal-header">${d}</div>`).join('');

  // Empty cells for first day
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="cal-day other-month"></div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === d;
    const dayEvents = calEvents.filter(e => new Date(e.start_date).getDate() === d);
    const cat = dayEvents[0] ? (CATEGORIES[dayEvents[0].category] || {color:'#0B4F8C'}) : {};

    html += `<div class="cal-day ${isToday ? 'today' : ''}">
      <div class="cal-day-num">${d}</div>
      ${dayEvents.slice(0, 2).map(e => `<div class="cal-event-dot" style="background:${CATEGORIES[e.category]?.color || '#0B4F8C'}" title="${e.title}">${e.title.substring(0,12)}...</div>`).join('')}
      ${dayEvents.length > 2 ? `<div style="font-size:0.6rem;color:var(--gray-400)">+${dayEvents.length-2} lagi</div>` : ''}
    </div>`;
  }

  grid.innerHTML = html;
}

// ── Search & Filter ───────────────────────────
function applyFilters() {
  filters.category = document.getElementById('filter-category')?.value || '';
  filters.faculty = document.getElementById('filter-faculty')?.value || '';
  filters.price_type = document.getElementById('filter-price')?.value || '';
  filters.is_online = document.getElementById('filter-online')?.value || '';
  currentPage = 1;
  loadEvents();
}

function resetFilters() {
  ['filter-category','filter-faculty','filter-price','filter-online'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  filters = { category: '', faculty: '', search: '', price_type: '', is_online: '' };
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  loadEvents();
}

function searchEvents() {
  filters.search = document.getElementById('search-input')?.value || '';
  currentPage = 1;
  loadEvents();
}

function filterByCategory(cat) {
  filters.category = cat;
  const select = document.getElementById('filter-category');
  if (select) select.value = cat;
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
  event?.target?.classList.add('active');
  loadEvents();
  document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' });
}

// ── Init ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadStoredUser();
  updateNavAuth();

  // Loader
  window.addEventListener('load', () => {
    const loader = document.getElementById('page-loader');
    if (loader) {
      setTimeout(() => { loader.style.opacity = '0'; setTimeout(() => loader.remove(), 500); }, 600);
    }
  });

  // Navbar scroll
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Forms
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
  document.getElementById('registrationForm')?.addEventListener('submit', submitRegistration);

  // Search
  document.getElementById('hero-search-btn')?.addEventListener('click', () => {
    const val = document.getElementById('hero-search-input')?.value || '';
    filters.search = val;
    if (document.getElementById('search-input')) document.getElementById('search-input').value = val;
    loadEvents();
    document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('hero-search-input')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') document.getElementById('hero-search-btn')?.click();
  });

  // Register event button in modal
  document.getElementById('btn-register-event')?.addEventListener('click', function() {
    openRegistrationForm(this.dataset.eventId, this.dataset.eventTitle);
  });

  // Load content
  loadStats();
  loadEvents();
  renderCalendar();
});