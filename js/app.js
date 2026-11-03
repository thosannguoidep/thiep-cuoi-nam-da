// =========================================================================
// 1. DÁN LINK /exec CỦA GOOGLE APPS SCRIPT VÀO GIỮA DẤU NHÁY ĐƠN DƯỚI ĐÂY
// =========================================================================
const API_URL = 'https://script.google.com/macros/s/DÁN_MÃ_CỦA_BẠN_VÀO_ĐÂY/exec';

const WEDDING_DATE = new Date('2026-12-12T17:30:00+07:00').getTime();
const LOCAL_STORAGE_KEY = 'wedding_nam_da_excel_data';
let isPlayingMusic = false;

document.addEventListener('DOMContentLoaded', () => {
  // Khởi tạo ngay phong bì 3D & con dấu sáp trước tiên
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

    setTimeout(() => {
      overlay.classList.add('envelope-opened');
    }, 1850);
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
// 6. LƯU THÔNG TIN VÀO GOOGLE SHEETS / EXCEL & SỔ LƯU BÚT
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
    if (API_URL.startsWith('http') && !API_URL.includes('DÁN_MÃ')) {
      const res = await fetch(API_URL);
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        if (badgeEl) badgeEl.textContent = `${result.data.length} lời chúc`;
        renderWishes(result.data);
        return;
      }
    }
  } catch (err) {}

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

  const payload = {
    createdAt: new Date().toLocaleString('vi-VN'),
    guestName: document.getElementById('guestName').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    side: document.getElementById('side').value,
    attendance: document.getElementById('attendance').value,
    guestsCount: Number(document.getElementById('guestsCount').value),
    wishMessage: document.getElementById('wishMessage').value.trim()
  };

  btn.disabled = true;
  btn.textContent = 'Đang gửi...';

  // Lưu ngay vào Sổ Lưu Bút trên trình duyệt
  const localList = getLocalExcelData();
  localList.unshift(payload);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localList));
  } catch (err) {}
  renderWishes(localList);

  const badgeEl = document.getElementById('wishesCountBadge');
  if (badgeEl) badgeEl.textContent = `${localList.length} lời chúc`;

  try {
    if (API_URL.includes('script.google.com') && API_URL.endsWith('/exec') && !API_URL.includes('DÁN_MÃ')) {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    }

    status.className = 'text-xs text-center text-green-600 font-medium block mt-2';
    status.textContent = 'Đã gửi xác nhận tham dự & lời chúc thành công!';
    document.getElementById('wishMessage').value = '';
  } catch (err) {
    status.className = 'text-xs text-center text-green-600 font-medium block mt-2';
    status.textContent = 'Đã lưu lời chúc vào Sổ Lưu Bút thành công!';
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

// =========================================================================
// 7. HIỆU ỨNG HỘP QUÀ & MODAL QUÀ CƯỚI NỀN ĐỎ
// =========================================================================
function toggleGiftModal(show) {
  const modal = document.getElementById('giftModal');
  const giftBox = document.getElementById('giftBox3DTrigger');
  if (!modal) return;

  if (show) {
    if (giftBox) {
      giftBox.classList.remove('gift-box-opening');
      giftBox.classList.add('gift-box-charging');
    }

    setTimeout(() => {
      if (giftBox) {
        giftBox.classList.remove('gift-box-charging');
        giftBox.classList.add('gift-box-opening');
      }
    }, 260);

    setTimeout(() => {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      initGiftModalSparkles();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          modal.classList.add('is-open');
        });
      });
    }, 750);
  } else {
    modal.classList.remove('is-open');
    if (giftBox) {
      giftBox.classList.remove('gift-box-charging', 'gift-box-opening');
    }

    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 420);
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

  // 1. Lớp lót trong lòng phong bì
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

  // 2. Thân túi phong bì phía trước (2 nếp gấp bên + 1 nếp gấp hình thang dưới)
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

  // 3. Nắp phong bì chữ V + Viền ren thêu đục lỗ (Broderie Anglaise)
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
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;

  const hCanvas = document.createElement('canvas');
  hCanvas.width = W;
  hCanvas.height = H;
  const hctx = hCanvas.getContext('2d');

  hctx.fillStyle = '#000000';
  hctx.fillRect(0, 0, W, H);

  hctx.save();
  hctx.filter = 'blur(4px)';
  hctx.beginPath();
  hctx.ellipse(cx, cy, 98, 134, 0, 0, Math.PI * 2);
  hctx.fillStyle = '#808080';
  hctx.fill();
  hctx.restore();

  hctx.save();
  hctx.filter = 'blur(6px)';
  hctx.beginPath();
  hctx.ellipse(cx, cy, 88, 122, 0, 0, Math.PI * 2);
  hctx.strokeStyle = '#ffffff';
  hctx.lineWidth = 16;
  hctx.stroke();
  hctx.restore();

  hctx.save();
  hctx.filter = 'blur(2px)';
  hctx.beginPath();
  hctx.ellipse(cx, cy, 78, 112, 0, 0, Math.PI * 2);
  hctx.fillStyle = '#555555';
  hctx.fill();
  hctx.restore();

  hctx.save();
  hctx.filter = 'blur(1.2px)';
  hctx.strokeStyle = '#d8d8d8';
  hctx.lineWidth = 3.2;
  hctx.beginPath();
  hctx.ellipse(cx, cy, 73, 106, 0, 0, Math.PI * 2);
  hctx.stroke();

  hctx.lineWidth = 2.4;
  [-1, 1].forEach(dir => {
    hctx.beginPath();
    hctx.moveTo(cx + dir * 56, cy - 52);
    hctx.quadraticCurveTo(cx + dir * 68, cy, cx + dir * 56, cy + 52);
    hctx.stroke();
  });
  hctx.restore();

  hctx.save();
  hctx.filter = 'blur(1.6px)';
  hctx.fillStyle = '#f2f2f2';
  hctx.strokeStyle = '#ffffff';
  hctx.lineCap = 'round';
  hctx.lineJoin = 'round';

  hctx.beginPath();
  hctx.moveTo(cx - 14, cy - 92);
  hctx.bezierCurveTo(cx - 28, cy - 76, cx - 22, cy - 48, cx - 2, cy - 26);
  hctx.bezierCurveTo(cx + 16, cy - 46, cx + 26, cy - 68, cx + 16, cy - 82);
  hctx.bezierCurveTo(cx + 8, cy - 88, cx - 4, cy - 80, cx - 14, cy - 92);
  hctx.fill();

  hctx.beginPath();
  hctx.moveTo(cx - 16, cy - 68);
  hctx.quadraticCurveTo(cx - 2, cy - 48, cx - 2, cy - 26);
  hctx.quadraticCurveTo(cx + 6, cy - 50, cx + 18, cy - 72);
  hctx.lineWidth = 4.5;
  hctx.stroke();

  hctx.beginPath();
  hctx.moveTo(cx - 1, cy - 62);
  hctx.lineTo(cx + 4, cy - 80);
  hctx.lineWidth = 5.5;
  hctx.stroke();

  hctx.beginPath();
  hctx.moveTo(cx - 2, cy - 28);
  hctx.quadraticCurveTo(cx - 3, cy, cx - 3, cy + 26);
  hctx.lineWidth = 5;
  hctx.stroke();

  hctx.beginPath();
  hctx.moveTo(cx - 3, cy + 18);
  hctx.bezierCurveTo(cx - 22, cy + 6, cx - 34, cy - 14, cx - 30, cy - 36);
  hctx.bezierCurveTo(cx - 18, cy - 22, cx - 8, cy - 4, cx - 3, cy + 12);
  hctx.closePath();
  hctx.fill();

  hctx.beginPath();
  hctx.moveTo(cx - 1, cy + 20);
  hctx.bezierCurveTo(cx + 18, cy + 8, cx + 32, cy - 10, cx + 30, cy - 32);
  hctx.bezierCurveTo(cx + 16, cy - 18, cx + 6, cy - 2, cx - 1, cy + 14);
  hctx.closePath();
  hctx.fill();
  hctx.restore();

  hctx.save();
  hctx.filter = 'blur(1px)';
  hctx.font = '700 28px "Cormorant Garamond", Georgia, serif';
  hctx.textAlign = 'center';
  hctx.textBaseline = 'middle';
  hctx.fillStyle = '#efefef';
  hctx.fillText('N&Đ', cx, cy + 62);
  hctx.restore();

  const hData = hctx.getImageData(0, 0, W, H).data;
  const outImg = ctx.createImageData(W, H);
  const out = outImg.data;

  const lx = -0.58, ly = -0.64, lz = 0.50;

  for (let y = 2; y < H - 2; y++) {
    for (let x = 2; x < W - 2; x++) {
      const nx = (x - cx) / 98;
      const ny = (y - cy) / 134;
      const angle = Math.atan2(ny, nx);
      const organicRadius = 1 + 0.014 * Math.sin(angle * 5) + 0.01 * Math.cos(angle * 3);
      const distSq = nx * nx + ny * ny;

      if (distSq > organicRadius * organicRadius) continue;

      const idx = (y * W + x) * 4;
      const hCenter = hData[idx] / 255;

      const hLeft = hData[(y * W + (x - 2)) * 4] / 255;
      const hRight = hData[(y * W + (x + 2)) * 4] / 255;
      const hUp = hData[((y - 2) * W + x) * 4] / 255;
      const hDown = hData[((y + 2) * W + x) * 4] / 255;

      const dx = (hRight - hLeft) * 3.4;
      const dy = (hDown - hUp) * 3.4;
      const invLen = 1 / Math.sqrt(dx * dx + dy * dy + 1);

      const normX = -dx * invLen;
      const normY = -dy * invLen;
      const normZ = invLen;

      let light = normX * lx + normY * ly + normZ * lz;
      light = light * 0.68 + hCenter * 0.34;

      const grain = (Math.random() - 0.5) * 0.018;
      const shade = Math.max(0.18, Math.min(1.06, light + grain));

      out[idx]     = Math.min(255, Math.round(176 + shade * 74));
      out[idx + 1] = Math.min(255, Math.round(158 + shade * 78));
      out[idx + 2] = Math.min(255, Math.round(134 + shade * 82));

      const edgeAlpha = Math.min(1, (organicRadius * organicRadius - distSq) * 28);
      out[idx + 3] = Math.round(edgeAlpha * 255);
    }
  }

  ctx.putImageData(outImg, 0, 0);
}