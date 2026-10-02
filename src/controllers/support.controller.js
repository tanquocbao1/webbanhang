// ============================================================
//  src/controllers/support.controller.js
//  Quản lý tương tác, tin nhắn liên hệ & CSKH
// ============================================================

import pool from '../config/db.js';
import {
    sanitizeString,
    isValidEmail,
    isValidVNPhone,
    normalizePhone,
    isValidFullName
} from '../utils/validator.js';

// Khách hàng gửi liên hệ / yêu cầu hỗ trợ
export const createContactController = async (req, res) => {
    try {
        const errors = {};
        const rawBody = req.body || {};

        // 1. Sanitize đầu vào
        const name    = sanitizeString(rawBody.name, 100);
        const email   = typeof rawBody.email === 'string' ? rawBody.email.trim().toLowerCase() : '';
        const rawPhone = typeof rawBody.phone === 'string' ? rawBody.phone.trim() : '';
        const phone   = normalizePhone(rawPhone);
        const subject = sanitizeString(rawBody.subject || 'Yêu cầu tư vấn', 150);
        const message = sanitizeString(rawBody.message, 1000);

        // 2. Validate lớp Back-end
        if (!name) {
            errors.name = 'Vui lòng cung cấp họ và tên của bạn.';
        } else if (!isValidFullName(name)) {
            errors.name = 'Họ và tên không hợp lệ (cần tối thiểu 2 từ, chỉ chứa chữ cái tiếng Việt).';
        }

        if (!email) {
            errors.email = 'Vui lòng cung cấp địa chỉ email liên hệ.';
        } else if (!isValidEmail(email)) {
            errors.email = 'Địa chỉ email không đúng định dạng chuẩn (ví dụ: hotro@baosneaker.vn).';
        }

        if (rawPhone && !isValidVNPhone(rawPhone)) {
            errors.phone = 'Số điện thoại không đúng định dạng di động Việt Nam (10 chữ số).';
        }

        if (!message) {
            errors.message = 'Nội dung yêu cầu hỗ trợ không được để trống.';
        } else if (message.length < 10) {
            errors.message = 'Nội dung tin nhắn quá ngắn. Vui lòng nhập tối thiểu 10 ký tự.';
        }

        // 3. Nếu dữ liệu sai -> Chặn ngay lập tức và trả về HTTP 400 kèm chi tiết lỗi từng trường
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Thông tin gửi liên hệ chưa chính xác. Vui lòng kiểm tra lại.',
                errors,
            });
        }

        const userId = req.user ? req.user.id : null;

        // 4. Lưu vào Database
        const result = await pool.query(
            `INSERT INTO support_contacts (user_id, name, email, phone, subject, message, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'pending')
             RETURNING *`,
            [userId, name, email, phone || null, subject, message]
        );

        const newContact = result.rows[0];

        // 5. Trả về HTTP 201 Created kèm dữ liệu đã được làm sạch
        return res.status(201).json({
            success: true,
            message: 'Cảm ơn bạn! Yêu cầu hỗ trợ đã được gửi thành công đến hệ thống CSKH.',
            data: {
                id: newContact.id,
                ticket_code: `CSKH-${newContact.id}`,
                name: newContact.name,
                email: newContact.email,
                phone: newContact.phone,
                subject: newContact.subject,
                message: newContact.message,
                status: newContact.status,
                created_at: newContact.created_at
            },
        });
    } catch (err) {
        console.error('❌ Lỗi createContactController:', err);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi phía máy chủ khi gửi tin nhắn. Vui lòng thử lại sau.'
        });
    }
};

// Admin & CSKH xem danh sách tin nhắn hỗ trợ
export const getAllContactsController = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM support_contacts ORDER BY created_at DESC`
        );

        return res.status(200).json({
            success: true,
            total: result.rows.length,
            data: result.rows,
        });
    } catch (err) {
        console.error('❌ Lỗi getAllContactsController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi lấy tin nhắn hỗ trợ.' });
    }
};

// Admin & CSKH đánh dấu trạng thái "Đã xử lý" / "Chờ phản hồi" và lưu ghi chú phản hồi
export const updateContactStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_reply } = req.body;

        const validStatuses = ['pending', 'processed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Trạng thái không hợp lệ. Chỉ chấp nhận: pending, processed`,
            });
        }

        const result = await pool.query(
            `UPDATE support_contacts
             SET status = $1,
                 admin_reply = COALESCE($2, admin_reply)
             WHERE id = $3
             RETURNING *`,
            [status, admin_reply, id]
        );

        const updatedContact = result.rows[0];

        // Nếu Admin có nhập phản hồi (admin_reply) -> Gửi thông báo vào Hộp thư của User
        if (admin_reply && admin_reply.trim()) {
            let targetUserId = updatedContact.user_id;

            // Nếu user_id là null, thử tìm user theo email
            if (!targetUserId && updatedContact.email) {
                const uRes = await pool.query('SELECT id FROM users WHERE email = $1', [updatedContact.email.toLowerCase().trim()]);
                if (uRes.rows.length > 0) {
                    targetUserId = uRes.rows[0].id;
                }
            }

            if (targetUserId) {
                await pool.query(
                    `INSERT INTO user_notifications (user_id, title, message, type, reference_id)
                     VALUES ($1, $2, $3, 'admin_reply', $4)`,
                    [
                        targetUserId,
                        `Phản hồi khiếu nại: ${updatedContact.subject || 'Hỗ trợ khách hàng'}`,
                        `Admin đã phản hồi phiếu #${updatedContact.id}: "${admin_reply.trim()}"`,
                        updatedContact.id
                    ]
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái và gửi phản hồi thành công!',
            data: updatedContact,
        });
    } catch (err) {
        console.error('❌ Lỗi updateContactStatusController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật trạng thái hỗ trợ.' });
    }
};

