// =========================================================================
// 1. DÁN LINK /exec CỦA GOOGLE APPS SCRIPT VÀO GIỮA DẤU NHÁY ĐƠN DƯỚI ĐÂY
// =========================================================================
const API_URL = 'https://script.google.com/macros/s/AKfycbzyee7Ax-ZyTnUglCkHENB_YHd8rsFPiDFe85tWYlJNk2GcuHNWpmw9hIJuz59Jqhds2A/exec';

const WEDDING_DATE = new Date('2026-11-29T11:00:00+07:00').getTime();
const LOCAL_STORAGE_KEY = 'wedding_nam_da_excel_data';
let isPlayingMusic = false;

document.addEventListener('DOMContentLoaded', () => {
  try {
    initRealisticEnvelopeCanvas();
  } catch (e) {
    console.error('Lỗi vẽ phong bì:', e);
  }

  initGuestNameFromURL();
  initEnvelopeOpen();
  initCountdown();
  initScrollReveal();
  initFallingPetals();
  fetchWishesFromMongoDB();

  const rsvpForm = document.getElementById('rsvpForm');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', handleRsvpSubmit);
  }
});

// =========================================================================
// 2. ĐỌC TÊN KHÁCH MỜI TỪ ĐƯỜNG LINK (?to=...)
// =========================================================================
function initGuestNameFromURL() {
  const params = new URLSearchParams(window.location.search);
  const guest = params.get('to');
  if (guest) {
    const envGuestEl = document.getElementById('envelopeGuestName');
    const mainGuestEl = document.getElementById('mainGuestName');
    const inputGuestEl = document.getElementById('guestName');

    if (envGuestEl) envGuestEl.textContent = guest;
    if (mainGuestEl) mainGuestEl.textContent = guest;
    if (inputGuestEl) inputGuestEl.value = guest;
  }
}

// =========================================================================
// 3. HIỆU ỨNG GÕ CHỮ "OPEN THE INVITATION" & LẬT MỞ PHONG BÌ 3D
// =========================================================================
function initEnvelopeOpen() {
  const openBtn = document.getElementById('openCardBtn');
  const envelopeBox = document.getElementById('luxury-envelope');
  const overlay = document.getElementById('envelope-overlay');
  const typeEl = document.getElementById('typewriterText');
  const audio = document.getElementById('bgMusic');
  let isOpening = false;

  if (typeEl) {
    const fullText = 'OPEN THE INVITATION';
    let index = 0;
    setInterval(() => {
      if (isOpening) return;
      index = (index + 1) % (fullText.length + 8);
      typeEl.textContent = fullText.slice(0, Math.min(index, fullText.length));
    }, 160);
  }

  const triggerOpenAnimation = () => {
    if (!overlay || isOpening) return;
    isOpening = true;

    if (audio) {
      audio.play().then(() => {
        isPlayingMusic = true;
        updateMusicIcon();
      }).catch(() => {
        isPlayingMusic = false;
        updateMusicIcon();
      });
    }

    overlay.classList.add('envelope-opening');
    if (typeEl) typeEl.textContent = 'WELCOME TO OUR WEDDING';

    // Giảm từ 2600 xuống 1150 để thiệp vừa trượt lên là chuyển cảnh ngay không bị khựng
    setTimeout(() => {
      overlay.classList.add('envelope-opened');
    }, 1900);
  };

  if (openBtn) openBtn.addEventListener('click', triggerOpenAnimation);
  if (envelopeBox) envelopeBox.addEventListener('click', triggerOpenAnimation);
}
// =========================================================================
// 4. ĐIỀU KHIỂN NHẠC NỀN & ĐỒNG HỒ ĐẾM NGƯỢC
// =========================================================================
function toggleMusic() {
  const audio = document.getElementById('bgMusic');
  if (!audio) return;

  if (isPlayingMusic) {
    audio.pause();
    isPlayingMusic = false;
  } else {
    audio.play();
    isPlayingMusic = true;
  }
  updateMusicIcon();
}

function updateMusicIcon() {
  const icon = document.getElementById('musicIcon');
  if (!icon) return;
  icon.className = isPlayingMusic
    ? 'fa-solid fa-compact-disc fa-spin text-lg'
    : 'fa-solid fa-volume-xmark text-lg';
}

