const ErrorService = require('../services/errorService');
const sendErrorResponse = require('../utils/response').sendErrorResponse;
const UserService = require('../services/userServices');
const jwt = require('jsonwebtoken');
const jwtSecretKey = process.env['JWT_SECRET'];

module.exports = {
    getUser: async function(req, res, next) {
        try {
            const accessToken = req.headers['authorization'];
            if (!accessToken) {
                if (res) {
                    return sendErrorResponse(req, res, {
                        code: 401,
                        message: 'Session Access Token must be present.',
                    });
                } else {
                    return null;
                }
            }
            if (typeof accessToken !== 'string') {
                if (res) {
                    return sendErrorResponse(req, res, {
                        code: 401,
                        message: 'Token is not of type string.',
                    });
                } else {
                    return null;
                }
            }

            const token = accessToken.split(' ')[1] || accessToken;

            //Decode the token
            let decoded = null;
            try {
                decoded = await jwt.verify(token, jwtSecretKey);
            } catch (err) {
                if (res) {
                    return sendErrorResponse(req, res, {
                        code: 401,
                        message: 'You are unauthorized to access the page',
                    });
                } else {
                    return null;
                }
            }
            req.user = decoded;
            const user = await UserService.findOneBy({ _id: req.user.id });

            if (!user) {
                if (res) {
                    return sendErrorResponse(req, res, {
                        code: 401,
                        message: 'You are unauthorized to access the page',
                    });
                } else {
                    return null;
                }
            }
            if (user.role === 'admin') {
                req.authorizationType = 'ADMIN';
            } else {
                req.authorizationType = 'USER';
            }
            UserService.updateOneBy(
                { _id: req.user.id },
                { lastActive: Date.now() }
            );
            if (next) {
                next();
            } else {
                return req;
            }
        } catch (error) {
            ErrorService.log('user.getUser', error);
            throw error;
        }
    },
    isAdmin: async function(req, res, next) {
        try {
            const role = req.authorizationType;
            if (role !== 'ADMIN') {
                return sendErrorResponse(req, res, {
                    code: 401,
                    message: 'You are unauthorized to perform this action',
                });
            }
            next();
        } catch (error) {
            ErrorService.log('user.isAdmin', error);
            throw error;
        }
    },
};
