/* eslint-disable no-undef */

process.env.PORT = 3020;
const expect = require('chai').expect;
const data = require('./data/user');
const chai = require('chai');
chai.use(require('chai-http'));
const app = require('../server');
const { hardDelete } = require('../services/userServices');

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
            .post('/api/user/register')
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
            .post('/api/user/register')
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
            .post('/api/user/register')
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
});
