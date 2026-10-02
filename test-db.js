import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function testDB() {
    try {
        const client = await pool.connect();
        console.log("✅ Đăng nhập Database thành công!");
        
        const res = await client.query('SELECT * FROM products');
        console.log(`✅ Bảng products tồn tại. Đang có ${res.rowCount} sản phẩm.`);
        client.release();
    } catch (err) {
        console.error("❌ Lỗi DB: ", err.message);
    } finally {
        pool.end();
    }
}
testDB();
