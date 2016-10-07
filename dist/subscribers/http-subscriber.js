"use strict";
const log_1 = require('./../log');
var url = require('url');
class HttpSubscriber {
    constructor(options, http) {
        this.options = options;
        this.http = http;
    }
    subscribe(callback) {
        this.http.on('request', (req, res) => {
            let body = [];
            if (req.method == 'POST' && url.parse(req.url).pathname == '/broadcast') {
                if (!this.canAccess(req)) {
                    return this.unauthorizedResponse(req, res);
                }
                res.on('error', (error) => log_1.Log.error(error));
                req.on('data', (chunk) => body.push(chunk))
                    .on('end', () => this.handleData(req, res, body, callback));
            }
            else {
                if (url.parse(req.url).pathname != '/socket.io/') {
                    res.end();
                }
            }
        });
        log_1.Log.success('Listening for http events...');
    }
    handleData(req, res, body, broadcast) {
        body = JSON.parse(Buffer.concat(body).toString());
        if (body.channel && body.message) {
            if (!broadcast(body.channel, body.message)) {
                return this.badResponse(req, res, `Could not broadcast to channel: ${body.channel}`);
            }
        }
        else {
            return this.badResponse(req, res, 'Event must include channel and message');
        }
        res.write(JSON.stringify({ message: 'ok' }));
        res.end();
    }
    canAccess(req) {
        if (this.options.host == req.headers.referer) {
            return true;
        }
        let api_key = this.getApiToken(req);
        if (api_key) {
            let referrer = this.options.referrers.find((referrer) => {
                return referrer.apiKey == api_key;
            });
            if (referrer && (referrer.host == '*' ||
                referrer.host == req.headers.referer)) {
                return true;
            }
        }
        return false;
    }
    getApiToken(req) {
        if (req.headers.authorization) {
            return req.headers.authorization.replace('Bearer ', '');
        }
        if (url.parse(req.url, true).query.api_key) {
            return url.parse(req.url, true).query.api_key;
        }
        return false;
    }
    unauthorizedResponse(req, res) {
        res.statusCode = 403;
        res.write(JSON.stringify({ error: 'Unauthorized' }));
        res.end();
        return false;
    }
    badResponse(req, res, message) {
        res.statusCode = 400;
        res.write(JSON.stringify({ error: message }));
        res.end();
        return false;
    }
}
exports.HttpSubscriber = HttpSubscriber;
