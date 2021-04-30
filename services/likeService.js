const ErrorService = require('./errorService');
const likeModel = require('../models/likes');

module.exports = {
    create: async function(data) {
        try {
            const likeModel = new likeModel();
            likeModel.content = data.content;
            likeModel.postId = data.postId;
            likeModel.userId = data.userId;
            likeModel.createdAt = data.createdAt || Date.now();
            const like = await likeModel.save();
            return like;
        } catch (error) {
            ErrorService.log('likeService.create', error);
            throw error;
        }
    },
    findOneBy: async function(query) {
        try {
            const like = await likeModel
                .findOne(query)
                .populate('userId', 'firstName lastName email');
            return like;
        } catch (error) {
            ErrorService.log('likeService.findOneBy', error);
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
            const posts = await likeModel
                .find(query)
                .populate('userId', 'firstName lastName email')
                .sort([['createdAt', -1]])
                .skip(skip)
                .limit(limit);
            const count = await likeModel.countDocuments(query);
            const response = {};
            response.post = posts;
            response.count = count;
            response.limit = limit;
            response.skip = skip;

            return response;
        } catch (error) {
            ErrorService.log('likeService.findBy', error);
            throw error;
        }
    },
    updateOneBy: async function(query, data) {
        try {
            data.updatedAt = Date.now();
            const like = await likeModel.findOneAndUpdate(
                query,
                {
                    $set: data,
                },
                { new: true }
            );
            return like;
        } catch (error) {
            ErrorService.log('likeService.updateOneBy', error);
            throw error;
        }
    },
    deleteOneBy: async function(query) {
        try {
            await likeModel.deleteOne(query);
            return 'deleted successfully';
        } catch (error) {
            ErrorService.log('likeService.hardDelete', error);
            throw error;
        }
    },
    hardDelete: async function(query) {
        try {
            await likeModel.deleteMany(query);
            return 'deleted successfully';
        } catch (error) {
            ErrorService.log('likeService.hardDelete', error);
            throw error;
        }
    },
};
