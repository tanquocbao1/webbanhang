// ============================================================
//  public/js/app.js
//  Logic Frontend – Kết nối với Backend API tại localhost:3000
// ============================================================

const API = 'http://localhost:3000/api';

// ============================================================
//  STATE – Trạng thái toàn cục của ứng dụng
// ============================================================
const state = {
    user:     JSON.parse(localStorage.getItem('baosneaker_user'))  || null,
    token:    localStorage.getItem('baosneaker_token')              || null,
    cart:     JSON.parse(localStorage.getItem('baosneaker_cart'))   || [],  // [{ product, qty }]
    products: [],
    filter:   'Tất cả',
    sort:     'default',
    priceMin: 0,   // 0 = không giới hạn
    priceMax: 0,   // 0 = không giới hạn
};

// ============================================================
//  INSTALLMENT STATE – Quản lý trạng thái tính trả góp
// ============================================================
const instState = {
    method: 'finance',       // 'finance' (công ty tài chính) | 'credit_card' (thẻ tín dụng)
    packageType: 'zero',     // 'zero' (0% lãi suất) | 'standard' (lãi suất chuẩn 1.49%/tháng)
    term: 6,                 // 3, 6, 9, 12 tháng
    downpayPct: 20,          // 0, 20, 30, 50 %
    productId: null
};

// ============================================================
//  HELPERS
// ============================================================
const fmt = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function getBrandFallback(brand) {
    const b = (brand || '').toLowerCase();
    switch (b) {
        case 'apple': return '/images/products/apple/5.png';
        case 'samsung': return '/images/products/samsung/21.jpg';
        case 'xiaomi': return '/images/products/xiaomi/41.jpg';
        case 'oppo': return '/images/products/oppo/66.jpg';
        case 'vivo': return '/images/products/vivo/81.jpg';
        default: return '/images/products/apple/5.png';
    }
}

function showToast(msg, type = '') {
    const t = $('#toast');
    t.textContent = msg;
    t.className = `toast ${type} show`;
    setTimeout(() => t.classList.remove('show'), 3000);
}

// Lưu giỏ hàng vào localStorage
function saveCart() {
    localStorage.setItem('baosneaker_cart', JSON.stringify(state.cart));
}

// ============================================================
//  AUTH – Quản lý đăng nhập / đăng xuất
// ============================================================
function updateNavAuth() {
    const guestEl = $('#nav-guest');
    const userEl  = $('#nav-user');
    const nameEl  = $('#nav-username');
    const avatarEl = $('#nav-avatar-char');
    const adminNavBtn = $('#nav-admin-btn');
    const dropdownAdminLink = $('#dropdown-admin-link');
    const notifBtn = $('#btn-notif-nav');

    if (state.user) {
        guestEl.style.display = 'none';
        userEl.style.display  = 'flex';
        nameEl.textContent    = state.user.full_name.split(' ').slice(-1)[0]; // Lấy tên
        avatarEl.textContent  = state.user.full_name.charAt(0).toUpperCase();

        const isStaff = ['admin', 'warehouse', 'sales'].includes(state.user.role);
        if (adminNavBtn) adminNavBtn.style.display = isStaff ? 'inline-flex' : 'none';
        if (dropdownAdminLink) dropdownAdminLink.style.display = isStaff ? 'flex' : 'none';

        if (notifBtn) notifBtn.style.display = 'inline-flex';
        refreshNotificationsBadge();
    } else {
        guestEl.style.display = 'flex';
        userEl.style.display  = 'none';
        if (adminNavBtn) adminNavBtn.style.display = 'none';
        if (dropdownAdminLink) dropdownAdminLink.style.display = 'none';
        if (notifBtn) notifBtn.style.display = 'none';
    }
}

function logout() {
    state.user  = null;
    state.token = null;
    localStorage.removeItem('baosneaker_user');
    localStorage.removeItem('baosneaker_token');
    updateNavAuth();
    closeUserMenu();
    showToast('Đã đăng xuất thành công.', 'success');
    navigateTo('home');
}

// ============================================================
//  CART – Quản lý giỏ hàng
// ============================================================
function updateCartBadge() {
    const total = state.cart.reduce((s, i) => s + i.qty, 0);
    const badge = $('#cart-badge');
    badge.textContent = total;
    total > 0 ? badge.classList.add('show') : badge.classList.remove('show');
}

function addToCart(product) {
    // Phải đăng nhập mới được đặt hàng
    if (!state.user) {
        showToast('Vui lòng đăng nhập để thêm vào giỏ hàng.', 'error');
        openModal('login');
        return;
    }
    if (product.stock_quantity === 0) {
        showToast('Sản phẩm này đã hết hàng!', 'error');
        return;
    }
    const existing = state.cart.find(i => i.product.id === product.id);
    if (existing) {
        if (existing.qty >= product.stock_quantity) {
            showToast('Đã đạt giới hạn số lượng trong kho!', 'error');
            return;
        }
        existing.qty += 1;
    } else {
        state.cart.push({ product, qty: 1 });
    }
    saveCart();
    updateCartBadge();
    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success');
}

// ============================================================
//  API CALLS
// ============================================================
async function fetchProducts() {
    const res  = await fetch(`${API}/products`);
    const data = await res.json();
    return data.success ? data.data : [];
}

async function doRegister(email, password, full_name) {
    const res  = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name }),
    });
    return res.json();
}

async function doLogin(email, password) {
    const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return res.json();
}

async function doCheckout(shipping_address) {
    const items = state.cart.map(i => ({ product_id: i.product.id, quantity: i.qty }));
    const res   = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${state.token}`,
        },
        body: JSON.stringify({ shipping_address, items }),
    });
    return res.json();
}

async function fetchMyOrders() {
    const res  = await fetch(`${API}/orders/my-orders`, {
        headers: { 'Authorization': `Bearer ${state.token}` },
    });
    return res.json();
}

// ============================================================
//  RENDER – Các hàm vẽ giao diện
// ============================================================

// Helper render box empty SVG
function emptyBoxSvg() {
    return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;
}

// Vẽ danh sách sản phẩm ra lưới
function renderProducts(products) {
    const grid = $('#product-grid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
            <div class="empty-icon">${emptyBoxSvg()}</div>
            <p>Không tìm thấy sản phẩm phù hợp.</p>
        </div>`;
        return;
    }

    grid.innerHTML = products.map(p => `
        <div class="product-card" onclick="openProductDetail(${p.id})">
            <div class="product-img-wrap">
                <img src="${p.image_url || getBrandFallback(p.brand)}"
                     alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src=getBrandFallback('${p.brand}')">
            </div>
            <div class="product-info">
                <div class="product-brand">${p.brand}</div>
                <div class="product-name">${p.name}</div>
                <div class="product-price">${fmt(p.price)}</div>
                <div class="${p.stock_quantity > 0 ? 'product-stock-ok' : 'product-stock-out'}">
                    ${p.stock_quantity > 0 ? `Còn ${p.stock_quantity} máy` : 'Tạm hết hàng'}
                </div>
            </div>
            <button class="btn-add-cart"
                onclick="event.stopPropagation(); addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})"
                ${p.stock_quantity === 0 ? 'disabled' : ''}>
                ${p.stock_quantity === 0 ? 'Hết hàng' : '+ Thêm vào giỏ'}
            </button>
        </div>
    `).join('');
}

// Vẽ giỏ hàng
function renderCart() {
    const list    = $('#cart-list');
    const summary = $('#order-summary');
    if (!list) return;

    if (state.cart.length === 0) {
        list.innerHTML = `<div class="empty-state">
            <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            </div>
            <p>Giỏ hàng của bạn đang trống.</p>
        </div>`;
        if (summary) summary.style.opacity = '.5';
        return;
    }

    if (summary) summary.style.opacity = '1';

    list.innerHTML = state.cart.map((item, idx) => `
        <div class="cart-item">
            <img class="cart-item-img"
                 src="${item.product.image_url || getBrandFallback(item.product.brand)}"
                 alt="${item.product.name}"
                 onerror="this.onerror=null;this.src=getBrandFallback('${item.product.brand}')">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.product.name}</div>
                <div class="cart-item-price">${fmt(item.product.price)}</div>
                <div class="cart-qty">
                    <button class="qty-btn" onclick="changeQty(${idx}, -1)">−</button>
                    <span class="qty-num">${item.qty}</span>
                    <button class="qty-btn" onclick="changeQty(${idx},  1)">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${idx})" title="Xóa">&times;</button>
        </div>
    `).join('');

    // Cập nhật tổng tiền
    const subtotal = state.cart.reduce((s, i) => s + i.product.price * i.qty, 0);
    const itemCount = state.cart.reduce((s, i) => s + i.qty, 0);
    $('#summary-items').textContent = `${itemCount} sản phẩm`;
    $('#summary-subtotal').textContent = fmt(subtotal);
    $('#summary-total').textContent    = fmt(subtotal);
}

function changeQty(idx, delta) {
    const item = state.cart[idx];
    const newQty = item.qty + delta;
    if (newQty < 1) { removeFromCart(idx); return; }
    if (newQty > item.product.stock_quantity) { showToast('Không đủ hàng trong kho!', 'error'); return; }
    item.qty = newQty;
    saveCart(); updateCartBadge(); renderCart();
}

function removeFromCart(idx) {
    state.cart.splice(idx, 1);
    saveCart(); updateCartBadge(); renderCart();
    showToast('Đã xóa sản phẩm khỏi giỏ hàng.');
}

