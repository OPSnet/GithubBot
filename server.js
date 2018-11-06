const fastify = require('fastify')();
const irc = require('irc-upd');

const settings = require('./settings');

const client = new irc.Client('irc.orpheus.network', settings.username, {
  channels: settings.channels
});

client.addListener('registered', () => {
  if (settings.nickserv) {
    client.say('nickserv', `IDENTIFY ${settings.nickserv}`);
  }
});

let messages = []
function issues(body) {
  // Format:
  // Gazelle - itismadness opened issue #59 - Test Issue... | https://github.com/OPSnet/Gazelle/issues/59
  let message = `${body.repository.name} - ${body.sender.name} ${body.action} issue #${body.issue.number}`;
  message += ` - ${body.issue.title} | ${body.issue.html_url}`;
  
  // TODO: handle comments

  message.push(message);
}

function commit(body) {
  let ref = body.ref.split('/');
  let branch = ref[ref.length-1];
  if (branch !== master_branch) {
    return;
  }
  for (let commit of body.commits) {
    let commit = commit.id.substr(0, 7);
    let message = `${body.repository.name} - ${commit.author.name} just pushed commit ${commit} to ${branch}`;
    message += ` - ${commit.message} | ${commit.url}`;
    messages.push(message);
  }
}

fastify.get('/', async (req, reply) => {
  return { hello: 'world' }
});

fastify.post('/', async (req, reply) => {
  let body = req.body;
  console.log(JSON.stringify(body, null, 2));
  console.log(req.headers);
  let message = `New Github Event from ${body.sender.login}`;
  let event = req.headers['x-github-event'];
  messages = [];
  if (event === 'issues') {
    handle_issue(body);
  }
  else if (event === 'push') {
    handle_commit(commit, body);
  }
  for (channel of client.channels) {
    console.log(channel);
  }
  for (let message of messages) {
    client.say('#test', message);
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