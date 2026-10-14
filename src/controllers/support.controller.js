// ============================================================
//  src/controllers/support.controller.js
//  Quản lý liên hệ, phản hồi CSKH (MongoDB / Mongoose)
// ============================================================

import mongoose from 'mongoose';
import SupportContact from '../models/support.model.js';
import User from '../models/user.model.js';
import UserNotification from '../models/notification.model.js';
import {
    sanitizeString,
    isValidEmail,
    isValidVNPhone,
    normalizePhone,
    isValidFullName,
} from '../utils/validator.js';

// -----------------------------------------------------------
//  createContactController
// -----------------------------------------------------------
export const createContactController = async (req, res) => {
    try {
        const errors = {};
        const rawBody = req.body || {};

        const name     = sanitizeString(rawBody.name, 100);
        const email    = typeof rawBody.email === 'string' ? rawBody.email.trim().toLowerCase() : '';
        const rawPhone = typeof rawBody.phone === 'string' ? rawBody.phone.trim() : '';
        const phone    = normalizePhone(rawPhone);
        const subject  = sanitizeString(rawBody.subject || 'Yêu cầu tư vấn', 150);
        const message  = sanitizeString(rawBody.message, 1000);

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

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Thông tin gửi liên hệ chưa chính xác. Vui lòng kiểm tra lại.',
                errors,
            });
        }

        const userId = req.user ? req.user.id : null;

        const newContact = await SupportContact.create({
            user_id: userId,
            name,
            email,
            phone: phone || null,
            subject,
            message,
            status: 'pending',
        });

        const shortId = newContact._id.toString().slice(-6).toUpperCase();

        return res.status(201).json({
            success: true,
            message: 'Cảm ơn bạn! Yêu cầu hỗ trợ đã được gửi thành công đến hệ thống CSKH.',
            data: {
                id: newContact._id.toString(),
                ticket_code: `CSKH-${shortId}`,
                name: newContact.name,
                email: newContact.email,
                phone: newContact.phone,
                subject: newContact.subject,
                message: newContact.message,
                status: newContact.status,
                created_at: newContact.created_at,
            },
        });
    } catch (err) {
        console.error('❌ Lỗi createContactController:', err);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi phía máy chủ khi gửi tin nhắn. Vui lòng thử lại sau.',
        });
    }
};

// -----------------------------------------------------------
//  getAllContactsController
// -----------------------------------------------------------
export const getAllContactsController = async (req, res) => {
    try {
        const contacts = await SupportContact.find().sort({ created_at: -1 });

        return res.status(200).json({
            success: true,
            total: contacts.length,
            data: contacts,
        });
    } catch (err) {
        console.error('❌ Lỗi getAllContactsController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi lấy tin nhắn hỗ trợ.' });
    }
};

// -----------------------------------------------------------
//  updateContactStatusController
// -----------------------------------------------------------
export const updateContactStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_reply } = req.body;

        const validStatuses = ['pending', 'processed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: pending, processed',
            });
        }

        const filter = mongoose.Types.ObjectId.isValid(id)
            ? { _id: id }
            : { $or: [{ _id: id }, { id }] };

        const updateFields = { status };
        if (admin_reply !== undefined) {
            updateFields.admin_reply = admin_reply;
        }

        const updatedContact = await SupportContact.findOneAndUpdate(filter, { $set: updateFields }, { new: true });

        if (!updatedContact) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu hỗ trợ.' });
        }

        // Nếu Admin phản hồi -> Tạo thông báo cho User
        if (admin_reply && admin_reply.trim()) {
            let targetUserId = updatedContact.user_id;

            if (!targetUserId && updatedContact.email) {
                const u = await User.findOne({ email: updatedContact.email.toLowerCase().trim() });
                if (u) {
                    targetUserId = u._id;
                }
            }

            if (targetUserId) {
                const shortId = updatedContact._id.toString().slice(-6).toUpperCase();
                await UserNotification.create({
                    user_id: targetUserId,
                    title: `Phản hồi khiếu nại: ${updatedContact.subject || 'Hỗ trợ khách hàng'}`,
                    message: `Admin đã phản hồi phiếu #${shortId}: "${admin_reply.trim()}"`,
                    type: 'admin_reply',
                    reference_id: updatedContact._id.toString(),
                }).catch((e) => console.warn('Lỗi tạo notification:', e.message));
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