// Vẽ lịch sử đơn hàng
async function renderOrders() {
    const container = $('#orders-container');
    if (!container) return;

    if (!state.user) {
        container.innerHTML = `<div class="empty-state">
            <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <p>Vui lòng <a href="#" onclick="openModal('login')">đăng nhập</a> để xem đơn hàng.</p>
        </div>`;
        return;
    }

    container.innerHTML = '<div class="spinner"></div>';

    const data = await fetchMyOrders();
    if (!data.success || data.data.length === 0) {
        container.innerHTML = `<div class="empty-state">
            <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <p>Bạn chưa có đơn hàng nào.</p>
        </div>`;
        return;
    }

    const statusLabel = { pending:'Chờ xác nhận', shipping:'Đang giao', completed:'Hoàn thành', cancelled:'Đã hủy' };

    container.innerHTML = data.data.map(o => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <div class="order-code">Đơn hàng #${o.order_id}</div>
                    <div class="order-date">${new Date(o.created_at).toLocaleDateString('vi-VN')}</div>
                </div>
                <span class="order-status status-${o.status}">${statusLabel[o.status] || o.status}</span>
            </div>
            <div class="order-items-list">
                ${(o.items || []).map(i => `
                    <div class="order-item-row">
                        <span>${i.product_name || 'Sản phẩm'} × ${i.quantity}</span>
                        <span>${fmt(i.price * i.quantity)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                <span>Tổng cộng</span>
                <span>${fmt(o.total_amount)}</span>
            </div>
        </div>
    `).join('');
}

// ============================================================
//  NAVIGATION – SPA Routing
// ============================================================
function navigateTo(page, subtab = null) {
    const footer = $('.footer-pro');

    if (page === 'admin') {
        if (!state.user) {
            showToast('Vui lòng đăng nhập với tài khoản Quản trị viên.', 'error');
            openModal('login');
            return;
        }
        if (!['admin', 'warehouse', 'sales'].includes(state.user.role)) {
            showToast('Tài khoản của bạn không có quyền truy cập khu vực Quản trị!', 'error');
            return;
        }
        if (footer) footer.style.display = 'none';
        initAdminDashboard();
    } else {
        if (footer) footer.style.display = 'block';
    }

    if (page === 'profile') {
        if (!state.user) {
            showToast('Vui lòng đăng nhập để xem trang cá nhân và hộp thư.', 'error');
            openModal('login');
            return;
        }
        loadUserProfile();
        if (subtab) switchProfileTab(subtab);
    }

    if (page === 'checkout') {
        if (!state.user) {
            showToast('Vui lòng đăng nhập để tiến hành thanh toán.', 'error');
            openModal('login');
            return;
        }
        if (state.cart.length === 0) {
            showToast('Giỏ hàng trống! Vui lòng chọn sản phẩm.', 'error');
            navigateTo('products');
            return;
        }
        renderCheckout();
    }

    $$('.page').forEach(p => p.classList.remove('active'));
    $$('.nav-link').forEach(l => l.classList.remove('active'));

    const pageEl = $(`#page-${page}`);
    const linkEl = $(`.nav-link[data-page="${page}"]`);
    if (pageEl) pageEl.classList.add('active');
    if (linkEl) linkEl.classList.add('active');

    // Tải dữ liệu theo trang
    if (page === 'products') renderProductsPage();
    if (page === 'cart')     renderCart();
    if (page === 'orders')   renderOrders();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigateToBrand(brand) {
    state.filter = brand;
    navigateTo('products');
    applyFilter(brand);
}

async function renderProductsPage() {
    const grid = $('#product-grid');
    if (!grid) return;
    grid.innerHTML = '<div class="spinner"></div>';
    state.products = await fetchProducts();
    applyFilter(state.filter);
}

// Helper: vẽ danh sách sản phẩm ra một grid container bất kỳ
function renderGrid(products, containerId) {
    const grid = $(`#${containerId}`);
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
            <div class="empty-icon">${emptyBoxSvg()}</div>
            <p>Không có sản phẩm nào.</p>
        </div>`;
        return;
    }

    grid.innerHTML = products.map(p => `
        <div class="product-card" onclick="openProductDetail(${p.id})">
            <div class="product-img-wrap">
                <img src="${p.image_url || getBrandFallback(p.brand)}"
                     alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src=getBrandFallback('${p.brand}')">
            </div>
            <div class="product-info">
                <div class="product-brand">${p.brand}</div>
                <div class="product-name">${p.name}</div>
                <div class="product-price">${fmt(p.price)}</div>
                <div class="${p.stock_quantity > 0 ? 'product-stock-ok' : 'product-stock-out'}">
                    ${p.stock_quantity > 0 ? `Còn ${p.stock_quantity} máy` : 'Tạm hết hàng'}
                </div>
            </div>
            <button class="btn-add-cart"
                onclick="event.stopPropagation(); addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})"
                ${p.stock_quantity === 0 ? 'disabled' : ''}>
                ${p.stock_quantity === 0 ? 'Hết hàng' : '+ Thêm vào giỏ'}
            </button>
        </div>
    `).join('');
}

// ============================================================
//  HERO BANNER SLIDER (CAROUSEL)
// ============================================================
let currentSlide = 0;
let sliderTimer = null;

function showSlide(index) {
    const slides = $$('.hero-slide');
    const dots   = $$('.slider-dot');
    if (slides.length === 0) return;

    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;

    slides.forEach((s, i) => s.classList.toggle('active', i === currentSlide));
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}

function nextSlide() {
    showSlide(currentSlide + 1);
    resetSliderTimer();
}

function prevSlide() {
    showSlide(currentSlide - 1);
    resetSliderTimer();
}

function goToSlide(index) {
    showSlide(index);
    resetSliderTimer();
}

function startSliderAutoPlay() {
    stopSliderAutoPlay();
    sliderTimer = setInterval(() => {
        showSlide(currentSlide + 1);
    }, 4000); // Tự động chuyển ảnh sau 4 giây
}

function stopSliderAutoPlay() {
    if (sliderTimer) clearInterval(sliderTimer);
}

function resetSliderTimer() {
    stopSliderAutoPlay();
    startSliderAutoPlay();
}

function initHeroSlider() {
    const sliderWrap = $('#hero-slider');
    if (!sliderWrap) return;

    showSlide(0);
    startSliderAutoPlay();

    // Tạm dừng khi hover chuột vào banner
    sliderWrap.addEventListener('mouseenter', stopSliderAutoPlay);
    sliderWrap.addEventListener('mouseleave', startSliderAutoPlay);
}

// ============================================================
//  FLASH SALE COUNTDOWN TIMER
// ============================================================
let countdownInterval = null;

function initCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);

    function updateTimer() {
        const now = new Date();
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const diff = end - now;

        if (diff <= 0) {
            end.setDate(end.getDate() + 1);
        }

        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins  = Math.floor((diff / (1000 * 60)) % 60);
        const secs  = Math.floor((diff / 1000) % 60);

        const pad = (n) => String(n).padStart(2, '0');
        const hEl = $('#cd-hours');
        const mEl = $('#cd-mins');
        const sEl = $('#cd-secs');

        if (hEl) hEl.textContent = pad(hours);
        if (mEl) mEl.textContent = pad(mins);
        if (sEl) sEl.textContent = pad(secs);
    }

    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
}

// ============================================================
//  HIỂN THỊ CÁC KHỐI SẢN PHẨM TRÊN TRANG CHỦ
// ============================================================

// 1. Đang giảm giá sốc (Flash Sale)
function renderHomeFlashSale(products) {
    const grid = $('#home-flash-grid');
    if (!grid) return;

    const flashList = products.filter(p => [14, 15, 25, 33, 49, 58, 66, 73].includes(p.id)).slice(0, 4);
    const displayList = flashList.length >= 4 ? flashList : products.slice(10, 14);

    grid.innerHTML = displayList.map(p => {
        const discountPct = 15 + (p.id % 15);
        const originalPrice = Math.round(p.price / (1 - discountPct / 100));
        const soldPct = 65 + (p.id % 30);

        return `
            <div class="product-card" onclick="openProductDetail(${p.id})">
                <span class="card-discount-badge">-${discountPct}%</span>
                <div class="product-img-wrap">
                    <img src="${p.image_url || getBrandFallback(p.brand)}"
                         alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src=getBrandFallback('${p.brand}')">
                </div>
                <div class="product-info">
                    <div class="product-brand">${p.brand}</div>
                    <div class="product-name">${p.name}</div>
                    <div class="card-price-row">
                        <span class="product-price">${fmt(p.price)}</span>
                        <span class="card-original-price">${fmt(originalPrice)}</span>
                    </div>
                    <div class="card-flash-progress">
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width:${soldPct}%"></div>
                        </div>
                        <div class="progress-text">
                            <span>🔥 Đã bán ${soldPct}%</span>
                            <span style="color:#16a34a">Trả góp 0%</span>
                        </div>
                    </div>
                </div>
                <button class="btn-add-cart"
                    onclick="event.stopPropagation(); addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})"
                    ${p.stock_quantity === 0 ? 'disabled' : ''}>
                    ${p.stock_quantity === 0 ? 'Hết hàng' : '+ Thêm vào giỏ'}
                </button>
            </div>
        `;
    }).join('');
}

// 2. Sản phẩm mới ra mắt (New Arrivals)
function renderHomeNewArrivals(products) {
    const grid = $('#home-new-grid');
    if (!grid) return;

    const newIds = [1, 21, 41, 66];
    let newItems = products.filter(p => newIds.includes(p.id));
    if (newItems.length < 4) newItems = products.slice(0, 4);

    grid.innerHTML = newItems.map(p => `
        <div class="product-card" onclick="openProductDetail(${p.id})">
            <span class="card-tag-badge">✨ Mới ra mắt</span>
            <div class="product-img-wrap">
                <img src="${p.image_url || getBrandFallback(p.brand)}"
                     alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src=getBrandFallback('${p.brand}')">
            </div>
            <div class="product-info">
                <div class="product-brand">${p.brand}</div>
                <div class="product-name">${p.name}</div>
                <div class="product-price">${fmt(p.price)}</div>
                <div class="${p.stock_quantity > 0 ? 'product-stock-ok' : 'product-stock-out'}">
                    ${p.stock_quantity > 0 ? `Còn ${p.stock_quantity} máy • Trả góp 0%` : 'Tạm hết hàng'}
                </div>
            </div>
            <button class="btn-add-cart"
                onclick="event.stopPropagation(); addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})"
                ${p.stock_quantity === 0 ? 'disabled' : ''}>
                ${p.stock_quantity === 0 ? 'Hết hàng' : '+ Thêm vào giỏ'}
            </button>
        </div>
    `).join('');
}

// 3. Điện thoại bán chạy (Best Sellers)
function renderHomeBestSellers(products) {
    const grid = $('#home-bestseller-grid');
    if (!grid) return;

    const bestIds = [9, 28, 50, 88];
    let bestItems = products.filter(p => bestIds.includes(p.id));
    if (bestItems.length < 4) bestItems = products.slice(4, 8);

    grid.innerHTML = bestItems.map((p, idx) => `
        <div class="product-card" onclick="openProductDetail(${p.id})">
            <span class="card-tag-badge" style="background:#ea580c">★ Top ${idx + 1} Bán chạy</span>
            <div class="product-img-wrap">
                <img src="${p.image_url || getBrandFallback(p.brand)}"
                     alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src=getBrandFallback('${p.brand}')">
            </div>
            <div class="product-info">
                <div class="product-brand">${p.brand}</div>
                <div class="product-name">${p.name}</div>
                <div class="product-price">${fmt(p.price)}</div>
                <div class="${p.stock_quantity > 0 ? 'product-stock-ok' : 'product-stock-out'}">
                    ${p.stock_quantity > 0 ? `Còn ${p.stock_quantity} máy • Sẵn hàng` : 'Tạm hết hàng'}
                </div>
            </div>
            <button class="btn-add-cart"
                onclick="event.stopPropagation(); addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})"
                ${p.stock_quantity === 0 ? 'disabled' : ''}>
                ${p.stock_quantity === 0 ? 'Hết hàng' : '+ Thêm vào giỏ'}
            </button>
        </div>
    `).join('');
}

async function renderHomeFeatured() {
    state.products = await fetchProducts();
    
    // Render 3 khối sản phẩm trang chủ
    renderHomeFlashSale(state.products);
    renderHomeNewArrivals(state.products);
    renderHomeBestSellers(state.products);

    // Khởi tạo slider và countdown timer
    initHeroSlider();
    initCountdown();
}

function applyFilter(brand) {
    state.filter = brand;
    $$('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.brand === brand));
    $$('.nav-link[data-brand]').forEach(l => l.classList.toggle('active', l.dataset.brand === brand));
    
    // Nếu chọn 1 thương hiệu cụ thể, bỏ active ở nút "Tất cả máy"
    if (brand !== 'Tất cả') {
        const allLink = $('.nav-link[data-page="products"][data-brand="Tất cả"]');
        if (allLink) allLink.classList.remove('active');
    }

    const heading = $('#products-heading');
    if (heading) {
        heading.textContent = brand === 'Tất cả' ? 'Tất cả sản phẩm' : `Điện thoại ${brand === 'Apple' ? 'Apple (iPhone)' : brand}`;
    }

    updateProductView();
}

function applySort(order) {
    state.sort = order;
    updateProductView();
}

function updateProductView() {
    // 1. Lọc theo thương hiệu
    let filtered = state.filter === 'Tất cả'
        ? [...state.products]
        : state.products.filter(p => p.brand === state.filter);

    // 2. Lọc theo giá
    if (state.priceMin > 0 || state.priceMax > 0) {
        filtered = filtered.filter(p => {
            const price = Number(p.price);
            const aboveMin = state.priceMin === 0 || price >= state.priceMin;
            const belowMax = state.priceMax === 0 || price <= state.priceMax;
            return aboveMin && belowMax;
        });
    }

    // 3. Sắp xếp
    if (state.sort === 'asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (state.sort === 'desc') {
        filtered.sort((a, b) => b.price - a.price);
    }

    // 4. Hiển thị số kết quả
    const countEl = $('#product-count');
    if (countEl) {
        countEl.style.display = 'block';
        countEl.innerHTML = `Tìm thấy <span>${filtered.length}</span> sản phẩm`;
    }

    renderGrid(filtered, 'product-grid');
}

// ============================================================
//  PRICE FILTER – Bộ lọc giá
// ============================================================

/**
 * Hiển thị giá dạng "X triệu" tiện lợi
 */
function fmtShort(n) {
    if (n === 0) return '';
    if (n >= 1000000) return (n / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' triệu';
    return (n / 1000).toLocaleString('vi-VN') + ' ngàn';
}

/**
 * Cập nhật phần hiển thị giá và nút reset
 */
function updatePriceDisplay() {
    const displayEl = $('#price-display');
    const resetBtn  = $('#price-reset-btn');
    const min = state.priceMin, max = state.priceMax;

    if (min === 0 && max === 0) {
        if (displayEl) { displayEl.textContent = 'Tất cả mức giá'; displayEl.classList.remove('show'); }
        if (resetBtn)  resetBtn.style.display = 'none';
    } else {
        let label = '';
        if (min > 0 && max > 0) label = `${fmtShort(min)} – ${fmtShort(max)}`;
        else if (min > 0)       label = `Từ ${fmtShort(min)}`;
        else                    label = `Đến ${fmtShort(max)}`;
        if (displayEl) { displayEl.textContent = label; displayEl.classList.add('show'); }
        if (resetBtn)  resetBtn.style.display = 'inline-flex';
    }
}

/**
 * Áp dụng preset giá nhanh
 */
function applyPricePreset(btn, min, max) {
    state.priceMin = min;
    state.priceMax = max;

    // Xóa input tùy chỉnh
    const minInp = $('#price-min'), maxInp = $('#price-max');
    if (minInp) minInp.value = '';
    if (maxInp) maxInp.value = '';

    // Active state của preset buttons
    $$('.price-preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    updatePriceDisplay();
    updateProductView();
}

/**
 * Người dùng nhập giá tùy chỉnh → bỏ active preset
 */
function onPriceInputChange() {
    $$('.price-preset-btn').forEach(b => b.classList.remove('active'));
}

/**
 * Áp dụng khoảng giá tùy chỉnh
 */
function applyCustomPrice() {
    const minVal = parseInt($('#price-min')?.value || '0', 10) || 0;
    const maxVal = parseInt($('#price-max')?.value || '0', 10) || 0;

    if (maxVal > 0 && minVal > maxVal) {
        showToast('Giá "Từ" không được lớn hơn giá "Đến"!', 'error');
        return;
    }

    state.priceMin = minVal;
    state.priceMax = maxVal;
    $$('.price-preset-btn').forEach(b => b.classList.remove('active'));

    updatePriceDisplay();
    updateProductView();

    if (minVal > 0 || maxVal > 0) {
        showToast(`Áp dụng lọc giá thành công!`, 'success');
    }
}

/**
 * Xóa bộ lọc giá
 */
function resetPriceFilter() {
    state.priceMin = 0;
    state.priceMax = 0;

    const minInp = $('#price-min'), maxInp = $('#price-max');
    if (minInp) minInp.value = '';
    if (maxInp) maxInp.value = '';

    $$('.price-preset-btn').forEach(b => b.classList.remove('active'));
    const firstPreset = $('.price-preset-btn');
    if (firstPreset) firstPreset.classList.add('active');

    updatePriceDisplay();
    updateProductView();
}

function openProductDetail(id) {
    const p = state.products.find(x => x.id === id);
    if (!p) return;

    // Reset installment state for current product
    instState.productId   = id;
    instState.method      = 'finance';
    instState.packageType = 'zero';
    instState.term        = 6;
    instState.downpayPct  = 20;

    navigateTo('detail');
    const d = $('#page-detail');

    // Tách description thành danh sách tính năng
    const descParts = (p.description || '').split(',').map(s => s.trim()).filter(Boolean);

    d.innerHTML = `
        <div class="section" style="max-width:960px">
            <button onclick="navigateTo('products')" class="detail-back-btn">
                ← Quay lại danh sách
            </button>
            <div class="detail-layout">
                <!-- Ảnh sản phẩm -->
                <div class="detail-img-wrap">
                    <img src="${p.image_url || getBrandFallback(p.brand)}"
                         alt="${p.name}"
                         onerror="this.onerror=null;this.src=getBrandFallback('${p.brand}')">
                    <div class="detail-badge-brand">${p.brand}</div>
                </div>

                <!-- Thông tin -->
                <div class="detail-info">
                    <div class="detail-brand-label">${p.brand}</div>
                    <h1 class="detail-name">${p.name}</h1>

                    <div class="detail-price-row">
                        <div class="detail-price">${fmt(p.price)}</div>
                        <div class="detail-stock-badge ${p.stock_quantity > 0 ? 'in' : 'out'}">
                            <span class="stock-dot"></span>
                            ${p.stock_quantity > 0 ? `Còn ${p.stock_quantity} máy` : 'Tạm hết hàng'}
                        </div>
                    </div>

                    ${descParts.length > 0 ? `
                    <div class="detail-specs">
                        <div class="detail-specs-title">✦ Thông số nổi bật</div>
                        <ul class="detail-specs-list">
                            ${descParts.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>` : ''}

                    <div class="detail-actions">
                        <button class="btn-add-cart detail-add-cart"
                            onclick="addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})"
                            ${p.stock_quantity === 0 ? 'disabled' : ''}>
                            ${p.stock_quantity === 0 ? '🚫 Tạm hết hàng' : '+ Thêm vào giỏ hàng'}
                        </button>
                        <button class="btn-detail-installment" onclick="scrollToInstallment()">
                            💳 Mua trả góp 0%
                        </button>
                        <button class="btn-detail-outline" onclick="navigateTo('products')">
                            Xem sản phẩm khác
                        </button>
                    </div>

                    <div class="detail-meta">
                        <div class="detail-meta-row"><span>Thương hiệu</span><span>${p.brand}</span></div>
                        <div class="detail-meta-row">
                            <span>Tình trạng kho</span>
                            <span style="color:${p.stock_quantity > 0 ? 'var(--success)' : 'var(--accent)'}">
                                ${p.stock_quantity > 0 ? `Còn hàng (${p.stock_quantity} sản phẩm)` : 'Hết hàng'}
                            </span>
                        </div>
                        <div class="detail-meta-row"><span>Bảo hành</span><span>12 tháng chính hãng</span></div>
                        <div class="detail-meta-row"><span>Xuất xứ</span><span>Chính hãng (LL/A)</span></div>
                        <div class="detail-meta-row"><span>Thanh toán</span><span>COD hoặc Trả góp linh hoạt</span></div>
                    </div>
                </div>
            </div>

            <!-- Khối trả góp điện thoại -->
            ${renderInstallmentCalculator(p)}
        </div>
    `;

    updateInstallmentCalculation();
}

// ============================================================
//  KHỐI TÍNH NĂNG TRẢ GÓP ĐIỆN THOẠI (INSTALLMENT CALCULATOR)
// ============================================================

function renderInstallmentCalculator(p) {
    return `
        <div class="installment-container" id="installment-section">
            <div class="installment-box">
                <div class="installment-header">
                    <div class="installment-header-left">
                        <span class="installment-badge">💡 Mua sắm thông minh</span>
                        <h3 class="installment-title">Ước tính trả góp điện thoại</h3>
                        <p class="installment-sub">Tính toán nhanh số tiền trả góp hàng tháng, chọn kỳ hạn và phương thức linh hoạt</p>
                    </div>
                    <div class="installment-header-promo">
                        <span class="promo-tag">🔥 Hỗ trợ Trả góp 0% Lãi suất</span>
                    </div>
                </div>

                <!-- 1. Tabs lựa chọn hình thức trả góp -->
                <div class="inst-label">1. Chọn hình thức trả góp:</div>
                <div class="installment-methods">
                    <div class="method-tab ${instState.method === 'finance' ? 'active' : ''}"
                         id="tab-finance" onclick="setInstallmentMethod('finance')">
                        <div class="method-icon">🏢</div>
                        <div class="method-info">
                            <div class="method-name">Công ty tài chính</div>
                            <div class="method-desc">Home Credit, FE Credit, HD Saison • Duyệt nhanh bằng CCCD, không giữ thẻ</div>
                        </div>
                    </div>
                    <div class="method-tab ${instState.method === 'credit_card' ? 'active' : ''}"
                         id="tab-credit" onclick="setInstallmentMethod('credit_card')">
                        <div class="method-icon">💳</div>
                        <div class="method-info">
                            <div class="method-name">Thẻ tín dụng (0% Lãi suất)</div>
                            <div class="method-desc">Hỗ trợ 25+ ngân hàng (Visa, Master, JCB) • Không cần giấy tờ, duyệt online ngay</div>
                        </div>
                    </div>
                </div>

                <!-- Gói lãi suất (dành cho công ty tài chính) -->
                <div class="installment-package-box" id="package-selector" style="${instState.method === 'finance' ? '' : 'display:none'}">
                    <label class="inst-label">Chương trình ưu đãi tài chính:</label>
                    <div class="package-grid">
                        <div class="package-btn ${instState.packageType === 'zero' ? 'active' : ''}"
                             id="pkg-zero" onclick="setInstallmentPackage('zero')">
                            <span class="package-btn-badge">Đề xuất</span>
                            <strong>⭐ Gói Trả Góp 0% Lãi Suất</strong>
                            <span class="inst-btn-sub">Lãi suất 0%/tháng • Áp dụng ưu đãi đặc biệt tại Bảo Sneaker</span>
                        </div>
                        <div class="package-btn ${instState.packageType === 'standard' ? 'active' : ''}"
                             id="pkg-standard" onclick="setInstallmentPackage('standard')">
                            <strong>Gói Tiêu Chuẩn Linh Hoạt</strong>
                            <span class="inst-btn-sub">Lãi suất phẳng 1.49%/tháng • Tỷ lệ duyệt hồ sơ 99%</span>
                        </div>
                    </div>
                </div>

                <!-- 2. Lựa chọn kỳ hạn (Số tháng) -->
                <div class="installment-group">
                    <label class="inst-label">2. Chọn kỳ hạn vay (Số tháng):</label>
                    <div class="inst-pills">
                        <button class="term-btn ${instState.term === 3 ? 'active' : ''}" onclick="setInstallmentTerm(3)">3 tháng</button>
                        <button class="term-btn ${instState.term === 6 ? 'active' : ''}" onclick="setInstallmentTerm(6)">6 tháng <span class="pill-rec">Phổ biến</span></button>
                        <button class="term-btn ${instState.term === 9 ? 'active' : ''}" onclick="setInstallmentTerm(9)">9 tháng</button>
                        <button class="term-btn ${instState.term === 12 ? 'active' : ''}" onclick="setInstallmentTerm(12)">12 tháng</button>
                    </div>
                </div>

                <!-- 3. Lựa chọn mức trả trước -->
                <div class="installment-group">
                    <div class="inst-label-row">
                        <label class="inst-label" style="margin-bottom:0">3. Chọn mức trả trước:</label>
                        <span class="inst-downpay-value" id="inst-downpay-display">20%</span>
                    </div>
                    <div class="inst-pills">
                        <button class="downpay-btn ${instState.downpayPct === 0 ? 'active' : ''}" onclick="setInstallmentDownpay(0)">0% (Trả trước 0đ)</button>
                        <button class="downpay-btn ${instState.downpayPct === 20 ? 'active' : ''}" onclick="setInstallmentDownpay(20)">20%</button>
                        <button class="downpay-btn ${instState.downpayPct === 30 ? 'active' : ''}" onclick="setInstallmentDownpay(30)">30%</button>
                        <button class="downpay-btn ${instState.downpayPct === 50 ? 'active' : ''}" onclick="setInstallmentDownpay(50)">50%</button>
                    </div>
                </div>

                <!-- 4. Bảng kết quả hiển thị chi tiết cho khách hàng -->
                <div class="installment-result-card">
                    <div class="result-highlight">
                        <div class="result-highlight-label">SỐ TIỀN CẦN ĐÓNG MỖI THÁNG (Mtháng)</div>
                        <div class="result-monthly-payment" id="res-monthly-payment">0 đ / tháng</div>
                        <div class="result-term-notice" id="res-term-notice">Góp trong 6 tháng • Lãi suất 0%</div>
                    </div>

                    <div class="result-details-grid">
                        <div class="res-item">
                            <span class="res-item-label">Giá niêm yết sản phẩm:</span>
                            <span class="res-item-val" id="res-product-price">0 đ</span>
                        </div>
                        <div class="res-item">
                            <span class="res-item-label">Số tiền trả trước:</span>
                            <span class="res-item-val highlight" id="res-downpay-amount">0 đ</span>
                        </div>
                        <div class="res-item">
                            <span class="res-item-label">Tiền gốc cần trả góp (Pgốc):</span>
                            <span class="res-item-val" id="res-principal-amount">0 đ</span>
                        </div>
                        <div class="res-item">
                            <span class="res-item-label">Lãi suất áp dụng:</span>
                            <span class="res-item-val" id="res-interest-rate">0% / tháng</span>
                        </div>
                        <div class="res-item">
                            <span class="res-item-label">Tổng tiền lãi phát sinh (Tlãi):</span>
                            <span class="res-item-val" id="res-total-interest">0 đ</span>
                        </div>
                        <div class="res-item">
                            <span class="res-item-label">Số tiền còn lại cần trả góp (Gốc + Lãi):</span>
                            <span class="res-item-val bold" id="res-total-repay">0 đ</span>
                        </div>
                    </div>

                    <!-- Giấy tờ cần chuẩn bị -->
                    <div class="inst-documents-box">
                        <div class="docs-icon" id="res-docs-icon">📄</div>
                        <div class="docs-content">
                            <div class="docs-title" id="res-docs-title">Giấy tờ & Điều kiện chuẩn bị:</div>
                            <div class="docs-text" id="res-docs-text">
                                • Căn cước công dân (CCCD) gắn chip chính chủ còn hạn (từ 20 - 60 tuổi).<br>
                                • Duyệt hồ sơ nhanh chóng trong 15 - 30 phút, không cần thế chấp tài sản.
                            </div>
                        </div>
                    </div>

                    <!-- Nút bấm hành động -->
                    <div class="inst-cta-row">
                        <button class="btn-inst-apply" onclick="openInstallmentModal(false)">
                            📝 Đăng ký trả góp ngay
                        </button>
                        <button class="btn-inst-consult" onclick="openInstallmentModal(true)">
                            📞 Nhận tư vấn trả góp miễn phí
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateInstallmentCalculation() {
    const p = state.products.find(x => x.id === instState.productId);
    if (!p) return;

    const price = Number(p.price) || 0;
    const downpayAmount = Math.round(price * (instState.downpayPct / 100));
    const pGoc = price - downpayAmount;

    // Lãi suất
    let rate = 0;
    if (instState.method === 'credit_card') {
        rate = 0;
    } else {
        rate = (instState.packageType === 'zero') ? 0 : 0.0149;
    }

    // Tổng tiền lãi = P_gốc * Lãi suất hàng tháng * Số tháng
    const totalInterest = Math.round(pGoc * rate * instState.term);
    
    // Tổng số tiền trả góp = P_gốc + T_lãi
    const totalRepay = pGoc + totalInterest;

    // Số tiền cần đóng mỗi tháng = (P_gốc + T_lãi) / Số tháng (làm tròn VNĐ)
    const monthlyPayment = instState.term > 0 ? Math.round(totalRepay / instState.term) : 0;

    // Cập nhật DOM
    const elMonthly = $('#res-monthly-payment');
    if (elMonthly) elMonthly.textContent = `${fmt(monthlyPayment)} / tháng`;

    const elNotice = $('#res-term-notice');
    if (elNotice) {
        const rateText = rate === 0 ? 'Lãi suất 0% (Ưu đãi)' : 'Lãi suất 1.49%/tháng';
        const methodText = instState.method === 'credit_card' ? 'Thẻ tín dụng' : 'Công ty tài chính';
        elNotice.textContent = `Góp ${instState.term} tháng qua ${methodText} • ${rateText}`;
    }

    const elPrice = $('#res-product-price');
    if (elPrice) elPrice.textContent = fmt(price);

    const elDown = $('#res-downpay-amount');
    if (elDown) elDown.textContent = `${fmt(downpayAmount)} (${instState.downpayPct}%)`;

    const elDownDisplay = $('#inst-downpay-display');
    if (elDownDisplay) elDownDisplay.textContent = `${instState.downpayPct}% (${fmt(downpayAmount)})`;

    const elGoc = $('#res-principal-amount');
    if (elGoc) elGoc.textContent = fmt(pGoc);

    const elRate = $('#res-interest-rate');
    if (elRate) elRate.textContent = rate === 0 ? '0% / tháng (Miễn phí lãi)' : '1.49% / tháng (Lãi phẳng)';

    const elInterest = $('#res-total-interest');
    if (elInterest) elInterest.textContent = fmt(totalInterest);

    const elTotalRepay = $('#res-total-repay');
    if (elTotalRepay) elTotalRepay.textContent = fmt(totalRepay);

    // Cập nhật giấy tờ
    const elDocsIcon = $('#res-docs-icon');
    const elDocsTitle = $('#res-docs-title');
    const elDocsText = $('#res-docs-text');
    if (elDocsText) {
        if (instState.method === 'credit_card') {
            if (elDocsIcon) elDocsIcon.textContent = '💳';
            if (elDocsTitle) elDocsTitle.textContent = 'Điều kiện trả góp thẻ tín dụng:';
            elDocsText.innerHTML = `
                • Sở hữu thẻ tín dụng Visa / Mastercard / JCB còn hiệu lực của hơn 25 ngân hàng đối tác.<br>
                • Hạn mức khả dụng của thẻ tối thiểu bằng số tiền trả góp (${fmt(pGoc)}).<br>
                • Không cần cung cấp CCCD hay chứng minh thu nhập, duyệt tự động online 100% trong 5 phút.
            `;
        } else {
            if (elDocsIcon) elDocsIcon.textContent = '📄';
            if (elDocsTitle) elDocsTitle.textContent = 'Giấy tờ & Điều kiện qua công ty tài chính:';
            elDocsText.innerHTML = `
                • Căn cước công dân (CCCD) gắn chip chính chủ còn hiệu lực (Độ tuổi từ 20 đến 60 tuổi).<br>
                • Bằng lái xe hoặc hóa đơn điện thoại/tiện ích (nếu khoản vay trên 15 triệu để tăng tỷ lệ duyệt).<br>
                • Thời gian duyệt hồ sơ cực nhanh trong 15 – 30 phút, nhận máy ngay tại cửa hàng hoặc giao tận nơi.
            `;
        }
    }

    // Update active classes
    $$('.method-tab').forEach(el => {
        el.classList.toggle('active', el.id === (instState.method === 'finance' ? 'tab-finance' : 'tab-credit'));
    });

    const pkgBox = $('#package-selector');
    if (pkgBox) {
        pkgBox.style.display = instState.method === 'finance' ? '' : 'none';
        $('#pkg-zero')?.classList.toggle('active', instState.packageType === 'zero');
        $('#pkg-standard')?.classList.toggle('active', instState.packageType === 'standard');
    }

    $$('.term-btn').forEach(btn => {
        const t = parseInt(btn.getAttribute('onclick')?.match(/\d+/)?.[0] || '0');
        btn.classList.toggle('active', t === instState.term);
    });

    $$('.downpay-btn').forEach(btn => {
        const d = parseInt(btn.getAttribute('onclick')?.match(/\d+/)?.[0] || '0');
        btn.classList.toggle('active', d === instState.downpayPct);
    });
}

function setInstallmentMethod(m) {
    instState.method = m;
    updateInstallmentCalculation();
}

function setInstallmentPackage(pkg) {
    instState.packageType = pkg;
    updateInstallmentCalculation();
}

function setInstallmentTerm(t) {
    instState.term = t;
    updateInstallmentCalculation();
}

function setInstallmentDownpay(pct) {
    instState.downpayPct = pct;
    updateInstallmentCalculation();
}

function scrollToInstallment() {
    const el = $('#installment-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ============================================================
//  CLIENT VALIDATION & SANITIZATION HELPERS (LAYER 1)
// ============================================================
function cleanClientInput(val) {
    if (typeof val !== 'string') return '';
    return val.replace(/<[^>]*>/g, '').trim();
}

function validateFullName(name) {
    const clean = cleanClientInput(name);
    if (!clean) return 'Vui lòng nhập họ và tên.';
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length < 2) return 'Họ và tên cần có ít nhất 2 từ.';
    const regex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/;
    if (!regex.test(clean)) return 'Họ và tên không chứa số hoặc ký tự đặc biệt.';
    return '';
}

function validateVNPhone(phone) {
    const clean = cleanClientInput(phone).replace(/[\s.-]/g, '');
    if (!clean) return 'Vui lòng nhập số điện thoại liên hệ.';
    const regex = /^(0|\+84)(3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
    if (!regex.test(clean)) return 'Số điện thoại không đúng (phải gồm 10 số di động VN, ví dụ 0901234567).';
    return '';
}

function validateEmail(email) {
    const clean = cleanClientInput(email);
    if (!clean) return 'Vui lòng nhập địa chỉ email.';
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(clean)) return 'Định dạng email chưa đúng (ví dụ: hotro@baosneaker.vn).';
    return '';
}

function validateIdCard(idCard, method) {
    if (method === 'credit_card') return ''; // Thẻ tín dụng không bắt buộc CCCD
    const clean = cleanClientInput(idCard).replace(/\s/g, '');
    if (!clean) return 'Vui lòng nhập số CCCD để xét duyệt hồ sơ.';
    if (!/^[0-9]{9}$|^[0-9]{12}$/.test(clean)) return 'Số CCCD phải gồm đúng 12 chữ số (hoặc 9 số CMND cũ).';
    return '';
}

function setFieldError(inputEl, errorEl, msg) {
    if (!inputEl) return;
    if (msg) {
        inputEl.classList.add('is-invalid');
        inputEl.classList.remove('is-valid');
        if (errorEl) {
            errorEl.textContent = msg;
            errorEl.classList.add('show');
        }
    } else {
        inputEl.classList.remove('is-invalid');
        inputEl.classList.add('is-valid');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('show');
        }
    }
}

function openInstallmentModal(isConsult = false) {
    const p = state.products.find(x => x.id === instState.productId);
    if (!p) return;

    const price = Number(p.price) || 0;
    const downpayAmount = Math.round(price * (instState.downpayPct / 100));
    const pGoc = price - downpayAmount;
    const rate = (instState.method === 'credit_card' || instState.packageType === 'zero') ? 0 : 0.0149;
    const totalInterest = Math.round(pGoc * rate * instState.term);
    const totalRepay = pGoc + totalInterest;
    const monthlyPayment = Math.round(totalRepay / instState.term);

    const methodName = instState.method === 'credit_card' ? 'Thẻ tín dụng (0% lãi suất)' : 'Công ty tài chính';
    const modal = $('#modal');
    const overlay = $('#modal-overlay');

    const defaultName = state.user?.full_name || '';

    modal.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h2 style="font-size:20px;font-weight:800;color:var(--black);margin:0">
                ${isConsult ? '📞 Nhận tư vấn trả góp' : '📝 Đăng ký hồ sơ trả góp'}
            </h2>
            <button onclick="closeModal()" style="font-size:22px;color:var(--gray-400);line-height:1">✕</button>
        </div>
        <p class="modal-sub" style="margin-bottom:16px">
            ${isConsult ? 'Để lại thông tin để chuyên viên Bảo Sneaker tư vấn gói trả góp phù hợp nhất cho bạn' : 'Điền thông tin để duyệt hồ sơ online nhanh chóng trong 15 phút'}
        </p>

        <!-- Tóm tắt gói trả góp đã chọn -->
        <div class="inst-modal-summary">
            <div class="inst-modal-product">${p.name}</div>
            <div class="inst-modal-detail-row">
                <span>Hình thức:</span>
                <strong>${methodName}</strong>
            </div>
            <div class="inst-modal-detail-row">
                <span>Kỳ hạn trả góp:</span>
                <strong>${instState.term} tháng</strong>
            </div>
            <div class="inst-modal-detail-row">
                <span>Số tiền trả trước:</span>
                <strong style="color:#0284c7">${fmt(downpayAmount)} (${instState.downpayPct}%)</strong>
            </div>
            <div class="inst-modal-detail-row">
                <span>Góp mỗi tháng:</span>
                <strong style="color:var(--accent);font-size:15px">${fmt(monthlyPayment)} / tháng</strong>
            </div>
        </div>

        <div class="form-error" id="inst-form-error" style="display:none;margin-bottom:12px"></div>

        <!-- 1. Họ và tên -->
        <div class="form-group" style="margin-bottom:12px">
            <label style="font-size:12.5px;font-weight:700">Họ và tên *</label>
            <input type="text" id="inst-inp-name" value="${defaultName}" placeholder="Ví dụ: Nguyễn Văn An" autocomplete="name">
            <div class="field-error-msg" id="err-inst-name"></div>
        </div>

        <!-- 2. SĐT & CCCD/Ngân hàng -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
            <div class="form-group" style="margin-bottom:0">
                <label style="font-size:12.5px;font-weight:700">Số điện thoại *</label>
                <input type="tel" id="inst-inp-phone" placeholder="0901234567" autocomplete="tel">
                <div class="field-error-msg" id="err-inst-phone"></div>
            </div>
            <div class="form-group" style="margin-bottom:0">
                <label style="font-size:12.5px;font-weight:700">${instState.method === 'credit_card' ? 'Ngân hàng phát hành thẻ' : 'Số CCCD (12 chữ số) *'}</label>
                <input type="text" id="inst-inp-id" placeholder="${instState.method === 'credit_card' ? 'VD: Vietcombank, Techcom...' : '079204001234'}">
                <div class="field-error-msg" id="err-inst-id"></div>
            </div>
        </div>

        <!-- 3. Địa chỉ -->
        <div class="form-group" style="margin-bottom:16px">
            <label style="font-size:12.5px;font-weight:700">Địa chỉ / Khu vực nhận máy</label>
            <input type="text" id="inst-inp-addr" placeholder="Số nhà, tên đường, phường/xã, quận/huyện">
            <div class="field-error-msg" id="err-inst-addr"></div>
        </div>

        <button class="btn-form-submit" id="btn-submit-inst" style="background:var(--accent)" onclick="submitInstallmentApplication(${isConsult})">
            ${isConsult ? 'Gửi yêu cầu tư vấn' : 'Xác nhận nộp hồ sơ duyệt ngay'}
        </button>
    `;

    overlay.classList.add('open');

    // Gắn Real-time Validation (Lớp Front-end)
    const inpName  = $('#inst-inp-name');
    const inpPhone = $('#inst-inp-phone');
    const inpId    = $('#inst-inp-id');

    inpName?.addEventListener('input', () => {
        setFieldError(inpName, $('#err-inst-name'), validateFullName(inpName.value));
    });
    inpPhone?.addEventListener('input', () => {
        setFieldError(inpPhone, $('#err-inst-phone'), validateVNPhone(inpPhone.value));
    });
    inpId?.addEventListener('input', () => {
        setFieldError(inpId, $('#err-inst-id'), validateIdCard(inpId.value, instState.method));
    });
}

async function submitInstallmentApplication(isConsult) {
    const inpName  = $('#inst-inp-name');
    const inpPhone = $('#inst-inp-phone');
    const inpId    = $('#inst-inp-id');
    const inpAddr  = $('#inst-inp-addr');
    const errSummary = $('#inst-form-error');

    // 1. Lớp Front-end Validate: Bắt lỗi ngay tại Client
    const errName  = validateFullName(inpName?.value);
    const errPhone = validateVNPhone(inpPhone?.value);
    const errId    = validateIdCard(inpId?.value, instState.method);

    setFieldError(inpName,  $('#err-inst-name'),  errName);
    setFieldError(inpPhone, $('#err-inst-phone'), errPhone);
    setFieldError(inpId,    $('#err-inst-id'),    errId);

    if (errName || errPhone || errId) {
        if (errSummary) {
            errSummary.textContent = 'Vui lòng kiểm tra và sửa lại các trường thông tin có viền đỏ.';
            errSummary.style.display = 'block';
        }
        return;
    }
    if (errSummary) errSummary.style.display = 'none';

    // 2. Chuẩn hóa Payload và Sanitize sạch sẽ trước khi gửi
    const p = state.products.find(x => x.id === instState.productId) || { price: 20000000, id: instState.productId, name: 'Điện thoại' };
    const price = Number(p.price);
    const downpayAmount = Math.round(price * (instState.downpayPct / 100));

    const payload = {
        product_id: parseInt(p.id, 10),
        customer_name: cleanClientInput(inpName.value),
        phone: cleanClientInput(inpPhone.value).replace(/[\s.-]/g, ''),
        id_card: cleanClientInput(inpId ? inpId.value : ''),
        address: cleanClientInput(inpAddr ? inpAddr.value : ''),
        method: instState.method,
        term_months: parseInt(instState.term, 10),
        prepaid_percent: parseFloat(instState.downpayPct),
        package_type: instState.packageType
    };

    const submitBtn = $('#btn-submit-inst');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang xử lý hồ sơ...';
    }

    try {
        // 3. Gửi Request lên Back-end API
        const res = await fetch(`${API}/installments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(state.token ? { 'Authorization': `Bearer ${state.token}` } : {})
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        // 4. Quản lý trạng thái và Error Handling từ Server
        if (!res.ok || !data.success) {
            // Lớp Back-end trả về HTTP Status 400: ánh xạ từng lỗi vào form
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = isConsult ? 'Gửi yêu cầu tư vấn' : 'Xác nhận nộp hồ sơ duyệt ngay';
            }

            if (data.errors) {
                if (data.errors.customer_name) setFieldError(inpName,  $('#err-inst-name'),  data.errors.customer_name);
                if (data.errors.phone)         setFieldError(inpPhone, $('#err-inst-phone'), data.errors.phone);
                if (data.errors.id_card)       setFieldError(inpId,    $('#err-inst-id'),    data.errors.id_card);
                if (data.errors.address)       setFieldError(inpAddr,  $('#err-inst-addr'),  data.errors.address);
            }

            if (errSummary) {
                errSummary.textContent = data.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
                errSummary.style.display = 'block';
            }
            return;
        }

        // 5. Lưu thành công (HTTP Status 201): Hiển thị thông báo thành công chuẩn xác
        const modal = $('#modal');
        const r = data.data;

        modal.innerHTML = `
            <div style="text-align:center;padding:20px 10px">
                <div style="font-size:54px;margin-bottom:14px">🎉</div>
                <h2 style="font-size:22px;font-weight:800;color:var(--black);margin-bottom:8px">
                    ${isConsult ? 'Đã gửi yêu cầu tư vấn thành công!' : 'Đã tiếp nhận hồ sơ trả góp!'}
                </h2>
                <div style="display:inline-block;background:#ecfdf5;color:#047857;font-weight:700;padding:6px 16px;border-radius:100px;font-size:13px;margin-bottom:16px;border:1px solid #a7f3d0">
                    Mã hồ sơ: <strong>#${r.application_code || ('TG' + r.id)}</strong>
                </div>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;text-align:left;font-size:13px;line-height:1.6;margin-bottom:18px">
                    <div><strong>Họ tên:</strong> ${r.customer_name}</div>
                    <div><strong>SĐT liên hệ:</strong> ${r.phone}</div>
                    <div><strong>Sản phẩm:</strong> ${r.product_name || p.name}</div>
                    <div><strong>Kỳ hạn:</strong> ${r.term_months} tháng (${r.method === 'credit_card' ? 'Thẻ tín dụng 0%' : 'Công ty tài chính'})</div>
                    <div><strong>Trả trước:</strong> ${fmt(r.prepaid_amount)}</div>
                    <div><strong>Góp mỗi tháng:</strong> <strong style="color:#059669">${fmt(r.monthly_payment)}</strong></div>
                </div>
                <p style="font-size:13.5px;color:var(--gray-600);line-height:1.5;margin-bottom:20px">
                    Chuyên viên tài chính của <strong>Bảo Sneaker</strong> sẽ liên hệ qua số điện thoại <strong>${r.phone}</strong> trong vòng <strong>15 phút</strong> để hoàn tất thủ tục và giao máy.
                </p>
                <button class="btn-form-submit" style="background:var(--black);width:auto;padding:12px 32px;margin:0 auto" onclick="closeModal()">
                    Hoàn tất & Đóng
                </button>
            </div>
        `;

        showToast(`Đã lưu hồ sơ #${r.application_code || r.id} vào hệ thống!`, 'success');
    } catch (e) {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Xác nhận nộp hồ sơ duyệt ngay';
        }
        showToast('Có lỗi kết nối đến máy chủ, vui lòng thử lại sau.', 'error');
    }
}

// ============================================================
//  CUSTOMER SUPPORT / CONTACT MODAL (MODULE 4) - 2-LAYER VALIDATION
// ============================================================
function openContactModal() {
    const overlay = $('#modal-overlay');
    const modal = $('#modal');
    modal.innerHTML = `
        <h2>Trung tâm Hỗ trợ & CSKH Bảo Sneaker</h2>
        <p class="modal-sub">Gửi câu hỏi, yêu cầu bảo hành hoặc tư vấn sản phẩm</p>
        <div class="form-error" id="contact-form-error" style="display:none"></div>

        <div class="form-group">
            <label>Họ và tên *</label>
            <input type="text" id="contact-name" value="${state.user ? state.user.full_name : ''}" placeholder="Nguyễn Văn An" autocomplete="name">
            <div class="field-error-msg" id="err-contact-name"></div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="form-group">
                <label>Email *</label>
                <input type="email" id="contact-email" value="${state.user ? state.user.email : ''}" placeholder="hotro@baosneaker.vn" autocomplete="email">
                <div class="field-error-msg" id="err-contact-email"></div>
            </div>
            <div class="form-group">
                <label>Số điện thoại</label>
                <input type="tel" id="contact-phone" placeholder="0901234567" autocomplete="tel">
                <div class="field-error-msg" id="err-contact-phone"></div>
            </div>
        </div>

        <div class="form-group">
            <label>Chủ đề yêu cầu</label>
            <select id="contact-subject" style="width:100%;padding:10px 12px;border:1.5px solid var(--gray-200);border-radius:8px;font-family:inherit">
                <option value="Tư vấn mua trả góp 0%">Tư vấn mua trả góp 0%</option>
                <option value="Hỏi về thời gian giao hàng">Hỏi về thời gian giao hàng</option>
                <option value="Bảo hành & Đổi trả">Bảo hành & Đổi trả máy</option>
                <option value="Khiếu nại dịch vụ">Khiếu nại dịch vụ</option>
                <option value="Khác">Chủ đề khác</option>
            </select>
        </div>

        <div class="form-group">
            <label>Nội dung chi tiết *</label>
            <textarea id="contact-message" rows="4" style="width:100%;padding:10px 12px;border:1.5px solid var(--gray-200);border-radius:8px;font-family:inherit;resize:vertical" placeholder="Nhập câu hỏi hoặc nội dung bạn cần hỗ trợ (tối thiểu 10 ký tự)..."></textarea>
            <div class="field-error-msg" id="err-contact-message"></div>
        </div>

        <button class="btn-form-submit" id="btn-submit-contact" style="background:#2563eb" onclick="submitContactMessage()">
            Gửi yêu cầu hỗ trợ ngay
        </button>
    `;
    overlay.classList.add('open');

    // Real-time Event Listeners
    const inpName  = $('#contact-name');
    const inpEmail = $('#contact-email');
    const inpPhone = $('#contact-phone');
    const inpMsg   = $('#contact-message');

    inpName?.addEventListener('input', () => {
        setFieldError(inpName, $('#err-contact-name'), validateFullName(inpName.value));
    });
    inpEmail?.addEventListener('input', () => {
        setFieldError(inpEmail, $('#err-contact-email'), validateEmail(inpEmail.value));
    });
    inpPhone?.addEventListener('input', () => {
        const val = inpPhone.value.trim();
        setFieldError(inpPhone, $('#err-contact-phone'), val ? validateVNPhone(val) : '');
    });
    inpMsg?.addEventListener('input', () => {
        const val = inpMsg.value.trim();
        const err = !val ? 'Vui lòng nhập nội dung yêu cầu.' : (val.length < 10 ? 'Nội dung tối thiểu 10 ký tự.' : '');
        setFieldError(inpMsg, $('#err-contact-message'), err);
    });
}

async function submitContactMessage() {
    const inpName  = $('#contact-name');
    const inpEmail = $('#contact-email');
    const inpPhone = $('#contact-phone');
    const inpMsg   = $('#contact-message');
    const subject  = $('#contact-subject')?.value;
    const errSummary = $('#contact-form-error');

    // 1. Lớp Front-end Validate
    const errName  = validateFullName(inpName?.value);
    const errEmail = validateEmail(inpEmail?.value);
    const phoneVal = cleanClientInput(inpPhone?.value);
    const errPhone = phoneVal ? validateVNPhone(phoneVal) : '';
    const msgVal   = cleanClientInput(inpMsg?.value);
    const errMsg   = !msgVal ? 'Vui lòng nhập nội dung yêu cầu hỗ trợ.' : (msgVal.length < 10 ? 'Nội dung quá ngắn (tối thiểu 10 ký tự).' : '');

    setFieldError(inpName,  $('#err-contact-name'),  errName);
    setFieldError(inpEmail, $('#err-contact-email'), errEmail);
    setFieldError(inpPhone, $('#err-contact-phone'), errPhone);
    setFieldError(inpMsg,   $('#err-contact-message'), errMsg);

    if (errName || errEmail || errPhone || errMsg) {
        if (errSummary) {
            errSummary.textContent = 'Vui lòng điền đầy đủ và chính xác các thông tin có viền đỏ.';
            errSummary.style.display = 'block';
        }
        return;
    }
    if (errSummary) errSummary.style.display = 'none';

    // 2. Sanitize Payload
    const payload = {
        name: cleanClientInput(inpName.value),
        email: cleanClientInput(inpEmail.value).toLowerCase(),
        phone: phoneVal ? phoneVal.replace(/[\s.-]/g, '') : '',
        subject: cleanClientInput(subject || 'Yêu cầu tư vấn'),
        message: msgVal
    };

    const submitBtn = $('#btn-submit-contact');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang gửi tin nhắn...';
    }

    try {
        // 3. Gửi lên Back-end API
        const res = await fetch(`${API}/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(state.token ? { 'Authorization': `Bearer ${state.token}` } : {})
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        // 4. Xử lý phản hồi lỗi từ Server (HTTP Status 400)
        if (!res.ok || !data.success) {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Gửi yêu cầu hỗ trợ ngay';
            }
            if (data.errors) {
                if (data.errors.name)    setFieldError(inpName,  $('#err-contact-name'),    data.errors.name);
                if (data.errors.email)   setFieldError(inpEmail, $('#err-contact-email'),   data.errors.email);
                if (data.errors.phone)   setFieldError(inpPhone, $('#err-contact-phone'),   data.errors.phone);
                if (data.errors.message) setFieldError(inpMsg,   $('#err-contact-message'), data.errors.message);
            }
            if (errSummary) {
                errSummary.textContent = data.message || 'Dữ liệu không hợp lệ.';
                errSummary.style.display = 'block';
            }
            return;
        }

        // 5. Lưu thành công (HTTP Status 201)
        const modal = $('#modal');
        const c = data.data;

        modal.innerHTML = `
            <div style="text-align:center;padding:24px 10px">
                <div style="font-size:50px;margin-bottom:12px">💌</div>
                <h2 style="font-size:22px;font-weight:800;color:var(--black);margin-bottom:8px">Đã gửi yêu cầu hỗ trợ thành công!</h2>
                <div style="display:inline-block;background:#ecfdf5;color:#047857;font-weight:700;padding:6px 16px;border-radius:100px;font-size:13px;margin-bottom:16px;border:1px solid #a7f3d0">
                    Mã ticket: <strong>#${c.ticket_code || ('CSKH-' + c.id)}</strong>
                </div>
                <p style="font-size:14px;color:var(--gray-600);line-height:1.6;margin-bottom:20px">
                    Cảm ơn <strong>${c.name}</strong>! Yêu cầu hỗ trợ về <em>"${c.subject}"</em> đã được chuyển đến bộ phận CSKH của Bảo Sneaker. Chúng tôi sẽ phản hồi qua email <strong>${c.email}</strong> trong thời gian sớm nhất.
                </p>
                <button class="btn-form-submit" style="background:var(--black);width:auto;padding:12px 32px;margin:0 auto" onclick="closeModal()">
                    Đóng cửa sổ
                </button>
            </div>
        `;
        showToast('Yêu cầu hỗ trợ đã được lưu vào hệ thống!', 'success');
    } catch (e) {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Gửi yêu cầu hỗ trợ ngay';
        }
        showToast('Không thể kết nối đến máy chủ, vui lòng thử lại sau.', 'error');
    }
}

// ============================================================
//  MODAL – Login / Register
// ============================================================
function openModal(type) {
    const overlay = $('#modal-overlay');
    overlay.classList.add('open');
    showModalForm(type);
}
function closeModal() { $('#modal-overlay').classList.remove('open'); }

function showModalForm(type) {
    const modal = $('#modal');
    if (type === 'login') {
        modal.innerHTML = `
            <h2>Đăng nhập</h2>
            <p class="modal-sub">Chào mừng bạn quay trở lại</p>
            <div class="form-error" id="auth-error"></div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="inp-email" placeholder="you@example.com" autocomplete="email">
            </div>
            <div class="form-group">
                <label>Mật khẩu</label>
                <input type="password" id="inp-pass" placeholder="••••••••" autocomplete="current-password">
            </div>
            <button class="btn-form-submit" onclick="submitLogin()">Đăng nhập</button>
            <div class="modal-switch">Chưa có tài khoản? <a href="#" onclick="showModalForm('register')">Đăng ký ngay</a></div>
        `;
    } else {
        modal.innerHTML = `
            <h2>Tạo tài khoản</h2>
            <p class="modal-sub">Tạo tài khoản để nhận ưu đãi mua sắm</p>
            <div class="form-error" id="auth-error"></div>
            <div class="form-group">
                <label>Họ và tên</label>
                <input type="text" id="inp-name" placeholder="Nguyễn Văn A">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="inp-email" placeholder="you@example.com" autocomplete="email">
            </div>
            <div class="form-group">
                <label>Mật khẩu</label>
                <input type="password" id="inp-pass" placeholder="Ít nhất 6 ký tự" autocomplete="new-password">
            </div>
            <button class="btn-form-submit" onclick="submitRegister()">Đăng ký</button>
            <div class="modal-switch">Đã có tài khoản? <a href="#" onclick="showModalForm('login')">Đăng nhập</a></div>
        `;
    }
}

function showAuthError(msg) {
    const el = $('#auth-error');
    if (el) { el.textContent = msg; el.classList.add('show'); }
}

async function submitLogin() {
    const email = $('#inp-email')?.value.trim();
    const pass  = $('#inp-pass')?.value;
    if (!email || !pass) { showAuthError('Vui lòng nhập email và mật khẩu.'); return; }

    const btn = $('.btn-form-submit');
    btn.textContent = 'Đang đăng nhập...'; btn.disabled = true;

    const data = await doLogin(email, pass);
    if (data.success) {
        state.user  = data.data.user;
        state.token = data.data.token;
        localStorage.setItem('baosneaker_user',  JSON.stringify(state.user));
        localStorage.setItem('baosneaker_token', state.token);
        updateNavAuth();
        closeModal();
        showToast(`Đăng nhập thành công, xin chào ${state.user.full_name}!`, 'success');
    } else {
        btn.textContent = 'Đăng nhập'; btn.disabled = false;
        showAuthError(data.message || 'Đăng nhập thất bại.');
    }
}

async function submitRegister() {
    const name  = $('#inp-name')?.value.trim();
    const email = $('#inp-email')?.value.trim();
    const pass  = $('#inp-pass')?.value;
    if (!name || !email || !pass) { showAuthError('Vui lòng điền đầy đủ thông tin.'); return; }
    if (pass.length < 6)          { showAuthError('Mật khẩu phải có ít nhất 6 ký tự.'); return; }

    const btn = $('.btn-form-submit');
    btn.textContent = 'Đang đăng ký...'; btn.disabled = true;

    const data = await doRegister(email, pass, name);
    if (data.success) {
        showToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
        showModalForm('login');
    } else {
        btn.textContent = 'Đăng ký'; btn.disabled = false;
        showAuthError(data.message || 'Đăng ký thất bại.');
    }
}

// ============================================================
//  USER DROPDOWN MENU
// ============================================================
function toggleUserMenu() { $('#user-dropdown').classList.toggle('open'); }
function closeUserMenu()  { $('#user-dropdown')?.classList.remove('open'); }

// ============================================================
//  CART & CHECKOUT WORKFLOW (LUỒNG ĐẶT HÀNG COD CHUẨN NGHIỆP VỤ)
// ============================================================

// BƯỚC 1: XEM & QUẢN LÝ GIỎ HÀNG
function renderCart() {
    const listEl = $('#cart-list');
    const itemsCountEl = $('#summary-items');
    const subtotalEl = $('#summary-subtotal');
    const totalEl = $('#summary-total');
    if (!listEl) return;

    if (state.cart.length === 0) {
        listEl.innerHTML = `
            <div class="empty-state" style="padding:48px 20px;text-align:center">
                <div style="font-size:52px;margin-bottom:12px">🛒</div>
                <h3 style="font-size:18px;font-weight:800;color:var(--black);margin-bottom:6px">Giỏ hàng của bạn đang trống</h3>
                <p style="font-size:13.5px;color:var(--gray-600);margin-bottom:20px">Hãy khám phá các dòng điện thoại mới nhất và thêm vào giỏ hàng ngay.</p>
                <button class="btn-hero-primary" style="margin:0 auto;display:inline-flex" onclick="navigateTo('products')">
                    Khám phá điện thoại ngay
                </button>
            </div>
        `;
        if (itemsCountEl) itemsCountEl.textContent = '0 sản phẩm';
        if (subtotalEl) subtotalEl.textContent = '0đ';
        if (totalEl) totalEl.textContent = '0đ';
        return;
    }

    let subtotal = 0;
    let totalQty = 0;

    listEl.innerHTML = state.cart.map(item => {
        const itemTotal = item.qty * Number(item.product.price);
        subtotal += itemTotal;
        totalQty += item.qty;

        return `
            <div class="cart-item-row" data-id="${item.product.id}">
                <img src="${item.product.image_url || getBrandFallback(item.product.brand)}"
                     alt="${item.product.name}" class="cart-item-img"
                     onerror="this.onerror=null;this.src=getBrandFallback('${item.product.brand}')">

                <div class="cart-item-details">
                    <span class="cart-item-brand">${item.product.brand}</span>
                    <h4 class="cart-item-title">${item.product.name}</h4>
                    <div class="cart-item-price">${fmt(item.product.price)}</div>
                </div>

                <div class="cart-item-qty-control">
                    <button class="cart-qty-btn" onclick="changeCartQty(${item.product.id}, -1)">−</button>
                    <span class="cart-qty-val">${item.qty}</span>
                    <button class="cart-qty-btn" onclick="changeCartQty(${item.product.id}, 1)">+</button>
                </div>

                <div class="cart-item-total">
                    ${fmt(itemTotal)}
                </div>

                <button class="cart-remove-btn" title="Xóa khỏi giỏ" onclick="removeFromCart(${item.product.id})">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
    }).join('');

    if (itemsCountEl) itemsCountEl.textContent = `${totalQty} sản phẩm`;
    if (subtotalEl) subtotalEl.textContent = fmt(subtotal);
    if (totalEl) totalEl.textContent = fmt(subtotal);
}

