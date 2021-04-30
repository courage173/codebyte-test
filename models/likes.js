const mongoose = require('../config/db');

const Schema = mongoose.Schema;
const likeSchema = new Schema({
    liked: {
        type: Boolean,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    userId: {
        type: String,
        ref: 'User',
    },
    postId: {
        type: String,
        ref: 'Post',
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    deleted: { type: Boolean, default: false },
    deletedAt: {
        type: Date,
    },
    deletedById: { type: String, ref: 'User', index: true },
});

module.exports = mongoose.model('Like', likeSchema);
