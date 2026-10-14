import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/phi_mobile_shop';

async function testDB() {
    try {
        console.log(`🔌 Đang kết nối thử tới MongoDB: ${MONGODB_URI} ...`);
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("✅ Kết nối MongoDB thành công!");

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`✅ Database hiện có ${collections.length} collections:`, collections.map(c => c.name).join(', ') || '(trống)');
    } catch (err) {
        console.error("❌ Lỗi kết nối MongoDB:", err.message);
        console.log("👉 Hướng dẫn: Đảm bảo phần mềm MongoDB (MongoDB Compass / MongoDB Community Server) đang chạy trên máy tính của bạn.");
    } finally {
        await mongoose.disconnect();
    }
}

testDB();
