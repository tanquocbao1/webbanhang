// ============================================================
//  src/models/user.model.js
//  Các câu truy vấn SQL liên quan đến bảng users
// ============================================================

import pool from '../config/db.js';

// -----------------------------------------------------------
//  Tìm user theo email (dùng khi đăng nhập)
// -----------------------------------------------------------
export const findUserByEmail = async (email) => {
    // $1 là placeholder - pg tự động escape để chống SQL Injection
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );
    // result.rows là mảng kết quả, lấy phần tử đầu tiên (hoặc undefined)
    return result.rows[0];
};

// -----------------------------------------------------------
//  Tạo user mới (dùng khi đăng ký)
// -----------------------------------------------------------
export const createUser = async ({ email, passwordHash, fullName, role = 'customer' }) => {
    const result = await pool.query(
        `INSERT INTO users (email, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, full_name, role, created_at`,
        [email, passwordHash, fullName, role]
    );
    // RETURNING giúp lấy lại record vừa tạo mà không cần query thêm
    return result.rows[0];
};
