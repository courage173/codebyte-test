const ErrorService = require('./errorService');
const likeModel = require('../models/likes');
const PostService = require('./postService');

module.exports = {
    likePost: async function(data) {
        try {
            const _this = this;
            //check if the user previously liked the post
            let like = await _this.findOneBy({
                postId: data.postId,
                userId: data.userId,
            });
            //if it exist simply update it on the db else create it
            if (like) {
                like = await _this.updateOneBy(
                    {
                        _id: like._id,
                    },
                    { liked: true }
                );
            } else {
                like = await _this.create(data);
            }
            //increment the like count on the post
            await PostService.updateOneBy(
                { _id: data.postId },
                { likeCount: data.likeCount + 1 }
            );

            return like;
        } catch (error) {
            ErrorService.log('likeService.create', error);
            throw error;
        }
    },
    unLikePost: async function(data) {
        try {
            const _this = this;
            //if it exist simply update it on the db
            const like = await _this.updateOneBy(
                {
                    postId: data.postId,
                    userId: data.userId,
                },
                { liked: false }
            );
            //decrement the like count on the post
            await PostService.updateOneBy(
                { _id: data.postId },
                { likeCount: data.likeCount > 0 ? data.likeCount - 1 : 0 }
            );

            return like;
        } catch (error) {
            ErrorService.log('likeService.unLikePost', error);
            throw error;
        }
    },
    create: async function(data) {
        try {
            const LikeModel = new likeModel();
            LikeModel.liked = true;
            LikeModel.postId = data.postId;
            LikeModel.userId = data.userId;
            LikeModel.createdAt = data.createdAt || Date.now();
            const like = await LikeModel.save();
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
            const likes = await likeModel
                .find(query)
                .populate('userId', 'firstName lastName email')
                .sort([['createdAt', -1]])
                .skip(skip)
                .limit(limit);
            const count = await likeModel.countDocuments(query);
            const response = {};
            response.likes = likes;
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
            ErrorService.log('likeService.deleteOneBy', error);
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