function initCountdown() {
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-minutes');
  const secsEl = document.getElementById('cd-seconds');
  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  const update = () => {
    const diff = WEDDING_DATE - Date.now();
    if (diff <= 0) return;

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = String(d).padStart(2, '0');
    hoursEl.textContent = String(h).padStart(2, '0');
    minsEl.textContent = String(m).padStart(2, '0');
    secsEl.textContent = String(s).padStart(2, '0');
  };

  update();
  setInterval(update, 1000);
}

// =========================================================================
// 5. HIỆU ỨNG CUỘN TRANG & CÁNH HOA RƠI
// =========================================================================
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.12 });

  items.forEach(el => observer.observe(el));
}

function initFallingPetals() {
  const container = document.getElementById('petals-container');
  if (!container) return;

  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    const size = Math.random() * 8 + 7;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}vw`;
    p.style.animationDuration = `${Math.random() * 6 + 8}s`;
    p.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(p);
  }
}

// =========================================================================
// 6. KẾT NỐI GOOGLE SHEETS & SỔ LƯU BÚT (CÓ KIỂM TRA LỖI TRỰC TIẾP)
// =========================================================================
function getLocalExcelData() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}

  const initialSample = [
    {
      createdAt: '03/11/2026 20:00:00',
      guestName: 'Vợ chồng Hoàng Tuấn',
      phone: '0988123456',
      side: 'Nha Trai',
      attendance: 'Co',
      guestsCount: 2,
      wishMessage: 'Chúc Lưu Văn Nam & Nguyễn Thị Linh Đa trăm năm hạnh phúc, sớm đón quý tử nhé!'
    },
    {
      createdAt: '03/11/2026 20:05:00',
      guestName: 'Hội bạn thân Đại học',
      phone: '0912345678',
      side: 'Nha Gai',
      attendance: 'Co',
      guestsCount: 4,
      wishMessage: 'Chúc mừng hạnh phúc Văn Nam & Linh Đa, mãi yêu thương nhau như thuở ban đầu!'
    }
  ];
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialSample));
  } catch (e) {}
  return initialSample;
}

async function fetchWishesFromMongoDB() {
  const badgeEl = document.getElementById('wishesCountBadge');
  try {
    if (API_URL.includes('script.google.com/macros/s/') && API_URL.endsWith('/exec') && !API_URL.includes('DÁN_')) {
      const res = await fetch(API_URL, { redirect: 'follow' });
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        if (badgeEl) badgeEl.textContent = `${result.data.length} lời chúc`;
        renderWishes(result.data);
        return;
      }
    }
  } catch (err) {
    console.warn('Đang hiển thị sổ lưu bút trên trình duyệt:', err);
  }

  const localList = getLocalExcelData();
  if (badgeEl) badgeEl.textContent = `${localList.length} lời chúc`;
  renderWishes(localList);
}

function renderWishes(list) {
  const container = document.getElementById('wishesList');
  if (!container) return;

  if (!list || list.length === 0) {
    container.innerHTML = `<p class="text-xs text-gray-400 text-center py-6">Hãy là người đầu tiên gửi lời chúc nhé!</p>`;
    return;
  }

  container.innerHTML = list.map(item => `
    <div class="p-3.5 rounded-xl bg-[#fdfbf7] border border-[#eee5d8]">
      <div class="flex items-center justify-between mb-1">
        <span class="font-bold text-xs text-[#7c1f20]">${escapeHTML(item.guestName)}</span>
        <span class="text-[10px] bg-amber-50 text-[#9e2a2b] px-2 py-0.5 rounded-full">
          ${item.attendance === 'Co' ? 'Sẽ tham dự' : (item.attendance === 'Co the' ? 'Có thể tham dự' : 'Gửi lời chúc')}
        </span>
      </div>
      <p class="text-xs text-gray-600 leading-relaxed">${escapeHTML(item.wishMessage)}</p>
    </div>
  `).join('');
}

async function handleRsvpSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const status = document.getElementById('formStatus');

  const SHEET_EXEC_URL = 'https://script.google.com/macros/s/AKfycbwdA8p1RFxgA8geWLR4er6T0f0r0lWmh-sn61aQagHa2cHaJrmcULz7cy59O3SGIjT5bg/exec';

  const payload = {
    action: 'add',
    createdAt: new Date().toLocaleString('vi-VN'),
    guestName: document.getElementById('guestName').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    side: document.getElementById('side').value,
    attendance: document.getElementById('attendance').value,
    guestsCount: Number(document.getElementById('guestsCount').value),
    wishMessage: document.getElementById('wishMessage').value.trim()
  };

  btn.disabled = true;
  btn.textContent = 'Đang gửi vào Google Sheets...';

  // Hiển thị ngay lời chúc lên Sổ Lưu Bút trên web
  const localList = getLocalExcelData();
  localList.unshift(payload);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localList));
  } catch (err) {}
  renderWishes(localList);

  const badgeEl = document.getElementById('wishesCountBadge');
  if (badgeEl) badgeEl.textContent = `${localList.length} lời chúc`;

  try {
    const queryParams = new URLSearchParams(payload).toString();
    await fetch(`${SHEET_EXEC_URL}?${queryParams}`, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    status.className = 'text-xs text-center text-green-600 font-semibold block mt-2';
    status.textContent = 'Đã gửi xác nhận tham dự & lời chúc thành công!';
    document.getElementById('wishMessage').value = '';

    setTimeout(() => {
      fetchWishesFromMongoDB();
    }, 1500);
  } catch (err) {
    status.className = 'text-xs text-center text-red-600 font-semibold block mt-2';
    status.textContent = 'Lỗi kết nối mạng! Vui lòng thử lại.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Gửi Xác Nhận & Lời Chúc';
  }
}

function exportGuestListToExcel() {
  const list = getLocalExcelData();
  if (!window.XLSX) {
    alert('Chưa tải được thư viện xuất Excel!');
    return;
  }

  const rowsForExcel = list.map((item, idx) => ({
    'STT': idx + 1,
    'Thời gian gửi': item.createdAt || new Date().toLocaleString('vi-VN'),
    'Tên của bạn': item.guestName,
    'Số điện thoại': item.phone || 'Không nhập',
    'Khách của bên': item.side === 'Nha Trai' ? 'Nhà Trai' : 'Nhà Gái',
    'Tham dự': item.attendance === 'Co' ? 'Sẽ tham dự' : (item.attendance === 'Co the' ? 'Có thể tham dự' : 'Tiếc quá mình bận'),
    'Số người đi': `${item.guestsCount} người`,
    'Lời chúc gửi tới dâu rể': item.wishMessage
  }));

  const worksheet = XLSX.utils.json_to_sheet(rowsForExcel);
  worksheet['!cols'] = [
    { wch: 6 }, { wch: 20 }, { wch: 26 }, { wch: 15 },
    { wch: 15 }, { wch: 18 }, { wch: 14 }, { wch: 48 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachKhachMoi');
  XLSX.writeFile(workbook, 'Danh_Sach_Khach_Moi_Nam_Da.xlsx');
}

function triggerGiftBurstEffect() {
  const triggerEl = document.getElementById('giftBox3DTrigger');
  let originX = window.innerWidth / 2;
  let originY = window.innerHeight / 2;

  if (triggerEl) {
    const rect = triggerEl.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      originX = rect.left + rect.width / 2;
      originY = rect.top + rect.height * 0.35;
    }
    triggerEl.classList.remove('gift-box-popping');
    void triggerEl.offsetWidth;
    triggerEl.classList.add('gift-box-popping');
    setTimeout(() => triggerEl.classList.remove('gift-box-popping'), 500);
  }

  // Vòng sáng bung nhẹ từ nơ hộp quà
  const ring = document.createElement('div');
  ring.className = 'gift-burst-ring';
  ring.style.left = `${originX}px`;
  ring.style.top = `${originY}px`;
  document.body.appendChild(ring);
  setTimeout(() => ring.remove(), 650);

  // 18 hạt tim & sao vàng nhẹ mượt, không gây giật đứng trình duyệt
  const symbols = ['❤', '✦', '✨', '💖', '★', '💝'];
  const colors = ['#ffd166', '#fceee2', '#ff758f', '#ffb703', '#ffffff'];
  const totalParticles = 18;

  for (let i = 0; i < totalParticles; i++) {
    const p = document.createElement('span');
    p.className = 'gift-burst-particle';
    p.textContent = symbols[i % symbols.length];

    const angle = (Math.PI * 2 * i) / totalParticles + (Math.random() - 0.5) * 0.3;
    const distance = 75 + Math.random() * 120;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 45;
    const rot = (Math.random() - 0.5) * 360;
    const dur = 0.75 + Math.random() * 0.35;

    p.style.left = `${originX}px`;
    p.style.top = `${originY}px`;
    p.style.fontSize = `${14 + Math.random() * 10}px`;
    p.style.color = colors[i % colors.length];
    p.style.setProperty('--tx', `${tx}px`);
    p.style.setProperty('--ty', `${ty}px`);
    p.style.setProperty('--rot', `${rot}deg`);
    p.style.setProperty('--dur', `${dur}s`);
    p.style.setProperty('--scale', '1');

    document.body.appendChild(p);
    setTimeout(() => p.remove(), dur * 1000 + 50);
  }
}

function toggleGiftModal(show) {
  const modal = document.getElementById('giftModal');
  if (!modal) {
    // Nếu không tìm thấy #giftModal thì tuyệt đối không khóa cuộn trang
    document.body.style.overflow = '';
    return;
  }

  if (show) {
    triggerGiftBurstEffect();

    // Hiển thị ngay bảng QR với đầy đủ class và thuộc tính chống tàng hình
    modal.classList.remove('hidden');
    modal.classList.add('active', 'open');
    modal.style.display = 'block';
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    modal.style.pointerEvents = 'auto';
    document.body.style.overflow = 'hidden';
  } else {
    modal.classList.remove('active', 'open');
    modal.classList.add('hidden');
    modal.style.display = '';
    modal.style.opacity = '';
    modal.style.visibility = '';
    modal.style.pointerEvents = '';
    document.body.style.overflow = '';
    if (typeof closeQrFullModal === 'function') {
      closeQrFullModal();
    }
  }
}

function initGiftModalSparkles() {
  const container = document.getElementById('giftModalSparkles');
  if (!container || container.childElementCount > 0) return;

  const symbols = ['✦', '❤', '•', '✧', '❤'];
  for (let i = 0; i < 18; i++) {
    const item = document.createElement('span');
    item.className = 'inside-sparkle-particle';
    item.textContent = symbols[i % symbols.length];
    item.style.left = `${Math.random() * 94 + 3}%`;
    item.style.fontSize = `${Math.random() * 8 + 8}px`;
    item.style.color = i % 2 === 0 ? 'rgba(245, 215, 176, 0.55)' : 'rgba(244, 198, 208, 0.45)';
    item.style.animationDuration = `${Math.random() * 5 + 5.5}s`;
    item.style.animationDelay = `${Math.random() * 4}s`;
    container.appendChild(item);
  }
}

function copyAccount(accNumber, ownerLabel = '') {
  navigator.clipboard.writeText(accNumber);
  const toast = document.getElementById('copyToast');
  const toastText = document.getElementById('copyToastText');

  if (toast && toastText) {
    toastText.textContent = ownerLabel
      ? `Đã sao chép STK ${ownerLabel}: ${accNumber}`
      : `Đã sao chép STK: ${accNumber}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2400);
  } else {
    alert('Đã sao chép số tài khoản: ' + accNumber);
  }
}
function openQrFullModal(imgSrc, ownerTitle, accNumber, downloadFileName) {
  const modal = document.getElementById('qrFullModal');
  const imgEl = document.getElementById('qrFullImage');
  const titleEl = document.getElementById('qrFullTitle');
  const accEl = document.getElementById('qrFullAccountText');
  const downloadBtn = document.getElementById('qrDownloadBtn');
  const copyBtn = document.getElementById('qrFullCopyBtn');

  if (!modal || !imgEl) return;

  imgEl.src = imgSrc;
  if (titleEl) titleEl.textContent = ownerTitle;
  if (accEl) accEl.textContent = `Số tài khoản: ${accNumber}`;

  if (downloadBtn) {
    downloadBtn.href = imgSrc;
    downloadBtn.setAttribute('download', downloadFileName || 'QR_Mung_Cuoi.jpg');
  }

  if (copyBtn) {
    copyBtn.onclick = () => copyAccount(accNumber, ownerTitle);
  }

  modal.classList.remove('hidden');
}

