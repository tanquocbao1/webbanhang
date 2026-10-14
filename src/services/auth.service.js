// ============================================================
//  src/services/auth.service.js
//  Logic xử lý đăng ký và đăng nhập
// ============================================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { findUserByEmail, createUser } from '../models/user.model.js';

dotenv.config();

// -----------------------------------------------------------
//  Đăng ký tài khoản mới
// -----------------------------------------------------------
export const register = async ({ email, password, fullName }) => {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        const err = new Error('Email này đã được sử dụng. Vui lòng chọn email khác.');
        err.isOperational = true;
        err.statusCode = 409;
        throw err;
    }

    // Mã hóa mật khẩu trước khi lưu vào DB
    // Số 10 là "salt rounds" - càng cao càng an toàn nhưng càng chậm
    const passwordHash = await bcrypt.hash(password, 10);

    // Tạo user mới trong DB
    const newUser = await createUser({ email, passwordHash, fullName });

    return newUser;
};


// -----------------------------------------------------------
//  Đăng nhập
// -----------------------------------------------------------
export const login = async ({ email, password }) => {
    // Tìm user theo email
    const user = await findUserByEmail(email);

    // Nếu không tìm thấy user -> sai thông tin
    // (Trả về thông báo chung chung để tránh lộ thông tin "email có tồn tại không")
    if (!user) {
        const err = new Error('Email hoặc mật khẩu không đúng.');
        err.isOperational = true;
        err.statusCode = 401;
        throw err;
    }

    // So sánh mật khẩu nhập vào với hash trong DB
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        const err = new Error('Email hoặc mật khẩu không đúng.');
        err.isOperational = true;
        err.statusCode = 401;
        throw err;
    }

    const userId = user.id || user._id.toString();

    // Tạo JWT token (hạn sử dụng lấy từ .env)
    const token = jwt.sign(
        { id: userId, email: user.email, role: user.role }, // Payload
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Trả về token và thông tin user (không trả password_hash)
    return {
        token,
        user: {
            id:        userId,
            email:     user.email,
            full_name: user.full_name,
            role:      user.role,
        },
    };
};
