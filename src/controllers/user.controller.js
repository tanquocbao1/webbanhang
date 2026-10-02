// ============================================================
//  src/controllers/user.controller.js
//  Quản lý trang cá nhân (Profile), Đổi mật khẩu, Đổi Email
//  và Hộp thư thông báo (Notifications & Admin Replies)
// ============================================================

import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import {
    sanitizeString,
    isValidEmail,
    isValidVNPhone,
    normalizePhone,
    isValidFullName
} from '../utils/validator.js';

// -----------------------------------------------------------
// 1. GET /api/user/profile
// Lấy thông tin cá nhân của người dùng đang đăng nhập
// -----------------------------------------------------------
export const getProfileController = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT id, email, full_name, phone, address, role, created_at, updated_at
             FROM users
             WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng.',
            });
        }

        return res.status(200).json({
            success: true,
            data: result.rows[0],
        });
    } catch (err) {
        console.error('❌ Lỗi getProfileController:', err);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi tải thông tin cá nhân.',
        });
    }
};

// -----------------------------------------------------------
// 2. PUT /api/user/profile
// Cập nhật thông tin cá nhân & Đổi email (Gmail)
// -----------------------------------------------------------
export const updateProfileController = async (req, res) => {
    try {
        const userId = req.user.id;
        const rawBody = req.body || {};

        const full_name = sanitizeString(rawBody.full_name, 100);
        const email = sanitizeString(rawBody.email, 255).toLowerCase();
        const rawPhone = sanitizeString(rawBody.phone, 20);
        const address = sanitizeString(rawBody.address, 300);

        const errors = {};

        // Validate Họ và tên
        if (!full_name) {
            errors.full_name = 'Họ và tên không được để trống.';
        } else if (!isValidFullName(full_name)) {
            errors.full_name = 'Họ và tên không hợp lệ (tối thiểu 2 từ, chỉ chứa chữ cái tiếng Việt).';
        }

        // Validate Email (hỗ trợ kiểm tra định dạng Gmail/Email)
        if (!email) {
            errors.email = 'Email không được để trống.';
        } else if (!isValidEmail(email)) {
            errors.email = 'Email không đúng định dạng chuẩn (ví dụ: nguyenvanan@gmail.com).';
        }

        // Validate Phone (nếu có nhập)
        let cleanPhone = null;
        if (rawPhone) {
            if (!isValidVNPhone(rawPhone)) {
                errors.phone = 'Số điện thoại không đúng chuẩn 10 chữ số di động Việt Nam.';
            } else {
                cleanPhone = normalizePhone(rawPhone);
            }
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Thông tin cập nhật không hợp lệ.',
                errors,
            });
        }

        // Kiểm tra xem email mới có bị trùng với tài khoản khác không
        const checkEmail = await pool.query(
            'SELECT id FROM users WHERE email = $1 AND id <> $2',
            [email, userId]
        );
        if (checkEmail.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email này đã được sử dụng bởi một tài khoản khác trong hệ thống.',
                errors: { email: 'Email đã tồn tại trên hệ thống.' },
            });
        }

        // Tiến hành cập nhật
        const updateResult = await pool.query(
            `UPDATE users
             SET full_name = $1,
                 email = $2,
                 phone = $3,
                 address = $4,
                 updated_at = NOW()
             WHERE id = $5
             RETURNING id, email, full_name, phone, address, role, created_at, updated_at`,
            [full_name, email, cleanPhone, address, userId]
        );

        return res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin cá nhân thành công!',
            data: updateResult.rows[0],
        });
    } catch (err) {
        console.error('❌ Lỗi updateProfileController:', err);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật thông tin cá nhân.',
        });
    }
};