function closeQrFullModal() {
  const modal = document.getElementById('qrFullModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// =========================================================================
// 8. MODAL LOCATION & TIMELINE + TẠO LINK KHÁCH MỜI
// =========================================================================
function toggleTimelineModal(show) {
  const modal = document.getElementById('timelineModal');
  const napkin = document.getElementById('napkinTrigger');
  const filmStrip = document.getElementById('filmStripDecor');
  if (!modal) return;

  if (show) {
    if (napkin) napkin.classList.add('napkin-unfolding');
    if (filmStrip) filmStrip.classList.add('-translate-x-10', 'opacity-40');

    setTimeout(() => {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      modal.scrollTop = 0;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => modal.classList.add('is-open'));
      });
    }, 360);
  } else {
    modal.classList.remove('is-open');
    if (napkin) napkin.classList.remove('napkin-unfolding');
    if (filmStrip) filmStrip.classList.remove('-translate-x-10', 'opacity-40');

    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 420);
  }
}
function switchTimelineSide(side) {
  const groomContent = document.getElementById('timelineContentGroom');
  const brideContent = document.getElementById('timelineContentBride');
  const btnGroom = document.getElementById('tabBtnGroom');
  const btnBride = document.getElementById('tabBtnBride');

  if (!groomContent || !brideContent || !btnGroom || !btnBride) return;

  if (side === 'bride') {
    groomContent.classList.add('hidden');
    brideContent.classList.remove('hidden');

    btnBride.className = 'px-6 py-2 rounded-full font-serif-title text-xs sm:text-sm font-bold uppercase tracking-[0.14em] transition-all duration-300 bg-[#fbf8f3] text-[#5a0b0f] shadow-md';
    btnGroom.className = 'px-6 py-2 rounded-full font-serif-title text-xs sm:text-sm font-bold uppercase tracking-[0.14em] transition-all duration-300 text-[#f5d7b0] hover:text-white';
  } else {
    brideContent.classList.add('hidden');
    groomContent.classList.remove('hidden');

    btnGroom.className = 'px-6 py-2 rounded-full font-serif-title text-xs sm:text-sm font-bold uppercase tracking-[0.14em] transition-all duration-300 bg-[#fbf8f3] text-[#5a0b0f] shadow-md';
    btnBride.className = 'px-6 py-2 rounded-full font-serif-title text-xs sm:text-sm font-bold uppercase tracking-[0.14em] transition-all duration-300 text-[#f5d7b0] hover:text-white';
  }
}


