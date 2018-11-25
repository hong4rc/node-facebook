'use strict';

module.exports = timeout => new Promise(resolve => setTimeout(() => resolve(), timeout));
