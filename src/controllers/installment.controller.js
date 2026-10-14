// ============================================================
//  src/controllers/installment.controller.js
//  Quản lý đơn yêu cầu mua trả góp (MongoDB / Mongoose)
// ============================================================

import mongoose from 'mongoose';
import Installment from '../models/installment.model.js';
import { getProductById } from '../models/product.model.js';
import {
    sanitizeString,
    isValidVNPhone,
    normalizePhone,
    isValidIdCard,
    isValidFullName,
} from '../utils/validator.js';

// -----------------------------------------------------------
//  createInstallmentController
// -----------------------------------------------------------
export const createInstallmentController = async (req, res) => {
    try {
        const errors = {};
        const rawBody = req.body || {};

        const product_id      = rawBody.product_id;
        const customer_name   = sanitizeString(rawBody.customer_name, 100);
        const rawPhone        = typeof rawBody.phone === 'string' ? rawBody.phone.trim() : '';
        const phone           = normalizePhone(rawPhone);
        const id_card         = typeof rawBody.id_card === 'string' ? sanitizeString(rawBody.id_card, 20) : '';
        const address         = sanitizeString(rawBody.address, 200);
        const method          = rawBody.method === 'credit_card' ? 'credit_card' : 'finance';
        const term_months     = parseInt(rawBody.term_months, 10);
        const prepaid_percent = parseFloat(rawBody.prepaid_percent) || 0;

        if (!product_id || String(product_id).trim() === '') {
            errors.product_id = 'Mã sản phẩm không hợp lệ hoặc bị thiếu.';
        }

        if (!customer_name) {
            errors.customer_name = 'Họ và tên người đăng ký không được để trống.';
        } else if (!isValidFullName(customer_name)) {
            errors.customer_name = 'Họ và tên không hợp lệ (cần tối thiểu 2 từ, chỉ chứa chữ cái tiếng Việt).';
        }

        if (!rawPhone) {
            errors.phone = 'Số điện thoại không được để trống.';
        } else if (!isValidVNPhone(rawPhone)) {
            errors.phone = 'Số điện thoại không đúng định dạng di động Việt Nam (gồm 10 số, ví dụ: 0901234567).';
        }

        if (method === 'finance') {
            if (!id_card) {
                errors.id_card = 'Hình thức trả góp qua công ty tài chính bắt buộc phải có số CCCD/CMND.';
            } else if (!isValidIdCard(id_card)) {
                errors.id_card = 'Số Căn cước công dân phải gồm đúng 12 chữ số (hoặc 9 số với CMND cũ).';
            }
        }

        const validTerms = [3, 6, 9, 12];
        if (!term_months || !validTerms.includes(term_months)) {
            errors.term_months = `Kỳ hạn trả góp không hợp lệ. Chỉ chấp nhận các mốc: ${validTerms.join(', ')} tháng.`;
        }

        const validPercents = [0, 20, 30, 50];
        if (!validPercents.includes(prepaid_percent)) {
            errors.prepaid_percent = `Tỷ lệ trả trước không hợp lệ. Chỉ chấp nhận các mức: ${validPercents.join('%, ')}%.`;
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu hồ sơ trả góp không hợp lệ. Vui lòng kiểm tra và sửa lại các trường bị lỗi.',
                errors,
            });
        }

        // Kiểm tra sản phẩm
        const product = await getProductById(product_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm bạn chọn mua trả góp không tồn tại trên hệ thống.',
                errors: { product_id: 'Sản phẩm không tồn tại.' },
            });
        }

        const realPrice = parseFloat(product.price);
        const prepaid_amount = Math.round(realPrice * (prepaid_percent / 100));
        const pGoc = Math.max(0, realPrice - prepaid_amount);

        const isZeroInterest = (method === 'credit_card' || rawBody.package_type === 'zero');
        const monthlyRate = isZeroInterest ? 0 : 0.0149;

        const totalInterest = Math.round(pGoc * monthlyRate * term_months);
        const total_payment = pGoc + totalInterest;
        const monthly_payment = term_months > 0 ? Math.round(total_payment / term_months) : 0;

        const userId = req.user ? req.user.id : null;

        // Lưu hồ sơ vào MongoDB
        const newRecord = await Installment.create({
            user_id: userId,
            product_id: product._id || product.custom_id || product.id,
            product_name: product.name,
            product_brand: product.brand,
            product_price: realPrice,
            product_image: product.image_url || '',
            customer_name,
            phone,
            id_card: id_card || null,
            address: address || null,
            method,
            term_months,
            prepaid_percent,
            prepaid_amount,
            monthly_payment,
            total_payment,
            status: 'pending',
        });

        const shortCode = newRecord._id.toString().slice(-6).toUpperCase();

        return res.status(201).json({
            success: true,
            message: 'Đăng ký hồ sơ mua trả góp thành công! Nhân viên tài chính sẽ liên hệ với bạn trong vòng 15 phút.',
            data: {
                id: newRecord._id.toString(),
                application_code: `TG${shortCode}`,
                customer_name: newRecord.customer_name,
                phone: newRecord.phone,
                product_id: newRecord.product_id,
                product_name: newRecord.product_name,
                method: newRecord.method,
                term_months: newRecord.term_months,
                prepaid_amount: parseFloat(newRecord.prepaid_amount),
                monthly_payment: parseFloat(newRecord.monthly_payment),
                total_payment: parseFloat(newRecord.total_payment),
                status: newRecord.status,
                created_at: newRecord.created_at,
            },
        });
    } catch (err) {
        console.error('❌ Lỗi createInstallmentController:', err);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi phía máy chủ khi lưu hồ sơ trả góp. Vui lòng thử lại sau.',
        });
    }
};

// -----------------------------------------------------------
//  getAllInstallmentsController
// -----------------------------------------------------------
export const getAllInstallmentsController = async (req, res) => {
    try {
        const installments = await Installment.find().sort({ created_at: -1 });

        return res.status(200).json({
            success: true,
            total: installments.length,
            data: installments,
        });
    } catch (err) {
        console.error('❌ Lỗi getAllInstallmentsController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi lấy hồ sơ trả góp.' });
    }
};

// -----------------------------------------------------------
//  updateInstallmentStatusController
// -----------------------------------------------------------
export const updateInstallmentStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body;

        const validStatuses = ['pending', 'approved', 'need_info', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}`,
            });
        }

        const filter = mongoose.Types.ObjectId.isValid(id)
            ? { _id: id }
            : { $or: [{ _id: id }, { id }] };

        const updateFields = { status };
        if (admin_notes !== undefined) {
            updateFields.admin_notes = admin_notes;
        }

        const updated = await Installment.findOneAndUpdate(filter, { $set: updateFields }, { new: true });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hồ sơ trả góp này.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái hồ sơ trả góp thành công!',
            data: updated,
        });
    } catch (err) {
        console.error('❌ Lỗi updateInstallmentStatusController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật hồ sơ trả góp.' });
    }
};
