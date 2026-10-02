// ============================================================
//  src/routes/user.route.js
//  Định tuyến API liên quan đến Trang cá nhân & Hộp thư
// ============================================================

import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
    getProfileController,
    updateProfileController,
    changePasswordController,
    getNotificationsController,
    markNotificationReadController,
    markAllNotificationsReadController,
    getMySupportsController,
} from '../controllers/user.controller.js';

const router = Router();

// Tất cả các route dưới đây đều yêu cầu đăng nhập (verifyToken)
router.use(verifyToken);

// 1. Quản lý thông tin cá nhân
router.get('/profile', getProfileController);
router.put('/profile', updateProfileController);
router.put('/change-password', changePasswordController);

// 2. Quản lý Hộp thư & Thông báo (Nhận phản hồi từ Admin)
router.get('/notifications', getNotificationsController);
router.patch('/notifications/read-all', markAllNotificationsReadController);
router.patch('/notifications/:id/read', markNotificationReadController);

// 3. Lịch sử khiếu nại / liên hệ CSKH của User
router.get('/my-supports', getMySupportsController);

export default router;
