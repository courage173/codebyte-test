try {
    //import test files here
    require('./server.test')
    require('./user.test')
    require('./post.test')
    require('./comments.test')
    require('./like.test');
} catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    throw error;
}
