// ============================================================
//  src/routes/voucher.route.js
// ============================================================

import { Router } from 'express';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js';
import {
    getAllVouchersController,
    createVoucherController,
    deleteVoucherController,
    applyVoucherController,
} from '../controllers/voucher.controller.js';

const router = Router();

// GET /api/vouchers - Xem danh sách voucher
router.get('/', getAllVouchersController);

// POST /api/vouchers/apply - Khách hàng áp mã giảm giá
router.post('/apply', applyVoucherController);

// POST /api/vouchers - Tạo voucher (Admin)
router.post('/', verifyToken, verifyAdmin, createVoucherController);

// DELETE /api/vouchers/:id - Xóa voucher (Admin)
router.delete('/:id', verifyToken, verifyAdmin, deleteVoucherController);

export default router;
