// ============================================================
//  src/controllers/auth.controller.js
//  Xử lý request đăng ký và đăng nhập
// ============================================================

import * as authService from '../services/auth.service.js';

// Đăng ký
export const registerController = async (req, res) => {
    try {
        const { email, password, full_name } = req.body;

        if (!email || !password || !full_name) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ email, mật khẩu và họ tên.',
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu phải có ít nhất 6 ký tự.',
            });
        }

        const newUser = await authService.register({ email, password, fullName: full_name });

        return res.status(201).json({
            success: true,
            message: 'Đăng ký thành công!',
            data: newUser,
        });
    } catch (err) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({ success: false, message: err.message });
        }
        console.error('❌ Lỗi register:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
};

// Đăng nhập
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email và mật khẩu.',
            });
        }

        const result = await authService.login({ email, password });

        return res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công!',
            data: result,
        });
    } catch (err) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({ success: false, message: err.message });
        }
        console.error('❌ Lỗi login:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
};
