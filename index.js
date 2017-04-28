const dgram = require('dgram');
const Location = require('./location');
const amqplib = require('amqplib');

const { RABBITMQ_HOST, RABBITMQ_PORT } = process.env;

const RABBITMQ_URL = `amqp://${RABBITMQ_HOST}:${RABBITMQ_PORT}`

async function getChannel(connectionString) {
  const client = await amqplib.connect(connectionString);
  return await client.createChannel();
}

getChannel(RABBITMQ_URL)
  .then(channel => {
    const server = dgram.createSocket('udp4');

    server.on('error', (err) => {
      console.log(`server error:\n${err.stack}`);
      server.close();
    });

    server.on('message', (msg, rinfo) => {
      console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
      const newLocation = Location.fromString(msg.toString('utf8'));
      console.log(newLocation);
      channel.publish('location', Location.user, msg);
    });

    server.on('listening', () => {
      var address = server.address();
      console.log(`server listening ${address.address}:${address.port}`);
    });

    server.bind(3000);
  }).catch(err => {
    console.log('Error getting RabbitMQ channel.');
    console.error(err.message);
  });
