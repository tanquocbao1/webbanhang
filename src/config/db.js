// ============================================================
//  src/config/db.js
//  Kết nối đến PostgreSQL bằng thư viện 'pg'
// ============================================================

import pg from 'pg';
import dotenv from 'dotenv';

// Nạp các biến môi trường từ file .env vào process.env
dotenv.config();

const { Pool } = pg;

// Pool (bể kết nối): thay vì tạo kết nối mới cho mỗi request,
// Pool tái sử dụng các kết nối sẵn có -> tiết kiệm tài nguyên hơn
const pool = new Pool({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Lắng nghe sự kiện kết nối thành công để biết DB đã sẵn sàng
pool.on('connect', () => {
    console.log('✅ Đã kết nối thành công đến PostgreSQL!');
});

// Lắng nghe lỗi kết nối không mong muốn
pool.on('error', (err) => {
    console.error('❌ Lỗi kết nối PostgreSQL:', err.message);
    process.exit(1); // Thoát chương trình nếu không kết nối được DB
});

export default pool;
