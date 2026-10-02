// ============================================================
//  public/js/admin.js
//  Module Quản trị Admin Dashboard – Bảo Sneaker
// ============================================================

const adminState = {
    currentTab: 'dashboard',
    stats: null,
    orders: [],
    installments: [],
    products: [],
    support: [],
    vouchers: [],
    users: [],
    // Filters
    orderStatusFilter: 'all',
    orderSearch: '',
    instStatusFilter: 'all',
    instSearch: '',
    prodBrandFilter: 'all',
    prodStockFilter: 'all',
    prodSearch: '',
    supportStatusFilter: 'all',
    editingProductId: null,
};

// -----------------------------------------------------------
//  KHỞI TẠO TRANG QUẢN TRỊ
// -----------------------------------------------------------
function initAdminDashboard() {
    if (!state.user) return;

    // Cập nhật thông tin admin ở sidebar
    const badgeChar = $('#admin-badge-char');
    const badgeName = $('#admin-badge-name');
    const badgeRole = $('#admin-badge-role');

    if (badgeChar) badgeChar.textContent = state.user.full_name.charAt(0).toUpperCase();
    if (badgeName) badgeName.textContent = state.user.full_name;
    if (badgeRole) {
        const roleLabels = {
            admin: 'Quản trị viên',
            warehouse: 'Thủ kho',
            sales: 'Kinh doanh & CSKH',
            customer: 'Khách hàng'
        };
        badgeRole.textContent = roleLabels[state.user.role] || state.user.role;
    }

    // Phân quyền hiển thị Menu Sidebar dựa trên role
    enforceRolePermissions();

    // Tải dữ liệu ban đầu
    refreshAdminData();
}

function enforceRolePermissions() {
    const role = state.user ? state.user.role : '';
    const btnOrders    = $('.admin-nav-item[data-tab="orders"]');
    const btnInst      = $('.admin-nav-item[data-tab="installments"]');
    const btnProds     = $('.admin-nav-item[data-tab="products"]');
    const btnSupport   = $('.admin-nav-item[data-tab="support"]');
    const btnVouchers  = $('.admin-nav-item[data-tab="vouchers"]');
    const btnUsers     = $('.admin-nav-item[data-tab="users"]');

    if (role === 'warehouse') {
        // Nhân viên kho chỉ quản lý Kho & Sản phẩm
        if (btnOrders)   btnOrders.style.display = 'none';
        if (btnInst)     btnInst.style.display = 'none';
        if (btnSupport)  btnSupport.style.display = 'none';
        if (btnVouchers) btnVouchers.style.display = 'none';
        if (btnUsers)    btnUsers.style.display = 'none';
        adminState.currentTab = 'products';
    } else if (role === 'sales') {
        // Nhân viên kinh doanh quản lý Đơn hàng, Trả góp, CSKH
        if (btnProds)    btnProds.style.display = 'none';
        if (btnUsers)    btnUsers.style.display = 'none';
        if (btnVouchers) btnVouchers.style.display = 'none';
        adminState.currentTab = 'orders';
    } else {
        // Admin full quyền
        if (btnOrders)   btnOrders.style.display = 'flex';
        if (btnInst)     btnInst.style.display = 'flex';
        if (btnProds)    btnProds.style.display = 'flex';
        if (btnSupport)  btnSupport.style.display = 'flex';
        if (btnVouchers) btnVouchers.style.display = 'flex';
        if (btnUsers)    btnUsers.style.display = 'flex';
    }
}

function toggleAdminSidebar() {
    $('#admin-sidebar')?.classList.toggle('open');
}

