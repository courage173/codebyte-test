const express = require('express');
const app = express();

const { NODE_ENV } = process.env;

if (!NODE_ENV || NODE_ENV === 'development') {
    // Load env vars from /backend/.env
    require('custom-env').env();
}

process.on('exit', () => {
    /* eslint-disable no-console */
    console.log('Server Shutting Shutdown');
});

process.on('unhandledRejection', err => {
    /* eslint-disable no-console */
    console.error('Unhandled rejection in server process occurred');
    /* eslint-disable no-console */
    console.error(err);
});

process.on('uncaughtException', err => {
    /* eslint-disable no-console */
    console.error('Uncaught exception in server process occurred');
    /* eslint-disable no-console */
    console.error(err);
});

const path = require('path');
const http = require('http').createServer(app);
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());

app.use(function(req, res, next) {
    if (typeof req.body === 'string') {
        req.body = JSON.parse(req.body);
    }
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header(
        'Access-Control-Allow-Headers',
        'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept,Authorization'
    );
    next();
});

// Add limit of 10 MB to avoid "Request Entity too large error"
// https://stackoverflow.com/questions/19917401/error-request-entity-too-large
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));

//View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// enable trust proxy
app.set('trust proxy', true);

app.set('port', process.env.PORT || 3005);

const server = http.listen(app.get('port'), function() {
    // eslint-disable-next-line
    console.log('Server Started on port ' + app.get('port'));
});

app.get(['/v1', '/v1/api'], function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(
        JSON.stringify({
            status: 200,
            message: 'Service Status - OK',
            serviceType: 'codebyteTest-api',
        })
    );
});

app.use(['/v1/user', '/v1/api/user'], require('./api/user'));
app.use(['/v1/post', '/v1/api/post'], require('./api/post'));
app.use(['/v1/comment', '/v1/api/comment'], require('./api/comments'));
app.use(['/v1/like', '/v1/api/like'], require('./api/like'));
app.use(['/v1/docs', '/v1/api/docs'], require('./api/swagger'));

module.exports = app;
module.exports.close = function() {
    server.close();
};

app.use('/*', function(req, res) {
    res.status(404).render('notFound.ejs', {});
});
