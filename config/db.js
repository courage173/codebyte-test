const mongoose = require('mongoose');
require('dotenv').config()
const DEV_MONGO_URL = process.env['MONGO_URL'];
const TEST_MONGO_URL = process.env['TEST_MONGO_URL'];

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


let mongoUrl;
if (process.env.NODE_ENV === 'development') {
    mongoUrl = DEV_MONGO_URL;
} else if (process.env.NODE_ENV === 'test') {
    mongoUrl = TEST_MONGO_URL;
}

mongoose
    .connect(mongoUrl)
    .then(() => {
        // eslint-disable-next-line
        return console.log('Mongo connected');
    })
    .catch(err => {
        // mongoose connection error will be handled here
        // eslint-disable-next-line
        console.error('App starting error:', err.stack);
        process.exit(1);
    });

module.exports = mongoose;
