const mongoose = require('../config/db');

const Schema = mongoose.Schema;
const postSchema = new Schema({
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
    likeCount: {
        type: Number,
        default: 0,
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

module.exports = mongoose.model('Post', postSchema);
