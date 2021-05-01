const imageDataURI = require('image-data-uri');

const dataUri = async req => {
    const mediaType = 'PNG';
    const url = await imageDataURI.encode(req.file.buffer, mediaType);
    return url;
};

module.exports = dataUri;
