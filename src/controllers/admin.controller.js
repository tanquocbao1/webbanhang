// ============================================================
//  src/controllers/admin.controller.js
//  Thống kê báo cáo Analytics & Quản lý người dùng, phân quyền
// ============================================================

import pool from '../config/db.js';

// -----------------------------------------------------------
//  getAdminStatsController
//  Thống kê tổng quan: Doanh thu, số đơn, tỉ lệ thành công,
//  top điện thoại bán chạy, cảnh báo tồn kho, doanh thu theo ngày
// -----------------------------------------------------------
export const getAdminStatsController = async (req, res) => {
    try {
        // 1. Thống kê đơn hàng và doanh thu
        const orderStats = await pool.query(`
            SELECT 
                COUNT(*) AS total_orders,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_orders,
                COUNT(CASE WHEN status = 'shipping' THEN 1 END) AS shipping_orders,
                COUNT(CASE WHEN status = 'processing' THEN 1 END) AS processing_orders,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_orders,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled_orders,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) AS total_revenue
            FROM orders
        `);

        // 2. Thống kê trả góp
        const instStats = await pool.query(`
            SELECT 
                COUNT(*) AS total_installments,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_installments,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) AS approved_installments
            FROM installments
        `);

        // 3. Thống kê sản phẩm & Cảnh báo tồn kho (< 10)
        const prodStats = await pool.query(`
            SELECT 
                COUNT(*) AS total_products,
                COUNT(CASE WHEN stock_quantity <= 10 THEN 1 END) AS low_stock_count,
                COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) AS out_of_stock_count
            FROM products
        `);

        // Danh sách các sản phẩm sắp hết hàng (tồn <= 10)
        const lowStockProducts = await pool.query(`
            SELECT id, name, brand, price, stock_quantity, image_url
            FROM products
            WHERE stock_quantity <= 10
            ORDER BY stock_quantity ASC
            LIMIT 10
        `);

        // 4. Top 5 sản phẩm bán chạy nhất
        const topProducts = await pool.query(`
            SELECT 
                p.id,
                p.name,
                p.brand,
                p.price,
                p.image_url,
                COALESCE(SUM(oi.quantity), 0) AS total_sold,
                COALESCE(SUM(oi.quantity * oi.price), 0) AS total_sales_amount
            FROM products p
            JOIN order_items oi ON oi.product_id = p.id
            JOIN orders o ON o.id = oi.order_id
            WHERE o.status != 'cancelled'
            GROUP BY p.id, p.name, p.brand, p.price, p.image_url
            ORDER BY total_sold DESC
            LIMIT 5
        `);

        // 5. Thống kê doanh thu theo ngày (7 ngày gần nhất)
        const revenueByDay = await pool.query(`
            SELECT 
                TO_CHAR(created_at, 'DD/MM') AS date_label,
                COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) AS daily_revenue,
                COUNT(id) AS daily_orders
            FROM orders
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY TO_CHAR(created_at, 'DD/MM')
            ORDER BY MIN(created_at) ASC
        `);

        // 6. Số lượng hỗ trợ CSKH
        const suppStats = await pool.query(`
            SELECT 
                COUNT(*) AS total_contacts,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_contacts
            FROM support_contacts
        `);

        const stats = {
            orders: orderStats.rows[0],
            installments: instStats.rows[0],
            products: prodStats.rows[0],
            support: suppStats.rows[0],
            low_stock_products: lowStockProducts.rows,
            top_products: topProducts.rows,
            revenue_by_day: revenueByDay.rows,
        };

        return res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (err) {
        console.error('❌ Lỗi getAdminStatsController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi tính toán thống kê.' });
    }
};

// -----------------------------------------------------------
//  getUsersController
//  Lấy danh sách người dùng kèm lịch sử tổng quan và vai trò
// -----------------------------------------------------------
export const getUsersController = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.id,
                u.full_name,
                u.email,
                u.role,
                u.created_at,
                COUNT(DISTINCT o.id) AS total_orders,
                COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) AS total_spent
            FROM users u
            LEFT JOIN orders o ON o.user_id = u.id
            GROUP BY u.id, u.full_name, u.email, u.role, u.created_at
            ORDER BY u.created_at DESC
        `);

        return res.status(200).json({
            success: true,
            total: result.rows.length,
            data: result.rows,
        });
    } catch (err) {
        console.error('❌ Lỗi getUsersController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách người dùng.' });
    }
};

// -----------------------------------------------------------
//  updateUserRoleController
//  Cập nhật phân quyền nhân viên / khách hàng (Chỉ Admin)
// -----------------------------------------------------------
export const updateUserRoleController = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        const validRoles = ['admin', 'warehouse', 'sales', 'customer'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Vai trò không hợp lệ. Chỉ chấp nhận: ${validRoles.join(', ')}`,
            });
        }

        // Không cho phép tự giáng cấp tài khoản chính mình nếu là admin duy nhất
        if (req.user.id == userId && role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Không thể tự thay đổi vai trò của chính mình.',
            });
        }

        const result = await pool.query(
            `UPDATE users
             SET role = $1
             WHERE id = $2
             RETURNING id, full_name, email, role`,
            [role, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng này.' });
        }

        return res.status(200).json({
            success: true,
            message: `Cập nhật vai trò thành "${role}" thành công!`,
            data: result.rows[0],
        });
    } catch (err) {
        console.error('❌ Lỗi updateUserRoleController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi phân quyền.' });
    }
};
