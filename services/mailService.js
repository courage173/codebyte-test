const ErrorService = require('./errorService');
const Path = require('path');
const fsp = require('fs/promises');
const Handlebars = require('handlebars');
const sgMail = require('@sendgrid/mail');
const SENDGRID_API_KEY = process.env['SENDGRID_API_KEY'];

module.exports = {
    sendMail: async function(mailOptions) {
        try {
            sgMail.setApiKey(SENDGRID_API_KEY);
            await sgMail.send(mailOptions);
            return { message: 'email sent successfully' };
        } catch (error) {
            error.code = 400;
            ErrorService.log('mailService.sendMail', error);
            throw error;
        }
    },
    getEmailBody: async function(mailOptions) {
        try {
            const data = await fsp.readFile(
                Path.resolve(
                    process.cwd(),
                    'views',
                    'email',
                    `${mailOptions.template}.hbs`
                ),
                { encoding: 'utf8', flag: 'r' }
            );
            let emailBody = Handlebars.compile(data);
            emailBody = emailBody(mailOptions.context);
            return emailBody;
        } catch (error) {
            ErrorService.log('mailService.getEmailBody', error);
        }
    },
    sendRegistrationMail: async function(user) {
        try {
            const _this = this;
            const options = {
                template: 'registration_body',
                context: {
                    name: user.firstName,
                    year: new Date().getFullYear(),
                },
            };

            const body = await _this.getEmailBody(options);
            const mailOptions = {
                from: 'courageosemwengie@gmail.com',
                to: user.email,
                subject: 'Welcome to TalentQl Test',
                html: body,
            };
            const response = await this.sendMail(mailOptions);
            return response;
        } catch (error) {
            error.code = 400;
            ErrorService.log('mailService.sendForgotPasswordMail', error);
            throw error;
        }
    },
    sendForgotPasswordMail: async function(forgotPasswordURL, email) {
        try {
            const _this = this;
            const options = {
                template: 'forgot_password_body',
                context: { forgotPasswordURL, year: new Date().getFullYear() },
            };

            const body = await _this.getEmailBody(options);
            const mailOptions = {
                from: 'courageosemwengie@gmail.com',
                to: email,
                subject: 'Reset Password',
                html: body,
            };
            const response = await this.sendMail(mailOptions);
            return response;
        } catch (error) {
            error.code = 400;
            ErrorService.log('mailService.sendForgotPasswordMail', error);
            throw error;
        }
    },
    sendResetPasswordConfirmMail: async function(email) {
        try {
            const _this = this;
            const options = {
                template: 'reset_password_body',
                context: {
                    year: new Date().getFullYear(),
                },
            };

            const body = await _this.getEmailBody(options);
            const mailOptions = {
                from: 'courageosemwengie@gmail.com',
                to: email,
                subject: 'Your password has been changed',
                html: body,
            };
            const response = await this.sendMail(mailOptions);
            return response;
        } catch (error) {
            error.code = 400;
            ErrorService.log('mailService.sendPasswordResetMail', error);
            throw error;
        }
    },
};
