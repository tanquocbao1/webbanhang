// ============================================================
//  src/controllers/voucher.controller.js
//  Quản lý khuyến mãi, voucher giảm giá
// ============================================================

import pool from '../config/db.js';

// Lấy danh sách voucher
export const getAllVouchersController = async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM vouchers ORDER BY created_at DESC`);
        return res.status(200).json({
            success: true,
            total: result.rows.length,
            data: result.rows,
        });
    } catch (err) {
        console.error('❌ Lỗi getAllVouchersController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách voucher.' });
    }
};

// Tạo voucher mới (Admin)
export const createVoucherController = async (req, res) => {
    try {
        const {
            code,
            title,
            discount_percent,
            discount_amount,
            min_order_amount,
            max_discount,
            usage_limit,
            expires_at
        } = req.body;

        if (!code || !title) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp mã voucher và tiêu đề khuyến mãi.',
            });
        }

        const result = await pool.query(
            `INSERT INTO vouchers (code, title, discount_percent, discount_amount, min_order_amount, max_discount, usage_limit, expires_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                code.trim().toUpperCase(),
                title.trim(),
                parseInt(discount_percent) || 0,
                parseFloat(discount_amount) || 0,
                parseFloat(min_order_amount) || 0,
                parseFloat(max_discount) || 0,
                parseInt(usage_limit) || 100,
                expires_at || null
            ]
        );

        return res.status(201).json({
            success: true,
            message: 'Tạo mã voucher khuyến mãi thành công!',
            data: result.rows[0],
        });
    } catch (err) {
        if (err.code === '23505') { // duplicate key
            return res.status(400).json({ success: false, message: 'Mã voucher này đã tồn tại trong hệ thống.' });
        }
        console.error('❌ Lỗi createVoucherController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi tạo voucher.' });
    }
};

// Xóa voucher (Admin)
export const deleteVoucherController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`DELETE FROM vouchers WHERE id = $1 RETURNING *`, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy voucher để xóa.' });
        }

        return res.status(200).json({
            success: true,
            message: 'Đã xóa mã voucher thành công!',
            data: result.rows[0],
        });
    } catch (err) {
        console.error('❌ Lỗi deleteVoucherController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi xóa voucher.' });
    }
};

// Áp dụng voucher khi thanh toán
export const applyVoucherController = async (req, res) => {
    try {
        const { code, order_amount } = req.body;
        if (!code || order_amount === undefined) {
            return res.status(400).json({ success: false, message: 'Thiếu mã voucher hoặc giá trị đơn hàng.' });
        }

        const result = await pool.query(
            `SELECT * FROM vouchers WHERE code = $1 AND is_active = true`,
            [code.trim().toUpperCase()]
        );

        const voucher = result.rows[0];
        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn.' });
        }

        const amount = parseFloat(order_amount);
        if (voucher.min_order_amount && amount < parseFloat(voucher.min_order_amount)) {
            return res.status(400).json({
                success: false,
                message: `Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN').format(voucher.min_order_amount)}đ mới có thể dùng voucher này.`
            });
        }

        let discount = 0;
        if (voucher.discount_percent > 0) {
            discount = (amount * voucher.discount_percent) / 100;
            if (voucher.max_discount && voucher.max_discount > 0 && discount > parseFloat(voucher.max_discount)) {
                discount = parseFloat(voucher.max_discount);
            }
        } else if (voucher.discount_amount > 0) {
            discount = parseFloat(voucher.discount_amount);
        }

        return res.status(200).json({
            success: true,
            message: 'Áp dụng mã giảm giá thành công!',
            data: {
                code: voucher.code,
                title: voucher.title,
                discount: Math.min(discount, amount),
                final_amount: Math.max(0, amount - discount)
            }
        });
    } catch (err) {
        console.error('❌ Lỗi applyVoucherController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi kiểm tra voucher.' });
    }
};
