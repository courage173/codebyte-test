const express = require('express');
const router = express.Router();
const sendErrorResponse = require('../utils/response').sendErrorResponse;
const sendItemResponse = require('../utils/response').sendItemResponse;
//const sendListResponse = require("../middlewares/response").sendListResponse;
const MailService = require('../services/mailService');
const UserService = require('../services/userServices');
const {
    validateRegisterationCredentials,
    validateLoginCredentials,
    validateForgotPasswordCredentials,
    validateResetPasswordCredentials,
} = require('../middlewares/validateCredentials');
const { getUser } = require('../middlewares/user');

// Route
// Description: registers a user
// Params:
// Returns: 400: Error; 500: Server Error; 200: User information.
router.post('/register', validateRegisterationCredentials, async (req, res) => {
    try {
        const data = req.body;
        data.email = data.email.toLowerCase();
        //check if user exist already
        const user = await UserService.findOneBy({ email: data.email });
        if (user) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Email already exist.',
            });
        }
        const userResponse = await UserService.register(data);
        MailService.sendRegistrationMail(userResponse);
        return sendItemResponse(req, res, userResponse);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route
// Description: logins a user
// Params:
// Returns: 400: Error; 500: Server Error; 200: User information.
router.post('/login', validateLoginCredentials, async (req, res) => {
    try {
        //call the user service
        const userResponse = await UserService.login(req.body);
        return sendItemResponse(req, res, userResponse);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route
// Description: this gets user information
// Params:
// Returns: 400: Error; 500: Server Error; 200: User information.
router.get('/profile', getUser, async (req, res) => {
    try {
        const userResponse = await UserService.findOneBy({ _id: req.user.id });
        return sendItemResponse(req, res, userResponse);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route
// Description: this route updates a users information
// Params:
// Returns: 400: Error; 500: Server Error; 200: User information.
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

// Route
// Description: forgot password function for  user
// Params:
// Param 1: req.body-> {email}; req.headers-> {host}
// Returns: 400: Error; 500: Server Error: 200: User password has been reset successfully.

router.post(
    '/forgot-password',
    validateForgotPasswordCredentials,
    async function(req, res) {
        try {
            const data = req.body;
            // Call the UserService.
            const user = await UserService.forgotPassword(data.email);
            //fix the url
            const forgotPasswordURL = `https://localhost:3005/api/user/change-password/${user.resetPasswordToken}`;
            // Call the MailService.
            await MailService.sendForgotPasswordMail(
                forgotPasswordURL,
                user.email
            );

            return sendItemResponse(req, res, {
                message: 'User received mail succcessfully.',
            });
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

// Route
// Description: reset password function for user
// Params:
// Param 1: req.body-> {password}; req.params-> {token}
// Returns: 400: Error; 500: Server Error; 200: User password has been reset successfully.
router.post('/reset-password', validateResetPasswordCredentials, async function(
    req,
    res
) {
    try {
        const data = req.body;
        // Call the UserService
        const user = await UserService.resetPassword(data.password, data.token);
        if (!user) {
            return sendErrorResponse(req, res, {
                code: 400,
                message:
                    'Reset password token has expired or token is invalid.',
            });
        }
        // Call the MailService.
        MailService.sendResetPasswordConfirmMail(user.email);
        return sendItemResponse(req, res, {
            message: 'User password has been reset successfully.',
        });
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});
module.exports = router;
