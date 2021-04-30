const ErrorService = require('./errorService');
const replyModel = require('../models/replies');

module.exports = {
    create: async function(data) {
        try {
            const replyModel = new replyModel();
            replyModel.content = data.content;
            replyModel.postId = data.postId;
            replyModel.userId = data.userId;
            replyModel.createdAt = data.createdAt || Date.now();
            const reply = await replyModel.save();
            return reply;
        } catch (error) {
            ErrorService.log('replyService.create', error);
            throw error;
        }
    },
    findOneBy: async function(query) {
        try {
            const reply = await replyModel
                .findOne(query)
                .populate('userId', 'firstName lastName email');
            return reply;
        } catch (error) {
            ErrorService.log('replyService.findOneBy', error);
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
            const posts = await replyModel
                .find(query)
                .populate('userId', 'firstName lastName email')
                .sort([['createdAt', -1]])
                .skip(skip)
                .limit(limit);
            const count = await replyModel.countDocuments(query);
            const response = {};
            response.post = posts;
            response.count = count;
            response.limit = limit;
            response.skip = skip;

            return response;
        } catch (error) {
            ErrorService.log('replyService.findBy', error);
            throw error;
        }
    },
    updateOneBy: async function(query, data) {
        try {
            data.updatedAt = Date.now();
            const reply = await replyModel.findOneAndUpdate(
                query,
                {
                    $set: data,
                },
                { new: true }
            );
            return reply;
        } catch (error) {
            ErrorService.log('replyService.updateOneBy', error);
            throw error;
        }
    },
    deleteOneBy: async function(query) {
        try {
            await replyModel.deleteOne(query);
            return 'deleted successfully';
        } catch (error) {
            ErrorService.log('replyService.hardDelete', error);
            throw error;
        }
    },
    hardDelete: async function(query) {
        try {
            await replyModel.deleteMany(query);
            return 'deleted successfully';
        } catch (error) {
            ErrorService.log('replyService.hardDelete', error);
            throw error;
        }
    },
};
