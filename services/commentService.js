const ErrorService = require('./errorService');
const CommentModel = require('../models/comments');

module.exports = {
    create: async function(data) {
        try {
            const commentModel = new CommentModel();
            commentModel.content = data.content;
            commentModel.postId = data.postId;
            commentModel.userId = data.userId;
            commentModel.createdAt = data.createdAt || Date.now();
            const reply = await commentModel.save();
            return reply;
        } catch (error) {
            ErrorService.log('commentService.create', error);
            throw error;
        }
    },
    findOneBy: async function(query) {
        try {
            const reply = await CommentModel.findOne(query).populate(
                'userId',
                'firstName lastName email'
            );
            return reply;
        } catch (error) {
            ErrorService.log('commentService.findOneBy', error);
            throw error;
        }
    },
    findBy: async function(query, skip, limit) {
        try {
            if (!skip) skip = 0;

            if (!limit) limit = 10;

            if (typeof skip === 'string') skip = parseInt(skip);

            if (typeof limit === 'string') limit = parseInt(limit);

            if (!query) query = {};
            const comments = await CommentModel.find(query)
                .populate('userId', 'firstName lastName email')
                .sort([['createdAt', -1]])
                .skip(skip)
                .limit(limit);
            const count = await CommentModel.countDocuments(query);
            const response = {};
            response.comments = comments;
            response.count = count;
            response.limit = limit;
            response.skip = skip;

            return response;
        } catch (error) {
            ErrorService.log('commentService.findBy', error);
            throw error;
        }
    },
    updateOneBy: async function(query, data) {
        try {
            data.updatedAt = Date.now();
            const reply = await CommentModel.findOneAndUpdate(
                query,
                {
                    $set: data,
                },
                { new: true }
            );
            return reply;
        } catch (error) {
            ErrorService.log('commentService.updateOneBy', error);
            throw error;
        }
    },
    deleteOneBy: async function(query) {
        try {
            await CommentModel.deleteOne(query);
            return 'deleted successfully';
        } catch (error) {
            ErrorService.log('commentService.hardDelete', error);
            throw error;
        }
    },
    hardDelete: async function(query) {
        try {
            await CommentModel.deleteMany(query);
            return 'deleted successfully';
        } catch (error) {
            ErrorService.log('commentService.hardDelete', error);
            throw error;
        }
    },
};
