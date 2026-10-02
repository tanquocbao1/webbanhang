// ============================================================
//  public/js/main.js
//  SneakerX - Quản lý sản phẩm giày, giỏ hàng, xác nhận đơn hàng
//  & Phân quyền Admin (admin@gmail.com / 123456)
// ============================================================

// 1. DỮ LIỆU SẢN PHẨM MẶC ĐỊNH (KÈM SỐ LƯỢNG TỒN KHO & ĐÃ BÁN)
const initialProducts = [
    { id: 1, name: "Nike Zoom Mercurial Superfly 10", brand: "Nike", category: "Giày Đá Banh", price: 6500000, stock: 18, sold: 12, tag: "HOT", image: "https://images.unsplash.com/photo-1614631446501-abcf76949eca?auto=format&fit=crop&w=600&q=80", desc: "Đế đinh FG bám sân cỏ tự nhiên, sợi dệt Flyknit ôm chân tốc độ cao" },
    { id: 2, name: "Adidas Predator Accuracy.1 ", brand: "Adidas", category: "Giày Đá Banh", price: 5900000, stock: 14, sold: 9, tag: "Mới", image: "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=600&q=80", desc: "Công nghệ High-Definition Grip kiểm soát bóng tối đa" },
    { id: 3, name: "Nike Air Max 270 React", brand: "Nike", category: "Thời trang", price: 3500000, stock: 25, sold: 21, tag: "Mới", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", desc: "Đệm khí Air Max cực êm, phối màu đỏ cam thể thao năng động" },
    { id: 4, name: "Adidas Ultraboost 22 Running", brand: "Adidas", category: "Chạy bộ", price: 4200000, stock: 4, sold: 16, tag: "", image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=600&q=80", desc: "Đế đệm Boost hoàn trả năng lượng tối ưu cho đường chạy cự ly dài" },
    { id: 5, name: "Puma Future Ultimate FG/AG", brand: "Puma", category: "Giày Đá Banh", price: 5200000, stock: 8, sold: 7, tag: "Bán chạy", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80", desc: "Dải nén FUZIONFIT360 thích ứng khóa chặt chân khi bứt tốc" },
    { id: 6, name: "Adidas Yeezy Boost 350 V2", brand: "Adidas", category: "Thời trang", price: 6500000, stock: 2, sold: 35, tag: "Giới hạn", image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80", desc: "Biểu tượng thời trang đường phố với chất liệu Primeknit cao cấp" },
    { id: 7, name: "Nike ZoomX Vaporfly Next% 3", brand: "Nike", category: "Chạy bộ", price: 7200000, stock: 10, sold: 15, tag: "HOT", image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=600&q=80", desc: "Tấm sợi carbon đẩy bước chạy siêu tốc độ dành cho marathon" },
    { id: 8, name: "Puma RS-X³ Puzzle Sneaker", brand: "Puma", category: "Thời trang", price: 2800000, stock: 15, sold: 11, tag: "", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80", desc: "Phong cách Chunky Retro cá tính, đệm êm ái cho hoạt động cả ngày" },
    { id: 9, name: "Mizuno Wave Lightning Z7", brand: "Mizuno", category: "Giày Bóng Chuyền", price: 3450000, stock: 12, sold: 8, tag: "Mới", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80", desc: "Đế Wave độc quyền trợ lực bật nhảy và tiếp đất êm ái trên sàn đấu" },
    { id: 10, name: "Air Jordan 1 Retro High OG Men's", brand: "Nike", category: "Thời trang", price: 4800000, stock: 11, sold: 18, tag: "HOT", image: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=600&q=80", desc: "Phong cách cổ điển, đế bền bỉ và thiết kế icon cho mọi outfit" },
    { id: 11, name: "Adidas Samba OG", brand: "Adidas", category: "Thời trang", price: 3100000, stock: 16, sold: 22, tag: "Bán chạy", image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80", desc: "Kiểu dáng retro mộc mạc, êm chân và dễ phối đồ hằng ngày" },
    { id: 12, name: "Asics Gel-Kayano 30", brand: "Asics", category: "Chạy bộ", price: 5600000, stock: 7, sold: 13, tag: "Mới", image: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=600&q=80", desc: "Công nghệ Gel ổn định và đệm cao cấp cho chạy bộ lâu dài" },
    { id: 13, name: "Puma Deviate Nitro 3", brand: "Puma", category: "Chạy bộ", price: 3900000, stock: 9, sold: 10, tag: "HOT", image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80", desc: "Đệm Nitro phản hồi mạnh, hỗ trợ tốc độ cho người chạy năng động" },
    { id: 14, name: "Nike Court Vision Low", brand: "Nike", category: "Thời trang", price: 2600000, stock: 20, sold: 14, tag: "", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80", desc: "Thiết kế sneaker cổ thấp dễ phối cùng quần jean và outfit hàng ngày" },
    { id: 15, name: "Nike Mercurial Vapor 17 Pro", brand: "Nike", category: "Giày Đá Banh", price: 6200000, stock: 10, sold: 9, tag: "HOT", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", desc: "Đế đinh siêu nhẹ, tăng tốc độ và kiểm soát bóng ở mọi pha bóng" },
    { id: 16, name: "Mizuno Morelia Neo III", brand: "Mizuno", category: "Giày Đá Banh", price: 4700000, stock: 13, sold: 8, tag: "Mới", image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80", desc: "Giày đá banh vừa vặn, bám sân tốt và cảm giác chạm bóng chính xác" },
    { id: 17, name: "Adidas NMD R1 Primeknit", brand: "Adidas", category: "Thời trang", price: 3600000, stock: 18, sold: 17, tag: "Bán chạy", image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80", desc: "Đệm Boost thoải mái, thiết kế thời trang hiện đại cho phong cách đô thị" },
    { id: 18, name: "Asics Gel-Resolution 9", brand: "Asics", category: "Giày Bóng Chuyền", price: 4200000, stock: 9, sold: 11, tag: "Mới", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80", desc: "Cấu trúc hỗ trợ ổn định, giảm chấn tốt cho lưới và di chuyển nhanh" },
    { id: 19, name: "Puma King Platinum FG", brand: "Puma", category: "Giày Đá Banh", price: 5100000, stock: 12, sold: 10, tag: "HOT", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80", desc: "Mẫu giày kinh điển với cảm giác chạm bóng và kiểm soát bóng toàn diện" },
    { id: 20, name: "Nike Pegasus 41", brand: "Nike", category: "Chạy bộ", price: 4300000, stock: 14, sold: 12, tag: "", image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=600&q=80", desc: "Đệm đàn hồi êm ái, phù hợp cho chạy bộ mỗi ngày và luyện tập lâu dài" }
];

// Khởi tạo sản phẩm từ localStorage hoặc dùng mặc định
let productsData = JSON.parse(localStorage.getItem('sneakerx_products')) || initialProducts;

// Đảm bảo dữ liệu sản phẩm luôn có thuộc tính stock và sold hợp lệ
function ensureProductsStock() {
    let hasChanges = false;
    productsData.forEach(p => {
        if (p.stock === undefined || p.stock === null || isNaN(p.stock)) {
            p.stock = 15;
            hasChanges = true;
        }
        if (p.sold === undefined || p.sold === null || isNaN(p.sold)) {
            p.sold = 0;
            hasChanges = true;
        }
    });
    if (hasChanges) {
        saveProducts();
    }
}
ensureProductsStock();

function saveProducts() {
    localStorage.setItem('sneakerx_products', JSON.stringify(productsData));
}

// Khởi tạo giỏ hàng từ localStorage
let cart = JSON.parse(localStorage.getItem('sneakerx_cart')) || [];

function saveCart() {
    localStorage.setItem('sneakerx_cart', JSON.stringify(cart));
}

// Trạng thái Người dùng & Phân quyền Admin
let currentUser = JSON.parse(localStorage.getItem('sneakerx_user')) || null;

function isAdmin() {
    return currentUser && (currentUser.role === 'admin' || currentUser.email === 'admin@gmail.com');
}

// Định dạng tiền tệ VNĐ
function formatPrice(price) {
    return Number(price || 0).toLocaleString('vi-VN') + ' ₫';
}

// Thông báo Toast
function showToast(msg, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast-msg';
        document.body.appendChild(toast);
    }
    const icon = type === 'success' ? '✅' : '⚠️';
    toast.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    toast.className = `toast-msg show ${type}`;
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}

// 2. QUẢN LÝ TÀI KHOẢN & ĐẶC QUYỀN ADMIN (admin@gmail.com / 123456)
function updateAuthUI() {
    const guestEl = document.getElementById('nav-guest');
    const userEl = document.getElementById('nav-user');
    const avatarEl = document.getElementById('nav-user-avatar');
    const nameEl = document.getElementById('nav-user-name');
    const roleEl = document.getElementById('nav-user-role');
    const adminTopBar = document.getElementById('admin-top-bar');
    const adminProdActions = document.getElementById('admin-product-actions');

    const orders = JSON.parse(localStorage.getItem('sneakerx_orders') || '[]');
    const ordersCountEl = document.getElementById('admin-bar-orders-count');
    if (ordersCountEl) ordersCountEl.innerText = orders.length;

    const prodCountEl = document.getElementById('admin-bar-prod-count');
    if (prodCountEl) prodCountEl.innerText = productsData.length;

    if (currentUser) {
        if (guestEl) guestEl.style.display = 'none';
        if (userEl) userEl.style.display = 'flex';
        if (avatarEl) avatarEl.innerText = currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U';
        if (nameEl) nameEl.innerText = currentUser.full_name || currentUser.email;

        if (isAdmin()) {
            if (roleEl) roleEl.innerText = 'Quản trị viên (Admin)';
            if (adminTopBar) adminTopBar.classList.add('active');
            if (adminProdActions) adminProdActions.style.display = 'block';
            document.body.style.paddingTop = '38px'; // Chừa chỗ cho admin top bar
        } else {
            if (roleEl) roleEl.innerText = 'Khách hàng';
            if (adminTopBar) adminTopBar.classList.remove('active');
            if (adminProdActions) adminProdActions.style.display = 'none';
            document.body.style.paddingTop = '0';
        }
    } else {
        if (guestEl) guestEl.style.display = 'block';
        if (userEl) userEl.style.display = 'none';
        if (adminTopBar) adminTopBar.classList.remove('active');
        if (adminProdActions) adminProdActions.style.display = 'none';
        document.body.style.paddingTop = '0';
    }
}

// Điền nhanh tài khoản Admin
function fillAdminCredentials() {
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    if (emailInput) emailInput.value = 'admin@gmail.com';
    if (passInput) passInput.value = '123456';
    showToast('Đã điền tài khoản Admin! Nhấn "Đăng Nhập" để kích hoạt đặc quyền.');
}

// Xử lý Đăng Nhập
function handleLogin(event) {
    if (event) event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    // KIỂM TRA ĐẶC QUYỀN ADMIN: admin@gmail.com / 123456
    if (email === 'admin@gmail.com' && password === '123456') {
        currentUser = {
            email: 'admin@gmail.com',
            full_name: 'Quản trị viên SneakerX',
            role: 'admin'
        };
        localStorage.setItem('sneakerx_user', JSON.stringify(currentUser));
        closeAuthModal();
        updateAuthUI();
        renderProducts();
        showToast('👑 Chào mừng trở lại, Quản trị viên! Bạn có toàn quyền quản trị SneakerX.');
        return;
    }

    // Kiểm tra tài khoản thành viên thông thường
    const registeredUsers = JSON.parse(localStorage.getItem('sneakerx_registered_users') || '[]');
    const matchedUser = registeredUsers.find(u => u.email === email && u.password === password);

    if (matchedUser) {
        currentUser = {
            email: matchedUser.email,
            full_name: matchedUser.full_name,
            role: 'customer'
        };
        localStorage.setItem('sneakerx_user', JSON.stringify(currentUser));
        closeAuthModal();
        updateAuthUI();
        renderProducts();
        showToast(`Chào mừng ${matchedUser.full_name} đã quay trở lại!`);
        return;
    }

    showToast('Email hoặc mật khẩu không chính xác! (Admin: admin@gmail.com / 123456)', 'error');
}

// Xử lý Đăng Ký
function handleRegister(event) {
    if (event) event.preventDefault();

    const fullName = document.getElementById('reg-fullname').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();

    if (!fullName || !email || !password) {
        showToast('Vui lòng điền đầy đủ thông tin đăng ký!', 'error');
        return;
    }
    if (password.length < 6) {
        showToast('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;
    }

    const registeredUsers = JSON.parse(localStorage.getItem('sneakerx_registered_users') || '[]');
    if (registeredUsers.some(u => u.email === email) || email === 'admin@gmail.com') {
        showToast('Email này đã được sử dụng!', 'error');
        return;
    }

    registeredUsers.push({ email, password, full_name: fullName });
    localStorage.setItem('sneakerx_registered_users', JSON.stringify(registeredUsers));

    showToast('Đăng ký thành công! Hãy đăng nhập bằng tài khoản vừa tạo.');
    switchAuthTab('login');
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = password;
}

// Đăng xuất
function logout() {
    currentUser = null;
    localStorage.removeItem('sneakerx_user');
    updateAuthUI();
    renderProducts();
    showToast('Đã đăng xuất tài khoản thành công!');
}

// 3. HIỂN THỊ DANH SÁCH SẢN PHẨM & QUYỀN XÓA CHO ADMIN
let currentFilter = 'all';

function renderProducts(filter = currentFilter) {
    currentFilter = filter;
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = '';

    let filtered = productsData;
    if (filter !== 'all') {
        const query = filter.toLowerCase().trim();
        filtered = productsData.filter(p => 
            (p.category && p.category.toLowerCase().includes(query)) ||
            (p.brand && p.brand.toLowerCase() === query) ||
            (query === 'giày đá banh' && p.category && p.category.toLowerCase().includes('đá'))
        );
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                <div style="font-size: 40px; margin-bottom: 10px;">👟</div>
                <h3 style="color: var(--black); margin-bottom: 8px;">Chưa có sản phẩm nào thuộc phân loại này!</h3>
                ${isAdmin() ? `
                    <button class="btn-admin-bar" style="background:#ea580c; border:none; margin-top:15px; padding: 8px 18px; border-radius: 20px;" onclick="openAddProductModal('${filter !== 'all' ? filter : ''}')">
                        ＋ Thêm Giày Vào Dòng Này (Admin)
                    </button>
                ` : '<p>Vui lòng chọn dòng giày khác.</p>'}
            </div>
        `;
        return;
    }

    const adminActive = isAdmin();

    filtered.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animation = `fadeInUp 0.4s ease forwards ${index * 0.04}s`;
        card.style.opacity = '0';

        let badgeHTML = '';
        if (product.tag) {
            let badgeColor = product.tag === 'HOT' ? '#e11d48' : (product.tag === 'Mới' ? '#0f172a' : '#ea580c');
            badgeHTML = `<div class="badge-new" style="background:${badgeColor}">${product.tag}</div>`;
        }

        // Cụm nút quản trị (Sửa ✏️ & Xóa 🗑️) chỉ dành cho ADMIN
        let adminBarHTML = '';
        if (adminActive) {
            adminBarHTML = `
                <div class="product-admin-actions-bar">
                    <button class="product-admin-btn edit" onclick="openEditProductModal(${product.id})" title="Admin: Sửa sản phẩm & tồn kho '${product.name}'">
                        ✏️
                    </button>
                    <button class="product-admin-btn delete" onclick="deleteProduct(event, ${product.id})" title="Admin: Xóa sản phẩm '${product.name}'">
                        🗑️
                    </button>
                </div>
            `;
        }

        // Thẻ hiển thị số lượng hàng tồn kho của cửa hàng
        const stockQty = Number(product.stock !== undefined ? product.stock : 15);
        let stockTagHTML = '';
        let isOutOfStock = stockQty <= 0;

        if (isOutOfStock) {
            stockTagHTML = `<div class="product-stock-tag out-of-stock">❌ Tạm hết hàng</div>`;
        } else if (stockQty <= 5) {
            stockTagHTML = `<div class="product-stock-tag low-stock">⚠️ Chỉ còn ${stockQty} đôi!</div>`;
        } else {
            stockTagHTML = `<div class="product-stock-tag in-stock">📦 Còn: ${stockQty} đôi</div>`;
        }

        card.innerHTML = `
            ${badgeHTML}
            ${adminBarHTML}
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80'">
            </div>
            <div class="product-info">
                <div class="product-brand">${product.brand} • ${product.category}</div>
                <div class="product-title" title="${product.name}">${product.name}</div>
                ${stockTagHTML}
                ${product.desc ? `<p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${product.desc}</p>` : ''}
                <div class="product-bottom">
                    <div>
                        <div class="product-price">${formatPrice(product.price)}</div>
                        <span style="font-size: 11px; color: var(--text-muted);">(Chi phí mua)</span>
                    </div>
                    <button class="add-to-cart-btn ${isOutOfStock ? 'disabled' : ''}" 
                            title="${isOutOfStock ? 'Tạm hết hàng' : 'Thêm vào giỏ hàng'}" 
                            onclick="${isOutOfStock ? `showToast('Sản phẩm này tạm thời đã hết hàng!', 'error')` : `addToCart(event, ${product.id})`}">
                        ${isOutOfStock ? 'Hết' : '＋'}
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Xóa sản phẩm (Đặc quyền Admin)
function deleteProduct(event, productId) {
    if (event) event.stopPropagation();

    if (!isAdmin()) {
        showToast('Chỉ Quản trị viên (Admin) mới có quyền xóa sản phẩm!', 'error');
        return;
    }

    const prod = productsData.find(p => p.id === productId);
    const prodName = prod ? prod.name : 'sản phẩm này';

    if (confirm(`[ADMIN] Bạn có chắc chắn muốn xóa "${prodName}" khỏi hệ thống không?`)) {
        productsData = productsData.filter(p => p.id !== productId);
        saveProducts();
        renderProducts();
        updateAuthUI();
        const modalAdminProd = document.getElementById('modal-admin-products');
        if (modalAdminProd && modalAdminProd.style.display === 'flex') {
            renderAdminProductsTable();
        }
        showToast(`🗑️ Đã xóa sản phẩm "${prodName}" thành công!`);
    }
}

function filterProducts(category) {
    showPage('home');
    document.querySelectorAll('.filter-tags button').forEach(btn => btn.classList.remove('active'));
    
    // Gắn active button dựa theo thẻ được ấn
    if (window.event && window.event.target && window.event.target.tagName === 'BUTTON') {
        window.event.target.classList.add('active');
    }
    renderProducts(category);
}

// 4. XỬ LÝ GIỎ HÀNG (KIỂM TRA HÀNG TỒN KHO)
function addToCart(event, productId) {
    if (event) event.stopPropagation();
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    const availableStock = Number(product.stock !== undefined ? product.stock : 15);

    // Kiểm tra tồn kho trước khi thêm vào giỏ
    if (availableStock <= 0) {
        showToast(`Sản phẩm "${product.name}" hiện đã hết hàng trong kho!`, 'error');
        return;
    }

    const existingItem = cart.find(item => item.product.id === productId);
    if (existingItem) {
        if (existingItem.qty >= availableStock) {
            showToast(`Cửa hàng chỉ còn ${availableStock} đôi "${product.name}" trong kho, không thể thêm nữa!`, 'error');
            return;
        }
        existingItem.qty += 1;
    } else {
        cart.push({ product, qty: 1 });
    }

    saveCart();
    updateCartCount();
    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.qty, 0);
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.innerText = count;
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 60px 20px; color: var(--text-muted); font-size: 16px;">
                <div style="font-size: 48px; margin-bottom: 15px;">🛒</div>
                <h3 style="color: var(--black); margin-bottom: 8px;">Giỏ hàng của bạn đang trống!</h3>
                <p style="margin-bottom: 20px;">Hãy khám phá các dòng giày siêu phẩm và chọn cho mình đôi giày ưng ý nhất.</p>
                <button class="btn btn-primary" onclick="showPage('home')">Xem Sản Phẩm Ngay</button>
            </div>
        `;
        document.getElementById('summary-qty').innerText = '0 sản phẩm';
        document.getElementById('summary-subtotal').innerText = '0 ₫';
        document.getElementById('summary-total').innerText = '0 ₫';
        return;
    }

    let html = '';
    let totalQty = 0;
    let totalPrice = 0;

    cart.forEach((item, index) => {
        totalQty += item.qty;
        totalPrice += item.product.price * item.qty;

        html += `
            <div class="cart-item">
                <img src="${item.product.image}" alt="${item.product.name}" onerror="this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80'">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.product.name}</div>
                    <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 5px;">Hãng: <b>${item.product.brand}</b> | Dòng: ${item.product.category}</div>
                    <div class="cart-item-price">${formatPrice(item.product.price)}</div>
                </div>
                <div class="cart-item-qty">
                    <button onclick="changeQty(${index}, -1)" title="Giảm số lượng">-</button>
                    <span style="font-weight: 700; font-size: 14px; min-width: 24px; text-align: center;">${item.qty}</span>
                    <button onclick="changeQty(${index}, 1)" title="Tăng số lượng">+</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    document.getElementById('summary-qty').innerText = `${totalQty} sản phẩm`;
    document.getElementById('summary-subtotal').innerText = formatPrice(totalPrice);
    document.getElementById('summary-total').innerText = formatPrice(totalPrice);
}

function changeQty(index, delta) {
    if (!cart[index]) return;
    const item = cart[index];
    const prod = productsData.find(p => p.id === item.product.id);
    const availableStock = prod ? Number(prod.stock !== undefined ? prod.stock : 15) : 99;

    if (delta > 0 && item.qty + delta > availableStock) {
        showToast(`Kho chỉ còn ${availableStock} đôi cho mẫu này!`, 'error');
        return;
    }

    item.qty += delta;
    if (item.qty <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
    updateCartCount();
    renderCart();
}

// 5. ĐIỀU HƯỚNG VÀ XÁC NHẬN ĐƠN HÀNG (CHECKOUT)
function goToCheckout() {
    if (cart.length === 0) {
        showToast('Giỏ hàng trống! Vui lòng chọn ít nhất 1 sản phẩm.', 'error');
        return;
    }
    showPage('checkout');
}

function renderCheckout() {
    const listEl = document.getElementById('checkout-items-list');
    const countEl = document.getElementById('checkout-item-count');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const totalEl = document.getElementById('checkout-total');
    if (!listEl) return;

    if (cart.length === 0) {
        listEl.innerHTML = `
            <div style="text-align: center; padding: 25px 10px; color: var(--text-muted);">
                <p>Chưa có sản phẩm nào trong đơn hàng.</p>
                <button onclick="showPage('home')" class="btn-logout" style="margin-top: 10px;">
                    ← Quay lại chọn giày
                </button>
            </div>
        `;
        if (countEl) countEl.innerText = '0';
        if (subtotalEl) subtotalEl.innerText = '0 ₫';
        if (totalEl) totalEl.innerText = '0 ₫';
        return;
    }

    let totalQty = 0;
    let totalPrice = 0;
    let itemsHtml = '';

    cart.forEach(item => {
        totalQty += item.qty;
        const itemTotal = item.product.price * item.qty;
        totalPrice += itemTotal;

        itemsHtml += `
            <div class="checkout-item-row">
                <img src="${item.product.image}" alt="${item.product.name}" onerror="this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80'">
                <div class="checkout-item-details">
                    <div class="checkout-item-name" title="${item.product.name}">${item.product.name}</div>
                    <div class="checkout-item-meta">Số lượng: ${item.qty} × ${formatPrice(item.product.price)}</div>
                </div>
                <div class="checkout-item-price">${formatPrice(itemTotal)}</div>
            </div>
        `;
    });

    listEl.innerHTML = itemsHtml;
    if (countEl) countEl.innerText = totalQty;
    if (subtotalEl) subtotalEl.innerText = formatPrice(totalPrice);
    if (totalEl) totalEl.innerText = formatPrice(totalPrice);

    // Tự động điền dữ liệu nếu đã có sẵn
    const savedRecipient = JSON.parse(localStorage.getItem('sneakerx_recipient') || '{}');
    if (currentUser && !document.getElementById('checkout-name').value) {
        document.getElementById('checkout-name').value = currentUser.full_name || '';
        document.getElementById('checkout-email').value = currentUser.email || '';
    } else {
        if (savedRecipient.name && document.getElementById('checkout-name') && !document.getElementById('checkout-name').value) {
            document.getElementById('checkout-name').value = savedRecipient.name;
        }
        if (savedRecipient.email && document.getElementById('checkout-email') && !document.getElementById('checkout-email').value) {
            document.getElementById('checkout-email').value = savedRecipient.email;
        }
    }
    if (savedRecipient.phone && document.getElementById('checkout-phone') && !document.getElementById('checkout-phone').value) {
        document.getElementById('checkout-phone').value = savedRecipient.phone;
    }
    if (savedRecipient.address && document.getElementById('checkout-address') && !document.getElementById('checkout-address').value) {
        document.getElementById('checkout-address').value = savedRecipient.address;
    }
}

// Xử lý gửi đơn hàng (Xác nhận đặt hàng COD)
function submitOrder(event) {
    if (event) event.preventDefault();

    if (cart.length === 0) {
        showToast('Giỏ hàng trống! Không thể đặt hàng.', 'error');
        return;
    }

    const nameInput = document.getElementById('checkout-name');
    const phoneInput = document.getElementById('checkout-phone');
    const emailInput = document.getElementById('checkout-email');
    const addressInput = document.getElementById('checkout-address');
    const noteInput = document.getElementById('checkout-note');

    const customerName = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const address = addressInput ? addressInput.value.trim() : '';
    const note = noteInput ? noteInput.value.trim() : '';

    let paymentMethod = 'COD';
    const paymentRadios = document.getElementsByName('payment_method');
    if (paymentRadios) {
        for (const radio of paymentRadios) {
            if (radio.checked) {
                paymentMethod = radio.value;
                break;
            }
        }
    }

    // Validate
    if (!customerName) {
        showToast('Vui lòng nhập Họ và tên người nhận!', 'error');
        if (nameInput) nameInput.focus();
        return;
    }
    if (!phone) {
        showToast('Vui lòng nhập Số điện thoại nhận hàng!', 'error');
        if (phoneInput) phoneInput.focus();
        return;
    }
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
        showToast('Số điện thoại không hợp lệ (cần 10 chữ số)!', 'error');
        if (phoneInput) phoneInput.focus();
        return;
    }
    if (!address || address.length < 8) {
        showToast('Vui lòng nhập địa chỉ giao hàng cụ thể (tối thiểu 8 ký tự)!', 'error');
        if (addressInput) addressInput.focus();
        return;
    }

    // Lưu thông tin người nhận cho các lần mua sau
    localStorage.setItem('sneakerx_recipient', JSON.stringify({
        name: customerName,
        phone: phone,
        email: email,
        address: address
    }));

    // BƯỚC 1: KIỂM TRA SỐ LƯỢNG HÀNG TỒN KHO CỦA CỬA HÀNG
    for (const item of cart) {
        const prod = productsData.find(p => p.id === item.product.id);
        const currentStock = prod ? Number(prod.stock !== undefined ? prod.stock : 0) : 0;

        if (!prod || currentStock < item.qty) {
            showToast(`Sản phẩm "${item.product.name}" chỉ còn ${currentStock} đôi trong kho (bạn đặt ${item.qty} đôi). Vui lòng giảm số lượng!`, 'error');
            return;
        }
    }

    // BƯỚC 2: TỰ ĐỘNG BỚT TRONG SỐ LƯỢNG HÀNG TỒN KHO KHI KHÁCH MUA ĐỒ
    cart.forEach(item => {
        const prod = productsData.find(p => p.id === item.product.id);
        if (prod) {
            const currentStock = Number(prod.stock !== undefined ? prod.stock : 0);
            prod.stock = Math.max(0, currentStock - item.qty); // Bớt số lượng hàng tồn
            prod.sold = (Number(prod.sold) || 0) + item.qty;  // Tăng số lượng khách đã mua
        }
    });

    // Lưu lại số lượng tồn kho mới vào hệ thống
    saveProducts();
    renderProducts();

    // Tính toán chi phí khách hàng mua đồ và tạo đơn hàng
    const orderId = 'SX-' + Math.floor(100000 + Math.random() * 900000);
    const orderTotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
    const orderItems = [...cart];

    const orderData = {
        orderId,
        date: new Date().toLocaleString('vi-VN'),
        customerName,
        phone,
        email,
        address,
        note,
        paymentMethod: paymentMethod === 'QR' ? 'Chuyển khoản QR (SePay)' : 'COD (Thanh toán khi nhận hàng)',
        paymentType: paymentMethod,
        items: orderItems,
        total: orderTotal,
        status: 'Chờ xác nhận'
    };

    // Lưu đơn hàng vào danh sách lịch sử
    const existingOrders = JSON.parse(localStorage.getItem('sneakerx_orders') || '[]');
    existingOrders.unshift(orderData);
    localStorage.setItem('sneakerx_orders', JSON.stringify(existingOrders));

    // Hiển thị modal Đặt hàng thành công
    showOrderSuccessModal(orderData);

    // Cập nhật lại giao diện quản trị kho nếu đang mở
    const modalAdminProd = document.getElementById('modal-admin-products');
    if (modalAdminProd && modalAdminProd.style.display === 'flex') {
        renderAdminProductsTable();
    }

    // Làm rỗng giỏ hàng
    cart = [];
    saveCart();
    updateCartCount();
    renderCheckout();
    updateAuthUI();
}

function showOrderSuccessModal(order) {
    const modal = document.getElementById('modal-order-success');
    if (!modal) return;

    document.getElementById('success-order-id').innerText = '#' + order.orderId;
    document.getElementById('success-order-date').innerText = order.date;
    document.getElementById('success-customer-name').innerText = order.customerName;
    document.getElementById('success-customer-phone').innerText = order.phone;
    document.getElementById('success-delivery-address').innerText = order.address;
    document.getElementById('success-total-price').innerText = formatPrice(order.total);

    const paymentMethodEl = document.getElementById('success-payment-method');
    if (paymentMethodEl) {
        paymentMethodEl.innerText = order.paymentMethod;
    }

    const qrContainer = document.getElementById('sepay-qr-container');
    const qrImg = document.getElementById('sepay-qr-img');
    const qrContentWrapper = document.getElementById('qr-content-wrapper');
    const qrSuccessWrapper = document.getElementById('qr-success-wrapper');
    
    // Reset giao diện test QR
    if (qrContentWrapper) qrContentWrapper.style.display = 'block';
    if (qrSuccessWrapper) qrSuccessWrapper.style.display = 'none';

    
    if (order.paymentType === 'QR' && qrContainer && qrImg) {
        // --- THÔNG TIN TÀI KHOẢN NGÂN HÀNG CỦA BẠN ---
        const BANK_ID = 'MB'; // Ngân hàng (VD: MB, VCB, ACB, TPB...)
        const ACCOUNT_NO = '0123456789'; // Số tài khoản của bạn
        const ACCOUNT_NAME = 'SNEAKERX WEB BAN HANG'; // Tên hiển thị (nếu ngân hàng hỗ trợ)
        // ---------------------------------------------

        const amount = order.total;
        const des = 'THANH TOAN ' + order.orderId;
        const qrUrl = `https://qr.sepay.vn/img?acc=${ACCOUNT_NO}&bank=${BANK_ID}&amount=${amount}&des=${encodeURIComponent(des)}&name=${encodeURIComponent(ACCOUNT_NAME)}`;
        
        qrImg.src = qrUrl;
        qrContainer.style.display = 'block';
    } else if (qrContainer) {
        qrContainer.style.display = 'none';
    }

    modal.style.display = 'flex';
}

function closeOrderSuccessModal() {
    const modal = document.getElementById('modal-order-success');
    if (modal) modal.style.display = 'none';
    showPage('home');
    showToast('Cảm ơn bạn đã tin tưởng SneakerX!');
}

function testQRPayment() {
    const orderIdEl = document.getElementById('success-order-id');
    if (!orderIdEl) return;
    
    const orderIdText = orderIdEl.innerText.replace('#', '');
    const existingOrders = JSON.parse(localStorage.getItem('sneakerx_orders') || '[]');
    const orderIndex = existingOrders.findIndex(o => o.orderId === orderIdText);
    
    if (orderIndex !== -1) {
        // Cập nhật trạng thái
        existingOrders[orderIndex].status = 'Đã thanh toán';
        localStorage.setItem('sneakerx_orders', JSON.stringify(existingOrders));
        
        showToast('Webhook SePay: Đã nhận được thanh toán!', 'success');
        
        // Đổi giao diện
        const qrContentWrapper = document.getElementById('qr-content-wrapper');
        const qrSuccessWrapper = document.getElementById('qr-success-wrapper');
        if (qrContentWrapper) qrContentWrapper.style.display = 'none';
        if (qrSuccessWrapper) qrSuccessWrapper.style.display = 'block';
    }
}

// 6. THÊM SẢN PHẨM GIÀY MỚI (CHỈ DÀNH CHO ADMIN)
const sampleShoesList = [
    {
        name: "Nike Zoom Mercurial Vapor 15 Elite",
        brand: "Nike",
        category: "Giày Đá Banh",
        price: 6800000,
        tag: "HOT",
        image: "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=600&q=80",
        desc: "Bộ đệm Zoom Air 3/4 chiều dài bứt tốc và tạo lực đẩy sân cỏ tự nhiên"
    },
    {
        name: "Adidas Predator Elite LL FG",
        brand: "Adidas",
        category: "Giày Đá Banh",
        price: 6200000,
        tag: "Mới",
        image: "https://images.unsplash.com/photo-1614631446501-abcf76949eca?auto=format&fit=crop&w=600&q=80",
        desc: "Thiết kế không dây siêu êm, gai cao su Strikeskin tối ưu xoáy bóng"
    },
    {
        name: "Puma Ultra 5 Carbon FG",
        brand: "Puma",
        category: "Giày Đá Banh",
        price: 5400000,
        tag: "Bán chạy",
        image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80",
        desc: "Đế sợi carbon siêu nhẹ chuyên biệt bứt phá tốc độ tối đa"
    },
    {
        name: "Nike Air Jordan 1 Retro High OG",
        brand: "Nike",
        category: "Thời trang",
        price: 5200000,
        tag: "HOT",
        image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80",
        desc: "Huyền thoại bóng rổ và sneaker đường phố da thật cao cấp"
    },
    {
        name: "Nike Invincible Run 3",
        brand: "Nike",
        category: "Chạy bộ",
        price: 4900000,
        tag: "Mới",
        image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=600&q=80",
        desc: "Đệm ZoomX dày nâng đỡ giảm chấn thương trên từng km đường chạy"
    },
    {
        name: "Mizuno Wave Momentum 2",
        brand: "Mizuno",
        category: "Giày Bóng Chuyền",
        price: 3600000,
        tag: "Mới",
        image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80",
        desc: "Đế đệm cao cấp chống lật sơ mi và bảo vệ cổ chân khi đập bóng"
    }
];

function openAddProductModal(defaultCategory = '') {
    if (!isAdmin()) {
        showToast('Chức năng thêm sản phẩm chỉ dành cho Quản trị viên (Admin)!', 'error');
        openAuthModal();
        return;
    }

    const modal = document.getElementById('modal-add-product');
    if (!modal) return;

    if (defaultCategory) {
        const catSelect = document.getElementById('new-prod-category');
        if (catSelect) {
            for (let i = 0; i < catSelect.options.length; i++) {
                if (catSelect.options[i].value.toLowerCase().includes(defaultCategory.toLowerCase())) {
                    catSelect.selectedIndex = i;
                    break;
                }
            }
        }
    }
    modal.style.display = 'flex';
}

function closeAddProductModal() {
    const modal = document.getElementById('modal-add-product');
    if (modal) modal.style.display = 'none';
}

function previewProductImage() {
    const url = document.getElementById('new-prod-image').value.trim();
    const previewImg = document.getElementById('new-prod-preview');
    const placeholder = document.getElementById('new-prod-preview-ph');
    if (url) {
        previewImg.src = url;
        previewImg.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
    } else {
        previewImg.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
    }
}

function selectQuickProduct(index) {
    const sample = sampleShoesList[index];
    if (!sample) return;

    document.getElementById('new-prod-name').value = sample.name;
    document.getElementById('new-prod-brand').value = sample.brand;
    document.getElementById('new-prod-category').value = sample.category;
    document.getElementById('new-prod-price').value = sample.price;
    document.getElementById('new-prod-tag').value = sample.tag;
    document.getElementById('new-prod-image').value = sample.image;
    document.getElementById('new-prod-desc').value = sample.desc;

    previewProductImage();
    showToast(`Đã tải mẫu "${sample.name}"`);
}

function saveNewProduct(event) {
    if (event) event.preventDefault();

    if (!isAdmin()) {
        showToast('Bạn không có quyền thực hiện thao tác này!', 'error');
        return;
    }

    const name = document.getElementById('new-prod-name').value.trim();
    const brand = document.getElementById('new-prod-brand').value;
    const category = document.getElementById('new-prod-category').value;
    const price = parseInt(document.getElementById('new-prod-price').value, 10);
    const stockInput = document.getElementById('new-prod-stock');
    const stock = stockInput && stockInput.value !== '' ? parseInt(stockInput.value, 10) : 20;
    const tag = document.getElementById('new-prod-tag').value;
    let image = document.getElementById('new-prod-image').value.trim();
    const desc = document.getElementById('new-prod-desc').value.trim();

    if (!name) {
        showToast('Vui lòng nhập Tên sản phẩm giày!', 'error');
        return;
    }
    if (!price || price < 50000) {
        showToast('Vui lòng nhập Chi phí khách mua / Giá bán hợp lệ (tối thiểu 50.000 ₫)!', 'error');
        return;
    }
    if (stock < 0 || isNaN(stock)) {
        showToast('Số lượng hàng tồn kho không hợp lệ!', 'error');
        return;
    }
    if (!image) {
        image = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80';
    }

    const newShoe = {
        id: Date.now(),
        name,
        brand,
        category,
        price,
        stock,
        sold: 0,
        tag,
        image,
        desc
    };

    // Đưa sản phẩm mới lên đầu danh sách
    productsData.unshift(newShoe);
    saveProducts();

    // Render lại giao diện
    renderProducts(category);
    closeAddProductModal();

    // Reset form
    document.getElementById('form-add-product').reset();
    previewProductImage();

    // Cập nhật lại số liệu admin
    updateAuthUI();
    const modalAdminProd = document.getElementById('modal-admin-products');
    if (modalAdminProd && modalAdminProd.style.display === 'flex') {
        renderAdminProductsTable();
    }

    // Chuyển trang chủ & cuộn đến phần sản phẩm
    showPage('home');
    scrollToProducts();
    showToast(`👑 [ADMIN] Đã thêm sản phẩm "${name}" (Tồn kho: ${stock} đôi) thành công!`);
}

// ============================================================
//  7. BẢNG QUẢN LÝ SẢN PHẨM & TỒN KHO CỦA ADMIN (THÊM, XÓA, SỬA, BỚT TỒN KHO)
// ============================================================
function openAdminProductsModal() {
    if (!isAdmin()) {
        showToast('Vui lòng đăng nhập với tài khoản Admin để truy cập Quản lý Kho!', 'error');
        openAuthModal();
        return;
    }

    const modal = document.getElementById('modal-admin-products');
    if (!modal) return;

    renderAdminProductsTable();
    modal.style.display = 'flex';
}

function closeAdminProductsModal() {
    const modal = document.getElementById('modal-admin-products');
    if (modal) modal.style.display = 'none';
}

function renderAdminProductsTable() {
    const tbody = document.getElementById('admin-products-tbody');
    if (!tbody) return;

    const searchInput = document.getElementById('admin-prod-search');
    const brandSelect = document.getElementById('admin-filter-brand');
    const stockSelect = document.getElementById('admin-filter-stock');

    const keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedBrand = brandSelect ? brandSelect.value : 'all';
    const selectedStock = stockSelect ? stockSelect.value : 'all';

    // 1. TÍNH TOÁN CÁC THỐNG KÊ KHO & CHI PHÍ KHÁCH MUA
    const totalSkus = productsData.length;
    const totalStock = productsData.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    const lowStockCount = productsData.filter(p => Number(p.stock || 0) <= 5).length;
    const totalStockValue = productsData.reduce((sum, p) => sum + (Number(p.stock) || 0) * (Number(p.price) || 0), 0);

    // Tính tổng chi phí khách hàng đã mua đồ
    const orders = JSON.parse(localStorage.getItem('sneakerx_orders') || '[]');
    let totalCustomerSpending = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    if (totalCustomerSpending === 0) {
        totalCustomerSpending = productsData.reduce((sum, p) => sum + (Number(p.sold) || 0) * (Number(p.price) || 0), 0);
    }

    // Hiển thị lên các thẻ KPI
    const statSkusEl = document.getElementById('stat-total-skus');
    const statStockEl = document.getElementById('stat-total-stock');
    const statLowEl = document.getElementById('stat-low-stock');
    const statStockValEl = document.getElementById('stat-stock-value');
    const statSpendingEl = document.getElementById('stat-customer-spending');

    if (statSkusEl) statSkusEl.innerText = totalSkus;
    if (statStockEl) statStockEl.innerText = totalStock.toLocaleString('vi-VN');
    if (statLowEl) statLowEl.innerText = lowStockCount;
    if (statStockValEl) statStockValEl.innerText = formatPrice(totalStockValue);
    if (statSpendingEl) statSpendingEl.innerText = formatPrice(totalCustomerSpending);

    // 2. LỌC DANH SÁCH SẢN PHẨM THEO TỪ KHÓA, THƯƠNG HIỆU, TRẠNG THÁI KHO
    let filtered = productsData.filter(p => {
        const matchesKeyword = !keyword || 
            (p.name && p.name.toLowerCase().includes(keyword)) ||
            (p.brand && p.brand.toLowerCase().includes(keyword)) ||
            (p.category && p.category.toLowerCase().includes(keyword));

        const matchesBrand = selectedBrand === 'all' || (p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase());

        const stock = Number(p.stock !== undefined ? p.stock : 0);
        let matchesStock = true;
        if (selectedStock === 'in_stock') {
            matchesStock = stock > 5;
        } else if (selectedStock === 'low_stock') {
            matchesStock = stock > 0 && stock <= 5;
        } else if (selectedStock === 'out_of_stock') {
            matchesStock = stock === 0;
        }

        return matchesKeyword && matchesBrand && matchesStock;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    Không tìm thấy sản phẩm nào khớp với bộ lọc tìm kiếm.
                </td>
            </tr>
        `;
        return;
    }

    let rowsHtml = '';
    filtered.forEach(p => {
        const stock = Number(p.stock !== undefined ? p.stock : 0);
        const sold = Number(p.sold !== undefined ? p.sold : 0);
        const revenue = sold * (Number(p.price) || 0);
        const totalUnits = stock + sold;
        const soldPercent = totalUnits > 0 ? Math.round((sold / totalUnits) * 100) : 0;
        const stockPercent = totalUnits > 0 ? Math.round((stock / totalUnits) * 100) : 0;

        let stockPillHTML = '';
        if (stock === 0) {
            stockPillHTML = `<span class="stock-pill out-of-stock">❌ Đã hết hàng</span>`;
        } else if (stock <= 5) {
            stockPillHTML = `<span class="stock-pill low-stock">⚠️ Sắp hết (${stock} đôi)</span>`;
        } else {
            stockPillHTML = `<span class="stock-pill in-stock">✓ Còn nhiều (${stock})</span>`;
        }

        // Progress bar tỉ lệ bán / tồn
        const progressBar = totalUnits > 0 ? `
            <div class="stock-progress-wrap" title="Đã bán: ${sold}/${totalUnits} đôi (${soldPercent}%)">
                <div class="stock-progress-bar">
                    <div class="stock-progress-fill" style="width: ${soldPercent}%"></div>
                </div>
                <span class="stock-progress-label">Bán ${soldPercent}% • Tồn ${stockPercent}%</span>
            </div>
        ` : '';

        rowsHtml += `
            <tr>
                <td>
                    <img class="admin-prod-thumb" src="${p.image}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80'">
                </td>
                <td>
                    <div class="admin-prod-meta-title">${p.name}</div>
                    <div class="admin-prod-meta-desc">${p.category} ${p.tag ? `• <span style="color:#ea580c;font-weight:700;">[${p.tag}]</span>` : ''}</div>
                    ${progressBar}
                </td>
                <td>
                    <span class="admin-badge-tag" style="background:#475569; font-size:11px;">${p.brand}</span>
                </td>
                <td>
                    <div style="font-weight: 800; color: #dc2626; font-size: 14px;">${formatPrice(p.price)}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">Chi phí khách mua</div>
                </td>
                <td>
                    <div class="stock-control-box">
                        <div class="stock-qty-stepper">
                            <button type="button" class="btn-stock-step minus" onclick="adminAdjustStock(${p.id}, -1)" title="Bớt 1 trong số lượng hàng tồn kho">-</button>
                            <span class="stock-qty-display" onclick="adminPromptStock(${p.id})" title="Click để chỉnh sửa số lượng tồn kho">${stock} đôi</span>
                            <button type="button" class="btn-stock-step plus" onclick="adminAdjustStock(${p.id}, 1)" title="Thêm 1 vào số lượng hàng tồn kho">+</button>
                        </div>
                        ${stockPillHTML}
                        <button type="button" class="btn-restock" onclick="adminRestockProduct(${p.id})" title="Nhập hàng nhanh (nhập thêm số lượng vào kho)">
                            📥 Nhập hàng
                        </button>
                    </div>
                </td>
                <td>
                    <div style="font-weight: 700; color: #0f172a;">${sold} đôi đã bán</div>
                    <div style="font-size: 11.5px; color: #16a34a; font-weight: 700;">+ ${formatPrice(revenue)}</div>
                </td>
                <td>
                    <div class="table-action-group">
                        <button type="button" class="btn-tbl-action edit" onclick="openEditProductModal(${p.id})" title="Chỉnh sửa sản phẩm">
                            ✏️ Sửa
                        </button>
                        <button type="button" class="btn-tbl-action delete" onclick="deleteProduct(null, ${p.id})" title="Xóa sản phẩm">
                            🗑️ Xóa
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = rowsHtml;
}

// BỚT / TĂNG SỐ LƯỢNG HÀNG TỒN KHO CỦA CỬA HÀNG
function adminAdjustStock(productId, delta) {
    if (!isAdmin()) {
        showToast('Chỉ Admin mới có quyền điều chỉnh kho hàng!', 'error');
        return;
    }

    const prod = productsData.find(p => p.id === productId);
    if (!prod) return;

    const currentStock = Number(prod.stock !== undefined ? prod.stock : 0);
    const newStock = Math.max(0, currentStock + delta);
    prod.stock = newStock;

    saveProducts();
    renderAdminProductsTable();
    renderProducts();

    const actionText = delta < 0 ? `Đã bớt ${Math.abs(delta)} đôi` : `Đã thêm ${delta} đôi`;
    showToast(`📦 [ADMIN] ${actionText} kho "${prod.name}" (Hiện còn: ${newStock} đôi)`);
}

// NHẬP HÀNG NHANH (CỘNG THÊM VÀO TỒN KHO)
function adminRestockProduct(productId) {
    if (!isAdmin()) {
        showToast('Chỉ Admin mới có quyền điều chỉnh kho hàng!', 'error');
        return;
    }

    const prod = productsData.find(p => p.id === productId);
    if (!prod) return;

    const currentStock = Number(prod.stock !== undefined ? prod.stock : 0);
    const input = prompt(`[ADMIN] Nhập thêm bao nhiêu đôi vào kho:\n"${prod.name}"\n(Tồn kho hiện tại: ${currentStock} đôi)\nSố lượng nhập thêm:`, '10');

    if (input === null) return;

    const addQty = parseInt(input.trim(), 10);
    if (isNaN(addQty) || addQty <= 0) {
        showToast('Vui lòng nhập số lượng nhập hàng là số nguyên dương!', 'error');
        return;
    }

    prod.stock = currentStock + addQty;
    saveProducts();
    renderAdminProductsTable();
    renderProducts();
    showToast(`📥 [ADMIN] Đã nhập thêm ${addQty} đôi vào kho "${prod.name}" (Tổng tồn: ${prod.stock} đôi)!`);
}

// NHẬP CHÍNH XÁC SỐ LƯỢNG HÀNG TỒN KHO
function adminPromptStock(productId) {
    if (!isAdmin()) {
        showToast('Chỉ Admin mới có quyền điều chỉnh kho hàng!', 'error');
        return;
    }

    const prod = productsData.find(p => p.id === productId);
    if (!prod) return;

    const currentStock = Number(prod.stock !== undefined ? prod.stock : 0);
    const input = prompt(`[ADMIN] Nhập số lượng hàng tồn kho mới cho:\n"${prod.name}"\n(Số lượng hiện tại: ${currentStock} đôi):`, currentStock);

    if (input === null) return; // Nhấn hủy

    const parsedStock = parseInt(input.trim(), 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
        showToast('Vui lòng nhập số lượng hàng tồn kho là số nguyên >= 0!', 'error');
        return;
    }

    prod.stock = parsedStock;
    saveProducts();
    renderAdminProductsTable();
    renderProducts();
    showToast(`📦 [ADMIN] Đã cập nhật tồn kho "${prod.name}": ${parsedStock} đôi!`);
}

// MODAL CHỈNH SỬA SẢN PHẨM & TỒN KHO
function openEditProductModal(productId) {
    if (!isAdmin()) {
        showToast('Chỉ Quản trị viên (Admin) mới có quyền chỉnh sửa sản phẩm!', 'error');
        openAuthModal();
        return;
    }

    const prod = productsData.find(p => p.id === productId);
    if (!prod) {
        showToast('Không tìm thấy sản phẩm cần chỉnh sửa!', 'error');
        return;
    }

    document.getElementById('edit-prod-id').value = prod.id;
    document.getElementById('edit-prod-name').value = prod.name;
    document.getElementById('edit-prod-brand').value = prod.brand || 'Nike';
    document.getElementById('edit-prod-category').value = prod.category || 'Giày Đá Banh';
    document.getElementById('edit-prod-price').value = prod.price;
    document.getElementById('edit-prod-stock').value = prod.stock !== undefined ? prod.stock : 15;
    document.getElementById('edit-prod-tag').value = prod.tag || '';
    document.getElementById('edit-prod-image').value = prod.image || '';
    document.getElementById('edit-prod-desc').value = prod.desc || '';

    previewEditProductImage();

    const modal = document.getElementById('modal-edit-product');
    if (modal) modal.style.display = 'flex';
}

function closeEditProductModal() {
    const modal = document.getElementById('modal-edit-product');
    if (modal) modal.style.display = 'none';
}

function previewEditProductImage() {
    const url = document.getElementById('edit-prod-image').value.trim();
    const previewImg = document.getElementById('edit-prod-preview');
    const placeholder = document.getElementById('edit-prod-preview-ph');
    if (url) {
        previewImg.src = url;
        previewImg.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
    } else {
        previewImg.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
    }
}

function saveEditProduct(event) {
    if (event) event.preventDefault();

    if (!isAdmin()) {
        showToast('Bạn không có quyền thực hiện thao tác này!', 'error');
        return;
    }

    const id = parseInt(document.getElementById('edit-prod-id').value, 10);
    const prod = productsData.find(p => p.id === id);
    if (!prod) {
        showToast('Không tìm thấy sản phẩm để cập nhật!', 'error');
        return;
    }

    const name = document.getElementById('edit-prod-name').value.trim();
    const brand = document.getElementById('edit-prod-brand').value;
    const category = document.getElementById('edit-prod-category').value;
    const price = parseInt(document.getElementById('edit-prod-price').value, 10);
    const stock = parseInt(document.getElementById('edit-prod-stock').value, 10);
    const tag = document.getElementById('edit-prod-tag').value;
    const image = document.getElementById('edit-prod-image').value.trim();
    const desc = document.getElementById('edit-prod-desc').value.trim();

    if (!name) {
        showToast('Vui lòng nhập Tên sản phẩm giày!', 'error');
        return;
    }
    if (!price || price < 50000) {
        showToast('Vui lòng nhập Giá bán hợp lệ (tối thiểu 50.000 ₫)!', 'error');
        return;
    }
    if (isNaN(stock) || stock < 0) {
        showToast('Số lượng hàng tồn kho phải lớn hơn hoặc bằng 0!', 'error');
        return;
    }

    // Cập nhật thông tin
    prod.name = name;
    prod.brand = brand;
    prod.category = category;
    prod.price = price;
    prod.stock = stock;
    prod.tag = tag;
    prod.image = image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80';
    prod.desc = desc;

    saveProducts();
    renderProducts();
    closeEditProductModal();

    // Nếu bảng quản lý kho đang mở thì cập nhật lại
    const modalAdminProd = document.getElementById('modal-admin-products');
    if (modalAdminProd && modalAdminProd.style.display === 'flex') {
        renderAdminProductsTable();
    }

    showToast(`👑 [ADMIN] Đã cập nhật thông tin & tồn kho "${name}" thành công!`);
}

// 7. QUẢN LÝ ĐƠN HÀNG DÀNH CHO ADMIN
function openAdminOrdersModal() {
    if (!isAdmin()) {
        showToast('Vui lòng đăng nhập với tài khoản Admin để xem đơn hàng!', 'error');
        openAuthModal();
        return;
    }

    const modal = document.getElementById('modal-admin-orders');
    const tbody = document.getElementById('admin-orders-tbody');
    if (!modal || !tbody) return;

    const orders = JSON.parse(localStorage.getItem('sneakerx_orders') || '[]');

    // Cập nhật thống kê KPI đơn hàng
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'Chờ xác nhận').length;
    const doneOrders = orders.filter(o => o.status === 'Đã hoàn thành').length;
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const elTotal = document.getElementById('stat-orders-total');
    const elPending = document.getElementById('stat-orders-pending');
    const elDone = document.getElementById('stat-orders-done');
    const elRevenue = document.getElementById('stat-orders-revenue');
    if (elTotal) elTotal.innerText = totalOrders;
    if (elPending) elPending.innerText = pendingOrders;
    if (elDone) elDone.innerText = doneOrders;
    if (elRevenue) elRevenue.innerText = formatPrice(totalRevenue);

    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    Chưa có đơn hàng nào được ghi nhận trên hệ thống.
                </td>
            </tr>
        `;
    } else {
        let rowsHtml = '';
        orders.forEach((order, index) => {
            const itemsStr = order.items.map(it => `${it.product.name} (x${it.qty})`).join('<br>• ');
            const statusClass = order.status === 'Đang giao hàng' ? 'shipping' : (order.status === 'Đã hoàn thành' ? 'completed' : (order.status === 'Đã hủy' ? 'cancelled' : 'pending'));

            rowsHtml += `
                <tr>
                    <td style="font-weight: 800; color: #ea580c;">#${order.orderId}<br><span style="font-size: 11px; color: var(--text-muted);">${order.date}</span></td>
                    <td style="font-weight: 700;">${order.customerName}</td>
                    <td style="font-size: 12.5px;">📞 ${order.phone}<br>📍 ${order.address}</td>
                    <td style="font-size: 12.5px; line-height: 1.4;">• ${itemsStr}</td>
                    <td style="font-weight: 800; color: #dc2626; white-space: nowrap;">${formatPrice(order.total)}</td>
                    <td>
                        <select class="status-select" onchange="updateOrderStatus('${order.orderId}', this.value)">
                            <option value="Chờ xác nhận" ${order.status === 'Chờ xác nhận' ? 'selected' : ''}>⏳ Chờ xác nhận</option>
                            <option value="Đang giao hàng" ${order.status === 'Đang giao hàng' ? 'selected' : ''}>🚚 Đang giao</option>
                            <option value="Đã hoàn thành" ${order.status === 'Đã hoàn thành' ? 'selected' : ''}>✅ Hoàn thành</option>
                            <option value="Đã hủy" ${order.status === 'Đã hủy' ? 'selected' : ''}>❌ Đã hủy</option>
                        </select>
                    </td>
                    <td>
                        <button onclick="deleteSingleOrder('${order.orderId}')" class="btn-logout" style="color:#ef4444; border-color:#fca5a5; padding: 4px 8px;" title="Xóa đơn hàng">
                            Xóa
                        </button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = rowsHtml;
    }

    modal.style.display = 'flex';
}

function closeAdminOrdersModal() {
    const modal = document.getElementById('modal-admin-orders');
    if (modal) modal.style.display = 'none';
}

function updateOrderStatus(orderId, newStatus) {
    const orders = JSON.parse(localStorage.getItem('sneakerx_orders') || '[]');
    const target = orders.find(o => o.orderId === orderId);
    if (target) {
        target.status = newStatus;
        localStorage.setItem('sneakerx_orders', JSON.stringify(orders));
        showToast(`Đã đổi trạng thái đơn #${orderId} sang "${newStatus}"!`);
    }
}

function deleteSingleOrder(orderId) {
    if (confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${orderId} không?`)) {
        let orders = JSON.parse(localStorage.getItem('sneakerx_orders') || '[]');
        orders = orders.filter(o => o.orderId !== orderId);
        localStorage.setItem('sneakerx_orders', JSON.stringify(orders));
        showToast(`Đã xóa đơn hàng #${orderId}!`);
        openAdminOrdersModal();
        updateAuthUI();
    }
}

function clearAllOrders() {
    if (confirm('Bạn có chắc muốn xóa TẤT CẢ các đơn hàng đã đặt để reset hệ thống?')) {
        localStorage.removeItem('sneakerx_orders');
        showToast('Đã xóa toàn bộ đơn hàng test!');
        openAdminOrdersModal();
        updateAuthUI();
    }
}

// 8. CHUYỂN TRANG (Single Page App)
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    const targetPage = document.getElementById('page-' + pageId);
    if (targetPage) {
        targetPage.style.display = 'block';
    }

    // Cập nhật trạng thái active trên navbar
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    const navItem = document.getElementById('nav-' + pageId);
    if (navItem) navItem.classList.add('active');

    if (pageId === 'cart') {
        renderCart();
    } else if (pageId === 'checkout') {
        renderCheckout();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 9. MODAL ĐĂNG NHẬP / ĐĂNG KÝ
function openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'flex';
}
function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'none';
}
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

    const tabBtn = document.getElementById('tab-' + tab);
    const form = document.getElementById(tab + '-form');
    if (tabBtn) tabBtn.classList.add('active');
    if (form) form.classList.add('active');
}

function scrollToProducts() {
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// 10. KHỞI TẠO KHI TẢI TRANG
window.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    updateCartCount();
    renderProducts();

    // Kiểm tra tham số URL (?page=checkout)
    const urlParams = new URLSearchParams(window.location.search);
    const requestedPage = urlParams.get('page');
    if (requestedPage === 'checkout') {
        showPage('checkout');
    } else if (requestedPage === 'cart') {
        showPage('cart');
    }
});

// Navbar hiệu ứng cuộn
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (!header) return;
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
    } else {
        header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
    }
});