const express = require('express');
const router = express.Router();
const sendErrorResponse = require('../utils/response').sendErrorResponse;
const sendItemResponse = require('../utils/response').sendItemResponse;
const CommentService = require('../services/commentService');
const PostService = require('../services/postService');
const { validatePost } = require('../middlewares/validateCredentials');
const { getUser } = require('../middlewares/user');

router.post('/:postId', getUser, validatePost, async (req, res) => {
    try {
        const data = req.body;
        const { postId } = req.params;
        const post = await PostService.findOneBy({ _id: postId });
        data.userId = req.user.id;
        if (!data.userId) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'user id must be present',
            });
        }
        if (!post) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Post does not exist',
            });
        }

        data.postId = postId;

        const comment = await CommentService.create(data);
        return sendItemResponse(req, res, comment);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});
router.get('/:commentId/comment', getUser, async (req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await CommentService.findOneBy({
            _id: commentId,
            deleted: false,
        });

        return sendItemResponse(req, res, comment);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});
router.get('/:postId', getUser, async (req, res) => {
    try {
        const { skip, limit } = req.query;
        const { postId } = req.params;
        const comments = await CommentService.findBy(
            { postId: postId, deleted: false },
            skip,
            limit
        );
        return sendItemResponse(req, res, comments);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.put('/:commentId/update', getUser, validatePost, async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        let comment = await CommentService.findOneBy({ _id: commentId });
        const user = String(comment.userId._id);
        if (userId !== user) {
            return sendErrorResponse(req, res, {
                message: 'you are not permitted to edit this comment',
                code: 401,
            });
        }
        comment = await CommentService.updateOneBy(
            { _id: commentId },
            { content }
        );
        return sendItemResponse(req, res, comment);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.delete('/:commentId/delete', getUser, async (req, res) => {
    try {
        const { commentId } = req.params;
        const user = req.user;
        const comment = await CommentService.findOneBy({
            _id: commentId,
        });
        const userId = String(comment.userId._id);
        if (user.id !== userId && user.role !== 'ADMIN') {
            return sendErrorResponse(req, res, {
                message: 'you are not permitted to delete this comment',
                statusCode: 401,
            });
        }
        await CommentService.updateOneBy(
            {
                _id: commentId,
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
        let post = await CommentService.findOneBy({ _id: postId });
        const userId = String(post.userId._id);
        if (user.id !== userId && user.role !== 'ADMIN') {
            return sendErrorResponse(req, res, {
                message: 'you are not permitted to delete this post',
                statusCode: 401,
            });
        }
        post = await CommentService.deleteOneBy({
            _id: postId,
        });

        return sendItemResponse(req, res, post);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

module.exports = router;
