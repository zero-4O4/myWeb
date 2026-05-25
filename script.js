/* ================================================
   AnimeKu — script.js  (All Phases Complete)
   ================================================ */

// ── Init ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  navigate('home');
});

// ── SPA Navigation ────────────────────────────
function navigate(page, param) {
  const content = document.getElementById('content');
  if (!content) return;

  // Mark active nav
  document.querySelectorAll('.nav-btn, .tnav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.page === page)
  );

  content.classList.remove('fade-up');
  void content.offsetWidth;
  content.classList.add('fade-up');

  switch (page) {
    case 'home':     renderHome();        break;
    case 'jadwal':   renderSchedule();   break;
    case 'search':   renderSearch();     break;
    case 'profile':  renderProfile();    break;
    default: content.innerHTML = '<p style="padding:20px">Halaman tidak ditemukan.</p>';
  }
}

// ── Shared Helpers ────────────────────────────
function $(id) { return document.getElementById(id); }

function skeletonCards(n, cls = '') {
  return Array.from({length: n}, () => `
    <div class="card-skel ${cls}">
      <div class="skeleton ps"></div>
      <div class="skeleton ts"></div>
      <div class="skeleton ms"></div>
    </div>`).join('');
}

function skeletonList(n) {
  return Array.from({length: n}, () => `
    <div class="list-item" style="pointer-events:none;">
      <div class="skeleton" style="width:50px;height:70px;border-radius:8px;flex-shrink:0;"></div>
      <div style="flex:1;">
        <div class="skeleton" style="height:13px;width:75%;margin-bottom:7px;"></div>
        <div class="skeleton" style="height:11px;width:45%;"></div>
      </div>
    </div>`).join('');
}

async function jikan(path) {
  const r = await fetch(`https://api.jikan.moe/v4${path}`);
  const j = await r.json();
  return j.data || [];
}

function animeCard(a, extra = '') {
  const score = a.score ? `⭐ ${a.score}` : '';
  const eps   = a.episodes ? `${a.episodes} ep` : '';
  return `
    <div class="anime-card" onclick="openDetail(${a.mal_id})" ${extra}>
      <img class="poster"
           src="${a.images?.jpg?.image_url || ''}"
           alt="${a.title}"
           loading="lazy"
           onerror="this.style.opacity='0'">
      <div class="card-title">${a.title}</div>
      <div class="card-meta">${[score, eps].filter(Boolean).join(' · ')}</div>
    </div>`;
}

function listItem(a) {
  const score  = a.score    ? `⭐ ${a.score}` : '';
  const eps    = a.episodes ? `${a.episodes} ep` : '';
  const status = a.airing   ? `<span class="badge b-green">Tayang</span>` : '';
  return `
    <div class="list-item" onclick="openDetail(${a.mal_id})">
      <img src="${a.images?.jpg?.image_url || ''}" alt="${a.title}" onerror="this.style.opacity='0'">
      <div class="li-info">
        <div class="li-title">${a.title}</div>
        <div class="li-meta">${[score, eps].filter(Boolean).join(' · ')} ${status}</div>
      </div>
    </div>`;
}

