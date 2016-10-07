"use strict";
var Redis = require('ioredis');
class RedisDatabase {
    constructor(options) {
        this.options = options;
        this._redis = new Redis(options.databaseConfig.redis);
    }
    get(key) {
        return new Promise((resolve, reject) => {
            this._redis.get(key).then(value => resolve(JSON.parse(value)));
        });
    }
    set(key, value) {
        this._redis.set(key, JSON.stringify(value));
    }
}
exports.RedisDatabase = RedisDatabase;