// -----------------------------------------------------------
//  TẢI LẠI DỮ LIỆU & CẬP NHẬT CHỈ SỐ NHANH
// -----------------------------------------------------------
async function refreshAdminData() {
    try {
        const res = await fetch(`${API}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        if (data.success) {
            adminState.stats = data.data;

            // Cập nhật các chỉ số nhanh ở topbar
            const pOrders = adminState.stats.orders.pending_orders || 0;
            const pInst   = adminState.stats.installments.pending_installments || 0;
            const lowStk  = adminState.stats.products.low_stock_count || 0;

            const topPOrd = $('#top-pending-orders');
            const topPIns = $('#top-pending-inst');
            const topLow  = $('#top-low-stock');

            if (topPOrd) topPOrd.textContent = pOrders;
            if (topPIns) topPIns.textContent = pInst;
            if (topLow)  topLow.textContent  = lowStk;

            // Badges trên sidebar menu
            updateSidebarBadge('#badge-orders-count', pOrders);
            updateSidebarBadge('#badge-inst-count', pInst);
            updateSidebarBadge('#badge-lowstock-count', lowStk);
            updateSidebarBadge('#badge-support-count', adminState.stats.support.pending_contacts || 0);
        }
    } catch (e) {
        console.error('Lỗi tải thống kê:', e);
    }

    switchAdminTab(adminState.currentTab);
}

function updateSidebarBadge(selector, count) {
    const el = $(selector);
    if (!el) return;
    const num = parseInt(count) || 0;
    if (num > 0) {
        el.textContent = num;
        el.style.display = 'inline-block';
    } else {
        el.style.display = 'none';
    }
}

// -----------------------------------------------------------
//  CHUYỂN ĐỔI TAB QUẢN TRỊ
// -----------------------------------------------------------
function switchAdminTab(tab) {
    adminState.currentTab = tab;

    // Đóng sidebar trên mobile nếu đang mở
    $('#admin-sidebar')?.classList.remove('open');

    // Cập nhật active tab button
    $$('.admin-nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Cập nhật breadcrumb title
    const titles = {
        dashboard:    'Tổng quan & Báo cáo Thống kê',
        orders:       'Quản lý Đơn hàng & Giao dịch',
        installments: 'Quản lý Hồ sơ Mua Trả góp',
        products:     'Quản lý Kho & Danh mục Sản phẩm',
        support:      'Tương tác & Chăm sóc Khách hàng (CSKH)',
        vouchers:     'Khuyến mãi & Banner Động Trang chủ',
        users:        'Danh sách Khách hàng & Phân quyền'
    };
    const titleEl = $('#admin-current-tab-title');
    if (titleEl) titleEl.textContent = titles[tab] || 'Quản trị';

    // Render nội dung tab tương ứng
    switch (tab) {
        case 'dashboard':
            renderAdminDashboard();
            break;
        case 'orders':
            renderAdminOrders();
            break;
        case 'installments':
            renderAdminInstallments();
            break;
        case 'products':
            renderAdminProducts();
            break;
        case 'support':
            renderAdminSupport();
            break;
        case 'vouchers':
            renderAdminVouchers();
            break;
        case 'users':
            renderAdminUsers();
            break;
        default:
            renderAdminDashboard();
    }
}

// ============================================================
//  TAB 1: TỔNG QUAN & BÁO CÁO (DASHBOARD ANALYTICS)
// ============================================================
function renderAdminDashboard() {
    const body = $('#admin-content-body');
    if (!body) return;

    const s = adminState.stats;
    if (!s) {
        body.innerHTML = '<div class="spinner"></div>';
        return;
    }

    const o = s.orders;
    const totalRev = parseFloat(o.total_revenue) || 0;
    const totalOrd = parseInt(o.total_orders) || 0;
    const compOrd  = parseInt(o.completed_orders) || 0;
    const convRate = totalOrd > 0 ? Math.round((compOrd / totalOrd) * 100) : 0;
    const lowStock = parseInt(s.products.low_stock_count) || 0;
    const pendInst = parseInt(s.installments.pending_installments) || 0;

    // Biểu đồ doanh thu 7 ngày
    const revDays = s.revenue_by_day || [];
    const maxRev = Math.max(...revDays.map(d => parseFloat(d.daily_revenue)), 10000000);

    body.innerHTML = `
        <!-- 4 Thẻ Stat Cards -->
        <div class="stat-cards-grid">
            <div class="admin-stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Doanh thu hoàn thành</span>
                    <div class="stat-card-icon green">💰</div>
                </div>
                <div class="stat-card-value">${fmt(totalRev)}</div>
                <div class="stat-card-sub">
                    <span class="stat-trend-up">✔ Thực thu</span> từ đơn giao thành công
                </div>
            </div>

            <div class="admin-stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Đơn hàng & Tỷ lệ giao</span>
                    <div class="stat-card-icon blue">📦</div>
                </div>
                <div class="stat-card-value">${totalOrd} đơn</div>
                <div class="stat-card-sub">
                    <span class="stat-trend-up">★ ${convRate}%</span> đơn hàng hoàn thành
                </div>
            </div>

            <div class="admin-stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Hồ sơ Trả góp</span>
                    <div class="stat-card-icon amber">💳</div>
                </div>
                <div class="stat-card-value">${pendInst} chờ duyệt</div>
                <div class="stat-card-sub">
                    Tổng cộng: <strong>${s.installments.total_installments}</strong> hồ sơ đăng ký
                </div>
            </div>

            <div class="admin-stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Cảnh báo tồn kho</span>
                    <div class="stat-card-icon rose">⚠️</div>
                </div>
                <div class="stat-card-value">${lowStock} mẫu máy</div>
                <div class="stat-card-sub">
                    <span class="${lowStock > 0 ? 'stat-trend-alert' : 'stat-trend-up'}">
                        ${lowStock > 0 ? '● Cần nhập thêm kho ngay' : '✔ Tồn kho an toàn'}
                    </span>
                </div>
            </div>
        </div>

        <!-- 2 Cột: Biểu đồ Doanh thu & Top 5 Bán chạy -->
        <div class="dashboard-grid-2">
            <!-- Biểu đồ doanh thu gần đây -->
            <div class="admin-card">
                <div class="admin-card-header">
                    <h3 class="admin-card-title">
                        <span>📈</span> Doanh thu theo ngày gần nhất
                    </h3>
                    <span class="admin-card-badge">7 ngày gần đây</span>
                </div>
                <div class="revenue-bars-wrap">
                    ${revDays.length > 0 ? revDays.map(d => {
                        const rev = parseFloat(d.daily_revenue);
                        const pct = Math.max(10, Math.round((rev / maxRev) * 100));
                        return `
                            <div class="bar-col">
                                <div class="bar-tooltip">${d.date_label}: ${fmt(rev)} (${d.daily_orders} đơn)</div>
                                <div class="bar-fill" style="height:${pct}%"></div>
                                <span class="bar-label">${d.date_label}</span>
                            </div>
                        `;
                    }).join('') : `
                        <div style="margin:auto;color:#94a3b8;font-size:13px">Chưa có dữ liệu giao dịch gần đây.</div>
                    `}
                </div>
            </div>

            <!-- Top 5 điện thoại bán chạy nhất -->
            <div class="admin-card">
                <div class="admin-card-header">
                    <h3 class="admin-card-title">
                        <span>🏆</span> Top điện thoại bán chạy
                    </h3>
                    <span class="admin-card-badge">Theo số lượng</span>
                </div>
                <div class="top-prods-list">
                    ${(s.top_products || []).length > 0 ? s.top_products.map((p, idx) => `
                        <div class="top-prod-row">
                            <div class="top-prod-rank rank-${idx + 1}">${idx + 1}</div>
                            <img class="top-prod-thumb" src="${p.image_url || getBrandFallback(p.brand)}" alt="${p.name}">
                            <div class="top-prod-info">
                                <div class="top-prod-name" title="${p.name}">${p.name}</div>
                                <div class="top-prod-brand">${p.brand} • ${fmt(p.price)}</div>
                            </div>
                            <div class="top-prod-stats">
                                <div class="top-prod-sold">${p.total_sold} máy</div>
                                <div class="top-prod-amount">${fmt(p.total_sales_amount)}</div>
                            </div>
                        </div>
                    `).join('') : `
                        <div style="text-align:center;padding:20px;color:#94a3b8;font-size:13px">Chưa có sản phẩm được bán.</div>
                    `}
                </div>
            </div>
        </div>

        <!-- Bảng cảnh báo tồn kho sắp hết -->
        ${(s.low_stock_products || []).length > 0 ? `
            <div class="inventory-alert-banner">
                <div class="alert-banner-left">
                    <span class="alert-banner-icon">🚨</span>
                    <div class="alert-banner-text">
                        <strong>CẢNH BÁO TỒN KHO: CÓ ${s.low_stock_products.length} MẪU ĐIỆN THOẠI SẮP HẾT HÀNG (TỒN ≤ 10)</strong>
                        <span>Hệ thống tự động highlight đỏ để bộ phận kho và quản trị kịp thời bổ sung hàng hóa.</span>
                    </div>
                </div>
                <button class="btn-admin-action secondary" onclick="switchAdminTab('products'); filterProductStock('low')">
                    Xem & Cập nhật kho →
                </button>
            </div>
        ` : ''}
    `;
}

// ============================================================
//  TAB 2: QUẢN LÝ ĐƠN HÀNG & GIAO DỊCH (CORE)
// ============================================================
async function renderAdminOrders() {
    const body = $('#admin-content-body');
    if (!body) return;

    body.innerHTML = '<div class="spinner"></div>';

    try {
        const res = await fetch(`${API}/orders`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        adminState.orders = data.success ? data.data : [];
    } catch (e) {
        showToast('Không thể tải danh sách đơn hàng.', 'error');
        adminState.orders = [];
    }

    displayOrdersList();
}

function displayOrdersList() {
    const body = $('#admin-content-body');
    if (!body) return;

    let filtered = [...adminState.orders];

    // Lọc theo trạng thái
    if (adminState.orderStatusFilter !== 'all') {
        filtered = filtered.filter(o => o.status === adminState.orderStatusFilter);
    }

    // Lọc theo từ khóa tìm kiếm
    if (adminState.orderSearch.trim()) {
        const q = adminState.orderSearch.toLowerCase();
        filtered = filtered.filter(o => 
            String(o.order_id).includes(q) ||
            (o.customer_name || '').toLowerCase().includes(q) ||
            (o.customer_email || '').toLowerCase().includes(q) ||
            (o.shipping_address || '').toLowerCase().includes(q)
        );
    }

    body.innerHTML = `
        <!-- Toolbar & Search -->
        <div class="admin-toolbar">
            <div class="toolbar-left">
                <input type="text" class="admin-search-input" placeholder="🔍 Tìm mã đơn, tên, SĐT..."
                       value="${adminState.orderSearch}"
                       oninput="adminState.orderSearch = this.value; displayOrdersList()">
                
                <span style="font-size:13px;color:#64748b;font-weight:600">
                    Tổng cộng: <strong>${filtered.length}</strong> đơn hàng
                </span>
            </div>

            <div class="toolbar-right">
                <button class="btn-admin-action secondary" onclick="renderAdminOrders()">
                    🔄 Làm mới danh sách
                </button>
            </div>
        </div>

        <!-- Filter tabs theo trạng thái -->
        <div class="admin-tabs-row">
            ${[
                { id: 'all', label: 'Tất cả' },
                { id: 'pending', label: 'Chờ xác nhận' },
                { id: 'processing', label: 'Đang xử lý' },
                { id: 'shipping', label: 'Đang giao' },
                { id: 'completed', label: 'Thành công' },
                { id: 'cancelled', label: 'Đã hủy' }
            ].map(t => `
                <button class="tab-filter-btn ${adminState.orderStatusFilter === t.id ? 'active' : ''}"
                        onclick="adminState.orderStatusFilter = '${t.id}'; displayOrdersList()">
                    ${t.label}
                </button>
            `).join('')}
        </div>

        <!-- Table đơn hàng -->
        <div class="admin-table-wrap">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Mã đơn</th>
                        <th>Ngày đặt</th>
                        <th>Khách hàng</th>
                        <th>Sản phẩm đặt</th>
                        <th>Địa chỉ giao</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Cập nhật trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.length > 0 ? filtered.map(o => `
                        <tr>
                            <td><strong>#${o.order_id}</strong></td>
                            <td style="white-space:nowrap">${new Date(o.created_at).toLocaleString('vi-VN')}</td>
                            <td>
                                <strong>${o.customer_name || 'Khách vãng lai'}</strong>
                                <div style="font-size:11px;color:#64748b">${o.customer_email || ''}</div>
                            </td>
                            <td>
                                <div style="max-width:240px;font-size:12.5px;color:#334155;line-height:1.4">
                                    ${(o.items || []).map(i => `• ${i.product_name || 'Điện thoại'} × <strong>${i.quantity}</strong>`).join('<br>')}
                                </div>
                            </td>
                            <td>
                                <div style="max-width:220px;font-size:12px;color:#475569" title="${o.shipping_address}">
                                    ${o.shipping_address}
                                </div>
                            </td>
                            <td><strong style="color:#0f172a">${fmt(o.total_amount)}</strong></td>
                            <td>
                                <span class="status-pill status-${o.status}">
                                    ${getStatusLabel(o.status)}
                                </span>
                            </td>
                            <td>
                                <select class="admin-select" style="padding:4px 8px;font-size:12px"
                                        onchange="updateOrderStatusAction(${o.order_id}, this.value)">
                                    <option value="pending"    ${o.status === 'pending' ? 'selected' : ''}>Chờ xác nhận</option>
                                    <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Đang xử lý</option>
                                    <option value="shipping"   ${o.status === 'shipping' ? 'selected' : ''}>Đang giao</option>
                                    <option value="completed"  ${o.status === 'completed' ? 'selected' : ''}>Thành công</option>
                                    <option value="cancelled"  ${o.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
                                </select>
                            </td>
                            <td>
                                <button class="btn-sm-action primary" onclick="openOrderDetailModal(${o.order_id})">
                                    👁 Chi tiết
                                </button>
                            </td>
                        </tr>
                    `).join('') : `
                        <tr>
                            <td colspan="9" style="text-align:center;padding:32px;color:#94a3b8">
                                Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                            </td>
                        </tr>
                    `}
                </tbody>
            </table>
        </div>
    `;
}

function getStatusLabel(st) {
    const map = {
        pending: 'Chờ xác nhận',
        processing: 'Đang xử lý',
        shipping: 'Đang giao',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy'
    };
    return map[st] || st;
}

async function updateOrderStatusAction(orderId, newStatus) {
    try {
        const res = await fetch(`${API}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`Đã chuyển đơn hàng #${orderId} sang trạng thái "${getStatusLabel(newStatus)}"`, 'success');
            // Cập nhật local state
            const target = adminState.orders.find(o => o.order_id === orderId);
            if (target) target.status = newStatus;
            displayOrdersList();
            refreshAdminData();
        } else {
            showToast(data.message || 'Cập nhật thất bại.', 'error');
        }
    } catch (e) {
        showToast('Lỗi máy chủ khi cập nhật đơn hàng.', 'error');
    }
}