// ════════════════════════════════════════════
// PAGE — HOME
// ════════════════════════════════════════════
function renderHome() {
  const content = $('content');
  content.innerHTML = `
    <!-- Hero Banner -->
    <div class="hero" id="hero">
      <div class="hero-bg" id="heroBg"></div>
      <div class="hero-overlay"></div>
      <div class="hero-content" id="heroContent">
        <div class="skeleton" style="width:90px;height:128px;border-radius:10px;flex-shrink:0;"></div>
        <div style="flex:1;">
          <div class="skeleton" style="height:14px;width:60%;margin-bottom:10px;"></div>
          <div class="skeleton" style="height:20px;width:90%;margin-bottom:8px;"></div>
          <div class="skeleton" style="height:12px;width:50%;margin-bottom:14px;"></div>
          <div style="display:flex;gap:8px;">
            <div class="skeleton" style="height:36px;width:110px;border-radius:10px;"></div>
            <div class="skeleton" style="height:36px;width:90px;border-radius:10px;"></div>
          </div>
        </div>
      </div>
      <div class="hero-dots" id="heroDots"></div>
    </div>

    <!-- Genres -->
    <div class="section" style="margin-top:16px;">
      <div class="genre-wrap" id="genreWrap">
        ${['Action','Romance','Comedy','Drama','Fantasy','Sci-Fi','Horror','Sports','Slice of Life','Mecha']
          .map((g,i) => `<button class="genre-chip" onclick="searchGenre(this,'${g}')">${g}</button>`)
          .join('')}
      </div>
    </div>

    <!-- Sedang Tayang -->
    <div class="section">
      <div class="section-head">
        <span class="section-title">📡 Sedang Tayang</span>
        <button class="see-all" onclick="navigate('search')">Lihat Semua</button>
      </div>
      <div class="hscroll" id="airingList">${skeletonCards(6)}</div>
    </div>

    <!-- Terpopuler -->
    <div class="section">
      <div class="section-head">
        <span class="section-title">🔥 Terpopuler</span>
        <button class="see-all" onclick="navigate('search')">Lihat Semua</button>
      </div>
      <div class="hscroll" id="popularList">${skeletonCards(6)}</div>
    </div>

    <!-- Top Rated -->
    <div class="section">
      <div class="section-head">
        <span class="section-title">🏆 Rating Tertinggi</span>
        <button class="see-all" onclick="navigate('search')">Lihat Semua</button>
      </div>
      <div class="hscroll" id="topList">${skeletonCards(6)}</div>
    </div>
  `;

  loadHomeData();
}

let heroAnimes = [], heroIndex = 0, heroTimer = null;

async function loadHomeData() {
  try {
    // Concurrent fetch — lebih cepat
    const [airing, popular, top] = await Promise.all([
      jikan('/top/anime?filter=airing&limit=12'),
      jikan('/top/anime?filter=bypopularity&limit=12'),
      jikan('/top/anime?limit=12'),
    ]);

    if ($('airingList'))  $('airingList').innerHTML  = airing.map(animeCard).join('');
    if ($('popularList')) $('popularList').innerHTML = popular.map(animeCard).join('');
    if ($('topList'))     $('topList').innerHTML     = top.map(animeCard).join('');

    // Setup hero with airing anime
    heroAnimes = airing.filter(a => a.images?.jpg?.large_image_url);
    heroIndex  = 0;
    clearInterval(heroTimer);
    updateHero();
    heroTimer = setInterval(() => {
      heroIndex = (heroIndex + 1) % Math.min(heroAnimes.length, 5);
      updateHero();
    }, 5000);

  } catch (e) {
    if ($('airingList')) $('airingList').innerHTML =
      '<p style="padding:12px;color:var(--muted);font-size:13px;">⚠️ Gagal memuat. Periksa koneksi.</p>';
  }
}

function updateHero() {
  const a = heroAnimes[heroIndex];
  if (!a) return;

  const bg   = $('heroBg');
  const cont = $('heroContent');
  const dots = $('heroDots');
  if (!bg || !cont) return;

  const img = a.images?.jpg?.large_image_url || a.images?.jpg?.image_url || '';
  bg.style.backgroundImage = `url('${img}')`;

  const genres = (a.genres || []).slice(0,2).map(g =>
    `<span class="badge b-purple">${g.name}</span>`).join('');
  const score  = a.score ? `⭐ ${a.score}` : '';
  const eps    = a.episodes ? `${a.episodes} ep` : '';

  cont.innerHTML = `
    <img class="hero-poster" src="${a.images?.jpg?.image_url || ''}" alt="${a.title}">
    <div class="hero-info">
      <div class="hero-badges">
        ${a.airing ? '<span class="badge b-green">▶ Tayang</span>' : ''}
        ${genres}
      </div>
      <div class="hero-title">${a.title}</div>
      <div class="hero-meta">${[score, eps, a.type].filter(Boolean).join(' · ')}</div>
      <div class="hero-btns">
        <button class="btn btn-primary btn-sm" onclick="openDetail(${a.mal_id})">
          ▶ Detail
        </button>
        <button class="btn btn-outline btn-sm" onclick="toggleWatchlist(${a.mal_id},'${escHtml(a.title)}','${a.images?.jpg?.image_url || ''}')">
          ${isInWatchlist(a.mal_id) ? '✓ Tersimpan' : '+ Simpan'}
        </button>
      </div>
    </div>`;

  // Update dots
  if (dots) {
    dots.innerHTML = heroAnimes.slice(0, 5).map((_, i) =>
      `<button class="hero-dot ${i === heroIndex ? 'active' : ''}" onclick="goHero(${i})"></button>`
    ).join('');
  }
}

