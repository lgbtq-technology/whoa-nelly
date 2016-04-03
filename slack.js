const fetch = require('node-fetch');
const debug = require('util').debuglog('whoa-nelly');
const qs = require('querystring');
const VError = require('verror');

if (!process.env.SLACK_TOKEN) {
    throw new Error("SLACK_TOKEN must exist in the environment");
}

var slack = module.exports = {
    users: {
        getByName: name => slack.users.list().then(list => list.members.find(e => e.name == stripName(name))).then(u => {
            if (u && u.id) {
                return u;
            } else {
                throw new Error("User not found");
            }
        }),
        list: () => slackFetch(`https://slack.com/api/users.list`)
    },
    chat: {
        postMessage: (channel, text, opts) => slackFetch(`https://slack.com/api/chat.postMessage`, Object.assign({ channel, text }, opts))
    },
    channels: {
        list: () => slackFetch(`https://slack.com/api/channels.list`),
        kick: (channel, user) => slackFetch(`https://slack.com/api/channels.kick`, { channel, user }),
        info: channel => slackFetch(`https://slack.com/api/channels.info`, { channel })
    },
    im: {
        open: user => slackFetch(`https://slack.com/api/im.open`, { user })
    }
};

function stripName(name) {
    return name[0] == '@' ? name.slice(1) : name;
}

function slackFetch(url, args) {
    debug('fetching %j %j', url, args);
    return fetch(url + "?" + qs.stringify(Object.assign({ token: process.env.SLACK_TOKEN }, args)))
        .then(res => {
            debug("response status %j", res.status)
            if (res.status >= 400) {
                throw new VError("Unexpected error %j", res.status);
            }
            return res.json()
        })
        .then(body => {
            debug("got %j", body);
            if (body.ok) return body;
            throw new Error(body.error);
        });
}

