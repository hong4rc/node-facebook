'use strict';

const log = require('kiat-log');
let groupId;
let answers;
let questions;

module.exports = {
    url: 'https://www.facebook.com/groups/membership/r2j/',
    init: (_groupId, _questions, _answers) => {
        groupId = _groupId;
        if (_questions && _answers) {
            answers = _answers;
            questions = _questions;
            module.exports.url = 'https://www.facebook.com/groups/membership_criteria_answer/save/';
        }
    },
    getForm: () => ({
        group_id: groupId,
        custom_questions: questions,
        questionnaire_answers: answers,
    }),
    onSuccess: () => {
        log.info('requestToJoinGroup', groupId);
    },
    onFailure: error => {
        log.error('requestToJoinGroup', error);
    }
};