function openOrderDetailModal(orderId) {
    const o = adminState.orders.find(x => x.order_id === orderId);
    if (!o) return;

    const overlay = $('#modal-overlay');
    const modal   = $('#modal');

    modal.innerHTML = `
        <div style="max-width:550px;width:100%">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:1px solid #e2e8f0;padding-bottom:12px">
                <h2 style="font-size:19px;margin:0">Chi tiết đơn hàng #${o.order_id}</h2>
                <span class="status-pill status-${o.status}">${getStatusLabel(o.status)}</span>
            </div>

            <div style="background:#f8fafc;padding:14px;border-radius:8px;margin-bottom:16px;font-size:13px;line-height:1.6">
                <div><strong>Người mua:</strong> ${o.customer_name || 'Khách vãng lai'} (${o.customer_email || 'Không có email'})</div>
                <div><strong>Địa chỉ giao:</strong> ${o.shipping_address}</div>
                <div><strong>Ngày đặt:</strong> ${new Date(o.created_at).toLocaleString('vi-VN')}</div>
            </div>

            <h4 style="font-size:14px;margin-bottom:10px;color:#334155">Danh sách sản phẩm trong đơn:</h4>
            <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:16px">
                ${(o.items || []).map(i => `
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:13px">
                        <div style="display:flex;align-items:center;gap:10px">
                            <img src="${i.image_url || getBrandFallback('')}" style="width:36px;height:36px;object-fit:contain;border-radius:4px;background:#f8fafc">
                            <div>
                                <strong style="display:block">${i.product_name || 'Điện thoại'}</strong>
                                <span style="color:#64748b;font-size:11.5px">${fmt(i.price)} × ${i.quantity}</span>
                            </div>
                        </div>
                        <div style="font-weight:700;color:#0f172a">${fmt(i.price * i.quantity)}</div>
                    </div>
                `).join('')}
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:#f1f5f9;border-radius:8px;font-size:15px;margin-bottom:20px">
                <strong>Tổng thanh toán (COD):</strong>
                <strong style="color:#dc2626;font-size:17px">${fmt(o.total_amount)}</strong>
            </div>

            <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn-sm-action primary" onclick="updateOrderStatusAction(${o.order_id}, 'processing'); closeModal()">
                    ⚙️ Đang xử lý
                </button>
                <button class="btn-sm-action warning" onclick="updateOrderStatusAction(${o.order_id}, 'shipping'); closeModal()">
                    🚚 Đang giao hàng
                </button>
                <button class="btn-sm-action success" onclick="updateOrderStatusAction(${o.order_id}, 'completed'); closeModal()">
                    ✔ Thành công
                </button>
                <button class="btn-sm-action danger" onclick="updateOrderStatusAction(${o.order_id}, 'cancelled'); closeModal()">
                    ✖ Hủy đơn
                </button>
                <button class="btn-sm-action" style="margin-left:auto" onclick="closeModal()">
                    Đóng
                </button>
            </div>
        </div>
    `;

    overlay.classList.add('open');
}