// -----------------------------------------------------------
// 3. PUT /api/user/change-password
// Đổi mật khẩu
// -----------------------------------------------------------
export const changePasswordController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { old_password, new_password, confirm_password } = req.body || {};

        const errors = {};

        if (!old_password) {
            errors.old_password = 'Vui lòng nhập mật khẩu hiện tại.';
        }
        if (!new_password) {
            errors.new_password = 'Vui lòng nhập mật khẩu mới.';
        } else if (new_password.length < 6) {
            errors.new_password = 'Mật khẩu mới phải có tối thiểu 6 ký tự.';
        }

        if (confirm_password !== undefined && new_password !== confirm_password) {
            errors.confirm_password = 'Mật khẩu xác nhận không khớp với mật khẩu mới.';
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Thông tin đổi mật khẩu không hợp lệ.',
                errors,
            });
        }

        // Lấy password_hash hiện tại của user từ DB
        const userRes = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
        }

        const isMatch = await bcrypt.compare(old_password, userRes.rows[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không chính xác.',
                errors: { old_password: 'Mật khẩu hiện tại không đúng.' },
            });
        }

        // Băm mật khẩu mới bằng bcrypt (salt rounds = 10)
        const newHash = await bcrypt.hash(new_password, 10);

        await pool.query(
            `UPDATE users
             SET password_hash = $1, updated_at = NOW()
             WHERE id = $2`,
            [newHash, userId]
        );

        // Tạo thông báo vào Hộp thư thông báo
        await pool.query(
            `INSERT INTO user_notifications (user_id, title, message, type)
             VALUES ($1, $2, $3, 'system')`,
            [
                userId,
                'Bảo mật: Đổi mật khẩu thành công',
                'Mật khẩu tài khoản của bạn đã được thay đổi thành công. Nếu không phải bạn thực hiện, vui lòng liên hệ ngay với CSKH Bảo Sneaker.'
            ]
        );

        return res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu thành công!',
        });
    } catch (err) {
        console.error('❌ Lỗi changePasswordController:', err);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi thay đổi mật khẩu.',
        });
    }
};

// -----------------------------------------------------------
// 4. GET /api/user/notifications
// Lấy danh sách Hộp thư / Thông báo & Phản hồi từ Admin
// -----------------------------------------------------------
export const getNotificationsController = async (req, res) => {
    try {
        const userId = req.user.id;

        const notifs = await pool.query(
            `SELECT * FROM user_notifications
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        const unreadCountRes = await pool.query(
            `SELECT COUNT(*) AS unread
             FROM user_notifications
             WHERE user_id = $1 AND is_read = false`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            total: notifs.rows.length,
            unread_count: parseInt(unreadCountRes.rows[0].unread, 10) || 0,
            data: notifs.rows,
        });
    } catch (err) {
        console.error('❌ Lỗi getNotificationsController:', err);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi tải hộp thư thông báo.',
        });
    }
};

// -----------------------------------------------------------
// 5. PATCH /api/user/notifications/:id/read
// Đánh dấu 1 thông báo là đã đọc
// -----------------------------------------------------------
export const markNotificationReadController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE user_notifications
             SET is_read = true
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông báo hoặc bạn không có quyền thao tác.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Đã đánh dấu đã đọc.',
            data: result.rows[0],
        });
    } catch (err) {
        console.error('❌ Lỗi markNotificationReadController:', err);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật trạng thái thông báo.',
        });
    }
};

// -----------------------------------------------------------
// 6. PATCH /api/user/notifications/read-all
// Đánh dấu tất cả thông báo là đã đọc
// -----------------------------------------------------------
export const markAllNotificationsReadController = async (req, res) => {
    try {
        const userId = req.user.id;

        await pool.query(
            `UPDATE user_notifications
             SET is_read = true
             WHERE user_id = $1 AND is_read = false`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            message: 'Đã đánh dấu tất cả thông báo là đã đọc.',
        });
    } catch (err) {
        console.error('❌ Lỗi markAllNotificationsReadController:', err);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật hộp thư.',
        });
    }
};

// -----------------------------------------------------------
// 7. GET /api/user/my-supports
// Lấy danh sách phiếu khiếu nại / yêu cầu hỗ trợ của chính User
// kèm phản hồi của Admin
// -----------------------------------------------------------
export const getMySupportsController = async (req, res) => {
    try {
        const userId = req.user.id;
        const userEmail = req.user.email;

        const result = await pool.query(
            `SELECT id, name, email, phone, subject, message, status, admin_reply, created_at
             FROM support_contacts
             WHERE user_id = $1 OR email = $2
             ORDER BY created_at DESC`,
            [userId, userEmail]
        );

        return res.status(200).json({
            success: true,
            total: result.rows.length,
            data: result.rows,
        });
    } catch (err) {
        console.error('❌ Lỗi getMySupportsController:', err);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi tải danh sách phiếu hỗ trợ.',
        });
    }
};

