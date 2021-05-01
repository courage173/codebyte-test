const express = require('express');
const router = express.Router();
const sendErrorResponse = require('../utils/response').sendErrorResponse;
const sendItemResponse = require('../utils/response').sendItemResponse;
const PostService = require('../services/postService');
const { validatePost } = require('../middlewares/validateCredentials');
const { getUser } = require('../middlewares/user');

// Route
// Description: create a post
// Params: null
// Returns: 400: Error; 500: Server Error; 201: post details.
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
        return sendItemResponse(req, res, post, 201);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Description: get a post
// Params: postId
// Returns: 400: Error; 500: Server Error; 200: post details.
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

// Description: get all post
// Params: null
// Returns: 400: Error; 500: Server Error; 200: post details.
router.get('/', getUser, async (req, res) => {
    try {
        const { skip, limit } = req.query;
        const posts = await PostService.findBy({}, skip, limit);
        return sendItemResponse(req, res, posts);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Description: update a post
// Params: postId
// Returns: 400: Error; 500: Server Error; 200: post details.
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
// Description: delete a post
// Params: postId
// Returns: 400: Error; 500: Server Error; 200: post details.
router.delete('/:postId/delete', getUser, async (req, res) => {
    try {
        const { postId } = req.params;
        const user = req.user;
        const post = await PostService.findOneBy({
            _id: postId,
            deleted: false,
        });
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

// Description: delete a post permanently
// Params: postId
// Returns: 400,401: Error; 500: Server Error; 200: message.

/* this endpoint is for an admin to be able to delete a post.
 normally we would have a crone job that removes deleted post 
permanently by the user after some time(say a month) */
router.delete('/hard-delete/:postId', getUser, async (req, res) => {
    try {
        const { postId } = req.params;
        const user = req.user;
        let post = await PostService.findOneBy({ _id: postId });
        if (user.role !== 'ADMIN') {
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