function generateGuestLink() {
  const input = document.getElementById('customGuestInput');
  const notice = document.getElementById('copyLinkNotice');
  if (!input || !notice) return;

  const name = input.value.trim();
  if (!name) return;

  const baseUrl = window.location.origin + window.location.pathname;
  const fullLink = `${baseUrl}?to=${encodeURIComponent(name)}`;
  navigator.clipboard.writeText(fullLink);

  notice.textContent = `Đã copy link mời: ${fullLink}`;
  notice.classList.remove('hidden');
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));
}

// =========================================================================
// 9. BỘ DỰNG CANVAS 3D CHO PHONG BÌ NHUNG ĐỎ & CON DẤU SÁP HOA RUM
// =========================================================================
function initRealisticEnvelopeCanvas() {
  renderFourFoldEnvelope();
  render3DWaxSeal();
}

function renderFourFoldEnvelope() {
  const backCanvas = document.getElementById('envBackCanvas');
  const pocketCanvas = document.getElementById('envPocketCanvas');
  const flapCanvas = document.getElementById('envFlapCanvas');
  if (!backCanvas || !pocketCanvas || !flapCanvas) return;

  const W = 840;
  const H = 550;

  const bctx = backCanvas.getContext('2d');
  const backGrad = bctx.createLinearGradient(0, 0, 0, H);
  backGrad.addColorStop(0, '#3a0508');
  backGrad.addColorStop(0.5, '#47080c');
  backGrad.addColorStop(1, '#330406');
  bctx.fillStyle = backGrad;
  bctx.fillRect(0, 0, W, H);

  bctx.strokeStyle = 'rgba(120, 24, 30, 0.45)';
  bctx.lineWidth = 2;
  bctx.beginPath();
  bctx.moveTo(0, 8);
  bctx.lineTo(W, 8);
  bctx.stroke();

  const pctx = pocketCanvas.getContext('2d');
  pctx.clearRect(0, 0, W, H);

  pctx.save();
  pctx.beginPath();
  pctx.moveTo(0, 0);
  pctx.lineTo(W * 0.43, H * 0.56);
  pctx.lineTo(0, H);
  pctx.closePath();
  pctx.shadowColor = 'rgba(15, 0, 2, 0.78)';
  pctx.shadowBlur = 16;
  pctx.shadowOffsetX = 5;
  pctx.shadowOffsetY = 3;
  const leftGrad = pctx.createLinearGradient(0, 0, W * 0.43, H * 0.56);
  leftGrad.addColorStop(0, '#5c0d13');
  leftGrad.addColorStop(1, '#4c090e');
  pctx.fillStyle = leftGrad;
  pctx.fill();
  pctx.strokeStyle = 'rgba(130, 28, 36, 0.55)';
  pctx.lineWidth = 2;
  pctx.stroke();
  pctx.restore();

  pctx.save();
  pctx.beginPath();
  pctx.moveTo(W, 0);
  pctx.lineTo(W * 0.57, H * 0.56);
  pctx.lineTo(W, H);
  pctx.closePath();
  pctx.shadowColor = 'rgba(15, 0, 2, 0.78)';
  pctx.shadowBlur = 16;
  pctx.shadowOffsetX = -5;
  pctx.shadowOffsetY = 3;
  const rightGrad = pctx.createLinearGradient(W, 0, W * 0.57, H * 0.56);
  rightGrad.addColorStop(0, '#580c12');
  rightGrad.addColorStop(1, '#49080d');
  pctx.fillStyle = rightGrad;
  pctx.fill();
  pctx.strokeStyle = 'rgba(130, 28, 36, 0.55)';
  pctx.lineWidth = 2;
  pctx.stroke();
  pctx.restore();

  pctx.save();
  pctx.beginPath();
  pctx.moveTo(0, H);
  pctx.lineTo(W * 0.31, H * 0.49);
  pctx.quadraticCurveTo(W * 0.34, H * 0.46, W * 0.38, H * 0.46);
  pctx.lineTo(W * 0.62, H * 0.46);
  pctx.quadraticCurveTo(W * 0.66, H * 0.46, W * 0.69, H * 0.49);
  pctx.lineTo(W, H);
  pctx.closePath();
  pctx.shadowColor = 'rgba(10, 0, 2, 0.85)';
  pctx.shadowBlur = 20;
  pctx.shadowOffsetY = -6;
  const botGrad = pctx.createLinearGradient(0, H * 0.46, 0, H);
  botGrad.addColorStop(0, '#5e0e14');
  botGrad.addColorStop(0.5, '#520a10');
  botGrad.addColorStop(1, '#43070b');
  pctx.fillStyle = botGrad;
  pctx.fill();
  pctx.strokeStyle = 'rgba(140, 32, 40, 0.6)';
  pctx.lineWidth = 2;
  pctx.stroke();
  pctx.restore();

  const fctx = flapCanvas.getContext('2d');
  fctx.clearRect(0, 0, W, H);

  const tipX = W / 2;
  const tipY = H * 0.64;

  const laceBuf = document.createElement('canvas');
  laceBuf.width = W;
  laceBuf.height = H;
  const lctx = laceBuf.getContext('2d');

  const drawEyeletScallop = (ctx, x, y, r) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI);
    ctx.closePath();
    ctx.fillStyle = '#4c090e';
    ctx.fill();

    const bumps = 11;
    for (let i = 0; i <= bumps; i++) {
      const a = (i / bumps) * Math.PI;
      const bx = x + Math.cos(a) * r;
      const by = y + Math.sin(a) * r;
      ctx.beginPath();
      ctx.arc(bx, by, 3.8, 0, Math.PI * 2);
      ctx.fillStyle = '#5c0e14';
      ctx.fill();
      ctx.strokeStyle = '#75171e';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(x, y, r - 3, 0.05 * Math.PI, 0.95 * Math.PI);
    ctx.strokeStyle = '#7c1a21';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, r - 8, 0.08 * Math.PI, 0.92 * Math.PI);
    ctx.strokeStyle = '#681218';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    for (let s = 1; s < 9; s++) {
      const a = (s / 9) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * 6, y + Math.sin(a) * 6);
      ctx.lineTo(x + Math.cos(a) * (r - 8), y + Math.sin(a) * (r - 8));
      ctx.strokeStyle = 'rgba(124, 26, 33, 0.7)';
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(x, y + r * 0.42, 5.2, 0, Math.PI * 2);
    ctx.fillStyle = '#240204';
    ctx.fill();
    ctx.strokeStyle = '#7e1b22';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawSideLace = (isRight) => {
    lctx.save();
    if (isRight) {
      lctx.translate(W, 0);
      lctx.scale(-1, 1);
    }

    const angle = Math.atan2(tipY, tipX);
    lctx.rotate(angle);

    const edgeLen = Math.hypot(tipX, tipY);
    const scallopR = 26;
    const step = scallopR * 1.92;

    lctx.fillStyle = '#46070c';
    lctx.fillRect(-10, -4, edgeLen + 8, 18);

    lctx.strokeStyle = '#70151c';
    lctx.lineWidth = 1.6;
    lctx.beginPath();
    lctx.moveTo(-10, 8);
    lctx.lineTo(edgeLen + 6, 8);
    lctx.stroke();

    lctx.strokeStyle = '#5c0e14';
    lctx.setLineDash([3, 3]);
    lctx.beginPath();
    lctx.moveTo(-10, 12);
    lctx.lineTo(edgeLen + 6, 12);
    lctx.stroke();
    lctx.setLineDash([]);

    for (let x = scallopR * 0.6; x < edgeLen - scallopR * 0.4; x += step) {
      drawEyeletScallop(lctx, x, 13, scallopR);
    }

    lctx.restore();
  };

  drawSideLace(false);
  drawSideLace(true);
  drawEyeletScallop(lctx, tipX, tipY + 6, 28);

  fctx.save();
  fctx.shadowColor = 'rgba(10, 0, 2, 0.85)';
  fctx.shadowBlur = 14;
  fctx.shadowOffsetY = 8;
  fctx.drawImage(laceBuf, 0, 0);
  fctx.restore();

  fctx.save();
  fctx.beginPath();
  fctx.moveTo(0, 0);
  fctx.lineTo(W, 0);
  fctx.lineTo(tipX, tipY);
  fctx.closePath();

  fctx.shadowColor = 'rgba(12, 0, 2, 0.8)';
  fctx.shadowBlur = 12;
  fctx.shadowOffsetY = 6;

  const flapGrad = fctx.createLinearGradient(0, 0, 0, tipY);
  flapGrad.addColorStop(0, '#610f15');
  flapGrad.addColorStop(0.6, '#520b10');
  flapGrad.addColorStop(1, '#44070b');
  fctx.fillStyle = flapGrad;
  fctx.fill();

  fctx.strokeStyle = '#751820';
  fctx.lineWidth = 1.8;
  fctx.stroke();
  fctx.restore();

  fctx.save();
  fctx.beginPath();
  fctx.moveTo(12, 0);
  fctx.lineTo(tipX, tipY - 10);
  fctx.lineTo(W - 12, 0);
  fctx.strokeStyle = '#330306';
  fctx.lineWidth = 2.2;
  fctx.stroke();

  fctx.beginPath();
  fctx.moveTo(14, 0);
  fctx.lineTo(tipX, tipY - 11.5);
  fctx.lineTo(W - 14, 0);
  fctx.strokeStyle = 'rgba(135, 30, 38, 0.55)';
  fctx.lineWidth = 1.2;
  fctx.stroke();

  fctx.beginPath();
  fctx.moveTo(22, 0);
  fctx.lineTo(tipX, tipY - 18);
  fctx.lineTo(W - 22, 0);
  fctx.strokeStyle = '#380407';
  fctx.lineWidth = 1.6;
  fctx.stroke();
  fctx.restore();
}

