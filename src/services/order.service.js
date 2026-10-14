// ============================================================
//  src/services/order.service.js
//  Logic nghiệp vụ đơn hàng & Checkout COD (MongoDB / Mongoose)
// ============================================================

import mongoose from 'mongoose';
import Order from '../models/order.model.js';
import Product, { getProductById } from '../models/product.model.js';
import UserNotification from '../models/notification.model.js';

// Helper: tạo lỗi có thể đoán trước (lỗi nghiệp vụ)
const createAppError = (message, statusCode = 400) => {
    const err = new Error(message);
    err.isOperational = true;
    err.statusCode = statusCode;
    return err;
};

// ============================================================
//  createOrder - LUỒNG CHECKOUT COD
// ============================================================
export const createOrder = async ({
    userId,
    shippingAddress,
    items,
    phone = null,
    customerName = null,
    paymentMethod = 'cod',
    note = null,
}) => {
    let totalAmount = 0;
    const enrichedItems = [];
    const productsToUpdate = [];

    // 1. Kiểm tra từng sản phẩm và tính toán
    for (const item of items) {
        const product = await getProductById(item.product_id);

        if (!product) {
            throw createAppError(`Sản phẩm với ID ${item.product_id} không tồn tại.`, 404);
        }

        if (product.stock_quantity < item.quantity) {
            throw createAppError(
                `Sản phẩm "${product.name}" không đủ hàng. ` +
                `Kho còn: ${product.stock_quantity}, bạn cần: ${item.quantity}.`,
                409
            );
        }

        totalAmount += item.quantity * parseFloat(product.price);

        enrichedItems.push({
            product_id: product._id || product.custom_id || product.id,
            product_name: product.name,
            image_url: product.image_url || '',
            quantity: item.quantity,
            price: product.price,
        });

        productsToUpdate.push({
            id: product._id,
            quantity: item.quantity,
        });
    }

    // 2. Trừ tồn kho và tăng lượt bán
    for (const p of productsToUpdate) {
        await Product.findByIdAndUpdate(p.id, {
            $inc: {
                stock_quantity: -p.quantity,
                sold: p.quantity,
            },
        });
    }

    // 3. Tạo đơn hàng trong MongoDB
    const newOrder = await Order.create({
        user_id: userId || null,
        customer_name: customerName,
        phone,
        shipping_address: shippingAddress,
        payment_method: paymentMethod || 'cod',
        note,
        total_amount: totalAmount,
        status: 'pending',
        items: enrichedItems,
    });

    // 4. Tạo thông báo cho user
    if (userId) {
        const orderShortCode = newOrder._id.toString().slice(-6).toUpperCase();
        const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount);
        await UserNotification.create({
            user_id: userId,
            title: `Đặt hàng thành công đơn #${orderShortCode}`,
            message: `Đơn hàng #${orderShortCode} (${enrichedItems.length} sản phẩm, tổng cộng: ${formattedTotal}) theo hình thức Thanh toán khi nhận hàng (COD) đã được tạo thành công. Nhân viên sẽ liên hệ và giao hàng tới địa chỉ: ${shippingAddress}.`,
            type: 'order_status',
            reference_id: newOrder._id.toString(),
        }).catch((e) => console.warn('Lỗi tạo notification:', e.message));
    }

    return newOrder;
};

// ============================================================
//  getOrdersByUser - Lịch sử đơn hàng của User
// ============================================================
export const getOrdersByUser = async (userId) => {
    return await Order.find({ user_id: userId }).sort({ created_at: -1 });
};

// ============================================================
//  getAllOrders - Dành cho Admin
// ============================================================
export const getAllOrders = async () => {
    return await Order.find().sort({ created_at: -1 });
};

// ============================================================
//  updateOrderStatus - Dành cho Admin cập nhật trạng thái
// ============================================================
export const updateOrderStatus = async (orderId, status) => {
    const filter = mongoose.Types.ObjectId.isValid(orderId)
        ? { _id: orderId }
        : { $or: [{ _id: orderId }, { id: orderId }] };

    return await Order.findOneAndUpdate(filter, { $set: { status } }, { new: true });
};
