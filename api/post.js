const express = require('express');
const router = express.Router();
const sendErrorResponse = require('../utils/response').sendErrorResponse;
const sendItemResponse = require('../utils/response').sendItemResponse;
const PostService = require('../services/postService');
const { validatePost } = require('../middlewares/validateCredentials');
const { getUser } = require('../middlewares/user');

router.post('/', getUser, validatePost, async (req, res) => {
    try {
        const data = req.body;
        data.userId = req.user.id;
        if (!data.userId) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'user id must be present',
            });
        }
        const post = await PostService.create(data);
        return sendItemResponse(req, res, post);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});
router.get('/:postId', getUser, async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await PostService.findOneBy({
            _id: postId,
            deleted: false,
        });
        return sendItemResponse(req, res, post);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});
router.get('/', getUser, async (req, res) => {
    try {
        const { skip, limit } = req.query;
        const posts = await PostService.findBy({}, skip, limit);
        return sendItemResponse(req, res, posts);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.put('/:postId/update', getUser, validatePost, async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        let post = await PostService.findOneBy({ _id: postId });
        const user = String(post.userId._id);
        if (userId !== user) {
            return sendErrorResponse(req, res, {
                message: 'you are not permitted to edit this post',
                code: 401,
            });
        }
        post = await PostService.updateOneBy({ _id: postId }, { content });
        return sendItemResponse(req, res, post);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.delete('/:postId/delete', getUser, async (req, res) => {
    try {
        const { postId } = req.params;
        const user = req.user;
        const post = await PostService.findOneBy({ _id: postId });
        const userId = String(post.userId._id);
        if (user.id !== userId && user.role !== 'ADMIN') {
            return sendErrorResponse(req, res, {
                message: 'you are not permitted to delete this post',
                statusCode: 401,
            });
        }
        await PostService.updateOneBy(
            {
                _id: postId,
            },
            {
                deleted: true,
            }
        );
        return sendItemResponse(req, res, { message: 'deleted successfully' });
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.delete('/hard-delete/:postId', getUser, async (req, res) => {
    try {
        const { postId } = req.params;
        const user = req.user;
        let post = await PostService.findOneBy({ _id: postId });
        const userId = String(post.userId._id);
        if (user.id !== userId && user.role !== 'ADMIN') {
            return sendErrorResponse(req, res, {
                message: 'you are not permitted to delete this post',
                statusCode: 401,
            });
        }
        post = await PostService.deleteOneBy({
            _id: postId,
        });

        return sendItemResponse(req, res, post);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

module.exports = router;
