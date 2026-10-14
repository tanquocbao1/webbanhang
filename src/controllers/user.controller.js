// ============================================================
//  src/controllers/user.controller.js
//  Quản lý trang cá nhân, Đổi mật khẩu, Hộp thư thông báo (MongoDB)
// ============================================================

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import UserNotification from '../models/notification.model.js';
import SupportContact from '../models/support.model.js';
import {
    sanitizeString,
    isValidEmail,
    isValidVNPhone,
    normalizePhone,
    isValidFullName,
} from '../utils/validator.js';

// Helper tìm user theo ID (ObjectId hoặc custom ID)
const findUserById = async (id) => {
    if (mongoose.Types.ObjectId.isValid(id)) {
        return await User.findById(id);
    }
    return await User.findOne({ $or: [{ _id: id }, { id }] });
};

// -----------------------------------------------------------
// 1. GET /api/user/profile
// -----------------------------------------------------------
export const getProfileController = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await findUserById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng.',
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: user._id.toString(),
                email: user.email,
                full_name: user.full_name,
                phone: user.phone,
                address: user.address,
                role: user.role,
                created_at: user.created_at,
                updated_at: user.updated_at,
            },
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

        if (!full_name) {
            errors.full_name = 'Họ và tên không được để trống.';
        } else if (!isValidFullName(full_name)) {
            errors.full_name = 'Họ và tên không hợp lệ (tối thiểu 2 từ, chỉ chứa chữ cái tiếng Việt).';
        }

        if (!email) {
            errors.email = 'Email không được để trống.';
        } else if (!isValidEmail(email)) {
            errors.email = 'Email không đúng định dạng chuẩn (ví dụ: nguyenvanan@gmail.com).';
        }

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

        // Kiểm tra xem email mới có bị trùng tài khoản khác không
        const checkEmail = await User.findOne({
            email,
            _id: { $ne: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId },
        });

        if (checkEmail) {
            return res.status(409).json({
                success: false,
                message: 'Email này đã được sử dụng bởi một tài khoản khác trong hệ thống.',
                errors: { email: 'Email đã tồn tại trên hệ thống.' },
            });
        }

        const filter = mongoose.Types.ObjectId.isValid(userId) ? { _id: userId } : { $or: [{ _id: userId }, { id: userId }] };

        const updatedUser = await User.findOneAndUpdate(
            filter,
            {
                $set: {
                    full_name,
                    email,
                    phone: cleanPhone,
                    address,
                },
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin cá nhân thành công!',
            data: {
                id: updatedUser._id.toString(),
                email: updatedUser.email,
                full_name: updatedUser.full_name,
                phone: updatedUser.phone,
                address: updatedUser.address,
                role: updatedUser.role,
                created_at: updatedUser.created_at,
                updated_at: updatedUser.updated_at,
            },
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

        const user = await findUserById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
        }

        const isMatch = await bcrypt.compare(old_password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không chính xác.',
                errors: { old_password: 'Mật khẩu hiện tại không đúng.' },
            });
        }

        const newHash = await bcrypt.hash(new_password, 10);
        user.password_hash = newHash;
        await user.save();

        await UserNotification.create({
            user_id: user._id,
            title: 'Bảo mật: Đổi mật khẩu thành công',
            message: 'Mật khẩu tài khoản của bạn đã được thay đổi thành công. Nếu không phải bạn thực hiện, vui lòng liên hệ ngay với CSKH Bảo Sneaker.',
            type: 'system',
        }).catch((e) => console.warn('Lỗi tạo notification:', e.message));

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
// -----------------------------------------------------------
export const getNotificationsController = async (req, res) => {
    try {
        const userId = req.user.id;

        const notifs = await UserNotification.find({
            $or: [{ user_id: userId }, { user_id: String(userId) }],
        }).sort({ created_at: -1 });

        const unreadCount = await UserNotification.countDocuments({
            $or: [{ user_id: userId }, { user_id: String(userId) }],
            is_read: false,
        });

        return res.status(200).json({
            success: true,
            total: notifs.length,
            unread_count: unreadCount,
            data: notifs,
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
// -----------------------------------------------------------
export const markNotificationReadController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const filter = mongoose.Types.ObjectId.isValid(id)
            ? { _id: id }
            : { $or: [{ _id: id }, { id }] };

        const updated = await UserNotification.findOneAndUpdate(
            { ...filter, $or: [{ user_id: userId }, { user_id: String(userId) }] },
            { $set: { is_read: true } },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông báo hoặc bạn không có quyền thao tác.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Đã đánh dấu đã đọc.',
            data: updated,
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
// -----------------------------------------------------------
export const markAllNotificationsReadController = async (req, res) => {
    try {
        const userId = req.user.id;

        await UserNotification.updateMany(
            {
                $or: [{ user_id: userId }, { user_id: String(userId) }],
                is_read: false,
            },
            { $set: { is_read: true } }
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
// -----------------------------------------------------------
export const getMySupportsController = async (req, res) => {
    try {
        const userId = req.user.id;
        const userEmail = req.user.email;

        const supports = await SupportContact.find({
            $or: [
                { user_id: userId },
                { user_id: String(userId) },
                { email: userEmail ? userEmail.toLowerCase().trim() : '' },
            ],
        }).sort({ created_at: -1 });

        return res.status(200).json({
            success: true,
            total: supports.length,
            data: supports,
        });
    } catch (err) {
        console.error('❌ Lỗi getMySupportsController:', err);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi tải danh sách phiếu hỗ trợ.',
        });
    }
};
