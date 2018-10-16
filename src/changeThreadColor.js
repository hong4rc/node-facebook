'use strict';

const log = require('../utils/log');
const colors = require('../utils/threadColors');
const FIRST = 0;

let color;
let threadId;

module.exports = {
    url: 'https://www.facebook.com/messaging/save_thread_color/?source=thread_settings',
    init: (_color, _threadId) => {
        color = _color;
        threadId = _threadId;
        if (colors.indexOf(color) < FIRST) {
            throw new Error('The color you are trying to use is not a valid thread color.');
        }
    },
    getForm: () => ({
        color_choice: color,
        thread_or_other_fbid: threadId,
    }),
    onSuccess: () => {
        log.info('Change color to', color, threadId);
    },
    onFailure: error => {
        log.error('changeThreadColor', error.message);
    }
};
