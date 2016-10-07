"use strict";
var colors = require('colors');
colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'cyan',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red',
    h1: 'grey',
    h2: 'yellow'
});
class Log {
    static title(message) {
        console.log(colors.bold(message));
    }
    static subtitle(message) {
        console.log(colors.h2.bold(message));
    }
    static info(message) {
        console.log(colors.info(message));
    }
    static success(message) {
        console.log(colors.green('\u2714'), message);
    }
    static error(message) {
        console.log(colors.error(message));
    }
}
exports.Log = Log;