function changeCartQty(productId, delta) {
    const item = state.cart.find(i => i.product.id === productId);
    if (!item) return;

    const newQty = item.qty + delta;
    if (newQty <= 0) {
        removeFromCart(productId);
        return;
    }
    if (newQty > item.product.stock_quantity) {
        showToast(`Kho chỉ còn ${item.product.stock_quantity} máy!`, 'error');
        return;
    }

    item.qty = newQty;
    saveCart();
    updateCartBadge();
    renderCart();
}

function removeFromCart(productId) {
    const item = state.cart.find(i => i.product.id === productId);
    state.cart = state.cart.filter(i => i.product.id !== productId);
    saveCart();
    updateCartBadge();
    renderCart();
    if (item) showToast(`Đã xóa "${item.product.name}" khỏi giỏ hàng.`, 'success');
}

// BƯỚC 2: CHUYỂN SANG TRANG CHECKOUT BẮT BUỘC
function goToCheckout() {
    if (state.cart.length === 0) {
        showToast('Giỏ hàng của bạn đang trống!', 'error');
        return;
    }
    if (!state.user) {
        showToast('Vui lòng đăng nhập tài khoản trước khi thanh toán.', 'error');
        openModal('login');
        return;
    }
    navigateTo('checkout');
}

let selectedPayment = 'cod';

