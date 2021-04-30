const mongoose = require('../config/db');

const Schema = mongoose.Schema;
const commentchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    userId: {
        type: String,
        ref: 'User',
        required: true,
    },
    postId: {
        type: String,
        ref: 'Post',
        required: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    deleted: { type: Boolean, default: false },
    deletedAt: {
        type: Date,
    },
    deletedById: { type: String, ref: 'User' },
});

module.exports = mongoose.model('Comment', commentchema);
