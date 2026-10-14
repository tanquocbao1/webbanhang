// ============================================================
//  src/controllers/admin.controller.js
//  Thống kê báo cáo Analytics & Quản lý người dùng (MongoDB)
// ============================================================

import mongoose from 'mongoose';
import Order from '../models/order.model.js';
import Installment from '../models/installment.model.js';
import Product from '../models/product.model.js';
import SupportContact from '../models/support.model.js';
import User from '../models/user.model.js';

// -----------------------------------------------------------
//  getAdminStatsController
// -----------------------------------------------------------
export const getAdminStatsController = async (req, res) => {
    try {
        // 1. Thống kê đơn hàng và doanh thu
        const total_orders = await Order.countDocuments();
        const completed_orders = await Order.countDocuments({ status: 'completed' });
        const shipping_orders = await Order.countDocuments({ status: 'shipping' });
        const processing_orders = await Order.countDocuments({ status: 'processing' });
        const pending_orders = await Order.countDocuments({ status: 'pending' });
        const cancelled_orders = await Order.countDocuments({ status: 'cancelled' });

        const revenueAgg = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$total_amount' } } },
        ]);
        const total_revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // 2. Thống kê trả góp
        const total_installments = await Installment.countDocuments();
        const pending_installments = await Installment.countDocuments({ status: 'pending' });
        const approved_installments = await Installment.countDocuments({ status: 'approved' });

        // 3. Thống kê sản phẩm
        const total_products = await Product.countDocuments();
        const low_stock_count = await Product.countDocuments({ stock_quantity: { $lte: 10 } });
        const out_of_stock_count = await Product.countDocuments({ stock_quantity: 0 });

        const lowStockProducts = await Product.find({ stock_quantity: { $lte: 10 } })
            .sort({ stock_quantity: 1 })
            .limit(10);

        // 4. Top 5 sản phẩm bán chạy nhất
        const topProducts = await Product.find()
            .sort({ sold: -1 })
            .limit(5);

        // 5. Thống kê doanh thu theo ngày (7 ngày gần nhất)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const revenueByDayAgg = await Order.aggregate([
            { $match: { created_at: { $gte: sevenDaysAgo }, status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%d/%m', date: '$created_at' } },
                    daily_revenue: { $sum: '$total_amount' },
                    daily_orders: { $sum: 1 },
                    min_date: { $min: '$created_at' },
                },
            },
            { $sort: { min_date: 1 } },
            {
                $project: {
                    _id: 0,
                    date_label: '$_id',
                    daily_revenue: 1,
                    daily_orders: 1,
                },
            },
        ]);

        // 6. Số lượng hỗ trợ CSKH
        const total_contacts = await SupportContact.countDocuments();
        const pending_contacts = await SupportContact.countDocuments({ status: 'pending' });

        const stats = {
            orders: {
                total_orders,
                completed_orders,
                shipping_orders,
                processing_orders,
                pending_orders,
                cancelled_orders,
                total_revenue,
            },
            installments: {
                total_installments,
                pending_installments,
                approved_installments,
            },
            products: {
                total_products,
                low_stock_count,
                out_of_stock_count,
            },
            support: {
                total_contacts,
                pending_contacts,
            },
            low_stock_products: lowStockProducts,
            top_products: topProducts.map((p) => ({
                id: p._id.toString(),
                name: p.name,
                brand: p.brand,
                price: p.price,
                image_url: p.image_url,
                total_sold: p.sold || 0,
                total_sales_amount: (p.sold || 0) * p.price,
            })),
            revenue_by_day: revenueByDayAgg,
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
// -----------------------------------------------------------
export const getUsersController = async (req, res) => {
    try {
        const users = await User.find().sort({ created_at: -1 });

        const userStats = await Promise.all(
            users.map(async (u) => {
                const uid = u._id.toString();
                const orders = await Order.find({
                    $or: [{ user_id: u._id }, { user_id: uid }, { user_id: u.id }],
                });
                const total_orders = orders.length;
                const total_spent = orders
                    .filter((o) => o.status === 'completed')
                    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

                return {
                    id: uid,
                    full_name: u.full_name,
                    email: u.email,
                    role: u.role,
                    created_at: u.created_at,
                    total_orders,
                    total_spent,
                };
            })
        );

        return res.status(200).json({
            success: true,
            total: userStats.length,
            data: userStats,
        });
    } catch (err) {
        console.error('❌ Lỗi getUsersController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách người dùng.' });
    }
};

// -----------------------------------------------------------
//  updateUserRoleController
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

        if (req.user.id == userId && role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Không thể tự thay đổi vai trò của chính mình.',
            });
        }

        const filter = mongoose.Types.ObjectId.isValid(userId)
            ? { _id: userId }
            : { $or: [{ _id: userId }, { id: userId }] };

        const updated = await User.findOneAndUpdate(filter, { $set: { role } }, { new: true });

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng này.' });
        }

        return res.status(200).json({
            success: true,
            message: `Cập nhật vai trò thành "${role}" thành công!`,
            data: {
                id: updated._id.toString(),
                full_name: updated.full_name,
                email: updated.email,
                role: updated.role,
            },
        });
    } catch (err) {
        console.error('❌ Lỗi updateUserRoleController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi phân quyền.' });
    }
};
