// ============================================================
//  src/routes/admin.route.js
// ============================================================

import { Router } from 'express';
import { verifyToken, verifyAdmin, verifyStaffOrAdmin } from '../middlewares/auth.middleware.js';
import {
    getAdminStatsController,
    getUsersController,
    updateUserRoleController,
} from '../controllers/admin.controller.js';

const router = Router();

// GET /api/admin/stats - Thống kê Analytics (Admin & Staff)
router.get('/stats', verifyToken, verifyStaffOrAdmin, getAdminStatsController);

// GET /api/admin/users - Danh sách người dùng & Lịch sử mua hàng (Admin & Staff)
router.get('/users', verifyToken, verifyStaffOrAdmin, getUsersController);

// PATCH /api/admin/users/:userId/role - Phân quyền người dùng (Chỉ Admin)
router.patch('/users/:userId/role', verifyToken, verifyAdmin, updateUserRoleController);

export default router;
