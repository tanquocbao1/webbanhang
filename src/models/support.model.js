// ============================================================
//  src/models/support.model.js
//  Mongoose Model cho liên hệ hỗ trợ / CSKH (MongoDB)
// ============================================================

import mongoose from 'mongoose';

const supportSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
            ref: 'User',
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            default: null,
            trim: true,
        },
        subject: {
            type: String,
            default: 'Yêu cầu tư vấn',
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'processed'],
            default: 'pending',
        },
        admin_reply: {
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

export const SupportContact = mongoose.models.SupportContact || mongoose.model('SupportContact', supportSchema);
export default SupportContact;
