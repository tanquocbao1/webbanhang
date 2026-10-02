// ============================================================
//  src/middlewares/auth.middleware.js
//  Xác thực JWT - Kiểm tra người dùng có đăng nhập không
// ============================================================

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// -----------------------------------------------------------
//  Middleware: verifyToken
//  Chức năng: Kiểm tra token JWT trong header của request.
//  Nếu hợp lệ -> gắn thông tin user vào req.user và cho đi tiếp.
//  Nếu không  -> trả về lỗi 401 (Unauthorized).
// -----------------------------------------------------------
export const verifyToken = (req, res, next) => {
    // Lấy header Authorization: "Bearer <token>"
    const authHeader = req.headers['authorization'];

    // Nếu không có header -> chưa đăng nhập
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Bạn chưa đăng nhập. Vui lòng cung cấp token.',
        });
    }

    // Tách lấy phần token (bỏ chữ "Bearer ")
    // authHeader = "Bearer eyJhbGciOiJIUzI1NiIs..."
    // token      = "eyJhbGciOiJIUzI1NiIs..."
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token không đúng định dạng.',
        });
    }

    try {
        // Giải mã token bằng JWT_SECRET. Nếu token bị giả mạo hoặc hết hạn,
        // hàm này sẽ throw lỗi ngay lập tức.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Gắn thông tin user đã giải mã vào request để controller dùng sau
        // decoded = { id: 1, email: '...', role: 'customer', ... }
        req.user = decoded;

        // Cho request đi tiếp đến controller
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Token không hợp lệ hoặc đã hết hạn.',
        });
    }
};


// -----------------------------------------------------------
//  Middleware: verifyAdmin
//  Chức năng: Chỉ cho phép tài khoản có role = 'admin' đi tiếp.
//  PHẢI dùng SAU verifyToken (vì cần req.user đã được gắn trước).
// -----------------------------------------------------------
export const verifyAdmin = (req, res, next) => {
    // req.user được gắn bởi verifyToken ở bước trước
    if (req.user && req.user.role === 'admin') {
        next(); // Là admin -> cho đi tiếp
    } else {
        return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền thực hiện thao tác này. Yêu cầu quyền Quản trị viên (Admin).',
        });
    }
};

// Cho phép Admin hoặc bất kỳ nhân viên nào (warehouse, sales)
export const verifyStaffOrAdmin = (req, res, next) => {
    const allowed = ['admin', 'warehouse', 'sales'];
    if (req.user && allowed.includes(req.user.role)) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền truy cập khu vực quản trị.',
        });
    }
};

// Cho phép Admin hoặc nhân viên kho
export const verifyWarehouseOrAdmin = (req, res, next) => {
    const allowed = ['admin', 'warehouse'];
    if (req.user && allowed.includes(req.user.role)) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Chỉ Quản trị viên hoặc Nhân viên kho mới có quyền thực hiện.',
        });
    }
};

// Cho phép Admin hoặc nhân viên kinh doanh / CSKH
export const verifySalesOrAdmin = (req, res, next) => {
    const allowed = ['admin', 'sales'];
    if (req.user && allowed.includes(req.user.role)) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Chỉ Quản trị viên hoặc Nhân viên kinh doanh mới có quyền thực hiện.',
        });
    }
};

