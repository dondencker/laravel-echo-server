"use strict";
var request = require('request'), url = require('url');
const log_1 = require('./../log');
class PrivateChannel {
    constructor(options) {
        this.options = options;
        this.request = request;
    }
    authenticate(socket, data) {
        var authHost = this.authHost();
        if (this.options.authUsingReferrerHost) {
            var { referer } = socket.request.headers;
            if (!referer) {
                return this.refuseAuth('No referer given.');
            }
            var { authReferrers } = this.options, parsedReferrer = url.parse(referer), host = parsedReferrer.hostname, pass = false;
            for (var r in authReferrers) {
                var pattern = authReferrers[r];
                if (pattern.indexOf("*") > -1) {
                    pattern = new RegExp("^" + pattern.replace(/\./g, '\\.').replace("*", ".+") + "$");
                }
                if ((pattern instanceof RegExp && pattern.test(host))
                    || pattern === host) {
                    pass = true;
                    break;
                }
            }
            if (!pass) {
                var validHosts = authReferrers.map(function (regex) { return regex.toString(); }).join(", ");
                return this.refuseAuth(`Referring host "${host}" is not valid. Should follow one of these patterns (${validHosts})`);
            }
            authHost = parsedReferrer.protocol + (parsedReferrer.slashes ? "//" : "") + host;
        }
        let options = {
            url: authHost + this.options.authEndpoint,
            form: { channel_name: data.channel },
            headers: (data.auth && data.auth.headers) ? data.auth.headers : {},
            rejectUnauthorized: false
        };
        return this.severRequest(socket, options);
    }
    refuseAuth(reason) {
        return new Promise((resolve, reject) => { reject(reason); });
    }
    authHost() {
        return (this.options.authHost) ?
            this.options.authHost : this.options.host;
    }
    severRequest(socket, options) {
        return new Promise((resolve, reject) => {
            options.headers = this.prepareHeaders(socket, options);
            this.request.post(options, (error, response, body, next) => {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(response.body));
                }
                else {
                    log_1.Log.error(error);
                    reject('Could not send authentication request.');
                }
            });
        });
    }
    prepareHeaders(socket, options) {
        options.headers['Cookie'] = socket.request.headers.cookie;
        options.headers['X-Requested-With'] = 'XMLHttpRequest';
        return options.headers;
    }
}
exports.PrivateChannel = PrivateChannel;
