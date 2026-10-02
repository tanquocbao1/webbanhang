// ============================================================
//  src/models/product.model.js
//  Các câu truy vấn SQL liên quan đến bảng products
// ============================================================

import pool from '../config/db.js';

// -----------------------------------------------------------
//  Lấy tất cả sản phẩm (cho trang danh sách)
// -----------------------------------------------------------
export const getAllProducts = async () => {
    const result = await pool.query(
        'SELECT id, name, brand, price, stock_quantity, image_url, description FROM products ORDER BY created_at DESC'
    );
    return result.rows;
};

// -----------------------------------------------------------
//  Lấy chi tiết 1 sản phẩm theo id
// -----------------------------------------------------------
export const getProductById = async (id) => {
    const result = await pool.query(
        'SELECT * FROM products WHERE id = $1',
        [id]
    );
    return result.rows[0]; // undefined nếu không tìm thấy
};

// -----------------------------------------------------------
//  Tạo sản phẩm mới (Admin / Warehouse)
// -----------------------------------------------------------
export const createProduct = async ({ name, brand, price, stock_quantity = 0, image_url = '', description = '' }) => {
    const result = await pool.query(
        `INSERT INTO products (name, brand, price, stock_quantity, image_url, description)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [name, brand, price, stock_quantity, image_url, description]
    );
    return result.rows[0];
};

// -----------------------------------------------------------
//  Cập nhật sản phẩm (Admin / Warehouse)
// -----------------------------------------------------------
export const updateProduct = async (id, { name, brand, price, stock_quantity, image_url, description }) => {
    const result = await pool.query(
        `UPDATE products
         SET name = COALESCE($1, name),
             brand = COALESCE($2, brand),
             price = COALESCE($3, price),
             stock_quantity = COALESCE($4, stock_quantity),
             image_url = COALESCE($5, image_url),
             description = COALESCE($6, description)
         WHERE id = $7
         RETURNING *`,
        [name, brand, price, stock_quantity, image_url, description, id]
    );
    return result.rows[0];
};

// -----------------------------------------------------------
//  Xóa sản phẩm (Admin)
// -----------------------------------------------------------
export const deleteProduct = async (id) => {
    const result = await pool.query(
        'DELETE FROM products WHERE id = $1 RETURNING id, name',
        [id]
    );
    return result.rows[0];
};

