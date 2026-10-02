// ============================================================
//  src/controllers/product.controller.js
//  Xử lý request liên quan đến sản phẩm
// ============================================================

import * as productModel from '../models/product.model.js';

// Lấy danh sách tất cả sản phẩm
export const getAllProductsController = async (req, res) => {
    try {
        const products = await productModel.getAllProducts();
        return res.status(200).json({
            success: true,
            total: products.length,
            data: products,
        });
    } catch (err) {
        console.error('❌ Lỗi getAllProducts:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
};

// Lấy chi tiết 1 sản phẩm
export const getProductByIdController = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await productModel.getProductById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm.',
            });
        }

        return res.status(200).json({ success: true, data: product });
    } catch (err) {
        console.error('❌ Lỗi getProductById:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
};

// Tạo sản phẩm mới (Admin / Warehouse)
export const createProductController = async (req, res) => {
    try {
        const { name, brand, price, stock_quantity, image_url, description } = req.body;

        if (!name || !brand || price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ tên, thương hiệu và giá sản phẩm.',
            });
        }

        const newProduct = await productModel.createProduct({
            name: name.trim(),
            brand: brand.trim(),
            price: parseFloat(price),
            stock_quantity: parseInt(stock_quantity) || 0,
            image_url: image_url ? image_url.trim() : '',
            description: description ? description.trim() : '',
        });

        return res.status(201).json({
            success: true,
            message: 'Thêm sản phẩm mới thành công!',
            data: newProduct,
        });
    } catch (err) {
        console.error('❌ Lỗi createProductController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tạo sản phẩm.' });
    }
};

// Cập nhật sản phẩm (Admin / Warehouse)
export const updateProductController = async (req, res) => {
    try {
        const { productId } = req.params;
        const { name, brand, price, stock_quantity, image_url, description } = req.body;

        const updated = await productModel.updateProduct(productId, {
            name: name ? name.trim() : undefined,
            brand: brand ? brand.trim() : undefined,
            price: price !== undefined ? parseFloat(price) : undefined,
            stock_quantity: stock_quantity !== undefined ? parseInt(stock_quantity) : undefined,
            image_url: image_url !== undefined ? image_url.trim() : undefined,
            description: description !== undefined ? description.trim() : undefined,
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm để cập nhật.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin sản phẩm thành công!',
            data: updated,
        });
    } catch (err) {
        console.error('❌ Lỗi updateProductController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật sản phẩm.' });
    }
};

// Cập nhật số lượng tồn kho (bớt / tăng tồn kho) (Admin / Warehouse)
export const updateProductStockController = async (req, res) => {
    try {
        const { productId } = req.params;
        const { stock_quantity, delta } = req.body;

        const product = await productModel.getProductById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
        }

        let newStock = 0;
        if (stock_quantity !== undefined) {
            newStock = Math.max(0, parseInt(stock_quantity, 10));
        } else if (delta !== undefined) {
            newStock = Math.max(0, parseInt(product.stock_quantity || 0, 10) + parseInt(delta, 10));
        } else {
            return res.status(400).json({ success: false, message: 'Cần truyền stock_quantity hoặc delta.' });
        }

        const updated = await productModel.updateProduct(productId, { stock_quantity: newStock });
        return res.status(200).json({
            success: true,
            message: `Đã cập nhật tồn kho sản phẩm "${product.name}" thành ${newStock}.`,
            data: updated,
        });
    } catch (err) {
        console.error('❌ Lỗi updateProductStockController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật tồn kho.' });
    }
};

// Xóa sản phẩm (Admin)
export const deleteProductController = async (req, res) => {
    try {
        const { productId } = req.params;
        const deleted = await productModel.deleteProduct(productId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm để xóa.',
            });
        }

        return res.status(200).json({
            success: true,
            message: `Đã xóa sản phẩm "${deleted.name}" thành công!`,
            data: deleted,
        });
    } catch (err) {
        console.error('❌ Lỗi deleteProductController:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xóa sản phẩm.' });
    }
};

