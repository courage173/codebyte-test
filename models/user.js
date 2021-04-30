const mongoose = require('../config/db');

const Schema = mongoose.Schema;
const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        required: true,
    },
    password: String,
    isVerified: {
        type: Boolean,
        default: false,
    },
    referral: String,
    profilePic: String,
    phone: String,
    dateOfBirth: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    verificationToken: {
        type: String,
    },
    resetPasswordToken: {
        type: String,
        default: null,
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
    },
});

module.exports = mongoose.model('User', userSchema);
