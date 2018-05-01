'use strict';
const fs = require('fs');
const log = require('./utils/log');
const login = require('./index');
const timer = require('./utils/timer');
const _15day2die = require('./utils/_15day2die');
const requestMyself = require('request-myself');

// const timer = require('./timer');

// let user = {email: 'your username/id', pass: 'your pass'};
let user = process.env.user;
if (user) {
    user = {appState: JSON.parse(user)};
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

_15day2die.start();

// For server
const express = require('express');
const app = express();

const DEFAULT_PORT = 1997;
const DEFAULT_TIME_IDLING = 60000;
const port = process.env.PORT || DEFAULT_PORT;
app.listen(port, () => log.info(`This app is running in Port: ${port}`));
app.use(express.static('public'));
const option = {
    hostname: process.env.BASE_URL,
    timeout: process.env.TIME_IDLING || DEFAULT_TIME_IDLING
};
app.use(requestMyself(option, (error, res) => {
    if (error) {
        log.error('RequestMyself statusCode:', res.statusCode, error);
    } else {
        log.info('RequestMyself statusCode:', res.statusCode, timer.getCurrentTime());
    }
}));
