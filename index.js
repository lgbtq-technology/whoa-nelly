const fetch = require('node-fetch');
const debug = require('util').debuglog('whoa-nelly');
const qs = require('querystring');
const VError = require('verror');

if (!process.env.SLACK_TOKEN) {
    throw new Error("SLACK_TOKEN must exist in the environment");
}

module.exports = function whoa(user) {
    return slack.users.getByName(user).then(user => slack.channels.list()
                .then(l => l.channels.filter(c => c.members.indexOf(user.id) >= 0 && !c.is_general))
                .then(channels => Promise.all(channels.map(c => slack.channels.kick(c.id, user.id)))))

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

const slack = {
    users: {
        getByName: name => slack.users.list().then(list => list.members.find(e => e.name == name)),
        list: () => slackFetch(`https://slack.com/api/users.list`)
    },
    channels: {
        list: () => slackFetch(`https://slack.com/api/channels.list`),
        kick: (channel, user) => slackFetch(`https://slack.com/api/channels.kick`, { channel, user }),
        info: channel => slackFetch(`https://slack.com/api/channels.info`, { channel })
    }
};