function selectPaymentMethod(method) {
    selectedPayment = method;
    const cardCod = $('#opt-payment-cod');
    const cardBank = $('#opt-payment-bank');
    const radCod = $('#rad-pay-cod');
    const radBank = $('#rad-pay-bank');

    if (method === 'cod') {
        if (cardCod) cardCod.classList.add('selected');
        if (cardBank) cardBank.classList.remove('selected');
        if (radCod) radCod.checked = true;
    } else {
        if (cardBank) cardBank.classList.add('selected');
        if (cardCod) cardCod.classList.remove('selected');
        if (radBank) radBank.checked = true;
    }
}

function renderCheckout() {
    const itemsListEl = $('#checkout-items-list');
    const countEl = $('#checkout-item-count');
    const subtotalEl = $('#checkout-subtotal');
    const totalEl = $('#checkout-total');

    let subtotal = 0;
    let totalQty = 0;

    if (itemsListEl) {
        itemsListEl.innerHTML = state.cart.map(item => {
            const itemTotal = item.qty * Number(item.product.price);
            subtotal += itemTotal;
            totalQty += item.qty;

            return `
                <div class="checkout-item-mini">
                    <img src="${item.product.image_url || getBrandFallback(item.product.brand)}"
                         alt="${item.product.name}"
                         onerror="this.onerror=null;this.src=getBrandFallback('${item.product.brand}')">
                    <div class="checkout-item-mini-info">
                        <div class="checkout-item-mini-name">${item.product.name}</div>
                        <div class="checkout-item-mini-qty">Số lượng: ${item.qty} × ${fmt(item.product.price)}</div>
                    </div>
                    <div class="checkout-item-mini-price">${fmt(itemTotal)}</div>
                </div>
            `;
        }).join('');
    }

    if (countEl) countEl.textContent = `${totalQty} món`;
    if (subtotalEl) subtotalEl.textContent = fmt(subtotal);
    if (totalEl) totalEl.textContent = fmt(subtotal);

    // Điền tự động thông tin từ User Profile nếu có
    const inpName = $('#checkout-inp-name');
    const inpEmail = $('#checkout-inp-email');
    const inpPhone = $('#checkout-inp-phone');
    const inpAddress = $('#checkout-inp-address');

    if (state.user) {
        if (inpName && !inpName.value) inpName.value = state.user.full_name || '';
        if (inpEmail && !inpEmail.value) inpEmail.value = state.user.email || '';
        if (inpPhone && !inpPhone.value && state.user.phone) inpPhone.value = state.user.phone;
        if (inpAddress && !inpAddress.value && state.user.address) inpAddress.value = state.user.address;
    }

    // Gắn sự kiện validate realtime
    inpName?.addEventListener('input', () => {
        setFieldError(inpName, $('#err-checkout-name'), validateFullName(inpName.value));
    });
    inpPhone?.addEventListener('input', () => {
        setFieldError(inpPhone, $('#err-checkout-phone'), validateVNPhone(inpPhone.value));
    });
    inpAddress?.addEventListener('input', () => {
        const val = inpAddress.value.trim();
        const err = !val ? 'Vui lòng nhập địa chỉ nhận hàng.' : (val.length < 10 ? 'Địa chỉ tối thiểu 10 ký tự (gồm số nhà, tên đường, quận/huyện).' : '');
        setFieldError(inpAddress, $('#err-checkout-address'), err);
    });
}

