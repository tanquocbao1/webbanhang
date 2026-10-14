// ============================================================
//  src/models/user.model.js
//  Mongoose Model & Helpers cho bảng users (MongoDB)
// ============================================================

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email là bắt buộc'],
            unique: true,
            trim: true,
            lowercase: true,
        },
        password_hash: {
            type: String,
            required: [true, 'Mật khẩu là bắt buộc'],
        },
        full_name: {
            type: String,
            required: [true, 'Họ và tên là bắt buộc'],
            trim: true,
        },
        role: {
            type: String,
            enum: ['admin', 'customer', 'warehouse', 'sales'],
            default: 'customer',
        },
        phone: {
            type: String,
            default: null,
            trim: true,
        },
        address: {
            type: String,
            default: null,
            trim: true,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id.toString();
                return ret;
            },
        },
        toObject: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id.toString();
                return ret;
            },
        },
    }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);

// -----------------------------------------------------------
//  Tìm user theo email (dùng khi đăng nhập / kiểm tra trùng)
// -----------------------------------------------------------
export const findUserByEmail = async (email) => {
    if (!email) return null;
    return await User.findOne({ email: email.toLowerCase().trim() });
};

// -----------------------------------------------------------
//  Tạo user mới (dùng khi đăng ký)
// -----------------------------------------------------------
export const createUser = async ({ email, passwordHash, fullName, role = 'customer' }) => {
    const user = await User.create({
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        full_name: fullName,
        role,
    });
    return {
        id: user._id.toString(),
        _id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        created_at: user.created_at,
    };
};

export default User;
