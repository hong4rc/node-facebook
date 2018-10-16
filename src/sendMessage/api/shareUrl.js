'use strict';

const log = require('../../../utils/log');

let url;

module.exports = {
    url: 'https://www.facebook.com/message_share_attachment/fromURI/',
    init: _url => {
        url = _url;
    },
    getForm: () => ({
        image_height: 960,
        image_width: 960,
        uri: url,
    }),
    onSuccess: res => res.payload.share_data && res.payload.share_data.share_params,
    onFailure: error => {
        log.error('shareUrl', error.message);
    }
};
