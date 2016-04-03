const fs = require('mz/fs');
const path = require('path');

const message = fs.readFile(path.resolve(__dirname, 'whoa-message.md'), 'utf-8');

const slack = require('./slack');

module.exports = function whoa(user) {
    return slack.users.getByName(user).then(user => slack.channels.list()
        .then(l => l.channels.filter(c => c.members.indexOf(user.id) >= 0 && !c.is_general))
        .then(channels => Promise.all([
            message.then(m => slack.im.open(user.id).then(im => slack.chat.postMessage(im.channel.id, m, {
                                                                                      username: 'adminbot',
                                                                                      icon_emoji: ':exclamation:'}))),
        ].concat(channels.map(c => slack.channels.kick(c.id, user.id))))))
}
