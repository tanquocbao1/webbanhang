-- ================================================================
--  SQL SCHEMA - BACK-END CỦA PHI
--  Nền tảng thương mại điện tử bán điện thoại di động
--  Database: PostgreSQL
-- ================================================================

-- Tạo database (chạy lệnh này trong psql trước):
-- CREATE DATABASE phi_mobile_shop;


-- ================================================================
--  BẢNG 1: users - Quản lý tài khoản người dùng
-- ================================================================
CREATE TABLE IF NOT EXISTS users (
    -- Khóa chính: tự động tăng
    id          SERIAL          PRIMARY KEY,

    -- Email dùng để đăng nhập, không được trùng nhau
    email       VARCHAR(255)    NOT NULL UNIQUE,

    -- Mật khẩu đã được mã hóa bằng bcrypt (KHÔNG lưu mật khẩu thật)
    password_hash VARCHAR(255)  NOT NULL,

    -- Phân quyền: 'admin' quản lý hệ thống, 'customer' mua hàng, 'warehouse' thủ kho, 'sales' nhân viên kinh doanh
    role        VARCHAR(20)     NOT NULL DEFAULT 'customer'
                                CHECK (role IN ('admin', 'customer', 'warehouse', 'sales')),

    -- Họ và tên đầy đủ
    full_name   VARCHAR(100)    NOT NULL,

    -- Thời điểm tạo tài khoản (tự động gán)
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Ghi chú: Trong bài thi, cần tạo tài khoản admin thủ công bằng lệnh INSERT


-- ================================================================
--  BẢNG 2: products - Quản lý sản phẩm điện thoại
-- ================================================================
CREATE TABLE IF NOT EXISTS products (
    id              SERIAL          PRIMARY KEY,

    -- Tên sản phẩm (vd: "iPhone 15 Pro Max")
    name            VARCHAR(200)    NOT NULL,

    -- Hãng sản xuất (vd: "Apple", "Samsung")
    brand           VARCHAR(100)    NOT NULL,

    -- Giá bán (đơn vị: VND). NUMERIC để tránh lỗi làm tròn số thập phân
    price           NUMERIC(15, 2)  NOT NULL CHECK (price >= 0),

    -- Số lượng tồn kho. CHECK đảm bảo không bao giờ âm
    stock_quantity  INTEGER         NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),

    -- Đường dẫn ảnh sản phẩm
    image_url       TEXT,

    -- Mô tả chi tiết sản phẩm
    description     TEXT,

    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);


-- ================================================================
--  BẢNG 3: orders - Quản lý đơn hàng
-- ================================================================
CREATE TABLE IF NOT EXISTS orders (
    id              SERIAL          PRIMARY KEY,

    -- Liên kết đến người đặt hàng. ON DELETE SET NULL: nếu user bị xóa,
    -- đơn hàng vẫn được giữ lại (không mất dữ liệu lịch sử)
    user_id         INTEGER         REFERENCES users(id) ON DELETE SET NULL,

    -- Tổng tiền của đơn hàng tại thời điểm đặt
    total_amount    NUMERIC(15, 2)  NOT NULL CHECK (total_amount >= 0),

    -- Địa chỉ giao hàng (lưu dạng text đầy đủ)
    shipping_address TEXT           NOT NULL,

    -- Trạng thái đơn hàng theo quy trình COD:
    -- pending    -> Chờ xác nhận
    -- processing -> Đang xử lý
    -- shipping   -> Đang giao
    -- completed  -> Đã hoàn thành
    -- cancelled  -> Đã hủy
    status          VARCHAR(20)     NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending', 'processing', 'shipping', 'completed', 'cancelled')),

    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);


-- ================================================================
--  BẢNG 4: order_items - Chi tiết từng sản phẩm trong đơn hàng
-- ================================================================
CREATE TABLE IF NOT EXISTS order_items (
    id          SERIAL          PRIMARY KEY,

    -- Liên kết đến đơn hàng. ON DELETE CASCADE: xóa đơn -> xóa luôn items
    order_id    INTEGER         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    -- Liên kết đến sản phẩm. ON DELETE SET NULL: sản phẩm bị xóa,
    -- lịch sử đơn hàng vẫn còn (product_id trở thành NULL)
    product_id  INTEGER         REFERENCES products(id) ON DELETE SET NULL,

    -- Số lượng mua
    quantity    INTEGER         NOT NULL CHECK (quantity > 0),

    -- Giá tại THỜI ĐIỂM MUA (quan trọng! không lấy giá hiện tại)
    -- Vì admin có thể thay đổi giá sản phẩm sau này
    price       NUMERIC(15, 2)  NOT NULL CHECK (price >= 0)
);


