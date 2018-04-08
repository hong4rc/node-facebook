'use strict';
module.exports = (defFunc, api, ctx) => {
    let makeTyping = (threadID, typing) => {
        let form = {
            typ: ~~typing,
            to: threadID,
            source: 'mercury-chat',
            thread: threadID
        };
        defFunc.post('https://www.facebook.com/ajax/messaging/typ.php', ctx.jar, form)
    };
    return (threadID, timeout) => {
        makeTyping(threadID, true);
        let stopTyping = () => makeTyping(threadID, false);
        if (typeof timeout === 'number' && timeout < 30000) {
            setTimeout(stopTyping, timeout);
        }
        return stopTyping;
    }
};