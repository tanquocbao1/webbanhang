// ============================================================
//  src/models/notification.model.js
//  Mongoose Model cho thông báo người dùng (MongoDB)
// ============================================================

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
            ref: 'User',
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ['admin_reply', 'order_status', 'system', 'promo'],
            default: 'admin_reply',
        },
        reference_id: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        is_read: {
            type: Boolean,
            default: false,
            index: true,
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

export const UserNotification = mongoose.models.UserNotification || mongoose.model('UserNotification', notificationSchema);
export default UserNotification;
