// ============================================================
//  src/config/db.js
//  Kết nối đến MongoDB bằng thư viện Mongoose
// ============================================================

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/phi_mobile_shop';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`✅ Đã kết nối thành công đến MongoDB: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
    } catch (err) {
        console.error('❌ Lỗi kết nối MongoDB:', err.message);
        console.error('👉 Vui lòng đảm bảo MongoDB Server/Compass đang chạy trên máy tính hoặc kiểm tra MONGODB_URI trong .env');
        return null;
    }
};

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ Mất kết nối tới MongoDB!');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Lỗi MongoDB:', err.message);
});

export default mongoose;