// ============================================================
//  TAB 3: QUẢN LÝ YÊU CẦU TRẢ GÓP (INSTALLMENT MANAGEMENT)
// ============================================================
async function renderAdminInstallments() {
    const body = $('#admin-content-body');
    if (!body) return;

    body.innerHTML = '<div class="spinner"></div>';

    try {
        const res = await fetch(`${API}/installments`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        adminState.installments = data.success ? data.data : [];
    } catch (e) {
        showToast('Không thể tải hồ sơ trả góp.', 'error');
        adminState.installments = [];
    }

    displayInstallmentsList();
}

function displayInstallmentsList() {
    const body = $('#admin-content-body');
    if (!body) return;

    let filtered = [...adminState.installments];

    if (adminState.instStatusFilter !== 'all') {
        filtered = filtered.filter(i => i.status === adminState.instStatusFilter);
    }

    if (adminState.instSearch.trim()) {
        const q = adminState.instSearch.toLowerCase();
        filtered = filtered.filter(i =>
            String(i.id).includes(q) ||
            (i.customer_name || '').toLowerCase().includes(q) ||
            (i.phone || '').includes(q) ||
            (i.id_card || '').includes(q) ||
            (i.product_name || '').toLowerCase().includes(q)
        );
    }

    body.innerHTML = `
        <!-- Toolbar & Filter -->
        <div class="admin-toolbar">
            <div class="toolbar-left">
                <input type="text" class="admin-search-input" placeholder="🔍 Tìm tên, SĐT, CCCD, dòng máy..."
                       value="${adminState.instSearch}"
                       oninput="adminState.instSearch = this.value; displayInstallmentsList()">
                
                <span style="font-size:13px;color:#64748b;font-weight:600">
                    Tổng số: <strong>${filtered.length}</strong> hồ sơ trả góp
                </span>
            </div>

            <div class="toolbar-right">
                <button class="btn-admin-action secondary" onclick="renderAdminInstallments()">
                    🔄 Tải lại hồ sơ
                </button>
            </div>
        </div>

        <!-- Status filter buttons -->
        <div class="admin-tabs-row">
            ${[
                { id: 'all', label: 'Tất cả hồ sơ' },
                { id: 'pending', label: 'Chờ duyệt hồ sơ' },
                { id: 'approved', label: 'Đã duyệt thành công' },
                { id: 'need_info', label: 'Cần bổ sung giấy tờ' },
                { id: 'rejected', label: 'Đã từ chối' }
            ].map(t => `
                <button class="tab-filter-btn ${adminState.instStatusFilter === t.id ? 'active' : ''}"
                        onclick="adminState.instStatusFilter = '${t.id}'; displayInstallmentsList()">
                    ${t.label}
                </button>
            `).join('')}
        </div>

        <!-- Table hồ sơ trả góp -->
        <div class="admin-table-wrap">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Mã hồ sơ</th>
                        <th>Ngày nộp</th>
                        <th>Khách hàng</th>
                        <th>SĐT & CCCD/Ngân hàng</th>
                        <th>Sản phẩm trả góp</th>
                        <th>Hình thức</th>
                        <th>Kỳ hạn</th>
                        <th>Trả trước</th>
                        <th>Góp / Tháng</th>
                        <th>Trạng thái</th>
                        <th>Thao tác xét duyệt</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.length > 0 ? filtered.map(item => `
                        <tr>
                            <td><strong>#TG${item.id}</strong></td>
                            <td style="white-space:nowrap">${new Date(item.created_at).toLocaleDateString('vi-VN')}</td>
                            <td>
                                <strong>${item.customer_name}</strong>
                                <div style="font-size:11px;color:#64748b">${item.address || 'Tại cửa hàng'}</div>
                            </td>
                            <td>
                                <div style="font-weight:700;color:#1d4ed8">${item.phone}</div>
                                <div style="font-size:11.5px;color:#64748b">${item.id_card || 'Chưa cung cấp'}</div>
                            </td>
                            <td>
                                <div style="display:flex;align-items:center;gap:8px">
                                    <img src="${item.product_image || getBrandFallback(item.product_brand)}" class="table-img">
                                    <div>
                                        <strong style="display:block;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${item.product_name}">
                                            ${item.product_name || 'Điện thoại'}
                                        </strong>
                                        <span style="font-size:11px;color:#64748b">${fmt(item.product_price || 0)}</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span style="font-size:11.5px;font-weight:600;color:#475569">
                                    ${item.method === 'credit_card' ? '💳 Thẻ tín dụng' : '🏢 Cty tài chính'}
                                </span>
                            </td>
                            <td><strong>${item.term_months} tháng</strong></td>
                            <td>
                                <div style="font-weight:700;color:#0f172a">${fmt(item.prepaid_amount)}</div>
                                <span style="font-size:11px;color:#64748b">${item.prepaid_percent}%</span>
                            </td>
                            <td>
                                <strong style="color:#059669">${fmt(item.monthly_payment)}</strong>
                            </td>
                            <td>
                                <span class="status-pill status-${item.status}">
                                    ${getInstStatusLabel(item.status)}
                                </span>
                                ${item.admin_notes ? `
                                    <div style="font-size:11px;color:#a21caf;margin-top:4px" title="${item.admin_notes}">
                                        📝 ${item.admin_notes.slice(0, 30)}...
                                    </div>
                                ` : ''}
                            </td>
                            <td>
                                <div class="row-actions">
                                    <button class="btn-sm-action success" onclick="updateInstallmentStatusAction(${item.id}, 'approved')" title="Duyệt hồ sơ">
                                        ✔ Duyệt
                                    </button>
                                    <button class="btn-sm-action warning" onclick="openInstallmentNoteModal(${item.id}, 'need_info')" title="Yêu cầu bổ sung">
                                        ⚠️ Bổ sung
                                    </button>
                                    <button class="btn-sm-action danger" onclick="openInstallmentNoteModal(${item.id}, 'rejected')" title="Từ chối">
                                        ✖ Từ chối
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('') : `
                        <tr>
                            <td colspan="11" style="text-align:center;padding:32px;color:#94a3b8">
                                Chưa có hồ sơ trả góp nào trong danh mục này.
                            </td>
                        </tr>
                    `}
                </tbody>
            </table>
        </div>
    `;
}

function getInstStatusLabel(st) {
    const map = {
        pending: 'Chờ duyệt',
        approved: 'Đã duyệt',
        need_info: 'Cần bổ sung giấy tờ',
        rejected: 'Từ chối'
    };
    return map[st] || st;
}

async function updateInstallmentStatusAction(id, status, notes = '') {
    try {
        const res = await fetch(`${API}/installments/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ status, admin_notes: notes })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`Cập nhật hồ sơ #TG${id} thành "${getInstStatusLabel(status)}"`, 'success');
            const target = adminState.installments.find(i => i.id === id);
            if (target) {
                target.status = status;
                if (notes) target.admin_notes = notes;
            }
            displayInstallmentsList();
            refreshAdminData();
        } else {
            showToast(data.message || 'Lỗi cập nhật.', 'error');
        }
    } catch (e) {
        showToast('Lỗi máy chủ khi cập nhật hồ sơ.', 'error');
    }
}

function openInstallmentNoteModal(id, targetStatus) {
    const item = adminState.installments.find(x => x.id === id);
    if (!item) return;

    const overlay = $('#modal-overlay');
    const modal   = $('#modal');

    const title = targetStatus === 'need_info' ? 'Yêu cầu Bổ sung Giấy tờ' : 'Lý do Từ chối Hồ sơ Trả góp';
    const notePlaceholder = targetStatus === 'need_info'
        ? 'VD: Vui lòng chụp rõ mặt sau CCCD và sao kê bảng lương 3 tháng gần nhất...'
        : 'VD: Hồ sơ có điểm tín dụng chưa đạt yêu cầu của công ty tài chính...';

    modal.innerHTML = `
        <div style="max-width:500px;width:100%">
            <h2>${title}</h2>
            <p class="modal-sub">Hồ sơ #${item.id} – Khách hàng: <strong>${item.customer_name}</strong> (${item.phone})</p>

            <div class="form-group">
                <label>Ghi chú phản hồi cho khách / nội bộ *</label>
                <textarea id="inst-modal-notes" rows="4" style="width:100%;padding:10px 12px;border:1px solid var(--gray-200);border-radius:8px;font-family:inherit;resize:vertical"
                          placeholder="${notePlaceholder}">${item.admin_notes || ''}</textarea>
            </div>

            <div style="display:flex;gap:10px;justify-content:flex-end">
                <button class="btn-sm-action" onclick="closeModal()">Hủy</button>
                <button class="btn-form-submit" style="width:auto;margin:0;padding:10px 24px;background:${targetStatus === 'need_info' ? '#d97706' : '#dc2626'}"
                        onclick="const n = $('#inst-modal-notes').value.trim(); updateInstallmentStatusAction(${id}, '${targetStatus}', n); closeModal()">
                    Xác nhận
                </button>
            </div>
        </div>
    `;

    overlay.classList.add('open');
}

