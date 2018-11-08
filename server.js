const fastify = require('fastify')();
const irc = require('irc-upd');

const settings = require('./settings');

const client = new irc.Client('irc.orpheus.network', settings.username, {
  channels: []
});

client.addListener('registered', () => {
  if (settings.nickserv) {
    client.say('nickserv', `IDENTIFY ${settings.nickserv}`);
    client.join(settings.channels.join(','));
  }
});

function handle_issue(body, messages) {
  let message = `${body.repository.name} - ${body.sender.login} ${body.action} issue #${body.issue.number}`;
  message += ` - ${body.issue.title} | ${body.issue.html_url}`;

  // TODO: handle comments

  messages.push(message);
}

function handle_commits(body, messages) {
  let ref = body.ref.split('/');
  let branch = ref[ref.length - 1];
  if (branch !== body.repository.master_branch) {
    return;
  }
  for (let commit of body.commits) {
    let id = commit.id.substr(0, 7);
    let message = `${body.repository.name} - ${commit.author.name} just pushed commit ${id} to ${branch}`;
    message += ` - ${commit.message.split(/\r?\n/)[0].substr(0, 50).trim()} | ${commit.url.replace(commit.id, id)}`;
    messages.push(message);
  }
}

fastify.get('/', async () => {
  return { hello: 'world' };
});

fastify.post('/', async (req) => {
  let body = req.body;

  let event = req.headers['x-github-event'];
  let messages = [];
  if (event === 'issues') {
    handle_issue(body, messages);
  }
  else if (event === 'push') {
    handle_commits(body, messages);
  }
  else {
    // View these events within GitHub to see headers and body
    // console.log(JSON.stringify(body, null, 2));
    // console.log(req.headers);
    // let message = `New Github Event ${event} by ${body.sender.login}`;
    // messages.push(message);
  }

  for (let channel of settings.channels) {
    for (let message of messages) {
      client.say(channel, message);
    }
  }

  return { message: 'posted' };
});

const start = async () => {
  fastify.listen(13452, '0.0.0.0', (err, address) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    fastify.log.info(`server listening on ${address}`);
  });
};

start();
