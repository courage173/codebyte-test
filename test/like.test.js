/* eslint-disable no-undef */

process.env.PORT = 3020;
const expect = require('chai').expect;
const data = require('./data/user');
const chai = require('chai');
chai.use(require('chai-http'));
const app = require('../server');
const { hardDelete } = require('../services/userServices');
const deleteAllPost = require('../services/postService').hardDelete;
const deleteAllLike = require('../services/likeService').hardDelete;

let token, postId;
describe('User API', function() {
    this.timeout(30000);
    before(function(done) {
        chai.request(app)
            .post('/v1/api/user/register')
            .set('Accept', 'application/json')
            .send(data.user)
            .end((err, res) => {
                token = `Basic ${res.body.tokens.jwtAccessToken}`;
                chai.request(app)
                    .post('/v1/api/post')
                    .set('Accept', 'application/json')
                    .set('Authorization', token)
                    .send(data.post)
                    .end((err, res) => {
                        postId = res.body._id;
                        done();
                    });
            });
    });

    after(async () => {
        await hardDelete({});
        await deleteAllPost({});
        await deleteAllLike({});
    });
    it('should like a post successfully', done => {
        chai.request(app)
            .post(`/v1/api/like/${postId}`)
            .set('Accept', 'application/json')
            .set('Authorization', token)
            .send(data.post)
            .end((err, res) => {
                commentId = res.body._id;
                expect(res.body).to.be.an('object');
                expect(res.status).to.equal(200);
                expect(res.body.liked).to.equal(true);
                done();
            });
    });
    it('should not like a post multiple times', done => {
        chai.request(app)
            .post(`/v1/api/like/${postId}`)
            .set('Accept', 'application/json')
            .set('Authorization', token)
            .send(data.post)
            .end((err, res) => {
                commentId = res.body._id;
                expect(res.body).to.be.an('object');
                expect(res.status).to.equal(401);
                expect(res.body.message).to.equal(
                    'User cannot like a post multiple times'
                );
                done();
            });
    });
    it('should fail to like a post when invalid user token is passed', done => {
        chai.request(app)
            .post(`/v1/api/like/${postId}`)
            .set('Accept', 'application/json')
            .set('Authorization', 'Basic nsdf78sd7f8s7d8fsbdhbfhs9dfsb')
            .send(data.user)
            .end((err, res) => {
                expect(res.body).to.be.an('object');
                expect(res.status).to.equal(401);
                expect(res.body.message).to.equal(
                    'You are unauthorized to access the page'
                );
                done();
            });
    });
    it('should fail to like a post when no user token is passed', done => {
        chai.request(app)
            .post(`/v1/api/comment/${postId}`)
            .set('Accept', 'application/json')
            .send(data.user)
            .end((err, res) => {
                expect(res.body).to.be.an('object');
                expect(res.status).to.equal(401);
                expect(res.body.message).to.equal(
                    'Session Access Token must be present.'
                );
                done();
            });
    });
    it('should not unlike a post if it is not the user that liked the post', done => {
        chai.request(app)
            .post('/v1/api/user/register')
            .set('Accept', 'application/json')
            .send(data.user2)
            .end((err, res) => {
                chai.request(app)
                    .post(`/v1/api/like/${postId}/unlike`)
                    .set('Accept', 'application/json')
                    .set(
                        'Authorization',
                        `Basic ${res.body.tokens.jwtAccessToken}`
                    )
                    .end((err, res) => {
                        expect(res.body).to.be.an('object');
                        expect(res.status).to.equal(401);
                        expect(res.body.message).to.equal(
                            'you cannot unlike a post you have not liked previously'
                        );
                        done();
                    });
            });
    });
    it('should unlike a post successfully', done => {
        chai.request(app)
            .post(`/v1/api/like/${postId}/unlike`)
            .set('Accept', 'application/json')
            .set('Authorization', token)
            .send(data.post)
            .end((err, res) => {
                commentId = res.body._id;
                expect(res.body).to.be.an('object');
                expect(res.status).to.equal(200);
                expect(res.body.liked).to.equal(false);
                done();
            });
    });
});
