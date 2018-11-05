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

fastify.get('/', async (req, reply) => {
  return { hello: 'world' }
});

fastify.post('/', async (req, reply) => {
  console.log(req.body['test']);
  console.log(req.headers);
  client.say('#develop', `New Github Event from ${sender.login}`);
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