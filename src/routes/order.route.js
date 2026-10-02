// ============================================================
//  src/routes/order.route.js
//  Định nghĩa các API endpoint liên quan đến đơn hàng
// ============================================================

import { Router } from 'express';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js';
import {
    createOrderController,
    getMyOrdersController,
    getAllOrdersController,
    updateOrderStatusController,
} from '../controllers/order.controller.js';

const router = Router();

// ============================================================
//  ROUTE DÀNH CHO CUSTOMER (phải đăng nhập)
// ============================================================

// POST /api/orders
// Mục đích: Customer đặt hàng (checkout bằng COD)
// Middleware verifyToken chạy TRƯỚC controller -> đảm bảo user đã đăng nhập
router.post('/', verifyToken, createOrderController);

// GET /api/orders/my-orders
// Mục đích: Customer xem lịch sử đơn hàng của chính mình
router.get('/my-orders', verifyToken, getMyOrdersController);


// ============================================================
//  ROUTE DÀNH CHO ADMIN
//  verifyToken kiểm tra đăng nhập, verifyAdmin kiểm tra quyền admin
// ============================================================

// GET /api/orders
// Mục đích: Admin xem TẤT CẢ đơn hàng trong hệ thống
router.get('/', verifyToken, verifyAdmin, getAllOrdersController);

// PATCH /api/orders/:orderId/status
// Mục đích: Admin cập nhật trạng thái đơn hàng (pending -> shipping -> completed)
router.patch('/:orderId/status', verifyToken, verifyAdmin, updateOrderStatusController);


export default router;
