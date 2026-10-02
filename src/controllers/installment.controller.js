// ============================================================
//  src/controllers/installment.controller.js
//  Quản lý đơn yêu cầu mua trả góp
// ============================================================

import pool from '../config/db.js';
import {
    sanitizeString,
    isValidVNPhone,
    normalizePhone,
    isValidIdCard,
    isValidFullName
} from '../utils/validator.js';

// -----------------------------------------------------------
//  createInstallmentController
//  Xử lý: POST /api/installments (Khách hàng gửi yêu cầu trả góp)
// -----------------------------------------------------------
export const createInstallmentController = async (req, res) => {
    try {
        const errors = {};

        // 1. Trích xuất đúng payload và sanitize
        const rawBody = req.body || {};
        const product_id      = parseInt(rawBody.product_id, 10);
        const customer_name   = sanitizeString(rawBody.customer_name, 100);
        const rawPhone        = typeof rawBody.phone === 'string' ? rawBody.phone.trim() : '';
        const phone           = normalizePhone(rawPhone);
        const id_card         = typeof rawBody.id_card === 'string' ? sanitizeString(rawBody.id_card, 20) : '';
        const address         = sanitizeString(rawBody.address, 200);
        const method          = rawBody.method === 'credit_card' ? 'credit_card' : 'finance';
        const term_months     = parseInt(rawBody.term_months, 10);
        const prepaid_percent = parseFloat(rawBody.prepaid_percent) || 0;

        // 2. Validate lớp Back-end: Kiểm tra từng trường thông tin
        if (!product_id || isNaN(product_id) || product_id <= 0) {
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

        // 3. Nếu có lỗi validation -> Chặn ngay lập tức và trả về HTTP 400 kèm chi tiết từng trường
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu hồ sơ trả góp không hợp lệ. Vui lòng kiểm tra và sửa lại các trường bị lỗi.',
                errors,
            });
        }

        // 4. Kiểm tra sự tồn tại của sản phẩm trong Database & Lấy giá thật
        const prodResult = await pool.query(
            'SELECT id, name, price, stock_quantity FROM products WHERE id = $1',
            [product_id]
        );

        if (prodResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm bạn chọn mua trả góp không tồn tại trên hệ thống.',
                errors: { product_id: 'Sản phẩm không tồn tại.' }
            });
        }

        const product = prodResult.rows[0];
        const realPrice = parseFloat(product.price);

        // 5. Tuyệt đối không tin số tiền Client gửi lên: Tự động tính toán lại 100% chuẩn xác
        const prepaid_amount = Math.round(realPrice * (prepaid_percent / 100));
        const pGoc = Math.max(0, realPrice - prepaid_amount);

        // Lãi suất: Thẻ tín dụng = 0%, Công ty tài chính = 0% (gói ưu đãi) hoặc 1.49%/tháng
        const isZeroInterest = (method === 'credit_card' || rawBody.package_type === 'zero');
        const monthlyRate = isZeroInterest ? 0 : 0.0149;

        const totalInterest = Math.round(pGoc * monthlyRate * term_months);
        const total_payment = pGoc + totalInterest;
        const monthly_payment = term_months > 0 ? Math.round(total_payment / term_months) : 0;

        // Lấy user_id nếu khách hàng đã đăng nhập
        const userId = req.user ? req.user.id : null;

        // 6. Ghi dữ liệu sạch vào Database
        const result = await pool.query(
            `INSERT INTO installments (
                user_id, product_id, customer_name, phone, id_card, address,
                method, term_months, prepaid_percent, prepaid_amount, monthly_payment, total_payment, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending')
            RETURNING *`,
            [
                userId,
                product.id,
                customer_name,
                phone,
                id_card || null,
                address || null,
                method,
                term_months,
                prepaid_percent,
                prepaid_amount,
                monthly_payment,
                total_payment
            ]
        );

        const newRecord = result.rows[0];

        // 7. Trả về HTTP 201 Created thành công
        return res.status(201).json({
            success: true,
            message: 'Đăng ký hồ sơ mua trả góp thành công! Nhân viên tài chính sẽ liên hệ với bạn trong vòng 15 phút.',
            data: {
                id: newRecord.id,
                application_code: `TG${newRecord.id}`,
                customer_name: newRecord.customer_name,
                phone: newRecord.phone,
                product_id: newRecord.product_id,
                product_name: product.name,
                method: newRecord.method,
                term_months: newRecord.term_months,
                prepaid_amount: parseFloat(newRecord.prepaid_amount),
                monthly_payment: parseFloat(newRecord.monthly_payment),
                total_payment: parseFloat(newRecord.total_payment),
                status: newRecord.status,
                created_at: newRecord.created_at
            },
        });
    } catch (err) {
        console.error('❌ Lỗi createInstallmentController:', err);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi phía máy chủ khi lưu hồ sơ trả góp. Vui lòng thử lại sau.'
        });
    }
};

// -----------------------------------------------------------
//  getAllInstallmentsController
//  Xử lý: GET /api/installments (Admin & Nhân viên xem danh sách)
// -----------------------------------------------------------
export const getAllInstallmentsController = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                i.*,
                p.name AS product_name,
                p.brand AS product_brand,
                p.price AS product_price,
                p.image_url AS product_image
            FROM installments i
            LEFT JOIN products p ON p.id = i.product_id
            ORDER BY i.created_at DESC
        `);

        return res.status(200).json({
            success: true,
            total: result.rows.length,
            data: result.rows,
        });
    } catch (err) {
        console.error('❌ Lỗi getAllInstallmentsController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi lấy hồ sơ trả góp.' });
    }
};

// -----------------------------------------------------------
//  updateInstallmentStatusController
//  Xử lý: PATCH /api/installments/:id/status (Admin/Sale duyệt/từ chối/yêu cầu bổ sung)
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

        const result = await pool.query(
            `UPDATE installments
             SET status = $1,
                 admin_notes = COALESCE($2, admin_notes)
             WHERE id = $3
             RETURNING *`,
            [status, admin_notes, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hồ sơ trả góp này.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái hồ sơ trả góp thành công!',
            data: result.rows[0],
        });
    } catch (err) {
        console.error('❌ Lỗi updateInstallmentStatusController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật hồ sơ trả góp.' });
    }
};
