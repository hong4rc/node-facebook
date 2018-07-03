'use strict';
const fs = require('fs');
const log = require('./utils/log');
const login = require('./index');

// const timer = require('./timer');

// let user = {email: 'your username/id', pass: 'your pass'};
let user = process.env.user;
if (typeof user === 'string') {
    user = JSON.parse(user);
}
if (user) {
    if (!user.email || !user.pass) {
        user = {appState: user};
    }
} else {
    user = {appState: JSON.parse(fs.readFileSync('state.json', 'utf8'))};
}
const TIME_OUT_MSG = 30000;
login(user)
    .then(api => {
        log.setApi(api);

        // fs.writeFileSync('state.json', JSON.stringify(api.getAppState()));
        const stopper = {};
        api.listen((err, msg) => {
            if (err) {
                log.error(err);
            }
            let from;
            switch (msg.type) {
                case 'presence':
                    log.info(msg.userId, msg.statUser ? 'online' : 'idle');

                    // if (msg.statUser) {
                    //     let nowHour = timer.getCurrentTime().getHours();
                    //     if (nowHour >= 1 && nowHour <= 3) {
                    //         api.sendMessage('Chào bạn buổi sáng tốt lành, chúc ngủ ngon !!!', msg.userId);
                    //     }
                    // }
                    break;
                case 'typ':
                    from = msg.from;
                    if (msg.isTyping) {
                        log.info(`${from} is typing.`);
                        stopper[from] = api.sendTyping(from);
                        setTimeout(() => {
                            delete stopper[from];
                        }, TIME_OUT_MSG);

                    } else {
                        log.info(`${from} is not typing.`);
                        if (stopper[from]) {
                            stopper[from]();
                        }
                    }
                    break;
                case 'message':
                    api.markAsRead(msg.threadId);
                    break;
                default:

                // log.info(msg);

            }
        });
    });
