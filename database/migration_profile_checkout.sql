-- Migration: User Profile, Notifications & Checkout COD Enhancements

-- 1. Bổ sung các trường vào bảng users
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 2. Bổ sung các trường vào bảng orders phục vụ luồng Checkout COD chuẩn nghiệp vụ
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'cod';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS note TEXT;

-- 3. Tạo bảng user_notifications: Hộp thư & Thông báo phản hồi từ Admin
CREATE TABLE IF NOT EXISTS user_notifications (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    message     TEXT NOT NULL,
    type        VARCHAR(50) DEFAULT 'admin_reply',
    reference_id INTEGER,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Thêm index để truy vấn thông báo nhanh theo user
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON user_notifications(is_read);