-- ================================================================
--  DỮ LIỆU MẪU - Dùng để test (chạy sau khi tạo bảng)
-- ================================================================

-- Tạo tài khoản admin (password: "admin123" đã được hash bằng bcrypt)
INSERT INTO users (email, password_hash, role, full_name) VALUES
(
    'admin@Bảo Sneaker.com',
    '$2a$10$uQYHOLuwEBiDXT1QvR/rO.VaV5bIJXAz.NByc/.WLzmHAigfhGwEK',
    'admin',
    'Quach Dai Phi'
);

-- Tạo vài sản phẩm mẫu
INSERT INTO products (name, brand, price, stock_quantity, image_url, description) VALUES
(
    'iPhone 15 Pro Max 256GB',
    'Apple',
    34990000,
    50,
    'https://example.com/iphone15promax.jpg',
    'Chip A17 Pro, màn hình 6.7 inch Super Retina XDR, camera 48MP'
),
(
    'Samsung Galaxy S24 Ultra 256GB',
    'Samsung',
    29990000,
    30,
    'https://example.com/s24ultra.jpg',
    'Chip Snapdragon 8 Gen 3, bút S-Pen, camera 200MP'
),
(
    'Xiaomi 14 Pro 512GB',
    'Xiaomi',
    19990000,
    20,
    'https://example.com/xiaomi14pro.jpg',
    'Chip Snapdragon 8 Gen 3, sạc nhanh 120W, camera Leica'
);
 
-- ================================================================
--  BẢNG 5: installments - Quản lý yêu cầu mua trả góp
-- ================================================================
CREATE TABLE IF NOT EXISTS installments (
    id              SERIAL          PRIMARY KEY,
    user_id         INTEGER         REFERENCES users(id) ON DELETE SET NULL,
    product_id      INTEGER         REFERENCES products(id) ON DELETE SET NULL,
    customer_name   VARCHAR(100)    NOT NULL,
    phone           VARCHAR(20)     NOT NULL,
    id_card         VARCHAR(20),
    address         TEXT,
    method          VARCHAR(50)     DEFAULT 'finance', -- 'finance' hoặc 'credit_card'
    term_months     INTEGER         NOT NULL,          -- 3, 6, 9, 12 tháng
    prepaid_percent NUMERIC(5, 2)   DEFAULT 0,
    prepaid_amount  NUMERIC(15, 2)  NOT NULL DEFAULT 0,
    monthly_payment NUMERIC(15, 2)  NOT NULL DEFAULT 0,
    total_payment   NUMERIC(15, 2)  NOT NULL DEFAULT 0,
    status          VARCHAR(30)     NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending', 'approved', 'need_info', 'rejected')),
    admin_notes     TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ================================================================
--  BẢNG 6: support_contacts - Quản lý tương tác & CSKH
-- ================================================================
CREATE TABLE IF NOT EXISTS support_contacts (
    id              SERIAL          PRIMARY KEY,
    user_id         INTEGER         REFERENCES users(id) ON DELETE SET NULL,
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    phone           VARCHAR(20),
    subject         VARCHAR(200),
    message         TEXT            NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending', 'processed')),
    admin_reply     TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ================================================================
--  BẢNG 7: vouchers - Quản lý mã giảm giá & Khuyến mãi
-- ================================================================
CREATE TABLE IF NOT EXISTS vouchers (
    id              SERIAL          PRIMARY KEY,
    code            VARCHAR(50)     NOT NULL UNIQUE,
    title           VARCHAR(200)    NOT NULL,
    discount_percent INTEGER        DEFAULT 0,
    discount_amount NUMERIC(15, 2)  DEFAULT 0,
    min_order_amount NUMERIC(15, 2) DEFAULT 0,
    max_discount    NUMERIC(15, 2)  DEFAULT 0,
    usage_limit     INTEGER         DEFAULT 100,
    used_count      INTEGER         DEFAULT 0,
    is_active       BOOLEAN         DEFAULT TRUE,
    expires_at      TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ================================================================
--  BẢNG 8: user_notifications - Hộp thư & Thông báo người dùng
-- ================================================================
CREATE TABLE IF NOT EXISTS user_notifications (
    id          SERIAL          PRIMARY KEY,
    user_id     INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255)    NOT NULL,
    message     TEXT            NOT NULL,
    type        VARCHAR(50)     DEFAULT 'admin_reply'
                                CHECK (type IN ('admin_reply', 'order_status', 'system', 'promo')),
    reference_id INTEGER,       -- Liên kết tới support_id hoặc order_id
    is_read     BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);


