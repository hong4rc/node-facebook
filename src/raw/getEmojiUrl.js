'use strict';
const HEX = 16;
const BYTE_MARK = 0xff;
const STEP = 5;
const FIRST = 0;

module.exports = (c, size, pixelRatio) => {

    /*
     Resolves Facebook Messenger emoji image asset URL for an emoji character.
     Supported sizes are 32, 64, and 128.
     Supported pixel ratios are '1.0' and '1.5' (possibly more; haven't tested)
     */
    pixelRatio = pixelRatio || '1.0';
    const codeHex = c.codePointAt(FIRST).toString(HEX);
    const ending = `%${pixelRatio}/%${size}/%${codeHex}.png`;
    let base = 317426846;
    for (let i = 0; i < ending.length; i++) {
        base = (base << STEP) - base + ending.charCodeAt(i);
    }

    const hashed = (base & BYTE_MARK).toString(HEX);
    return `https://static.xx.fbcdn.net/images/emoji.php/v8/z%${hashed}/%${ending}`;
};
