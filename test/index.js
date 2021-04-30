try {
    //import test files here
    //require('./user.test')
    require('./server.test')
    require('./post.test')
    require('./comments.test')
} catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    throw error;
}
