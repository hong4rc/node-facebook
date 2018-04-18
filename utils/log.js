'use strict';
const cslCtr = require('console-control-strings');
const log = {
    VERBOSE: 0,
    INFO: 2,
    WARN: 3,
    ERROR: 4
};
const prefixNm = cslCtr.color('magenta');
const suffixesNm = cslCtr.color('reset');
let level = log.INFO;

const createLevel = (lvl, fb, bg, disp) => (...args) => {
    if (lvl < level) {
        return;
    }
    console.log(cslCtr.color(fb, bg, 'bold') + disp + cslCtr.color('reset') + prefixNm, ...args, suffixesNm);
};
log.verbose = createLevel(log.VERBOSE, 'blue', 'bgBlack', 'VERB  ');
log.info = createLevel(log.INFO, 'green', 'bgBlack', 'INFO  ');
log.warn = createLevel(log.WARN, 'yellow', 'bgBlack', 'WARN  ');
log.error = createLevel(log.ERROR, 'red', 'bgBlack', 'ERROR ');

log.setLevel = lvl => {
    if (typeof lvl === 'number') {
        level = lvl;
    }
};
module.exports = log;
