/* eslint-disable no-undef */

process.env.PORT = 3020;
const expect = require('chai').expect;
const data = require('./data/user');
const chai = require('chai');
chai.use(require('chai-http'));
const app = require('../server');
const { hardDelete } = require('../services/userServices');
const deleteAllPost = require('../services/postService').hardDelete;

let token, postId,commentId;
describe('User API', function() {
    this.timeout(30000);
    before(function(done) {
        chai.request(app)
            .post('/api/user/register')
            .set('Accept', 'application/json')
            .send(data.user)
            .end((err, res) => {
                token = `Basic ${res.body.tokens.jwtAccessToken}`;
                chai.request(app)
                    .post('/api/post')
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
    });
    it('should create a comment successfullyy', done => {
        chai.request(app)
            .post(`/api/comment/${postId}`)
            .set('Accept', 'application/json')
            .set('Authorization', token)
            .send(data.post)
            .end((err, res) => {
                commentId = res.body._id;
                expect(res.body).to.be.an('object');
                expect(res.status).to.equal(200);
                expect(res.body.content).to.equal(data.post.content);
                done();
            });
    });
    it('should fail to create a comment when no content is passed', done => {
        chai.request(app)
            .post(`/api/comment/${postId}`)
            .set('Accept', 'application/json')
            .set('Authorization', token)
            .send({ content: '' })
            .end((err, res) => {
                expect(res.body).to.be.an('object');
                expect(res.status).to.equal(400);
                expect(res.body.message.content[0]).to.equal(
                    'the content is required'
                );
                done();
            });
    });
    it('should fail to create a comment when invalid user token is passed', done => {
        chai.request(app)
            .post(`/api/comment/${postId}`)
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
    it('should fail to create a comment when no user token is passed', done => {
        chai.request(app)
            .post(`/api/comment/${postId}`)
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
    it('should update a comment successfully by a user', done => {
        chai.request(app)
            .put(`/api/comment/${commentId}/update`)
            .set('Accept', 'application/json')
            .set('Authorization', token)
            .send({ content: 'i am an updated post' })
            .end((err, res) => {
                expect(res.body).to.be.an('object');
                expect(res.status).to.equal(200);
                expect(res.body.content).to.equal('i am an updated post');
                done();
            });
    });
    it('should not update a comment successfully by a user when no content is provided', done => {
        chai.request(app)
            .put(`/api/comment/${commentId}/update`)
            .set('Accept', 'application/json')
            .set('Authorization', token)
            .send({ content: '' })
            .end((err, res) => {
                expect(res.body).to.be.an('object');
                expect(res.status).to.equal(400);
                expect(res.body.message.content[0]).to.equal(
                    'the content is required'
                );
                done();
            });
    });
    it('should not update a comment if it is not the user that created the comment', done => {
        chai.request(app)
            .post('/api/user/register')
            .set('Accept', 'application/json')
            .send(data.user2)
            .end((err, res) => {
                chai.request(app)
                    .put(`/api/comment/${commentId}/update`)
                    .set('Accept', 'application/json')
                    .set(
                        'Authorization',
                        `Basic ${res.body.tokens.jwtAccessToken}`
                    )
                    .send({ content: 'i am an updated comment' })
                    .end((err, res) => {
                        expect(res.body).to.be.an('object');
                        expect(res.status).to.equal(401);
                        expect(res.body.message).to.equal(
                            'you are not permitted to edit this comment'
                        );
                        done();
                    });
            });
    });
    it('should not delete a comment if its not the user or an admin', done => {
        chai.request(app)
            .post('/api/user/login')
            .set('Accept', 'application/json')
            .send(data.user2)
            .end((err, res) => {
                chai.request(app)
                    .delete(`/api/comment/${commentId}/delete`)
                    .set('Accept', 'application/json')
                    .set(
                        'Authorization',
                        `Basic ${res.body.tokens.jwtAccessToken}`
                    )
                    .end((err, res) => {
                        expect(res.body).to.be.an('object');
                        expect(res.status).to.equal(401);
                        expect(res.body.message).to.equal(
                            'you are not permitted to delete this comment'
                        );
                        done();
                    });
            });
    });
    it('should delete a comment', done => {
        chai.request(app)
            .delete(`/api/comment/${commentId}/delete`)
            .set('Accept', 'application/json')
            .set('Authorization', token)
            .end((err, res) => {
                expect(res.body).to.be.an('object');
                expect(res.status).to.equal(200);
                expect(res.body.message).to.equal('deleted successfully');
                done();
            });
    });
});
