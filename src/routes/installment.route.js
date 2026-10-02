// ============================================================
//  src/routes/installment.route.js
// ============================================================

import { Router } from 'express';
import { verifyToken, verifyStaffOrAdmin, verifySalesOrAdmin } from '../middlewares/auth.middleware.js';
import {
    createInstallmentController,
    getAllInstallmentsController,
    updateInstallmentStatusController,
} from '../controllers/installment.controller.js';

const router = Router();

// Middleware phụ: nếu có token thì parse user, nếu không thì vẫn cho qua
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        try {
            const token = authHeader.split(' ')[1];
            if (token) {
                import('jsonwebtoken').then(jwt => {
                    try {
                        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
                        req.user = decoded;
                        next();
                    } catch (e) {
                        next();
                    }
                }).catch(() => next());
                return;
            }
        } catch (e) {
            // continue without user
        }
    }
    next();
};

// POST /api/installments - Nộp hồ sơ trả góp
router.post('/', optionalAuth, createInstallmentController);

// GET /api/installments - Xem danh sách hồ sơ (Admin / Staff)
router.get('/', verifyToken, verifyStaffOrAdmin, getAllInstallmentsController);

// PATCH /api/installments/:id/status - Duyệt / Từ chối / Bổ sung hồ sơ
router.patch('/:id/status', verifyToken, verifySalesOrAdmin, updateInstallmentStatusController);

export default router;
