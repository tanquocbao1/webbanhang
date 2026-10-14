// ============================================================
//  src/controllers/order.controller.js
//  Tiếp nhận request từ client, validate dữ liệu đầu vào,
//  rồi gọi Service để xử lý logic.
//
//  NGUYÊN TẮC: Controller KHÔNG chứa logic nghiệp vụ phức tạp.
//  Nó chỉ là "cầu nối" giữa HTTP request và tầng Service.
// ============================================================

import * as orderService from '../services/order.service.js';
import { sanitizeString, isValidVNPhone, normalizePhone, isValidFullName } from '../utils/validator.js';

// -----------------------------------------------------------
//  createOrderController
//  Xử lý: POST /api/orders
//  Chức năng: Nhận đơn hàng Checkout COD từ Frontend, validate, rồi tạo đơn
// -----------------------------------------------------------
export const createOrderController = async (req, res) => {
    try {
        const userId = req.user.id;

        const errors = {};
        const rawBody = req.body || {};
        const customer_name = sanitizeString(rawBody.customer_name || req.user.full_name || '', 100);
        const rawPhone = sanitizeString(rawBody.phone, 20);
        const shipping_address = sanitizeString(rawBody.shipping_address, 300);
        const payment_method = sanitizeString(rawBody.payment_method || 'cod', 50);
        const note = sanitizeString(rawBody.note || '', 300);
        const items = rawBody.items;

        // --- VALIDATE DỮ LIỆU ĐẦU VÀO ---
        if (!customer_name) {
            errors.customer_name = 'Họ và tên người nhận không được để trống.';
        } else if (!isValidFullName(customer_name)) {
            errors.customer_name = 'Họ và tên người nhận không hợp lệ (tối thiểu 2 từ, chỉ chứa chữ cái tiếng Việt).';
        }

        let cleanPhone = '';
        if (!rawPhone) {
            errors.phone = 'Số điện thoại người nhận không được để trống.';
        } else if (!isValidVNPhone(rawPhone)) {
            errors.phone = 'Số điện thoại không đúng chuẩn 10 chữ số di động Việt Nam (vd: 0901234567).';
        } else {
            cleanPhone = normalizePhone(rawPhone);
        }

        if (!shipping_address) {
            errors.shipping_address = 'Địa chỉ nhận hàng không được để trống.';
        } else if (shipping_address.length < 10) {
            errors.shipping_address = 'Vui lòng nhập địa chỉ giao hàng chi tiết (tối thiểu 10 ký tự, gồm số nhà, tên đường, phường/xã, quận/huyện).';
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            errors.items = 'Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.';
        } else {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (!item.product_id || String(item.product_id).trim() === '') {
                    errors[`items_${i}_product_id`] = `Sản phẩm thứ ${i + 1} không có ID hợp lệ.`;
                }
                if (!item.quantity || parseInt(item.quantity, 10) < 1) {
                    errors[`items_${i}_quantity`] = `Số lượng sản phẩm thứ ${i + 1} phải từ 1 trở lên.`;
                }
            }
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Thông tin đặt hàng không hợp lệ. Vui lòng kiểm tra lại các trường bị lỗi.',
                errors,
            });
        }

        // --- GỌI SERVICE ĐỂ XỬ LÝ TRANSACTION & TẠO ĐƠN HÀNG COD ---
        const newOrder = await orderService.createOrder({
            userId,
            customerName: customer_name,
            phone: cleanPhone,
            shippingAddress: shipping_address.trim(),
            paymentMethod: payment_method || 'cod',
            note: note || null,
            items,
        });

        // Trả về kết quả thành công (HTTP 201 = Created)
        return res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công! Đơn hàng COD của bạn đang chờ xác nhận.',
            data: newOrder,
        });

    } catch (err) {
        // Xử lý các lỗi đã được "ném" từ Service (vd: hết hàng)
        // Đây là lỗi có thể dự đoán trước
        if (err.isOperational) {
            return res.status(err.statusCode || 400).json({
                success: false,
                message: err.message,
            });
        }

        // Lỗi không mong đợi (lỗi server, lỗi DB...)
        console.error('❌ Lỗi tại createOrderController:', err);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi phía server. Vui lòng thử lại sau.',
        });
    }
};


// -----------------------------------------------------------
//  getMyOrdersController
//  Xử lý: GET /api/orders/my-orders
//  Chức năng: Customer xem lịch sử đơn hàng của mình
// -----------------------------------------------------------
export const getMyOrdersController = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await orderService.getOrdersByUser(userId);

        return res.status(200).json({
            success: true,
            data: orders,
        });
    } catch (err) {
        console.error('❌ Lỗi tại getMyOrdersController:', err);
        return res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách đơn hàng.',
        });
    }
};


// -----------------------------------------------------------
//  getAllOrdersController
//  Xử lý: GET /api/orders  (chỉ Admin)
//  Chức năng: Admin xem tất cả đơn hàng
// -----------------------------------------------------------
export const getAllOrdersController = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();

        return res.status(200).json({
            success: true,
            total: orders.length,
            data: orders,
        });
    } catch (err) {
        console.error('❌ Lỗi tại getAllOrdersController:', err);
        return res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách đơn hàng.',
        });
    }
};


// -----------------------------------------------------------
//  updateOrderStatusController
//  Xử lý: PATCH /api/orders/:orderId/status  (chỉ Admin)
//  Chức năng: Admin cập nhật trạng thái đơn hàng
// -----------------------------------------------------------
export const updateOrderStatusController = async (req, res) => {
    try {
        const { orderId } = req.params; // Lấy từ URL: /api/orders/5/status
        const { status } = req.body;    // Lấy từ body: { "status": "shipping" }

        // Danh sách trạng thái hợp lệ
        const validStatuses = ['pending', 'processing', 'shipping', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}`,
            });
        }

        const updatedOrder = await orderService.updateOrderStatus(orderId, status);

        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng với id này.',
            });
        }

        return res.status(200).json({
            success: true,
            message: `Cập nhật trạng thái đơn hàng thành "${status}" thành công.`,
            data: updatedOrder,
        });
    } catch (err) {
        console.error('❌ Lỗi tại updateOrderStatusController:', err);
        return res.status(500).json({
            success: false,
            message: 'Không thể cập nhật trạng thái.',
        });
    }
};
