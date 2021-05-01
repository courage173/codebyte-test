/* eslint-disable no-undef */

process.env.PORT = 3020;
const expect = require('chai').expect;
const data = require('./data/user');
const chai = require('chai');
chai.use(require('chai-http'));
const app = require('../server');
const { hardDelete } = require('../services/userServices');
const userModel = require('../models/user');

describe('User API', function() {
    this.timeout(20000);

    before(function(done) {
        //this.timeout(40000)
        done();
    });

    after(async () => {
        await hardDelete({ email: data.user.email });
    });
    it('return signup successfull', done => {
        chai.request(app)
            .post('/v1/api/user/register')
            .set('Accept', 'application/json')
            .send(data.user)
            .end((err, res) => {
                expect(res.body).to.be.an('object');
                expect(res.body.tokens).to.be.an('object');
                expect(res.body.firstName).to.equal(data.user.firstName);
                expect(res.body.lastName).to.equal(data.user.lastName);
                expect(res.body.email).to.equal(data.user.email);
                done();
            });
    });
    it('should not signup a user who exist already', done => {
        chai.request(app)
            .post('/v1/api/user/register')
            .set('Accept', 'application/json')
            .send(data.user)
            .end((err, res) => {
                expect(res.status).to.equal(400);
                expect(res.body.message).to.equal('Email already exist.');
                done();
            });
    });
    it('it should not signup the user when a required field are missing', done => {
        chai.request(app)
            .post('/v1/api/user/register')
            .set('Accept', 'application/json')
            .send({})
            .end((err, res) => {
                expect(res.body).to.be.an('object');
                expect(res.status).to.equal(400);
                expect(res.body.message.firstName[0]).to.equal(
                    'the firstName is required'
                );
                expect(res.body.message.lastName[0]).to.equal(
                    'the lastName is required'
                );
                expect(res.body.message.email[0]).to.equal(
                    'the email is required'
                );
                done();
            });
    });
    it('it should successfully login a user', done => {
        chai.request(app)
            .post('/v1/api/user/login')
            .set('Accept', 'application/json')
            .send({
                email: data.user.email,
                password: data.user.password,
            })
            .end((err, res) => {
                expect(res.body).to.be.an('object');
                expect(res.status).to.equal(200);
                expect(res.body.firstName).to.equal(data.user.firstName);
                expect(res.body.lastName).to.equal(data.user.lastName);
                expect(res.body.email).to.equal(data.user.email);
                done();
            });
    });
    it('it should not login a user with wrong password', done => {
        chai.request(app)
            .post('/v1/api/user/login')
            .set('Accept', 'application/json')
            .send({
                email: data.user.email,
                password: 'randompassword',
            })
            .end((err, res) => {
                expect(res.body).to.be.an('object');
                expect(res.status).to.equal(400);
                done();
            });
    });
    it('it should not login a user with credentials that does not exist', done => {
        chai.request(app)
            .post('/v1/api/user/login')
            .set('Accept', 'application/json')
            .send({
                email: 'random' + data.user.email,
                password: 'randompassword',
            })
            .end((err, res) => {
                expect(res.body).to.be.an('object');
                expect(res.status).to.equal(400);
                done();
            });
    });
    it('it should not login a user with empty email or password', done => {
        chai.request(app)
            .post('/v1/api/user/login')
            .set('Accept', 'application/json')
            .send({
                email: '',
                password: '',
            })
            .end((err, res) => {
                expect(res.body).to.be.an('object');
                expect(res.status).to.equal(400);
                expect(res.body.message.password[0]).to.equal(
                    'the password is required'
                );
                expect(res.body.message.email[0]).to.equal(
                    'the email is required'
                );
                done();
            });
    });
    it('it should succesffuly reset password and send a link', done => {
        chai.request(app)
            .post('/v1/api/user/forgot-password')
            .set('Accept', 'application/json')
            .send({
                email: data.user.email,
            })
            .end((err, res) => {
                expect(res.body).to.be.an('object');
                expect(res.body.message).to.equal(
                    'User received mail succcessfully.'
                );
                expect(res.status).to.equal(200);
                done();
            });
    });
    it('it should not reset password for a user who does not exist', done => {
        chai.request(app)
            .post('/v1/api/user/forgot-password')
            .set('Accept', 'application/json')
            .send({
                email: 'random' + data.user.email,
            })
            .end((err, res) => {
                expect(res.body).to.be.an('object');
                expect(res.body.message).to.equal('User does not exist.');
                expect(res.status).to.equal(400);
                done();
            });
    });
    it('it should not change password when token is not supplied', done => {
        chai.request(app)
            .post('/v1/api/user/reset-password')
            .set('Accept', 'application/json')
            .send({
                password: 'newpassword',
                token: ''
            })
            .end((err, res) => {
                expect(res.body).to.be.an('object');
                expect(res.body.message.token[0]).to.equal(
                    'the token is required'
                );
                expect(res.status).to.equal(400);
                done();
            });
    });
    it('it should not change password when token is not invalid', done => {
        chai.request(app)
            .post('/v1/api/user/reset-password')
            .set('Accept', 'application/json')
            .send({
                password: 'newpassword',
                token: data.user.token,
            })
            .end((err, res) => {
                expect(res.body).to.be.an('object');
                expect(res.body.message).to.equal(
                    'Reset password token has expired or token is invalid.'
                );
                expect(res.status).to.equal(400);
                done();
            });
    });

    it('it should successfully change password', done => {
        userModel.findOne({ email: data.user.email }, (err, user) => {
            chai.request(app)
                .post('/v1/api/user/reset-password')
                .set('Accept', 'application/json')
                .send({
                    password: 'newpassword',
                    token: user.resetPasswordToken,
                })
                .end((err, res) => {
                    expect(res.body).to.be.an('object');
                    expect(res.body.message).to.equal(
                        'User password has been reset successfully.'
                    );
                    expect(res.status).to.equal(200);
                    done();
                });
        });
    });
});