function goHero(i) {
  heroIndex = i;
  clearInterval(heroTimer);
  updateHero();
  heroTimer = setInterval(() => {
    heroIndex = (heroIndex + 1) % Math.min(heroAnimes.length, 5);
    updateHero();
  }, 5000);
}

// ════════════════════════════════════════════
// PAGE — JADWAL
// ════════════════════════════════════════════
const DAYS_ID = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const DAYS_EN = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
let currentDay = new Date().getDay();

function renderSchedule() {
  const content = $('content');
  content.innerHTML = `
    <div class="page-head">
      <span class="ph-title">📅 Jadwal Tayang</span>
    </div>
    <div class="day-tabs" id="dayTabs">
      ${DAYS_ID.map((d, i) => `
        <button class="day-tab ${i === currentDay ? 'active' : ''}"
                onclick="switchDay(${i}, this)">${d}</button>
      `).join('')}
    </div>
    <div class="box" id="scheduleList" style="margin-top:12px;">
      ${skeletonList(6)}
    </div>`;

  loadScheduleDay(currentDay);
}

function switchDay(idx, btn) {
  currentDay = idx;
  document.querySelectorAll('.day-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if ($('scheduleList')) $('scheduleList').innerHTML = skeletonList(6);
  loadScheduleDay(idx);
}

async function loadScheduleDay(idx) {
  try {
    const data = await jikan(`/schedules?filter=${DAYS_EN[idx]}&limit=25`);
    const el   = $('scheduleList');
    if (!el) return;
    if (!data.length) { el.innerHTML = '<p style="padding:12px;color:var(--muted);font-size:13px;">Tidak ada jadwal hari ini.</p>'; return; }
    el.innerHTML = data.map(listItem).join('');
  } catch (e) {
    if ($('scheduleList')) $('scheduleList').innerHTML =
      '<p style="padding:12px;color:var(--muted);font-size:13px;">⚠️ Gagal memuat jadwal.</p>';
  }
}

// ════════════════════════════════════════════
// PAGE — SEARCH
// ════════════════════════════════════════════
const GENRES = [
  {id:1,name:'Action'},{id:4,name:'Comedy'},{id:8,name:'Drama'},
  {id:10,name:'Fantasy'},{id:14,name:'Horror'},{id:22,name:'Romance'},
  {id:24,name:'Sci-Fi'},{id:37,name:'Supernatural'},{id:36,name:'Slice of Life'},
  {id:46,name:'Award Winning'},
];
let activeGenreId = null;
let sTimer = null;

function renderSearch(q = '') {
  const content = $('content');
  content.innerHTML = `
    <div class="page-head">
      <span class="ph-title">🔍 Temukan Anime</span>
    </div>

    <div style="padding: 0 12px 12px;">
      <div class="search-box">
        <span class="si">🔍</span>
        <input type="search" id="sInput" placeholder="Cari judul anime..."
               value="${q}" oninput="onSearch(this.value)" autocomplete="off">
      </div>
    </div>

    <div class="genre-wrap" style="padding: 0 12px 12px;" id="sGenres">
      ${GENRES.map(g => `
        <button class="genre-chip ${activeGenreId === g.id ? 'active' : ''}"
                onclick="filterByGenre(${g.id}, this)">${g.name}</button>
      `).join('')}
    </div>

    <div id="sStatus" style="padding:0 12px 8px;font-size:12px;color:var(--muted);">
      Ketik judul atau pilih genre.
    </div>

    <div class="anime-grid" id="sGrid"></div>
    <div style="padding:0 12px;" id="sListWrap"></div>
  `;

  if (q) onSearch(q);
  else if (activeGenreId) filterByGenre(activeGenreId, null);
  else loadTopSearch();
}

async function loadTopSearch() {
  if ($('sGrid')) $('sGrid').innerHTML = skeletonCards(12, '');
  if ($('sStatus')) $('sStatus').textContent = 'Anime terpopuler saat ini';
  try {
    const data = await jikan('/top/anime?filter=bypopularity&limit=18');
    if ($('sGrid')) $('sGrid').innerHTML = data.map(animeCard).join('');
  } catch (e) {}
}

function onSearch(val) {
  clearTimeout(sTimer);
  activeGenreId = null;
  document.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
  if (val.trim().length < 2) { loadTopSearch(); return; }
  if ($('sGrid')) $('sGrid').innerHTML = skeletonCards(9);
  if ($('sStatus')) $('sStatus').textContent = 'Mencari...';
  sTimer = setTimeout(() => doSearch(val.trim()), 500);
}

async function doSearch(q) {
  try {
    const data = await jikan(`/anime?q=${encodeURIComponent(q)}&limit=18`);
    if ($('sStatus')) $('sStatus').textContent = `${data.length} hasil untuk "${q}"`;
    if ($('sGrid')) $('sGrid').innerHTML = data.length ? data.map(animeCard).join('') :
      '<p style="padding:12px;color:var(--muted);grid-column:1/-1;">Tidak ada hasil.</p>';
  } catch (e) {
    if ($('sStatus')) $('sStatus').textContent = '⚠️ Gagal. Cek koneksi.';
  }
}

function filterByGenre(id, btn) {
  activeGenreId = id;
  document.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if ($('sInput')) $('sInput').value = '';
  if ($('sGrid')) $('sGrid').innerHTML = skeletonCards(9);
  if ($('sStatus')) $('sStatus').textContent = 'Memuat genre...';
  jikan(`/anime?genres=${id}&order_by=score&sort=desc&limit=18`)
    .then(data => {
      if ($('sStatus')) $('sStatus').textContent = `${data.length} anime ditemukan`;
      if ($('sGrid')) $('sGrid').innerHTML = data.map(animeCard).join('');
    }).catch(() => {
      if ($('sStatus')) $('sStatus').textContent = '⚠️ Gagal memuat.';
    });
}

// Called from home genre chips
function searchGenre(btn, name) {
  const genre = GENRES.find(g => g.name === name);
  if (genre) activeGenreId = genre.id;
  navigate('search');
}

// ════════════════════════════════════════════
// PAGE — PROFILE
// ════════════════════════════════════════════
let wlTab = 'watching';

function renderProfile() {
  const loggedIn = localStorage.getItem('loggedIn');
  if (!loggedIn) {
    $('content').innerHTML = `
      <div style="padding:48px 16px;text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;">🔐</div>
        <h3 style="margin-bottom:8px;">Belum Login</h3>
        <p style="color:var(--muted);font-size:13px;margin-bottom:20px;">Login untuk akses profil dan watchlist.</p>
        <a href="login.html" class="btn btn-primary" style="display:inline-flex;">Masuk / Daftar</a>
      </div>`;
    return;
  }

  const name  = localStorage.getItem('username') || 'Pengguna';
  const email = localStorage.getItem('email')    || '';
  const role  = name === 'admin' ? 'Administrator' : 'Member';
  const wl    = getWatchlist();
  const watching  = wl.filter(w => w.status === 'watching');
  const planTo    = wl.filter(w => w.status === 'plan');
  const completed = wl.filter(w => w.status === 'completed');

  $('content').innerHTML = `
    <div class="profile-header">
      <div class="p-avatar">${name === 'admin' ? '🛡️' : '🧑'}</div>
      <div class="p-name">${name}</div>
      <div class="p-email">${email}</div>
      <span class="badge ${name === 'admin' ? 'b-pink' : 'b-purple'}" style="margin-top:8px;">${role}</span>
    </div>

    <!-- Watchlist Stats -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:0 12px;margin-bottom:20px;">
      <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;">
        <div style="font-size:22px;font-weight:800;color:var(--accent);">${watching.length}</div>
        <div style="font-size:11px;color:var(--muted);">Menonton</div>
      </div>
      <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;">
        <div style="font-size:22px;font-weight:800;color:var(--yellow);">${planTo.length}</div>
        <div style="font-size:11px;color:var(--muted);">Plan to Watch</div>
      </div>
      <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;">
        <div style="font-size:22px;font-weight:800;color:var(--green);">${completed.length}</div>
        <div style="font-size:11px;color:var(--muted);">Selesai</div>
      </div>
    </div>

    <!-- Watchlist Tabs -->
    <div class="wl-tabs">
      <button class="wl-tab ${wlTab==='watching'?'active':''}" onclick="switchWlTab('watching',this)">▶ Menonton</button>
      <button class="wl-tab ${wlTab==='plan'?'active':''}"     onclick="switchWlTab('plan',this)">🕐 Plan</button>
      <button class="wl-tab ${wlTab==='completed'?'active':''}" onclick="switchWlTab('completed',this)">✓ Selesai</button>
    </div>

    <div class="box" id="wlList" style="margin-top:12px;">
      ${renderWlList()}
    </div>

    <!-- Menu -->
    <div class="box">
      <div class="menu-item" onclick="navigate('jadwal')">
        <span class="mi">📅</span><span class="mt">Jadwal Tayang</span><span class="mc">›</span>
      </div>
      ${name === 'admin' ? `
      <div class="menu-item" onclick="window.location.href='admin.html'">
        <span class="mi">🛡️</span><span class="mt">Admin Panel</span><span class="mc">›</span>
      </div>` : ''}
    </div>

    <!-- Settings inline -->
    <div class="box">
      <div class="setting-item">
        <div><div class="s-label">🌙 Mode Gelap</div><div class="s-desc">Ganti tampilan terang/gelap</div></div>
        <label class="toggle">
          <input type="checkbox" id="themeToggle"
                 ${localStorage.getItem('theme') !== 'light' ? 'checked' : ''}
                 onchange="toggleTheme(this.checked)">
          <span class="tslider"></span>
        </label>
      </div>
      <div class="setting-item">
        <div><div class="s-label">🌐 Subtitle</div><div class="s-desc">Bahasa subtitle default</div></div>
        <select onchange="localStorage.setItem('lang',this.value)"
                style="width:auto;padding:6px 10px;font-size:12px;">
          <option value="id" ${localStorage.getItem('lang')==='id'?'selected':''}>Indonesia</option>
          <option value="en" ${localStorage.getItem('lang')==='en'?'selected':''}>English</option>
          <option value="off" ${localStorage.getItem('lang')==='off'?'selected':''}>Off</option>
        </select>
      </div>
    </div>

    <div class="box">
      <div class="menu-item" onclick="doLogout()">
        <span class="mi">🚪</span>
        <span class="mt" style="color:#ff5252;">Keluar dari Akun</span>
      </div>
    </div>
  `;
}

function switchWlTab(tab, btn) {
  wlTab = tab;
  document.querySelectorAll('.wl-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if ($('wlList')) $('wlList').innerHTML = renderWlList();
}

function renderWlList() {
  const wl = getWatchlist().filter(w => w.status === wlTab);
  if (!wl.length) return `<p style="text-align:center;color:var(--muted);padding:20px;font-size:13px;">
    ${wlTab === 'watching' ? 'Belum ada anime yang sedang ditonton.' :
      wlTab === 'plan' ? 'Belum ada anime di daftar plan.' : 'Belum ada anime yang selesai.'}</p>`;
  return wl.map(a => `
    <div class="list-item" onclick="openDetail(${a.id})">
      <img src="${a.img}" alt="${a.title}" onerror="this.style.opacity='0'">
      <div class="li-info">
        <div class="li-title">${a.title}</div>
        <div class="li-meta" style="display:flex;gap:6px;align-items:center;margin-top:4px;">
          <span class="badge ${wlTab==='watching'?'b-green':wlTab==='plan'?'b-yellow':'b-purple'}"
                style="font-size:10px;">
            ${wlTab==='watching'?'Menonton':wlTab==='plan'?'Plan':'Selesai'}
          </span>
        </div>
      </div>
      <button onclick="event.stopPropagation();removeWatchlist(${a.id})"
              style="background:none;border:none;color:var(--muted);font-size:18px;padding:4px;">✕</button>
    </div>`).join('');
}

// ════════════════════════════════════════════
// WATCHLIST (localStorage)
// ════════════════════════════════════════════
function getWatchlist() {
  return JSON.parse(localStorage.getItem('watchlist') || '[]');
}
function saveWatchlist(wl) {
  localStorage.setItem('watchlist', JSON.stringify(wl));
}
function isInWatchlist(id) {
  return getWatchlist().some(a => a.id === id);
}
function toggleWatchlist(id, title, img, status = 'plan') {
  let wl = getWatchlist();
  if (isInWatchlist(id)) {
    wl = wl.filter(a => a.id !== id);
    showToast('Dihapus dari watchlist');
  } else {
    wl.push({ id, title, img, status });
    showToast('✓ Ditambahkan ke watchlist');
  }
  saveWatchlist(wl);
}
function removeWatchlist(id) {
  saveWatchlist(getWatchlist().filter(a => a.id !== id));
  renderProfile();
}
function addToWatchlistWithStatus(id, title, img, status) {
  let wl = getWatchlist();
  const existing = wl.find(a => a.id === id);
  if (existing) { existing.status = status; }
  else { wl.push({ id, title, img, status }); }
  saveWatchlist(wl);
  showToast(`✓ ${status === 'watching' ? 'Menonton' : status === 'plan' ? 'Plan to Watch' : 'Selesai'}`);
  closeDetail();
}

// ════════════════════════════════════════════
// ANIME DETAIL MODAL
// ════════════════════════════════════════════
async function openDetail(id) {
  const overlay = $('detailOverlay');
  const sheet   = $('detailSheet');
  if (!overlay || !sheet) return;

  sheet.innerHTML = `
    <div style="height:220px;background:var(--card2);border-radius:20px 20px 0 0;"></div>
    <div style="padding:16px;">${skeletonList(3)}</div>`;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  try {
    const [main, chars] = await Promise.all([
      fetch(`https://api.jikan.moe/v4/anime/${id}/full`).then(r => r.json()),
      fetch(`https://api.jikan.moe/v4/anime/${id}/characters`).then(r => r.json()).catch(() => ({data:[]})),
    ]);
    const a = main.data;
    if (!a) return;

    const genres = (a.genres || []).map(g => `<span class="badge b-purple">${g.name}</span>`).join(' ');
    const studios = (a.studios || []).map(s => s.name).join(', ') || '—';
    const inWl = isInWatchlist(a.mal_id);
    const trailer = a.trailer?.youtube_id;

    sheet.innerHTML = `
      <div class="detail-hero">
        <div class="detail-hero-bg" style="background-image:url('${a.images?.jpg?.large_image_url || a.images?.jpg?.image_url}')"></div>
        <button class="close-btn" onclick="closeDetail()">✕</button>
        <div class="detail-hero-content">
          <img class="detail-poster" src="${a.images?.jpg?.image_url}" alt="${a.title}">
          <div>
            <div class="detail-title">${a.title}</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px;">
              ${[a.type, a.episodes ? a.episodes+' ep' : '', a.year || ''].filter(Boolean).join(' · ')}
            </div>
            <div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;">
              ${a.score ? `<span class="badge b-yellow">⭐ ${a.score}</span>` : ''}
              ${a.airing ? '<span class="badge b-green">Tayang</span>' : ''}
            </div>
          </div>
        </div>
      </div>

      <div class="detail-body">
        <!-- Genres -->
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">${genres}</div>

        <!-- Action Buttons -->
        <div class="detail-btns">
          ${trailer ? `
          <button class="btn btn-primary btn-sm" onclick="openTrailer('${trailer}','${escHtml(a.title)}')">
            ▶ Trailer
          </button>` : ''}
          <button id="wlBtn" class="btn ${inWl ? 'btn-ghost' : 'btn-outline'} btn-sm"
                  onclick="toggleWatchlist(${a.mal_id},'${escHtml(a.title)}','${a.images?.jpg?.image_url||''}');updateWlBtn(${a.mal_id})">
            ${inWl ? '✓ Tersimpan' : '+ Simpan'}
          </button>
        </div>

        <!-- Add to list dropdown -->
        <div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;">
          <button class="btn btn-ghost btn-sm" onclick="addToWatchlistWithStatus(${a.mal_id},'${escHtml(a.title)}','${a.images?.jpg?.image_url||''}','watching')">▶ Menonton</button>
          <button class="btn btn-ghost btn-sm" onclick="addToWatchlistWithStatus(${a.mal_id},'${escHtml(a.title)}','${a.images?.jpg?.image_url||''}','plan')">🕐 Plan to Watch</button>
          <button class="btn btn-ghost btn-sm" onclick="addToWatchlistWithStatus(${a.mal_id},'${escHtml(a.title)}','${a.images?.jpg?.image_url||''}','completed')">✓ Selesai</button>
        </div>

        <!-- Synopsis -->
        <div style="font-size:13px;font-weight:700;margin-bottom:6px;">Sinopsis</div>
        <div class="detail-synopsis">${a.synopsis || 'Tidak ada sinopsis.'}</div>

        <!-- Info -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;font-size:13px;">
          <div><span style="color:var(--muted);">Studio</span><br><strong>${studios}</strong></div>
          <div><span style="color:var(--muted);">Musim</span><br><strong>${a.season ? a.season+' '+a.year : (a.year || '—')}</strong></div>
          <div><span style="color:var(--muted);">Rating</span><br><strong>${a.rating || '—'}</strong></div>
          <div><span style="color:var(--muted);">Durasi</span><br><strong>${a.duration || '—'}</strong></div>
        </div>

        <!-- MAL Link -->
        <a href="https://myanimelist.net/anime/${a.mal_id}" target="_blank"
           class="btn btn-ghost btn-sm" style="width:100%;justify-content:center;margin-bottom:8px;">
          🔗 Lihat di MyAnimeList
        </a>
      </div>`;

  } catch (e) {
    sheet.innerHTML = `
      <button class="close-btn" onclick="closeDetail()" style="position:fixed;top:16px;right:16px;">✕</button>
      <div style="padding:40px;text-align:center;color:var(--muted);">⚠️ Gagal memuat detail.</div>`;
  }
}

function closeDetail() {
  const overlay = $('detailOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function updateWlBtn(id) {
  const btn = $('wlBtn');
  if (!btn) return;
  const inWl = isInWatchlist(id);
  btn.textContent = inWl ? '✓ Tersimpan' : '+ Simpan';
  btn.className = `btn ${inWl ? 'btn-ghost' : 'btn-outline'} btn-sm`;
}

// ════════════════════════════════════════════
// TRAILER MODAL
// ════════════════════════════════════════════
function openTrailer(ytId, title) {
  const overlay = $('trailerOverlay');
  const frame   = $('trailerFrame');
  if (!overlay || !frame) return;
  frame.src = `https://www.youtube.com/embed/${ytId}?autoplay=1`;
  $('trailerTitle').textContent = title;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeTrailer() {
  const overlay = $('trailerOverlay');
  const frame   = $('trailerFrame');
  if (overlay) overlay.classList.remove('open');
  if (frame) frame.src = '';
  document.body.style.overflow = '';
}

// ════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════
let toastTimer;
function showToast(msg) {
  let toast = $('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position:fixed; bottom:80px; left:50%; transform:translateX(-50%) translateY(20px);
      background:#222235; color:#fff; padding:10px 20px;
      border-radius:99px; font-size:13px; font-weight:600;
      box-shadow:0 4px 20px rgba(0,0,0,0.4);
      z-index:9999; opacity:0; transition:all 0.25s ease;
      white-space:nowrap; pointer-events:none;`;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.opacity = '0'; toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2500);
}

// ════════════════════════════════════════════
// THEME
// ════════════════════════════════════════════
function applyTheme() {
  document.body.classList.toggle('light', localStorage.getItem('theme') === 'light');
}
function toggleTheme(isDark) {
  const theme = isDark ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
  document.body.classList.toggle('light', !isDark);
}

// ════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════
function doLogout() {
  if (!confirm('Yakin ingin keluar?')) return;
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('username');
  window.location.href = 'login.html';
}

// ════════════════════════════════════════════
// UTILS
// ════════════════════════════════════════════
function escHtml(str) {
  return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
