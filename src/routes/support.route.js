// ============================================================
//  src/routes/support.route.js
// ============================================================

import { Router } from 'express';
import { verifyToken, verifyStaffOrAdmin, verifySalesOrAdmin } from '../middlewares/auth.middleware.js';
import {
    createContactController,
    getAllContactsController,
    updateContactStatusController,
} from '../controllers/support.controller.js';

const router = Router();

// Middleware phụ nếu có token
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
            // continue
        }
    }
    next();
};

// POST /api/contacts - Khách gửi form liên hệ
router.post('/', optionalAuth, createContactController);

// GET /api/contacts - CSKH / Admin xem danh sách liên hệ
router.get('/', verifyToken, verifyStaffOrAdmin, getAllContactsController);

// PATCH /api/contacts/:id - Cập nhật trạng thái và phản hồi
router.patch('/:id', verifyToken, verifySalesOrAdmin, updateContactStatusController);

export default router;
