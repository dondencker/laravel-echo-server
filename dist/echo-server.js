"use strict";
const subscribers_1 = require('./subscribers');
const channels_1 = require('./channels');
const server_1 = require('./server');
const log_1 = require('./log');
class EchoServer {
    constructor() {
        this.defaultOptions = {
            appKey: '',
            authHost: null,
            authEndpoint: '/broadcasting/auth',
            database: 'redis',
            authUsingReferrerHost: false,
            authReferrers: [],
            databaseConfig: {
                redis: {},
                sqlite: {
                    databasePath: '/database/laravel-echo-server.sqlite'
                }
            },
            devMode: false,
            host: 'http://localhost',
            port: 6001,
            referrers: [],
            sslCertPath: '',
            sslKeyPath: ''
        };
    }
    run(options) {
        this.options = Object.assign(this.defaultOptions, options);
        this.startup();
        this.server = new server_1.Server(this.options);
        this.server.init().then(io => {
            this.init(io).then(() => {
                log_1.Log.info('\nServer ready!\n');
            }, error => log_1.Log.error(error));
        }, error => log_1.Log.error(error));
    }
    init(io) {
        return new Promise((resolve, reject) => {
            this.channel = new channels_1.Channel(io, this.options);
            this.redisSub = new subscribers_1.RedisSubscriber(this.options);
            this.httpSub = new subscribers_1.HttpSubscriber(this.options, this.server.http);
            this.listen();
            this.onConnect();
            resolve();
        });
    }
    startup() {
        log_1.Log.title(`\nL A R A V E L  E C H O  S E R V E R\n`);
        if (this.options.devMode) {
            log_1.Log.info('Starting server in DEV mode...\n');
            log_1.Log.success('Dev mode activated.');
        }
        else {
            log_1.Log.info('Starting server...\n');
        }
    }
    listen() {
        this.redisSub.subscribe((channel, message) => {
            return this.broadcast(channel, message);
        });
        this.httpSub.subscribe((channel, message) => {
            return this.broadcast(channel, message);
        });
    }
    find(socket_id) {
        return this.server.io.sockets
            .connected["/#" + socket_id];
    }
    broadcast(channel, message) {
        if (message.socket && this.find(message.socket)) {
            return this.toOthers(this.find(message.socket), channel, message);
        }
        else {
            return this.toAll(channel, message);
        }
    }
    toOthers(socket, channel, message) {
        socket.broadcast.to(channel)
            .emit(message.event, channel, message.data);
        return true;
    }
    toAll(channel, message) {
        this.server.io.to(channel)
            .emit(message.event, channel, message.data);
        return true;
    }
    onConnect() {
        this.server.io.on('connection', socket => {
            this.onSubscribe(socket);
            this.onUnsubscribe(socket);
        });
    }
    onSubscribe(socket) {
        socket.on('subscribe', data => {
            this.channel.join(socket, data);
        });
    }
    onUnsubscribe(socket) {
        socket.on('unsubscribe', data => {
            this.channel.leave(socket, data.channel);
        });
    }
}
exports.EchoServer = EchoServer;
