/* eslint-disable no-undef */

process.env.PORT = 3020;
const expect = require('chai').expect;
const chai = require('chai');
chai.use(require('chai-http'));
const app = require('../server');

describe('Server starting properly', function() {
    this.timeout(20000);
    it('server ok', done => {
        chai.request(app)
            .get('/v1')
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res.status).to.equal(200)
                expect(res.body.message).to.be.equal('Service Status - OK');
                done();
            });
    });
});
