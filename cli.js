#!/usr/bin/env node

const yargs = require('yargs');

const argv = yargs.option('user', {
    alias: 'u',
    required: true,
    nargs: 1
}).argv;

Promise.resolve().then(() => require('./')).then(whoa => whoa(argv.user)).then(result => {
    if (result) console.log(result);
}, err => {
    console.warn(err.stack);
    process.exit(1);
})
