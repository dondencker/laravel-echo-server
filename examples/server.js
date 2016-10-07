var echo = require('../dist/index.js');

var options = {
    host: '127.0.0.1',

    authUsingReferrerHost: true,
    authReferrers : [
        /.*\.example\.com/,
        "localhost",
        "127.0.0.1"
    ]
};

echo.run(options);
