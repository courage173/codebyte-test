const express = require('express');
const router = express.Router();
const sendErrorResponse = require('../utils/response').sendErrorResponse;
const sendItemResponse = require('../utils/response').sendItemResponse;
const CommentService = require('../services/commentService');
const PostService = require('../services/postService');
const { validatePost } = require('../middlewares/validateCredentials');
const { getUser } = require('../middlewares/user');


// Route
// Description: to can reply to a post
// Params: postId
// Returns: 400: Error; 500: Server Error; 201: post details.
router.post('/:postId', getUser, validatePost, async (req, res) => {
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

        data.postId = postId;

        const comment = await CommentService.create(data);
        return sendItemResponse(req, res, comment, 201);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});
// Route
// Description: to get a single comment
// Params: commentId
// Returns: 400: Error; 500: Server Error; 200: comment details.
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

// Route
// Description: get all comment of a post
// Params: postId
// Returns: 400: Error; 500: Server Error; 200: an array of comments.
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

// Route
// Description: update  comment
// Params: commentId
// Returns: 400: Error; 500: Server Error; 200: comment details.
router.put('/:commentId/update', getUser, validatePost, async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        //prevent another user from editting a comment which he did not post
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

// Route
// Description: delete comment
// Params: commentId
// Returns: 400: Error; 500: Server Error; 200: successful message.
router.delete('/:commentId/delete', getUser, async (req, res) => {
    try {
        const { commentId } = req.params;
        const user = req.user;

        //prevent a user from deleting another persons comment
        //an admin should be able to delete a comment in case of violations
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

// Route
// Description: delete a comment permanently
// Params: commentId
// Returns: 400: Error; 500: Server Error; 200: delete successfully.


/* this endpoint is for an admin to be able to delete a post.
 normally we would have a crone job that removes deleted comment 
permanently by the user after some time(say a month) */
router.delete('/hard-delete/:commentId', getUser, async (req, res) => {
    try {
        const { commentId } = req.params;
        const user = req.user;
        let post = await CommentService.findOneBy({ _id: commentId });
        const userId = String(post.userId._id);
        if (user.id !== userId && user.role !== 'ADMIN') {
            return sendErrorResponse(req, res, {
                message: 'you are not permitted to delete this post',
                statusCode: 401,
            });
        }
        post = await CommentService.deleteOneBy({
            _id: commentId,
        });

        return sendItemResponse(req, res, post);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

module.exports = router;