// ============================================================
//  TAB 4: QUẢN LÝ KHO & SẢN PHẨM (INVENTORY & PRODUCT CRUD)
// ============================================================
async function renderAdminProducts() {
    const body = $('#admin-content-body');
    if (!body) return;

    body.innerHTML = '<div class="spinner"></div>';

    try {
        const res = await fetch(`${API}/products`);
        const data = await res.json();
        adminState.products = data.success ? data.data : [];
    } catch (e) {
        showToast('Không thể tải danh sách sản phẩm.', 'error');
        adminState.products = [];
    }

    displayProductsList();
}

function filterProductStock(status) {
    adminState.prodStockFilter = status;
    displayProductsList();
}

function displayProductsList() {
    const body = $('#admin-content-body');
    if (!body) return;

    let filtered = [...adminState.products];

    // Filter theo Brand
    if (adminState.prodBrandFilter !== 'all') {
        filtered = filtered.filter(p => p.brand === adminState.prodBrandFilter);
    }

    // Filter theo Tồn kho
    if (adminState.prodStockFilter === 'low') {
        filtered = filtered.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 10);
    } else if (adminState.prodStockFilter === 'out') {
        filtered = filtered.filter(p => p.stock_quantity === 0);
    } else if (adminState.prodStockFilter === 'ok') {
        filtered = filtered.filter(p => p.stock_quantity > 10);
    }

    // Tìm kiếm
    if (adminState.prodSearch.trim()) {
        const q = adminState.prodSearch.toLowerCase();
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            String(p.id).includes(q)
        );
    }

    // Đếm sản phẩm sắp hết
    const lowStockCount = adminState.products.filter(p => p.stock_quantity <= 10).length;

    body.innerHTML = `
        <!-- Cảnh báo tồn kho đỏ nếu có máy sắp hết -->
        ${lowStockCount > 0 ? `
            <div class="inventory-alert-banner">
                <div class="alert-banner-left">
                    <span class="alert-banner-icon">⚠️</span>
                    <div class="alert-banner-text">
                        <strong>CẢNH BÁO TỒN KHO: CÓ ${lowStockCount} SẢN PHẨM SẮP HẾT HÀNG (TỒN KHO ≤ 10)</strong>
                        <span>Tự động kích hoạt thông báo đỏ để thủ kho kịp thời nhập hàng mới.</span>
                    </div>
                </div>
                <button class="btn-sm-action danger" onclick="adminState.prodStockFilter = 'low'; displayProductsList()">
                    Lọc sản phẩm sắp hết (${lowStockCount})
                </button>
            </div>
        ` : ''}

        <!-- Toolbar -->
        <div class="admin-toolbar">
            <div class="toolbar-left">
                <input type="text" class="admin-search-input" placeholder="🔍 Tìm tên điện thoại, mã SP..."
                       value="${adminState.prodSearch}"
                       oninput="adminState.prodSearch = this.value; displayProductsList()">

                <!-- Lọc hãng -->
                <select class="admin-select" onchange="adminState.prodBrandFilter = this.value; displayProductsList()">
                    <option value="all" ${adminState.prodBrandFilter === 'all' ? 'selected' : ''}>Tất cả thương hiệu</option>
                    <option value="Apple" ${adminState.prodBrandFilter === 'Apple' ? 'selected' : ''}>Apple (iPhone)</option>
                    <option value="Samsung" ${adminState.prodBrandFilter === 'Samsung' ? 'selected' : ''}>Samsung</option>
                    <option value="Xiaomi" ${adminState.prodBrandFilter === 'Xiaomi' ? 'selected' : ''}>Xiaomi</option>
                    <option value="OPPO" ${adminState.prodBrandFilter === 'OPPO' ? 'selected' : ''}>OPPO</option>
                    <option value="vivo" ${adminState.prodBrandFilter === 'vivo' ? 'selected' : ''}>vivo</option>
                </select>

                <!-- Lọc trạng thái tồn kho -->
                <select class="admin-select" onchange="adminState.prodStockFilter = this.value; displayProductsList()">
                    <option value="all" ${adminState.prodStockFilter === 'all' ? 'selected' : ''}>Tất cả tình trạng kho</option>
                    <option value="ok"  ${adminState.prodStockFilter === 'ok' ? 'selected' : ''}>Còn hàng dồi dào (>10)</option>
                    <option value="low" ${adminState.prodStockFilter === 'low' ? 'selected' : ''}>⚠️ Sắp hết hàng (≤10)</option>
                    <option value="out" ${adminState.prodStockFilter === 'out' ? 'selected' : ''}>🚫 Hết hàng (0)</option>
                </select>

                <span style="font-size:13px;color:#64748b;font-weight:600">
                    Hiển thị <strong>${filtered.length}</strong> / ${adminState.products.length} máy
                </span>
            </div>

            <div class="toolbar-right">
                <button class="btn-admin-action" onclick="openProductModal(null)">
                    + Thêm điện thoại mới
                </button>
            </div>
        </div>

        <!-- Table sản phẩm -->
        <div class="admin-table-wrap">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Hình ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Hãng</th>
                        <th>Giá bán niêm yết</th>
                        <th>Số lượng tồn kho</th>
                        <th>Trạng thái kho</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.length > 0 ? filtered.map(p => {
                        const isLow = p.stock_quantity > 0 && p.stock_quantity <= 10;
                        const isOut = p.stock_quantity === 0;
                        return `
                            <tr class="${isLow ? 'highlight-danger' : ''}">
                                <td><strong>#${p.id}</strong></td>
                                <td>
                                    <img src="${p.image_url || getBrandFallback(p.brand)}" class="table-img" alt="${p.name}">
                                </td>
                                <td>
                                    <strong style="color:#0f172a;display:block">${p.name}</strong>
                                    <span style="font-size:11px;color:#64748b">${(p.description || '').slice(0, 50)}...</span>
                                </td>
                                <td><span style="font-weight:700;color:#475569">${p.brand}</span></td>
                                <td><strong style="color:#dc2626">${fmt(p.price)}</strong></td>
                                <td>
                                    <span class="stock-tag ${isOut ? 'out' : (isLow ? 'low' : 'ok')}">
                                        ${isLow ? '⚠️ Sắp hết: ' : ''}<strong>${p.stock_quantity}</strong> máy
                                    </span>
                                </td>
                                <td>
                                    <span class="status-pill ${isOut ? 'status-cancelled' : (isLow ? 'status-pending' : 'status-completed')}">
                                        ${isOut ? 'Hết hàng' : (isLow ? 'Sắp hết' : 'Còn hàng')}
                                    </span>
                                </td>
                                <td>
                                    <div class="row-actions">
                                        <button class="btn-sm-action primary" onclick="openProductModal(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                                            ✏️ Sửa
                                        </button>
                                        <button class="btn-sm-action danger" onclick="deleteProductAction(${p.id}, '${p.name.replace(/'/g, "\\'")}')">
                                            🗑️ Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('') : `
                        <tr>
                            <td colspan="8" style="text-align:center;padding:32px;color:#94a3b8">
                                Không tìm thấy mẫu điện thoại nào phù hợp.
                            </td>
                        </tr>
                    `}
                </tbody>
            </table>
        </div>
    `;
}

function openProductModal(prod = null) {
    adminState.editingProductId = prod ? prod.id : null;
    const isEdit = !!prod;

    const overlay = $('#modal-overlay');
    const modal   = $('#modal');

    modal.innerHTML = `
        <div style="max-width:560px;width:100%">
            <h2>${isEdit ? 'Chỉnh sửa thông tin điện thoại' : 'Thêm sản phẩm điện thoại mới'}</h2>
            <p class="modal-sub">${isEdit ? `Mã sản phẩm #${prod.id}` : 'Nhập thông số kỹ thuật và số lượng tồn kho'}</p>
            <div class="form-error" id="prod-modal-error" style="display:none"></div>

            <div class="form-group">
                <label>Tên điện thoại *</label>
                <input type="text" id="p-name" value="${prod ? prod.name : ''}" placeholder="VD: iPhone 16 Pro Max 256GB">
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div class="form-group">
                    <label>Thương hiệu *</label>
                    <select id="p-brand" class="admin-select" style="width:100%;padding:10px">
                        <option value="Apple"   ${prod && prod.brand === 'Apple' ? 'selected' : ''}>Apple</option>
                        <option value="Samsung" ${prod && prod.brand === 'Samsung' ? 'selected' : ''}>Samsung</option>
                        <option value="Xiaomi"  ${prod && prod.brand === 'Xiaomi' ? 'selected' : ''}>Xiaomi</option>
                        <option value="OPPO"    ${prod && prod.brand === 'OPPO' ? 'selected' : ''}>OPPO</option>
                        <option value="vivo"    ${prod && prod.brand === 'vivo' ? 'selected' : ''}>vivo</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Giá bán (VNĐ) *</label>
                    <input type="number" id="p-price" value="${prod ? prod.price : ''}" placeholder="VD: 34990000">
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div class="form-group">
                    <label>Số lượng tồn kho *</label>
                    <input type="number" id="p-stock" value="${prod ? prod.stock_quantity : 50}" placeholder="Số lượng máy trong kho">
                </div>
                <div class="form-group">
                    <label>Hình ảnh sản phẩm (URL)</label>
                    <input type="text" id="p-image" value="${prod ? prod.image_url : '/images/products/apple/1.jpg'}" placeholder="/images/products/...">
                </div>
            </div>

            <div class="form-group">
                <label>Thông số kỹ thuật & Mô tả máy</label>
                <textarea id="p-desc" rows="3" style="width:100%;padding:10px;border:1px solid var(--gray-200);border-radius:8px;font-family:inherit;resize:vertical"
                          placeholder="Màn hình OLED 6.7 inch, chip A18 Pro, sạc nhanh 30W, RAM 8GB...">${prod ? prod.description || '' : ''}</textarea>
            </div>

            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
                <button class="btn-sm-action" onclick="closeModal()">Hủy</button>
                <button class="btn-form-submit" style="width:auto;margin:0;padding:10px 28px;background:#2563eb" onclick="saveProductAction()">
                    ${isEdit ? 'Lưu cập nhật' : 'Tạo sản phẩm'}
                </button>
            </div>
        </div>
    `;

    overlay.classList.add('open');
}

async function saveProductAction() {
    const name  = $('#p-name')?.value.trim();
    const brand = $('#p-brand')?.value;
    const price = parseFloat($('#p-price')?.value);
    const stock = parseInt($('#p-stock')?.value) || 0;
    const img   = $('#p-image')?.value.trim();
    const desc  = $('#p-desc')?.value.trim();
    const errEl = $('#prod-modal-error');

    if (!name || isNaN(price) || price < 0) {
        if (errEl) {
            errEl.textContent = 'Vui lòng nhập tên sản phẩm và mức giá hợp lệ.';
            errEl.style.display = 'block';
        }
        return;
    }

    const payload = {
        name,
        brand,
        price,
        stock_quantity: stock,
        image_url: img || getBrandFallback(brand),
        description: desc
    };

    try {
        const isEdit = !!adminState.editingProductId;
        const url = isEdit ? `${API}/products/${adminState.editingProductId}` : `${API}/products`;
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.success) {
            closeModal();
            showToast(data.message || 'Lưu sản phẩm thành công!', 'success');
            renderAdminProducts();
            refreshAdminData();
        } else {
            if (errEl) {
                errEl.textContent = data.message || 'Lỗi lưu sản phẩm.';
                errEl.style.display = 'block';
            }
        }
    } catch (e) {
        showToast('Lỗi máy chủ khi thao tác sản phẩm.', 'error');
    }
}

async function deleteProductAction(id, name) {
    if (!confirm(`Bạn có chắc chắn muốn xóa mẫu điện thoại "${name}" (ID #${id}) khỏi hệ thống?`)) return;

    try {
        const res = await fetch(`${API}/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${state.token}`
            }
        });
        const data = await res.json();
        if (data.success) {
            showToast(data.message || `Đã xóa sản phẩm #${id}`, 'success');
            adminState.products = adminState.products.filter(p => p.id !== id);
            displayProductsList();
            refreshAdminData();
        } else {
            showToast(data.message || 'Không thể xóa sản phẩm.', 'error');
        }
    } catch (e) {
        showToast('Lỗi máy chủ khi xóa sản phẩm.', 'error');
    }
}

