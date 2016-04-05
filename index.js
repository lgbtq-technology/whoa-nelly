const fs = require('mz/fs');
const path = require('path');
const fmt = require('util').format;

const message = fs.readFile(path.resolve(__dirname, 'whoa-message.md'), 'utf-8');

const slack = require('./slack');

module.exports = function whoa(user, context) {
    const notify = process.env.NOTIFY_CHANNEL;
    const botname = process.env.BOT_NAME || 'friendly_admin_bot';
    const boticon = process.env.BOT_ICON || 'https://raw.githubusercontent.com/lgbtq-technology/whoa-nelly/master/adminbot-48x48.jpeg';
    const notification = fmt("Whoa on %j by %s", user, context.user_name) + (context.channel_name ? fmt(" in %s", context.channel_name) : "");

    return Promise.resolve(notify && slack.chat.postMessage(notify, notification, {
                                                                username: botname,
                                                                icon_url: boticon
                                                            }))
        .then(() => slack.users.getByName(user).then(user => slack.channels.list()
        .then(l => l.channels.filter(c => c.members.indexOf(user.id) >= 0 && !c.is_general))
        .then(channels => Promise.all([
            message.then(m => slack.im.open(user.id).then(im => slack.chat.postMessage(im.channel.id, m, {
                                                                                      username: botname,
                                                                                      icon_url: boticon }))),
        ].concat(channels.map(c => slack.channels.kick(c.id, user.id)))))))
        .then(() => "Whoa sent!")
}
