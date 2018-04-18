'use strict';
module.exports = (defFunc, api, ctx) => {
    const AUTO_STOP_TYPING = 30000;
    const makeTyping = (threadId, typing) => {
        const form = {
            typ: ~~typing,
            to: threadId,
            source: 'mercury-chat',
            thread: threadId
        };
        defFunc.post('https://www.facebook.com/ajax/messaging/typ.php', ctx.jar, form);
    };
    return (threadId, timeout) => {
        makeTyping(threadId, true);
        const stopTyping = () => makeTyping(threadId, false);
        if (typeof timeout === 'number' && timeout < AUTO_STOP_TYPING) {
            setTimeout(stopTyping, timeout);
        }
        return stopTyping;
    };
};