// ============================================================
//  TAB 5: QUẢN LÝ CSKH & HỖ TRỢ (CUSTOMER SUPPORT)
// ============================================================
async function renderAdminSupport() {
    const body = $('#admin-content-body');
    if (!body) return;

    body.innerHTML = '<div class="spinner"></div>';

    try {
        const res = await fetch(`${API}/contacts`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        adminState.support = data.success ? data.data : [];
    } catch (e) {
        showToast('Không thể tải tin nhắn hỗ trợ.', 'error');
        adminState.support = [];
    }

    displaySupportList();
}

function displaySupportList() {
    const body = $('#admin-content-body');
    if (!body) return;

    let filtered = [...adminState.support];

    if (adminState.supportStatusFilter !== 'all') {
        filtered = filtered.filter(s => s.status === adminState.supportStatusFilter);
    }

    body.innerHTML = `
        <div class="admin-toolbar">
            <div class="toolbar-left">
                <span style="font-size:13.5px;color:#334155;font-weight:700">
                    Hộp thư CSKH: <strong>${filtered.length}</strong> yêu cầu hỗ trợ từ khách hàng
                </span>
            </div>
            <div class="toolbar-right">
                <button class="btn-admin-action secondary" onclick="renderAdminSupport()">
                    🔄 Làm mới
                </button>
            </div>
        </div>

        <div class="admin-tabs-row">
            ${[
                { id: 'all', label: 'Tất cả tin nhắn' },
                { id: 'pending', label: '⏳ Chờ phản hồi' },
                { id: 'processed', label: '✔ Đã xử lý' }
            ].map(t => `
                <button class="tab-filter-btn ${adminState.supportStatusFilter === t.id ? 'active' : ''}"
                        onclick="adminState.supportStatusFilter = '${t.id}'; displaySupportList()">
                    ${t.label}
                </button>
            `).join('')}
        </div>

        <div class="admin-table-wrap">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Thời gian</th>
                        <th>Họ tên & Email</th>
                        <th>Số điện thoại</th>
                        <th>Chủ đề</th>
                        <th>Nội dung yêu cầu</th>
                        <th>Trạng thái</th>
                        <th>Ghi chú phản hồi</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.length > 0 ? filtered.map(item => `
                        <tr>
                            <td><strong>#${item.id}</strong></td>
                            <td style="white-space:nowrap">${new Date(item.created_at).toLocaleString('vi-VN')}</td>
                            <td>
                                <strong>${item.name}</strong>
                                <div style="font-size:11.5px;color:#64748b">${item.email}</div>
                            </td>
                            <td><strong style="color:#1d4ed8">${item.phone || 'Chưa cung cấp'}</strong></td>
                            <td><span style="font-weight:700;color:#475569">${item.subject || 'Tư vấn'}</span></td>
                            <td>
                                <div style="max-width:260px;font-size:12.5px;color:#334155;line-height:1.4" title="${item.message}">
                                    ${item.message}
                                </div>
                            </td>
                            <td>
                                <span class="status-pill ${item.status === 'processed' ? 'status-completed' : 'status-pending'}">
                                    ${item.status === 'processed' ? 'Đã xử lý' : 'Chờ phản hồi'}
                                </span>
                            </td>
                            <td>
                                <div style="max-width:180px;font-size:11.5px;color:#059669">
                                    ${item.admin_reply ? `💬 ${item.admin_reply}` : '<em style="color:#94a3b8">Chưa có</em>'}
                                </div>
                            </td>
                            <td>
                                <div class="row-actions">
                                    <button class="btn-sm-action ${item.status === 'processed' ? 'warning' : 'success'}"
                                            onclick="toggleSupportStatusAction(${item.id}, '${item.status}')">
                                        ${item.status === 'processed' ? 'Đánh dấu Chờ' : '✔ Đã xử lý'}
                                    </button>
                                    <button class="btn-sm-action primary" onclick="openSupportReplyModal(${item.id})">
                                        ✏️ Phản hồi
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('') : `
                        <tr>
                            <td colspan="9" style="text-align:center;padding:32px;color:#94a3b8">
                                Không có yêu cầu hỗ trợ nào trong danh mục này.
                            </td>
                        </tr>
                    `}
                </tbody>
            </table>
        </div>
    `;
}

async function toggleSupportStatusAction(id, currentStatus) {
    const nextStatus = currentStatus === 'processed' ? 'pending' : 'processed';
    try {
        const res = await fetch(`${API}/contacts/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ status: nextStatus })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`Đã chuyển yêu cầu #${id} thành "${nextStatus === 'processed' ? 'Đã xử lý' : 'Chờ phản hồi'}"`, 'success');
            const target = adminState.support.find(s => s.id === id);
            if (target) target.status = nextStatus;
            displaySupportList();
            refreshAdminData();
        }
    } catch (e) {
        showToast('Lỗi máy chủ khi cập nhật.', 'error');
    }
}