// BƯỚC 3: BẤM "XÁC NHẬN ĐẶT HÀNG (COD)" -> LƯU DATABASE THẬT & CLEAR CART
async function submitCheckoutOrder() {
    if (!state.user) {
        showToast('Vui lòng đăng nhập trước khi đặt hàng.', 'error');
        openModal('login');
        return;
    }
    if (state.cart.length === 0) {
        showToast('Giỏ hàng trống!', 'error');
        return;
    }

    const inpName = $('#checkout-inp-name');
    const inpPhone = $('#checkout-inp-phone');
    const inpEmail = $('#checkout-inp-email');
    const inpAddress = $('#checkout-inp-address');
    const inpNote = $('#checkout-inp-note');
    const errSummary = $('#checkout-form-error');

    // 1. Lớp Front-end Validate
    const errName = validateFullName(inpName?.value);
    const errPhone = validateVNPhone(inpPhone?.value);
    const addrVal = cleanClientInput(inpAddress?.value);
    const errAddress = !addrVal ? 'Vui lòng nhập địa chỉ nhận hàng.' : (addrVal.length < 10 ? 'Địa chỉ quá ngắn (tối thiểu 10 ký tự, gồm số nhà, tên đường).' : '');

    setFieldError(inpName, $('#err-checkout-name'), errName);
    setFieldError(inpPhone, $('#err-checkout-phone'), errPhone);
    setFieldError(inpAddress, $('#err-checkout-address'), errAddress);

    if (errName || errPhone || errAddress) {
        if (errSummary) {
            errSummary.textContent = 'Vui lòng kiểm tra và điền đầy đủ các trường thông tin có viền đỏ.';
            errSummary.style.display = 'block';
        }
        return;
    }
    if (errSummary) errSummary.style.display = 'none';

    // 2. Chuẩn hóa Payload
    const payload = {
        customer_name: cleanClientInput(inpName.value),
        phone: cleanClientInput(inpPhone.value).replace(/[\s.-]/g, ''),
        shipping_address: addrVal,
        payment_method: selectedPayment || 'cod',
        note: cleanClientInput(inpNote?.value || ''),
        items: state.cart.map(i => ({
            product_id: parseInt(i.product.id, 10),
            quantity: parseInt(i.qty, 10)
        }))
    };

    const confirmBtn = $('#btn-confirm-order');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `<span>⏳ Đang khởi tạo đơn hàng COD...</span>`;
    }

    try {
        // 3. Gửi lên Back-end API (Kiểm duyệt lớp 2 & Transaction trừ kho)
        const res = await fetch(`${API}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg> Xác nhận Đặt hàng (COD)`;
            }
            if (data.errors) {
                if (data.errors.customer_name) setFieldError(inpName, $('#err-checkout-name'), data.errors.customer_name);
                if (data.errors.phone) setFieldError(inpPhone, $('#err-checkout-phone'), data.errors.phone);
                if (data.errors.shipping_address) setFieldError(inpAddress, $('#err-checkout-address'), data.errors.shipping_address);
            }
            if (errSummary) {
                errSummary.textContent = data.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.';
                errSummary.style.display = 'block';
            }
            return;
        }

        // 4. Đặt hàng thành công: Clear giỏ hàng trong LocalStorage & UI
        const newOrder = data.data;
        state.cart = [];
        saveCart();
        updateCartBadge();

        // 5. Cập nhật thông tin lên màn hình Đặt hàng thành công
        const codeEl = $('#success-order-code');
        const custNameEl = $('#success-customer-name');
        const phoneEl = $('#success-phone');
        const addrEl = $('#success-address');
        const methodEl = $('#success-pay-method');
        const totalEl = $('#success-total');

        if (codeEl) codeEl.textContent = `Mã đơn hàng: #DH-${newOrder.id}`;
        if (custNameEl) custNameEl.textContent = newOrder.customer_name || payload.customer_name;
        if (phoneEl) phoneEl.textContent = newOrder.phone || payload.phone;
        if (addrEl) addrEl.textContent = newOrder.shipping_address;
        if (methodEl) methodEl.textContent = (newOrder.payment_method === 'bank') ? 'Chuyển khoản ngân hàng (VietQR)' : 'Thanh toán khi nhận hàng (COD)';
        if (totalEl) totalEl.textContent = fmt(newOrder.total_amount);

        // Chuyển sang trang Success
        navigateTo('order-success');
        refreshNotificationsBadge();
        showToast('Đặt hàng thành công! Đơn hàng đã được lưu vào hệ thống.', 'success');

    } catch (err) {
        console.error('❌ Lỗi đặt hàng:', err);
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg> Xác nhận Đặt hàng (COD)`;
        }
        showToast('Không thể kết nối đến máy chủ, vui lòng thử lại sau.', 'error');
    }
}

// RENDER LỊCH SỬ ĐƠN HÀNG CỦA USER
async function renderOrders() {
    const container = $('#orders-container');
    if (!container) return;
    if (!state.user) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">${emptyBoxSvg()}</div>
                <p>Vui lòng đăng nhập để xem lịch sử đơn hàng của bạn.</p>
                <button class="btn-hero-primary" style="margin-top:12px" onclick="openModal('login')">Đăng nhập</button>
            </div>
        `;
        return;
    }

    container.innerHTML = '<div class="spinner"></div>';
    const res = await fetchMyOrders();

    if (!res.success || !res.data || res.data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">${emptyBoxSvg()}</div>
                <p>Bạn chưa có đơn hàng nào.</p>
                <button class="btn-hero-primary" style="margin-top:12px" onclick="navigateTo('products')">Mua sắm ngay</button>
            </div>
        `;
        return;
    }

    const statusBadge = (s) => {
        const map = {
            pending:    ['#fef3c7', '#d97706', 'Chờ xác nhận'],
            processing: ['#e0f2fe', '#0284c7', 'Đang xử lý'],
            shipping:   ['#f3e8ff', '#9333ea', 'Đang giao hàng'],
            completed:  ['#dcfce7', '#16a34a', 'Đã giao thành công'],
            cancelled:  ['#fee2e2', '#dc2626', 'Đã hủy'],
        };
        const [bg, col, label] = map[s] || ['#f3f4f6', '#4b5563', s];
        return `<span style="background:${bg};color:${col};padding:3px 10px;border-radius:100px;font-size:11.5px;font-weight:700;letter-spacing:.3px">${label}</span>`;
    };

    container.innerHTML = res.data.map(order => {
        const dateStr = new Date(order.created_at).toLocaleDateString('vi-VN', {
            hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
        });

        const itemsHtml = (order.items || []).map(i => `
            <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;border-bottom:1px dashed var(--gray-100)">
                <span>• ${i.product_name} <span style="color:var(--gray-400)">× ${i.quantity}</span></span>
                <strong>${fmt(i.price * i.quantity)}</strong>
            </div>
        `).join('');

        return `
            <div style="background:#fff;border:1px solid var(--gray-200);border-radius:12px;padding:18px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,.03)">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--gray-100)">
                    <div>
                        <strong style="font-size:15px;color:var(--black)">Đơn hàng #DH-${order.id}</strong>
                        <div style="font-size:12px;color:var(--gray-400);margin-top:2px">Thời gian đặt: ${dateStr}</div>
                    </div>
                    <div>${statusBadge(order.status)}</div>
                </div>

                <div style="margin-bottom:12px">
                    ${itemsHtml}
                </div>

                <div style="background:#f8fafc;padding:10px 14px;border-radius:8px;font-size:12.5px;color:var(--gray-600);margin-bottom:12px">
                    <div>📍 <strong>Địa chỉ nhận hàng:</strong> ${order.shipping_address}</div>
                    <div style="margin-top:4px">💳 <strong>Hình thức:</strong> ${order.payment_method === 'bank' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng (COD)'}</div>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center">
                    <span style="font-size:13px;color:var(--gray-600)">Tổng tiền thanh toán:</span>
                    <strong style="font-size:16px;color:var(--accent)">${fmt(order.total_amount)}</strong>
                </div>
            </div>
        `;
    }).join('');
}


// ============================================================
//  USER PROFILE & NOTIFICATIONS (TÀI KHOẢN & HỘP THƯ)
// ============================================================

function switchProfileTab(tabName) {
    const tabs = ['info', 'password', 'notifications', 'supports'];
    tabs.forEach(t => {
        const btn = $(`#tab-btn-${t}`);
        const content = $(`#tab-content-${t}`);
        if (btn) btn.classList.toggle('active', t === tabName);
        if (content) content.style.display = (t === tabName) ? 'block' : 'none';
    });

    if (tabName === 'notifications') loadUserNotifications();
    if (tabName === 'supports') loadUserSupports();
}

