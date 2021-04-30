const ErrorService = require('./errorService');
const PostModel = require('../models/post');

module.exports = {
    create: async function(data) {
        try {
            const postModel = new PostModel();
            postModel.content = data.content;
            postModel.userId = data.userId;
            postModel.createdAt = data.createdAt || Date.now();
            const post = await postModel.save();
            return post;
        } catch (error) {
            ErrorService.log('postService.create', error);
            throw error;
        }
    },
    findOneBy: async function(query) {
        try {
            const post = await PostModel.findOne(query).populate(
                'userId',
                'firstName lastName email'
            );
            return post;
        } catch (error) {
            ErrorService.log('postService.findOneBy', error);
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
            query.deleted = false;
            const posts = await PostModel.find(query)
                .populate('userId', 'firstName lastName email')
                .sort([['createdAt', -1]])
                .skip(skip)
                .limit(limit);
            const count = await PostModel.countDocuments(query);
            const response = {};
            response.post = posts;
            response.count = count;
            response.limit = limit;
            response.skip = skip;

            return response;
        } catch (error) {
            ErrorService.log('postService.findBy', error);
            throw error;
        }
    },
    updateOneBy: async function(query, data) {
        try {
            data.updatedAt = Date.now();
            if (!query.deleted) {
                query.deleted = false;
            }
            const post = await PostModel.findOneAndUpdate(
                query,
                {
                    $set: data,
                },
                { new: true }
            );
            return post;
        } catch (error) {
            ErrorService.log('postService.updateOneBy', error);
            throw error;
        }
    },
    deleteOneBy: async function(query) {
        try {
            await PostModel.deleteOne(query);
            return 'deleted successfully';
        } catch (error) {
            ErrorService.log('postService.hardDelete', error);
            throw error;
        }
    },
    hardDelete: async function(query) {
        try {
            await PostModel.deleteMany(query);
            return 'deleted successfully';
        } catch (error) {
            ErrorService.log('postService.hardDelete', error);
            throw error;
        }
    },
};
