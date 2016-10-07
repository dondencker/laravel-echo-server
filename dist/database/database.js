"use strict";
const sqlite_1 = require('./sqlite');
const redis_1 = require('./redis');
const log_1 = require('./../log');
class Database {
    constructor(options) {
        this.options = options;
        if (options.database == 'redis') {
            this.driver = new redis_1.RedisDatabase(options);
        }
        else if (options.database == 'sqlite') {
            this.driver = new sqlite_1.SQLiteDatabase(options);
        }
        else {
            log_1.Log.error('Database driver not set.');
        }
    }
    get(key) {
        return this.driver.get(key);
    }
    ;
    set(key, value) {
        this.driver.set(key, value);
    }
    ;
}
exports.Database = Database;
