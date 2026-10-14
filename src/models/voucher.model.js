// ============================================================
//  src/models/voucher.model.js
//  Mongoose Model cho mã giảm giá / khuyến mãi (MongoDB)
// ============================================================

import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Mã voucher là bắt buộc'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        title: {
            type: String,
            required: [true, 'Tiêu đề khuyến mãi là bắt buộc'],
            trim: true,
        },
        discount_percent: {
            type: Number,
            default: 0,
        },
        discount_amount: {
            type: Number,
            default: 0,
        },
        min_order_amount: {
            type: Number,
            default: 0,
        },
        max_discount: {
            type: Number,
            default: 0,
        },
        usage_limit: {
            type: Number,
            default: 100,
        },
        used_count: {
            type: Number,
            default: 0,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        expires_at: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id.toString();
                return ret;
            },
        },
        toObject: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id.toString();
                return ret;
            },
        },
    }
);

export const Voucher = mongoose.models.Voucher || mongoose.model('Voucher', voucherSchema);
export default Voucher;
