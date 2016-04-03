const whoa = require('./');
const http = require('http');
const bodyParser = require('body/form');

if (!process.env.PORT) {
    throw "PORT environment variable must be set";
}

if (!process.env.WEBHOOK_TOKEN) {
    throw "WEBHOOK_TOKEN environment variable must be set";
}

http.createServer(function (req, res) {
    bodyParser(req, res, function(err, body) {
        console.warn(body);
        if (body.token != process.env.WEBHOOK_TOKEN) {
            res.statusCode = 500;
            console.warn("token mismatch. Expected %j, got %j", process.env.WEBHOOK_TOKEN, body.token);
            res.end('invalid token');
        } else {

            const user = body.text.split(/ +/)[0];
            if (!user) {
                res.end("you must give a username");
            } else {
                console.warn("whoa on %j by %j", user, body.user_name);
                whoa(user).then(result => {
                    res.end(result || "whoa sent!");
                    if (result) console.log(result);
                }, err => {
                    console.warn(err.stack);
                    res.end('something went wrong. Eek. Time to /admin?');
                });
            }
        }
    });
}).listen(process.env.PORT)

