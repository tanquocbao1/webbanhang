// ============================================================
//  src/controllers/voucher.controller.js
//  Quản lý khuyến mãi, voucher giảm giá (MongoDB / Mongoose)
// ============================================================

import mongoose from 'mongoose';
import Voucher from '../models/voucher.model.js';

// -----------------------------------------------------------
//  Lấy danh sách voucher
// -----------------------------------------------------------
export const getAllVouchersController = async (req, res) => {
    try {
        const vouchers = await Voucher.find().sort({ created_at: -1 });
        return res.status(200).json({
            success: true,
            total: vouchers.length,
            data: vouchers,
        });
    } catch (err) {
        console.error('❌ Lỗi getAllVouchersController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách voucher.' });
    }
};

// -----------------------------------------------------------
//  Tạo voucher mới (Admin)
// -----------------------------------------------------------
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
            expires_at,
        } = req.body;

        if (!code || !title) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp mã voucher và tiêu đề khuyến mãi.',
            });
        }

        const cleanCode = code.trim().toUpperCase();

        const existing = await Voucher.findOne({ code: cleanCode });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Mã voucher này đã tồn tại trong hệ thống.' });
        }

        const newVoucher = await Voucher.create({
            code: cleanCode,
            title: title.trim(),
            discount_percent: parseInt(discount_percent, 10) || 0,
            discount_amount: parseFloat(discount_amount) || 0,
            min_order_amount: parseFloat(min_order_amount) || 0,
            max_discount: parseFloat(max_discount) || 0,
            usage_limit: parseInt(usage_limit, 10) || 100,
            expires_at: expires_at ? new Date(expires_at) : null,
        });

        return res.status(201).json({
            success: true,
            message: 'Tạo mã voucher khuyến mãi thành công!',
            data: newVoucher,
        });
    } catch (err) {
        console.error('❌ Lỗi createVoucherController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi tạo voucher.' });
    }
};

// -----------------------------------------------------------
//  Xóa voucher (Admin)
// -----------------------------------------------------------
export const deleteVoucherController = async (req, res) => {
    try {
        const { id } = req.params;

        const filter = mongoose.Types.ObjectId.isValid(id)
            ? { _id: id }
            : { $or: [{ _id: id }, { id }] };

        const deleted = await Voucher.findOneAndDelete(filter);

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy voucher để xóa.' });
        }

        return res.status(200).json({
            success: true,
            message: 'Đã xóa mã voucher thành công!',
            data: deleted,
        });
    } catch (err) {
        console.error('❌ Lỗi deleteVoucherController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi xóa voucher.' });
    }
};

// -----------------------------------------------------------
//  Áp dụng voucher khi thanh toán
// -----------------------------------------------------------
export const applyVoucherController = async (req, res) => {
    try {
        const { code, order_amount } = req.body;
        if (!code || order_amount === undefined) {
            return res.status(400).json({ success: false, message: 'Thiếu mã voucher hoặc giá trị đơn hàng.' });
        }

        const voucher = await Voucher.findOne({
            code: code.trim().toUpperCase(),
            is_active: true,
        });

        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn.' });
        }

        // Kiểm tra hạn sử dụng nếu có
        if (voucher.expires_at && new Date() > new Date(voucher.expires_at)) {
            return res.status(400).json({ success: false, message: 'Mã giảm giá này đã hết hạn sử dụng.' });
        }

        const amount = parseFloat(order_amount);
        if (voucher.min_order_amount && amount < parseFloat(voucher.min_order_amount)) {
            return res.status(400).json({
                success: false,
                message: `Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN').format(voucher.min_order_amount)}đ mới có thể dùng voucher này.`,
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
                final_amount: Math.max(0, amount - discount),
            },
        });
    } catch (err) {
        console.error('❌ Lỗi applyVoucherController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi kiểm tra voucher.' });
    }
};
