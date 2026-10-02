// ============================================================
//  src/routes/auth.route.js
// ============================================================

import { Router } from 'express';
import { registerController, loginController } from '../controllers/auth.controller.js';

const router = Router();

// POST /api/auth/register - Đăng ký tài khoản
router.post('/register', registerController);

// POST /api/auth/login - Đăng nhập
router.post('/login', loginController);

export default router;
