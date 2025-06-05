const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CouponSchema = new Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed_amount'],
            required: true
        },
        discountValue: {
            type: Number,
            required: true
        },
        minOrderAmount: {
            type: Number,
            default: 0
        },
        maxDiscountAmount: {
            type: Number,
            default: 0
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        usageLimit: {
            type: Number,
            default: 100
        },
        usedCount: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Coupon = mongoose.model('Coupon', CouponSchema);
module.exports = Coupon;