function openSupportReplyModal(id) {
    const item = adminState.support.find(x => x.id === id);
    if (!item) return;

    const overlay = $('#modal-overlay');
    const modal   = $('#modal');

    modal.innerHTML = `
        <div style="max-width:520px;width:100%">
            <h2>Ghi chú phản hồi CSKH</h2>
            <p class="modal-sub">Khách hàng: <strong>${item.name}</strong> (${item.email})</p>

            <div style="background:#f8fafc;padding:12px;border-radius:8px;margin-bottom:14px;font-size:13px">
                <strong>Nội dung câu hỏi của khách:</strong>
                <p style="margin-top:6px;color:#334155;line-height:1.5">${item.message}</p>
            </div>

            <div class="form-group">
                <label>Nội dung đã phản hồi / Giải pháp xử lý *</label>
                <textarea id="support-reply-text" rows="4" style="width:100%;padding:10px;border:1px solid var(--gray-200);border-radius:8px;font-family:inherit;resize:vertical"
                          placeholder="VD: Đã gọi điện giải đáp quy trình mua trả góp Sacombank cho khách...">${item.admin_reply || ''}</textarea>
            </div>

            <div style="display:flex;gap:10px;justify-content:flex-end">
                <button class="btn-sm-action" onclick="closeModal()">Đóng</button>
                <button class="btn-form-submit" style="width:auto;margin:0;padding:10px 24px;background:#2563eb"
                        onclick="saveSupportReplyAction(${id})">
                    Lưu phản hồi & Đánh dấu đã xử lý
                </button>
            </div>
        </div>
    `;

    overlay.classList.add('open');
}

