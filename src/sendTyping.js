'use strict';
module.exports = (defFunc, api, ctx) => {
    let makeTyping = (threadId, typing) => {
        let form = {
            typ: ~~typing,
            to: threadId,
            source: 'mercury-chat',
            thread: threadId
        };
        defFunc.post('https://www.facebook.com/ajax/messaging/typ.php', ctx.jar, form)
    };
    return (threadId, timeout) => {
        makeTyping(threadId, true);
        let stopTyping = () => makeTyping(threadId, false);
        if (typeof timeout === 'number' && timeout < 30000) {
            setTimeout(stopTyping, timeout);
        }
        return stopTyping;
    }
};