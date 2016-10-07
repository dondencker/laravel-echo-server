"use strict";
var fs = require('fs');
var http = require('http');
var https = require('https');
var io = require('socket.io');
const log_1 = require('./log');
class Server {
    constructor(options) {
        this.options = options;
    }
    init() {
        return new Promise((resolve, reject) => {
            this.serverProtocol().then(() => {
                log_1.Log.success(`Running at ${this.options.host} on port ${this.options.port}`);
                resolve(this.io);
            }, error => reject(error));
        });
    }
    serverProtocol() {
        return new Promise((resolve, reject) => {
            if (this.options.protocol == 'https') {
                this.secure().then(() => {
                    resolve(this.httpServer(true));
                }, error => reject(error));
            }
            else {
                resolve(this.httpServer(false));
            }
        });
    }
    secure() {
        return new Promise((resolve, reject) => {
            if (!this.options.sslCertPath || !this.options.sslKeyPath) {
                reject('SSL paths are missing in server config.');
            }
            Object.assign(this.options, {
                cert: fs.readFileSync(this.options.sslCertPath),
                key: fs.readFileSync(this.options.sslKeyPath)
            });
            resolve(this.options);
        });
    }
    httpServer(secure) {
        if (secure) {
            this.http = https.createServer(this.options, this.httpHandler);
        }
        else {
            this.http = http.createServer(this.httpHandler);
        }
        this.http.listen(this.options.port, this.options.host);
        return this.io = io(this.http);
    }
    httpHandler(req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Powered-By', 'Laravel Echo Server');
    }
}
exports.Server = Server;
