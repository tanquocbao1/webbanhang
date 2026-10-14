// ============================================================
//  src/server.js - Cập nhật: Phục vụ cả file tĩnh (Frontend)
// ============================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

import authRoutes        from './routes/auth.route.js';
import productRoutes     from './routes/product.route.js';
import orderRoutes       from './routes/order.route.js';
import installmentRoutes from './routes/installment.route.js';
import supportRoutes     from './routes/support.route.js';
import voucherRoutes     from './routes/voucher.route.js';
import adminRoutes       from './routes/admin.route.js';
import userRoutes       from './routes/user.route.js';

import { connectDB } from './config/db.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;

// Lấy đường dẫn thư mục hiện tại (thay thế __dirname trong ES Module)
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ============================================================
//  MIDDLEWARE TOÀN CỤC
// ============================================================
app.use(cors());
app.use(express.json());

// Phục vụ các file tĩnh (HTML, CSS, JS) từ thư mục public/
app.use(express.static(path.join(__dirname, '..', 'public')));

// ============================================================
//  API ROUTES
// ============================================================
app.use('/api/auth',         authRoutes);
app.use('/api/user',         userRoutes);
app.use('/api/products',     productRoutes);
app.use('/api/orders',       orderRoutes);
app.use('/api/installments', installmentRoutes);
app.use('/api/contacts',     supportRoutes);
app.use('/api/vouchers',     voucherRoutes);
app.use('/api/admin',        adminRoutes);


// Route trang thanh toán / xác nhận đơn hàng
app.get('/thanh-toan', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'thanh-toan.html'));
});

// Mọi route không khớp với /api/* sẽ trả về index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ============================================================
//  KHỞI ĐỘNG SERVER
// ============================================================
app.listen(PORT, async () => {
    console.log(`\n🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`📋 Môi trường: ${process.env.NODE_ENV || 'development'}`);
    await connectDB();
});
