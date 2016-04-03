const whoa = require('./');
const http = require('http');

if (!process.env.PORT) {
    throw "PORT environment variable must be set";
}

http.createServer(function (req, res) {
    console.warn('hi');
    req.pipe(process.stdout);
    res.end('ok');
    then(whoa => whoa(argvuser)).then(result => {
        if (result) console.log(result);
    }, err => {
        console.warn(err.stack);
    })
}).listen(process.env.PORT)