async function saveSupportReplyAction(id) {
    const reply = $('#support-reply-text')?.value.trim();
    if (!reply) {
        showToast('Vui lòng nhập nội dung phản hồi.', 'error');
        return;
    }

    try {
        const res = await fetch(`${API}/contacts/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ status: 'processed', admin_reply: reply })
        });
        const data = await res.json();
        if (data.success) {
            closeModal();
            showToast('Lưu phản hồi thành công!', 'success');
            const target = adminState.support.find(s => s.id === id);
            if (target) {
                target.status = 'processed';
                target.admin_reply = reply;
            }
            displaySupportList();
            refreshAdminData();
        }
    } catch (e) {
        showToast('Lỗi máy chủ.', 'error');
    }
}

// ============================================================
//  TAB 6: QUẢN LÝ KHUYẾN MÃI & VOUCHER & BANNER
// ============================================================
async function renderAdminVouchers() {
    const body = $('#admin-content-body');
    if (!body) return;

    body.innerHTML = '<div class="spinner"></div>';

    try {
        const res = await fetch(`${API}/vouchers`);
        const data = await res.json();
        adminState.vouchers = data.success ? data.data : [];
    } catch (e) {
        adminState.vouchers = [];
    }

    body.innerHTML = `
        <!-- Tạo Voucher mới -->
        <div class="admin-card" style="margin-bottom:24px">
            <h3 class="admin-card-title" style="margin-bottom:14px">
                <span>🏷️</span> Tạo mã giảm giá (Voucher) mới
            </h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px;align-items:flex-end">
                <div class="form-group" style="margin:0">
                    <label style="font-size:12px;font-weight:700">Mã voucher *</label>
                    <input type="text" id="v-code" placeholder="VD: SIEUSALE500K" style="text-transform:uppercase">
                </div>
                <div class="form-group" style="margin:0">
                    <label style="font-size:12px;font-weight:700">Tiêu đề chương trình *</label>
                    <input type="text" id="v-title" placeholder="VD: Giảm 500k cho đơn từ 15tr">
                </div>
                <div class="form-group" style="margin:0">
                    <label style="font-size:12px;font-weight:700">Phần trăm giảm (%)</label>
                    <input type="number" id="v-pct" placeholder="0" min="0" max="100">
                </div>
                <div class="form-group" style="margin:0">
                    <label style="font-size:12px;font-weight:700">Số tiền giảm thẳng (VNĐ)</label>
                    <input type="number" id="v-amt" placeholder="500000">
                </div>
                <div class="form-group" style="margin:0">
                    <label style="font-size:12px;font-weight:700">Đơn hàng tối thiểu (VNĐ)</label>
                    <input type="number" id="v-min" placeholder="10000000">
                </div>
                <div>
                    <button class="btn-admin-action" style="width:100%;height:40px;justify-content:center" onclick="createVoucherAction()">
                        + Tạo voucher ngay
                    </button>
                </div>
            </div>
        </div>

        <!-- Danh sách voucher hiện có -->
        <div class="admin-card" style="margin-bottom:24px">
            <div class="admin-card-header">
                <h3 class="admin-card-title">
                    <span>🎟️</span> Danh sách Voucher & Mã giảm giá đang áp dụng
                </h3>
                <span class="admin-card-badge">${adminState.vouchers.length} mã</span>
            </div>
            <div class="admin-table-wrap">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Mã Voucher</th>
                            <th>Tên chương trình</th>
                            <th>Mức giảm</th>
                            <th>Đơn tối thiểu</th>
                            <th>Lượt đã dùng</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${adminState.vouchers.length > 0 ? adminState.vouchers.map(v => `
                            <tr>
                                <td><strong style="color:#2563eb;font-family:monospace;font-size:14px">${v.code}</strong></td>
                                <td><strong>${v.title}</strong></td>
                                <td>
                                    <strong style="color:#16a34a">
                                        ${v.discount_percent > 0 ? `${v.discount_percent}%` : fmt(v.discount_amount)}
                                    </strong>
                                </td>
                                <td>${fmt(v.min_order_amount || 0)}</td>
                                <td>${v.used_count || 0} / ${v.usage_limit || 100}</td>
                                <td>
                                    <span class="status-pill ${v.is_active ? 'status-completed' : 'status-cancelled'}">
                                        ${v.is_active ? 'Đang hoạt động' : 'Tạm khóa'}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn-sm-action danger" onclick="deleteVoucherAction(${v.id})">
                                        🗑️ Xóa
                                    </button>
                                </td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="7" style="text-align:center;padding:24px;color:#94a3b8">
                                    Chưa có mã giảm giá nào.
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Quản lý Banner Động Slider ngoài Trang Chủ -->
        <div class="admin-card">
            <div class="admin-card-header">
                <h3 class="admin-card-title">
                    <span>🖼️</span> Quản lý Banner Động (Slider) ngoài Trang chủ
                </h3>
                <span class="admin-card-badge">Tự động chạy mỗi 4 giây</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px">
                <div style="background:#f8fafc;padding:16px;border-radius:10px;border:1px solid #e2e8f0">
                    <span style="font-size:11px;font-weight:700;color:#dc2626">SLIDE 1 (APPLE)</span>
                    <h4 style="font-size:15px;margin:6px 0">iPhone 16 Pro Max – Titan Sa Mạc</h4>
                    <p style="font-size:12.5px;color:#64748b;margin-bottom:12px">Chip A18 Pro, Camera Fusion 48MP và Apple Intelligence.</p>
                    <button class="btn-sm-action primary" onclick="navigateTo('home'); setTimeout(() => goToSlide(0), 400)">
                        👁 Xem trực tiếp ngoài trang chủ
                    </button>
                </div>
                <div style="background:#f8fafc;padding:16px;border-radius:10px;border:1px solid #e2e8f0">
                    <span style="font-size:11px;font-weight:700;color:#0284c7">SLIDE 2 (SAMSUNG)</span>
                    <h4 style="font-size:15px;margin:6px 0">Galaxy S25 Ultra – Quyền năng Galaxy AI</h4>
                    <p style="font-size:12.5px;color:#64748b;margin-bottom:12px">Camera 200MP, bút S-Pen quyền năng và trợ lý Galaxy AI thông minh.</p>
                    <button class="btn-sm-action primary" onclick="navigateTo('home'); setTimeout(() => goToSlide(1), 400)">
                        👁 Xem trực tiếp ngoài trang chủ
                    </button>
                </div>
                <div style="background:#f8fafc;padding:16px;border-radius:10px;border:1px solid #e2e8f0">
                    <span style="font-size:11px;font-weight:700;color:#16a34a">SLIDE 3 (XIAOMI)</span>
                    <h4 style="font-size:15px;margin:6px 0">Xiaomi 14 Ultra – Tuyệt tác ống kính Leica</h4>
                    <p style="font-size:12.5px;color:#64748b;margin-bottom:12px">Bộ 4 camera 50MP cảm biến 1-inch và sạc siêu tốc 90W HyperCharge.</p>
                    <button class="btn-sm-action primary" onclick="navigateTo('home'); setTimeout(() => goToSlide(2), 400)">
                        👁 Xem trực tiếp ngoài trang chủ
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function createVoucherAction() {
    const code  = $('#v-code')?.value.trim();
    const title = $('#v-title')?.value.trim();
    const pct   = parseInt($('#v-pct')?.value) || 0;
    const amt   = parseFloat($('#v-amt')?.value) || 0;
    const min   = parseFloat($('#v-min')?.value) || 0;

    if (!code || !title) {
        showToast('Vui lòng nhập mã voucher và tên chương trình.', 'error');
        return;
    }

    try {
        const res = await fetch(`${API}/vouchers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({
                code,
                title,
                discount_percent: pct,
                discount_amount: amt,
                min_order_amount: min
            })
        });
        const data = await res.json();
        if (data.success) {
            showToast('Tạo voucher thành công!', 'success');
            renderAdminVouchers();
        } else {
            showToast(data.message || 'Lỗi tạo voucher.', 'error');
        }
    } catch (e) {
        showToast('Lỗi máy chủ.', 'error');
    }
}

async function deleteVoucherAction(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa mã voucher này?')) return;
    try {
        const res = await fetch(`${API}/vouchers/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        if (data.success) {
            showToast('Đã xóa voucher thành công.', 'success');
            adminState.vouchers = adminState.vouchers.filter(v => v.id !== id);
            renderAdminVouchers();
        }
    } catch (e) {
        showToast('Lỗi máy chủ khi xóa voucher.', 'error');
    }
}

// ============================================================
//  TAB 7: QUẢN LÝ KHÁCH HÀNG & PHÂN QUYỀN (USERS & ROLES)
// ============================================================
async function renderAdminUsers() {
    const body = $('#admin-content-body');
    if (!body) return;

    body.innerHTML = '<div class="spinner"></div>';

    try {
        const res = await fetch(`${API}/admin/users`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        adminState.users = data.success ? data.data : [];
    } catch (e) {
        showToast('Không thể tải danh sách người dùng.', 'error');
        adminState.users = [];
    }

    body.innerHTML = `
        <div class="admin-toolbar">
            <div class="toolbar-left">
                <span style="font-size:13.5px;color:#334155;font-weight:700">
                    Danh sách tài khoản hệ thống: <strong>${adminState.users.length}</strong> người dùng
                </span>
            </div>
            <div class="toolbar-right">
                <button class="btn-admin-action secondary" onclick="renderAdminUsers()">
                    🔄 Làm mới
                </button>
            </div>
        </div>

        <div class="admin-table-wrap">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Họ và tên</th>
                        <th>Email đăng nhập</th>
                        <th>Ngày tạo</th>
                        <th>Số đơn đã mua</th>
                        <th>Tổng chi tiêu</th>
                        <th>Vai trò hiện tại</th>
                        <th>Cập nhật phân quyền</th>
                    </tr>
                </thead>
                <tbody>
                    ${adminState.users.map(u => `
                        <tr>
                            <td><strong>#${u.id}</strong></td>
                            <td>
                                <strong>${u.full_name}</strong>
                                ${u.id === state.user.id ? '<span style="font-size:11px;color:#2563eb;margin-left:4px">(Tài khoản của bạn)</span>' : ''}
                            </td>
                            <td>${u.email}</td>
                            <td>${new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                            <td><strong>${u.total_orders || 0}</strong> đơn</td>
                            <td><strong style="color:#16a34a">${fmt(u.total_spent || 0)}</strong></td>
                            <td>
                                <span class="status-pill ${u.role === 'admin' ? 'status-cancelled' : (u.role === 'customer' ? 'status-completed' : 'status-processing')}">
                                    ${getUserRoleName(u.role)}
                                </span>
                            </td>
                            <td>
                                <select class="admin-select"
                                        style="font-size:12px;padding:4px 8px"
                                        ${u.id === state.user.id ? 'disabled title="Không thể tự đổi vai trò của chính mình"' : ''}
                                        onchange="updateUserRoleAction(${u.id}, this.value)">
                                    <option value="customer"  ${u.role === 'customer' ? 'selected' : ''}>Khách hàng (customer)</option>
                                    <option value="sales"     ${u.role === 'sales' ? 'selected' : ''}>Nhân viên Sale / CSKH (sales)</option>
                                    <option value="warehouse" ${u.role === 'warehouse' ? 'selected' : ''}>Thủ kho (warehouse)</option>
                                    <option value="admin"     ${u.role === 'admin' ? 'selected' : ''}>Quản trị viên (admin)</option>
                                </select>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function getUserRoleName(role) {
    const map = {
        admin: 'Quản trị viên (Admin)',
        warehouse: 'Nhân viên Kho',
        sales: 'Nhân viên Sale / CSKH',
        customer: 'Khách mua hàng'
    };
    return map[role] || role;
}

async function updateUserRoleAction(userId, newRole) {
    try {
        const res = await fetch(`${API}/admin/users/${userId}/role`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ role: newRole })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`Đã cập nhật phân quyền tài khoản #${userId} thành "${getUserRoleName(newRole)}"`, 'success');
            const target = adminState.users.find(u => u.id === userId);
            if (target) target.role = newRole;
            renderAdminUsers();
        } else {
            showToast(data.message || 'Lỗi cập nhật phân quyền.', 'error');
        }
    } catch (e) {
        showToast('Lỗi máy chủ khi cập nhật vai trò.', 'error');
    }
}

