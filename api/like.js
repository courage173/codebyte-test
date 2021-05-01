const express = require('express');
const router = express.Router();
const sendErrorResponse = require('../utils/response').sendErrorResponse;
const sendItemResponse = require('../utils/response').sendItemResponse;
const LikeService = require('../services/likeService');
const PostService = require('../services/postService');
const { getUser } = require('../middlewares/user');

router.post('/:postId', getUser, async (req, res) => {
    try {
        const data = req.body;
        const { postId } = req.params;
        data.userId = req.user.id;
        if (!data.userId) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'user id must be present',
            });
        }
        const post = await PostService.findOneBy({ _id: postId });
        if (!post) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Post does not exist',
            });
        }

        const likedPost = await LikeService.findOneBy({
            postId,
            userId: data.userId,
            liked: true,
        });
        if (likedPost) {
            return sendErrorResponse(req, res, {
                message: 'User cannot like a post multiple times',
                code: 401,
            });
        }
        data.postId = postId;
        data.likeCount = post.likeCount;
        const comment = await LikeService.likePost(data);
        return sendItemResponse(req, res, comment);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.post('/:postId/unlike', getUser, async (req, res) => {
    try {
        const data = req.body;
        const { postId } = req.params;
        data.userId = req.user.id;
        if (!data.userId) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'user id must be present',
            });
        }
        //check if the post exist
        const post = await PostService.findOneBy({ _id: postId });
        if (!post) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Post does not exist',
            });
        }
        //check if the user previously liked the post
        const likedPost = await LikeService.findOneBy({
            postId,
            userId: data.userId,
        });
        if (!likedPost || !likedPost.liked) {
            return sendErrorResponse(req, res, {
                message: 'you cannot unlike a post you have not liked previously',
                code: 401,
            });
        }

        data.postId = postId;
        data.likeCount = post.likeCount;
        const comment = await LikeService.unLikePost(data);
        return sendItemResponse(req, res, comment);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get('/:postId', getUser, async (req, res) => {
    try {
        const { skip, limit } = req.query;
        const { postId } = req.params;
        const comments = await LikeService.findBy(
            { postId: postId, deleted: false },
            skip,
            limit
        );
        return sendItemResponse(req, res, comments);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

module.exports = router;
