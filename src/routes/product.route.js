// ============================================================
//  src/routes/product.route.js
// ============================================================

import { Router } from 'express';
import { verifyToken, verifyAdmin, verifyWarehouseOrAdmin } from '../middlewares/auth.middleware.js';
import {
    getAllProductsController,
    getProductByIdController,
    createProductController,
    updateProductController,
    updateProductStockController,
    deleteProductController,
} from '../controllers/product.controller.js';

const router = Router();

// GET /api/products - Xem danh sách sản phẩm (ai cũng xem được)
router.get('/', getAllProductsController);

// GET /api/products/:productId - Xem chi tiết sản phẩm
router.get('/:productId', getProductByIdController);

// POST /api/products - Thêm sản phẩm mới (Admin hoặc Warehouse)
router.post('/', verifyToken, verifyWarehouseOrAdmin, createProductController);

// PUT /api/products/:productId - Cập nhật sản phẩm (Admin hoặc Warehouse)
router.put('/:productId', verifyToken, verifyWarehouseOrAdmin, updateProductController);

// PATCH /api/products/:productId/stock - Bớt / tăng / cập nhật số lượng tồn kho (Admin hoặc Warehouse)
router.patch('/:productId/stock', verifyToken, verifyWarehouseOrAdmin, updateProductStockController);

// DELETE /api/products/:productId - Xóa sản phẩm (Chỉ Admin)
router.delete('/:productId', verifyToken, verifyAdmin, deleteProductController);

export default router;
