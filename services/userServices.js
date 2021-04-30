const bcrypt = require('bcrypt');
const randToken = require('rand-token');
const jwt = require('jsonwebtoken');
const ErrorService = require('./errorService');
const sendErrorResponse = require('../utils/response').sendErrorResponse;
const UserModel = require('../models/user');
const crypto = require('crypto');
const jwtSecretKey = process.env['JWT_SECRET'];

module.exports = {
    register: async function(data) {
        const _this = this;
        try {
            const hashPassword = await bcrypt.hash(data.password, 10);
            data.password = hashPassword;
            data.verificationToken = crypto.randomBytes(16).toString('hex');

            const user = await _this.create(data);
            const authUserObj = {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                referral: user.referral,
                tokens: {
                    jwtAccessToken: `${jwt.sign(
                        {
                            id: user._id,
                        },
                        jwtSecretKey,
                        { expiresIn: 8640000 }
                    )}`,
                    jwtRefreshToken: user.jwtRefreshToken,
                },
                role: user.role || null,
            };
            return authUserObj;
        } catch (error) {
            ErrorService.log('userService.register', error);
            throw error;
        }
    },

    login: async function(data) {
        try {
            data.email = data.email.toLowerCase();
            const user = await UserModel.findOne({ email: data.email });
            if (!user) {
                const error = new Error('User does not exist.');
                error.code = 400;
                ErrorService.log('userService.login', error);
                throw error;
            }

            const encryptedPassword = user.password;
            const validPassword = await bcrypt.compare(
                data.password,
                encryptedPassword
            );
            if (validPassword) {
                const authUserObj = {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    referral: user.referral,
                    tokens: {
                        jwtAccessToken: `${jwt.sign(
                            {
                                id: user._id,
                            },
                            jwtSecretKey,
                            { expiresIn: 8640000 }
                        )}`,
                        jwtRefreshToken: user.jwtRefreshToken,
                    },
                    role: user.role || null,
                };
                return authUserObj;
            } else {
                const error = new Error('Password is incorrect.');
                error.code = 400;
                throw error;
            }
        } catch (error) {
            ErrorService.log('userService.login', error);
            throw error;
        }
    },
    findOneBy: async function(query) {
        try {
            const user = await UserModel.findOne(query).select('-password');
            return user;
        } catch (error) {
            ErrorService.log('userService.findOneBy', error);
            throw error;
        }
    },
    findBy: async function(query, skip, limit) {
        try {
            if (!skip) skip = 0;

            if (!limit) limit = 0;

            if (typeof skip === 'string') skip = parseInt(skip);

            if (typeof limit === 'string') limit = parseInt(limit);

            if (!query) query = {};
            const user = await UserModel.find(query)
                .skip(skip)
                .limit(limit)
                .select('-password');
            return user;
        } catch (error) {
            ErrorService.log('userService.findBy', error);
            throw error;
        }
    },
    create: async function(data) {
        try {
            const userModel = new UserModel();
            userModel.firstName = data.firstName;
            userModel.lastName = data.lastName;
            userModel.email = data.email;
            userModel.role = data.role || 'user';
            userModel.password = data.password;
            userModel.phone = data.phone || null;
            userModel.dateOfBirth = data.dateOfBirth || null;
            userModel.profilePic = data.profilePic || null;
            userModel.createdAt = data.createdAt || Date.now();
            userModel.jwtRefreshToken = randToken.uid(256);

            const user = await userModel.save();

            return user;
        } catch (error) {
            ErrorService.log('userService.create', error);
            throw error;
        }
    },
    updateOneBy: async function(query, data) {
        try {
            if (data.role) delete data.role;
            if (data.password) delete data.password;
            data.updatedAt = Date.now();
            const user = await UserModel.findOneAndUpdate(
                query,
                {
                    $set: data,
                },
                { new: true }
            ).select('-password');
            return user;
        } catch (error) {
            ErrorService.log('userService.updateOneBy', error);
            throw error;
        }
    },
    hardDelete: async function(query) {
        try {
            await UserModel.deleteMany(query);
            return 'deleted successfully';
        } catch (error) {
            ErrorService.log('userService.hardDelete', error);
            throw error;
        }
    },
};
