'use strict';

const log = require('../utils/log');

let title;
let threadId;
let options;

module.exports = {
    url: 'https://www.facebook.com/messaging/group_polling/create_poll/',
    init: (_title, _threadId, _options) => {
        title = _title;
        threadId = _threadId;
        options = _options;
    },
    getForm: () => {
        const form = {
            question_text: title,
            target_id: threadId,
            option_text_array: [],
            option_is_selected_array: [],
        };
        for (const option in options) {
            if (options.hasOwnProperty(option)) {
                const selected = Number(options[option]);
                form.option_text_array.push(option);
                form.option_is_selected_array.push(selected);
            }
        }
        return form;
    },
    onSuccess: () => {
        log.info('Added question:', title, 'with', threadId);
    },
    onFailure: error => {
        log.error('createPoll', error.message);
    }
};