async function loadUserProfile() {
    if (!state.user || !state.token) return;

    try {
        const res = await fetch(`${API}/user/profile`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        if (!data.success) return;

        const u = data.data;

        // Cập nhật card tóm tắt
        const nameEl = $('#profile-display-name');
        const emailEl = $('#profile-display-email');
        const charEl = $('#profile-avatar-char');
        const roleEl = $('#profile-display-role');
        const createdEl = $('#profile-display-created');

        if (nameEl) nameEl.textContent = u.full_name;
        if (emailEl) emailEl.textContent = u.email;
        if (charEl) charEl.textContent = u.full_name.charAt(0).toUpperCase();
        if (roleEl) roleEl.textContent = u.role === 'admin' ? 'Quản trị viên' : (u.role === 'warehouse' ? 'Thủ kho' : (u.role === 'sales' ? 'Kinh doanh' : 'Khách hàng'));
        if (createdEl && u.created_at) {
            createdEl.textContent = `Tham gia: ${new Date(u.created_at).toLocaleDateString('vi-VN')}`;
        }

        // Cập nhật Form
        const inpName = $('#prof-inp-name');
        const inpEmail = $('#prof-inp-email');
        const inpPhone = $('#prof-inp-phone');
        const inpAddress = $('#prof-inp-address');

        if (inpName) inpName.value = u.full_name || '';
        if (inpEmail) inpEmail.value = u.email || '';
        if (inpPhone) inpPhone.value = u.phone || '';
        if (inpAddress) inpAddress.value = u.address || '';

    } catch (e) {
        console.error('❌ Lỗi loadUserProfile:', e);
    }
}

async function saveUserProfile() {
    const inpName = $('#prof-inp-name');
    const inpEmail = $('#prof-inp-email');
    const inpPhone = $('#prof-inp-phone');
    const inpAddress = $('#prof-inp-address');
    const errBox = $('#profile-info-error');

    const errName = validateFullName(inpName?.value);
    const errEmail = validateEmail(inpEmail?.value);
    const phoneVal = cleanClientInput(inpPhone?.value);
    const errPhone = phoneVal ? validateVNPhone(phoneVal) : '';

    setFieldError(inpName, $('#err-prof-name'), errName);
    setFieldError(inpEmail, $('#err-prof-email'), errEmail);
    setFieldError(inpPhone, $('#err-prof-phone'), errPhone);

    if (errName || errEmail || errPhone) {
        if (errBox) {
            errBox.textContent = 'Vui lòng kiểm tra các trường bị lỗi viền đỏ.';
            errBox.style.display = 'block';
        }
        return;
    }
    if (errBox) errBox.style.display = 'none';

    const btn = $('#btn-save-profile');
    if (btn) { btn.disabled = true; btn.textContent = 'Đang lưu thông tin...'; }

    try {
        const res = await fetch(`${API}/user/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({
                full_name: cleanClientInput(inpName.value),
                email: cleanClientInput(inpEmail.value).toLowerCase(),
                phone: phoneVal ? phoneVal.replace(/[\s.-]/g, '') : '',
                address: cleanClientInput(inpAddress?.value || '')
            })
        });

        const data = await res.json();
        if (btn) { btn.disabled = false; btn.textContent = '💾 Lưu thay đổi thông tin'; }

        if (!res.ok || !data.success) {
            if (data.errors) {
                if (data.errors.full_name) setFieldError(inpName, $('#err-prof-name'), data.errors.full_name);
                if (data.errors.email) setFieldError(inpEmail, $('#err-prof-email'), data.errors.email);
                if (data.errors.phone) setFieldError(inpPhone, $('#err-prof-phone'), data.errors.phone);
            }
            if (errBox) {
                errBox.textContent = data.message || 'Lỗi cập nhật thông tin.';
                errBox.style.display = 'block';
            }
            return;
        }

        // Cập nhật State
        state.user = {
            ...state.user,
            full_name: data.data.full_name,
            email: data.data.email,
            phone: data.data.phone,
            address: data.data.address
        };
        localStorage.setItem('baosneaker_user', JSON.stringify(state.user));
        updateNavAuth();
        loadUserProfile();
        showToast('Cập nhật thông tin cá nhân thành công!', 'success');

    } catch (e) {
        if (btn) { btn.disabled = false; btn.textContent = '💾 Lưu thay đổi thông tin'; }
        showToast('Không thể kết nối đến máy chủ.', 'error');
    }
}

async function changeUserPassword() {
    const inpOld = $('#prof-inp-oldpass');
    const inpNew = $('#prof-inp-newpass');
    const inpConf = $('#prof-inp-confirmpass');
    const errBox = $('#profile-pass-error');

    const oldVal = inpOld?.value || '';
    const newVal = inpNew?.value || '';
    const confVal = inpConf?.value || '';

    const errOld = !oldVal ? 'Vui lòng nhập mật khẩu hiện tại.' : '';
    const errNew = !newVal ? 'Vui lòng nhập mật khẩu mới.' : (newVal.length < 6 ? 'Mật khẩu mới phải từ 6 ký tự.' : '');
    const errConf = newVal !== confVal ? 'Mật khẩu xác nhận không khớp.' : '';

    setFieldError(inpOld, $('#err-prof-oldpass'), errOld);
    setFieldError(inpNew, $('#err-prof-newpass'), errNew);
    setFieldError(inpConf, $('#err-prof-confirmpass'), errConf);

    if (errOld || errNew || errConf) {
        if (errBox) {
            errBox.textContent = 'Vui lòng nhập đúng và đủ thông tin đổi mật khẩu.';
            errBox.style.display = 'block';
        }
        return;
    }
    if (errBox) errBox.style.display = 'none';

    const btn = $('#btn-save-password');
    if (btn) { btn.disabled = true; btn.textContent = 'Đang xử lý...'; }

    try {
        const res = await fetch(`${API}/user/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({
                old_password: oldVal,
                new_password: newVal,
                confirm_password: confVal
            })
        });

        const data = await res.json();
        if (btn) { btn.disabled = false; btn.textContent = '🔑 Cập nhật mật khẩu mới'; }

        if (!res.ok || !data.success) {
            if (data.errors?.old_password) setFieldError(inpOld, $('#err-prof-oldpass'), data.errors.old_password);
            if (errBox) {
                errBox.textContent = data.message || 'Đổi mật khẩu thất bại.';
                errBox.style.display = 'block';
            }
            return;
        }

        if (inpOld) inpOld.value = '';
        if (inpNew) inpNew.value = '';
        if (inpConf) inpConf.value = '';

        showToast('Đổi mật khẩu thành công! Mật khẩu mới đã được cập nhật.', 'success');
        refreshNotificationsBadge();

    } catch (e) {
        if (btn) { btn.disabled = false; btn.textContent = '🔑 Cập nhật mật khẩu mới'; }
        showToast('Không thể kết nối đến máy chủ.', 'error');
    }
}

