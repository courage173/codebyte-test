const express = require('express');
const router = express.Router();
const sendErrorResponse = require('../utils/response').sendErrorResponse;
const sendItemResponse = require('../utils/response').sendItemResponse;
const PostService = require('../services/postService');
const { validatePost } = require('../middlewares/validateCredentials');
const { getUser } = require('../middlewares/user');

router.post('/:postId', getUser, validatePost, async (req, res) => {
    try {
        const data = req.body;
        const { postId } = req.query;
        data.userId = req.user.id;

        if (!data.userId) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'user id must be present',
            });
        }
        if (!postId) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'post id must be present',
            });
        }
        data.postId;
        const post = await PostService.create(data);
        return sendItemResponse(req, res, post);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});
router.get('/:postId', getUser, async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await PostService.findOneBy({ _id: postId });
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

router.put('/update', getUser, async (req, res) => {
    try {
        const { skip, limit } = req.query;
        const posts = await PostService.findBy({}, skip, limit);
        return sendItemResponse(req, res, posts);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.delete('/delete/:postId', getUser, async (req, res) => {
    try {
        const { postId } = req.params;
        const posts = await PostService.updateOneBy(
            {
                _id: postId,
            },
            {
                deleted: true,
            }
        );
        return sendItemResponse(req, res, posts);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.delete('/hard-delete/:postId', getUser, async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await PostService.deleteOneBy({
            _id: postId,
        });
        return sendItemResponse(req, res, post);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

module.exports = router;
