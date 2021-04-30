const Validator = require('validatorjs');
const sendErrorResponse = require('../utils/response').sendErrorResponse;

const errorMessages = {
    required: 'the :attribute is required',
    email: 'the email format is invalid',
    min: 'Min :attribute limit is :min',
    max: 'Min :attribute limit is :min',
};
const validateCredentials = (req, res, next, rules) => {
    const validator = new Validator(req.body, rules, errorMessages);
    if (validator.passes()) {
        return next();
    }
    const errors = validator.errors.all();
    return sendErrorResponse(req, res, {
        statusCode: 400,
        message: errors,
    });
};
const validateRegisterationCredentials = (req, res, next) => {
    const rules = {
        firstName: 'required',
        lastName: 'required',
        email: 'required|email',
        password: 'required|min:6',
        dateOfBirth: 'required',
    };
    return validateCredentials(req, res, next, rules);
};

const validateLoginCredentials = (req, res, next) => {
    const rules = {
        email: 'required|email',
        password: 'required|min:6',
    };
    return validateCredentials(req, res, next, rules);
};



module.exports = {
    validateRegisterationCredentials,
    validateLoginCredentials,
};
