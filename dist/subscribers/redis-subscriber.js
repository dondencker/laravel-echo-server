"use strict";
var Redis = require('ioredis');
const log_1 = require('./../log');
class RedisSubscriber {
    constructor(options) {
        this.options = options;
        this._redis = new Redis(options.databaseConfig.redis);
    }
    subscribe(callback) {
        this._redis.psubscribe('*', (err, count) => { });
        this._redis.on('pmessage', (subscribed, channel, message) => {
            message = JSON.parse(message);
            callback(channel, message);
        });
        log_1.Log.success('Listening for redis events...');
    }
}
exports.RedisSubscriber = RedisSubscriber;
