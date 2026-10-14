// ============================================================
//  src/models/installment.model.js
//  Mongoose Model cho hồ sơ trả góp (MongoDB)
// ============================================================

import mongoose from 'mongoose';

const installmentSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
            ref: 'User',
        },
        product_id: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        product_name: {
            type: String,
            default: '',
        },
        product_brand: {
            type: String,
            default: '',
        },
        product_price: {
            type: Number,
            default: 0,
        },
        product_image: {
            type: String,
            default: '',
        },
        customer_name: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        id_card: {
            type: String,
            default: null,
            trim: true,
        },
        address: {
            type: String,
            default: null,
            trim: true,
        },
        method: {
            type: String,
            enum: ['finance', 'credit_card'],
            default: 'finance',
        },
        term_months: {
            type: Number,
            required: true,
        },
        prepaid_percent: {
            type: Number,
            default: 0,
        },
        prepaid_amount: {
            type: Number,
            default: 0,
        },
        monthly_payment: {
            type: Number,
            default: 0,
        },
        total_payment: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'need_info', 'rejected'],
            default: 'pending',
        },
        admin_notes: {
            type: String,
            default: '',
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

export const Installment = mongoose.models.Installment || mongoose.model('Installment', installmentSchema);
export default Installment;
