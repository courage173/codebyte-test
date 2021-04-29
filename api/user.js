const express = require('express');
const router = express.Router();
const sendErrorResponse = require('../utils/response').sendErrorResponse;
const sendItemResponse = require('../utils/response').sendItemResponse;
//const sendListResponse = require("../middlewares/response").sendListResponse;

const UserService = require('../services/userServices');
const {
    validateRegisterationCredentials,
    validateLoginCredentials,
} = require('../middlewares/validateCredentials');
const { getUser } = require('../middlewares/user');

router.post('/register', validateRegisterationCredentials, async (req, res) => {
    try {
        const userResponse = await UserService.register(req, res, req.body);
        return sendItemResponse(req, res, userResponse);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.post('/login', validateLoginCredentials, async (req, res) => {
    try {
        const userResponse = await UserService.login(req, res, req.body);
        return sendItemResponse(req, res, userResponse);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get('/profile', getUser, async (req, res) => {
    try {
        const userResponse = await UserService.findOneBy({ _id: req.user.id });
        return sendItemResponse(req, res, userResponse);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});
router.put('/update', getUser, async (req, res) => {
    try {
        const userResponse = await UserService.updateOneBy(
            { _id: req.user.id },
            req.body
        );
        return sendItemResponse(req, res, userResponse);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});
module.exports = router;