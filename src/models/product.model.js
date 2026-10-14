// ============================================================
//  src/models/product.model.js
//  Mongoose Model & Helpers cho bảng products (MongoDB)
// ============================================================

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        custom_id: {
            type: Number,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Tên sản phẩm là bắt buộc'],
            trim: true,
        },
        brand: {
            type: String,
            required: [true, 'Hãng sản xuất là bắt buộc'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Giá sản phẩm là bắt buộc'],
            min: [0, 'Giá không được âm'],
        },
        stock_quantity: {
            type: Number,
            default: 0,
            min: [0, 'Số lượng tồn kho không được âm'],
        },
        image_url: {
            type: String,
            default: '',
            trim: true,
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
        sold: {
            type: Number,
            default: 0,
            min: 0,
        },
        category: {
            type: String,
            default: 'Điện thoại',
            trim: true,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret.custom_id || ret._id.toString();
                return ret;
            },
        },
        toObject: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret.custom_id || ret._id.toString();
                return ret;
            },
        },
    }
);

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// -----------------------------------------------------------
//  Lấy tất cả sản phẩm (cho trang danh sách)
// -----------------------------------------------------------
export const getAllProducts = async () => {
    return await Product.find().sort({ created_at: -1 });
};

// -----------------------------------------------------------
//  Lấy chi tiết 1 sản phẩm theo id (hỗ trợ cả ObjectId và Number)
// -----------------------------------------------------------
export const getProductById = async (id) => {
    if (!id) return null;
    try {
        if (mongoose.Types.ObjectId.isValid(id)) {
            const byObjId = await Product.findById(id);
            if (byObjId) return byObjId;
        }
        const numericId = Number(id);
        if (!isNaN(numericId)) {
            const byCustomId = await Product.findOne({ custom_id: numericId });
            if (byCustomId) return byCustomId;
        }
        return await Product.findOne({ _id: id });
    } catch {
        return null;
    }
};

// -----------------------------------------------------------
//  Tạo sản phẩm mới (Admin / Warehouse)
// -----------------------------------------------------------
export const createProduct = async ({ name, brand, price, stock_quantity = 0, image_url = '', description = '', custom_id = null }) => {
    return await Product.create({
        custom_id,
        name,
        brand,
        price,
        stock_quantity,
        image_url,
        description,
    });
};

// -----------------------------------------------------------
//  Cập nhật sản phẩm (Admin / Warehouse)
// -----------------------------------------------------------
export const updateProduct = async (id, updateData) => {
    const filter = mongoose.Types.ObjectId.isValid(id)
        ? { _id: id }
        : { $or: [{ custom_id: Number(id) || -1 }, { _id: id }] };

    const updateFields = {};
    if (updateData.name !== undefined) updateFields.name = updateData.name;
    if (updateData.brand !== undefined) updateFields.brand = updateData.brand;
    if (updateData.price !== undefined) updateFields.price = updateData.price;
    if (updateData.stock_quantity !== undefined) updateFields.stock_quantity = updateData.stock_quantity;
    if (updateData.image_url !== undefined) updateFields.image_url = updateData.image_url;
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.sold !== undefined) updateFields.sold = updateData.sold;

    return await Product.findOneAndUpdate(filter, { $set: updateFields }, { new: true });
};

// -----------------------------------------------------------
//  Xóa sản phẩm (Admin)
// -----------------------------------------------------------
export const deleteProduct = async (id) => {
    const filter = mongoose.Types.ObjectId.isValid(id)
        ? { _id: id }
        : { $or: [{ custom_id: Number(id) || -1 }, { _id: id }] };

    return await Product.findOneAndDelete(filter);
};

export default Product;