// HỘP THƯ & THÔNG BÁO TỪ ADMIN
async function loadUserNotifications() {
    const container = $('#profile-notifs-container');
    if (!container) return;

    container.innerHTML = '<div class="spinner"></div>';

    try {
        const res = await fetch(`${API}/user/notifications`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        if (!data.success) {
            container.innerHTML = `<p style="color:var(--gray-600)">Không thể tải thông báo.</p>`;
            return;
        }

        // Cập nhật số chưa đọc
        updateNotifBadges(data.unread_count);

        if (!data.data || data.data.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding:32px 10px">
                    <div style="font-size:42px;margin-bottom:10px">📭</div>
                    <p style="font-size:14px;color:var(--gray-600)">Hộp thư của bạn chưa có thông báo nào.</p>
                </div>
            `;
            return;
        }

        const tagLabel = (t) => {
            if (t === 'admin_reply') return '<span class="notif-tag admin_reply">💬 Phản hồi CSKH</span>';
            if (t === 'order_status') return '<span class="notif-tag order_status">📦 Cập nhật đơn hàng</span>';
            return '<span class="notif-tag system">🔔 Thông báo hệ thống</span>';
        };

        container.innerHTML = data.data.map(n => {
            const timeStr = new Date(n.created_at).toLocaleDateString('vi-VN', {
                hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
            });

            return `
                <div class="notif-card ${n.is_read ? 'read' : 'unread'}" id="notif-card-${n.id}">
                    <div class="notif-card-header">
                        <div class="notif-card-title">
                            ${tagLabel(n.type)}
                            <span>${n.title}</span>
                            ${!n.is_read ? '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#2563eb"></span>' : ''}
                        </div>
                        <div class="notif-time">${timeStr}</div>
                    </div>
                    <div class="notif-card-body">
                        ${n.message}
                    </div>
                    <div class="notif-card-actions">
                        ${!n.is_read ? `
                            <button class="btn-mark-read" onclick="markNotificationAsRead(${n.id})">
                                ✓ Đánh dấu đã đọc
                            </button>
                        ` : '<span style="font-size:12px;color:var(--gray-400)">✓ Đã đọc</span>'}
                    </div>
                </div>
            `;
        }).join('');

    } catch (e) {
        container.innerHTML = `<p style="color:var(--gray-600)">Không thể kết nối đến máy chủ.</p>`;
    }
}

async function markNotificationAsRead(id) {
    try {
        await fetch(`${API}/user/notifications/${id}/read`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        loadUserNotifications();
    } catch (e) {
        console.error(e);
    }
}

async function markAllNotificationsAsRead() {
    try {
        await fetch(`${API}/user/notifications/read-all`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        showToast('Đã đánh dấu tất cả thông báo là đã đọc.', 'success');
        loadUserNotifications();
    } catch (e) {
        console.error(e);
    }
}

async function refreshNotificationsBadge() {
    if (!state.user || !state.token) return;
    try {
        const res = await fetch(`${API}/user/notifications`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        if (data.success) {
            updateNotifBadges(data.unread_count);
        }
    } catch (e) {}
}

function updateNotifBadges(count) {
    const navBadge = $('#nav-notif-badge');
    const dropBadge = $('#dropdown-notif-count');
    const tabBadge = $('#profile-tab-notif-count');

    const show = count > 0;
    const txt = count > 99 ? '99+' : count;

    if (navBadge) {
        navBadge.textContent = txt;
        navBadge.classList.toggle('show', show);
    }
    if (dropBadge) {
        dropBadge.textContent = txt;
        dropBadge.style.display = show ? 'inline-block' : 'none';
    }
    if (tabBadge) {
        tabBadge.textContent = txt;
        tabBadge.style.display = show ? 'inline-block' : 'none';
    }
}

// XEM LỊCH SỬ KHIẾU NẠI & PHẢN HỒI CSKH
async function loadUserSupports() {
    const container = $('#profile-supports-container');
    if (!container) return;

    container.innerHTML = '<div class="spinner"></div>';

    try {
        const res = await fetch(`${API}/user/my-supports`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();

        if (!data.success || !data.data || data.data.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding:32px 10px">
                    <div style="font-size:42px;margin-bottom:10px">💬</div>
                    <p style="font-size:14px;color:var(--gray-600)">Bạn chưa gửi phiếu khiếu nại hoặc hỗ trợ nào.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = data.data.map(s => {
            const timeStr = new Date(s.created_at).toLocaleDateString('vi-VN', {
                hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
            });

            return `
                <div style="background:#fff;border:1px solid var(--gray-200);border-radius:12px;padding:18px;margin-bottom:14px">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                        <div>
                            <span style="font-size:11px;font-weight:700;color:var(--gray-400)">MÃ PHIẾU: #CSKH-${s.id}</span>
                            <h4 style="font-size:15px;font-weight:800;color:var(--black);margin-top:2px">${s.subject || 'Yêu cầu hỗ trợ'}</h4>
                        </div>
                        <div>
                            ${s.status === 'processed'
                                ? '<span style="background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:100px;font-size:11.5px;font-weight:700">✓ Đã giải quyết</span>'
                                : '<span style="background:#fef3c7;color:#d97706;padding:3px 10px;border-radius:100px;font-size:11.5px;font-weight:700">⏳ Chờ phản hồi</span>'
                            }
                        </div>
                    </div>

                    <div style="font-size:13px;color:var(--gray-600);background:#f8fafc;padding:12px;border-radius:8px;line-height:1.55;margin-bottom:12px">
                        <strong>Nội dung bạn gửi:</strong><br>
                        ${s.message}
                        <div style="font-size:11.5px;color:var(--gray-400);margin-top:6px">${timeStr}</div>
                    </div>

                    ${s.admin_reply ? `
                        <div style="background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:8px;padding:12px;font-size:13px;color:#1e3a8a;line-height:1.55">
                            <div style="font-weight:800;color:#1d4ed8;margin-bottom:4px;display:flex;align-items:center;gap:6px">
                                <span>🛡️ Phản hồi chính thức từ Quản trị viên Bảo Sneaker:</span>
                            </div>
                            ${s.admin_reply}
                        </div>
                    ` : `
                        <div style="font-size:12px;color:var(--gray-400);font-style:italic">
                            Chuyên viên CSKH đang thẩm tra nội dung khiếu nại và sẽ phản hồi sớm nhất qua Hộp thư này.
                        </div>
                    `}
                </div>
            `;
        }).join('');

    } catch (e) {
        container.innerHTML = `<p style="color:var(--gray-600)">Không thể kết nối đến máy chủ.</p>`;
    }
}


// ============================================================
//  SEARCH
// ============================================================
function doSearch(q) {
    if (!q.trim()) { applyFilter(state.filter); return; }
    navigateTo('products');
    const filtered = state.products.filter(p =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.brand.toLowerCase().includes(q.toLowerCase())
    );

    if (state.sort === 'asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (state.sort === 'desc') {
        filtered.sort((a, b) => b.price - a.price);
    }

    renderGrid(filtered, 'product-grid');
}

// ============================================================
//  KHỞI ĐỘNG ỨNG DỤNG
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    // Cập nhật nav theo trạng thái đăng nhập
    updateNavAuth();
    updateCartBadge();

    // Tải sản phẩm nổi bật ở trang chủ
    await renderHomeFeatured();

    // Điều hướng trang mặc định
    navigateTo('home');

    // Đóng dropdown khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu')) closeUserMenu();
        if (e.target === $('#modal-overlay')) closeModal();
    });

    // Tìm kiếm khi nhấn Enter
    $('#search-input')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doSearch(e.target.value);
    });
});

