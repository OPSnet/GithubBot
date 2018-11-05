const fastify = require('fastify')();

fastify.get('/', async (req, reply) => {
  return { hello: 'world' }
});

fastify.post('/', async (req, reply) => {
  console.log(req.body['test']);
  console.log(req.headers);
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