function render3DWaxSeal() {
  const canvas = document.getElementById('waxSealCanvas');
  if (!canvas) return;

  const SIZE = 300;
  canvas.width = SIZE;
  canvas.height = SIZE;
  canvas.classList.remove('w-[66px]', 'h-[86px]', 'sm:w-[74px]', 'sm:h-[96px]');
  canvas.style.width = '84px';
  canvas.style.height = '84px';
  canvas.style.filter = 'drop-shadow(0 8px 14px rgba(0, 0, 0, 0.78))';

  const ctx = canvas.getContext('2d');
  const cx = SIZE / 2;
  const cy = SIZE / 2;

  // Bản đồ 36 điểm bán kính (mỗi 10 độ) ôm sát bên trong mép sáp đỏ của ảnh thiep.jpg
  // Giúp cắt sạch 100% các vệt trắng ở góc 7h, 1h, 3h và 4h30
  const radiiMap = [
    0.340, // 0°   (3h - hõm phải)
    0.358, // 10°
    0.372, // 20°
    0.368, // 30°  (4h)
    0.346, // 40°  (4h20 - hõm dưới phải)
    0.334, // 50°  (4h40 - hõm dưới phải)
    0.346, // 60°  (5h)
    0.374, // 70°
    0.390, // 80°
    0.390, // 90°  (6h - đáy dưới)
    0.380, // 100°
    0.354, // 110° (6h40 - bắt đầu hõm sâu góc dưới trái)
    0.328, // 120° (7h)
    0.314, // 130° (7h20 - điểm lõm sâu nhất góc dưới trái)
    0.318, // 140° (7h40)
    0.344, // 150° (8h)
    0.362, // 160°
    0.356, // 170°
    0.342, // 180° (9h - mép trái)
    0.332, // 190°
    0.336, // 200°
    0.350, // 210° (10h)
    0.360, // 220°
    0.354, // 230°
    0.340, // 240° (11h)
    0.350, // 250°
    0.374, // 260°
    0.382, // 270° (12h - đỉnh trên)
    0.368, // 280°
    0.338, // 290° (12h40 - hõm trên phải)
    0.330, // 300° (1h - hõm trên phải)
    0.340, // 310°
    0.356, // 320°
    0.362, // 330° (2h)
    0.350, // 340°
    0.336  // 350° (2h40 - hõm phải)
  ];

  // Hàm nội suy mượt giữa 36 điểm để viền sáp cong tự nhiên
  const getSmoothRadius = (angleRad) => {
    let deg = ((angleRad * 180) / Math.PI) % 360;
    if (deg < 0) deg += 360;
    const idx = deg / 10;
    const i0 = Math.floor(idx) % 36;
    const i1 = (i0 + 1) % 36;
    const t = idx - Math.floor(idx);
    const smoothT = (1 - Math.cos(t * Math.PI)) / 2;
    return SIZE * (radiiMap[i0] * (1 - smoothT) + radiiMap[i1] * smoothT);
  };

  const traceExactSealContour = () => {
    ctx.beginPath();
    const steps = 180;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const r = getSmoothRadius(a);
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  };

  const img = new Image();

  img.onload = () => {
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.save();

    // 1. Cắt theo đúng đường viền thực tế của sáp đỏ
    traceExactSealContour();
    ctx.clip();

    // 2. Vẽ ảnh con dấu hoa hồng
    ctx.drawImage(img, 0, 0, SIZE, SIZE);

    // 3. Phủ nhẹ đường viền sáp đỏ sẫm ở mép ngoài cùng để triệt tiêu hoàn toàn răng cưa sáng màu
    traceExactSealContour();
    ctx.strokeStyle = '#4a0907';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.restore();
  };

  img.onerror = () => {
    if (!img.dataset.fallback) {
      img.dataset.fallback = 'true';
      img.src = './thiep.jpg';
    }
  };

  img.src = './img/thiep.jpg';
}