// ============================================================
//  src/models/order.model.js
//  Mongoose Model cho đơn hàng (MongoDB)
// ============================================================

import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
    {
        product_id: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        product_name: {
            type: String,
            required: true,
        },
        image_url: {
            type: String,
            default: '',
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
            ref: 'User',
        },
        customer_name: {
            type: String,
            default: '',
            trim: true,
        },
        phone: {
            type: String,
            default: '',
            trim: true,
        },
        shipping_address: {
            type: String,
            required: [true, 'Địa chỉ giao hàng là bắt buộc'],
            trim: true,
        },
        payment_method: {
            type: String,
            default: 'cod',
        },
        note: {
            type: String,
            default: '',
        },
        total_amount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipping', 'completed', 'cancelled'],
            default: 'pending',
        },
        items: [orderItemSchema],
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id.toString();
                ret.order_id = ret._id.toString();
                return ret;
            },
        },
        toObject: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id.toString();
                ret.order_id = ret._id.toString();
                return ret;
            },
        },
    }
);

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
