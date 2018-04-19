'use strict';
const cslCtr = require('console-control-strings');
const util = require('util');
const log = {
    VERBOSE: 0,
    INFO: 2,
    WARN: 3,
    ERROR: 4
};
let level = log.INFO;
const COLOR_NORMAL = cslCtr.color('magenta');
const COLOR_RESET = cslCtr.color('reset');
const NEXT_PREFIX = '││││ ';
const END_PREFIX = '└┴┴┘ ';

const createLevel = (lvl, fb, bg, disp) => (...args) => {
    if (lvl < level) {
        return;
    }
    const COLOR = cslCtr.color(fb, bg, 'bold');
    const PREFIX = COLOR + NEXT_PREFIX + COLOR_NORMAL;
    const lines = util.format(...args).split('\n');
    let output = COLOR + disp + COLOR_NORMAL + lines.shift();
    let endLine = '';
    if (lines.length) {
        endLine = `\n${COLOR}${END_PREFIX}${COLOR_NORMAL}${lines.pop()}`;
    }
    for (const line of lines) {
        output += `\n${PREFIX}${line}`;
    }
    output += endLine + COLOR_RESET;
    console.log(output);
};
log.verbose = createLevel(log.VERBOSE, 'blue', 'bgBlack', 'VERB ');
log.info = createLevel(log.INFO, 'green', 'bgBlack', 'INFO ');
log.warn = createLevel(log.WARN, 'yellow', 'bgBlack', 'WARN ');
log.error = createLevel(log.ERROR, 'red', 'bgBlack', 'ERR! ');

log.setLevel = lvl => {
    if (typeof lvl === 'number') {
        level = lvl;
    }
};
module.exports = log;
