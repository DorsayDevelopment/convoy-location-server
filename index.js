const dgram = require('dgram');
const Location = require('./location');
const amqplib = require('amqplib');

const { RABBITMQ_HOST, RABBITMQ_PORT } = process.env;
const EXCHANGE_NAME = 'location';

const RABBITMQ_URL = `amqp://${RABBITMQ_HOST}:${RABBITMQ_PORT}`;

async function setupRabbit(connectionString) {
  const options = {
    durable: true,
    autoDelete: false
  };
  
  const client = await amqplib.connect(connectionString);
  const channel = await client.createChannel();
  const result = await channel.assertExchange(EXCHANGE_NAME, 'topic', options);
  console.log('Connection to exchange successful');

  return channel;
}

function getChannel(connectionString, maxTries=0) {
  let tries = 0;

  return new Promise((resolve, reject) => {
    const retry = setInterval(() => {
      console.log(`Attemping rabbitmq connection try ${++tries} of ${maxTries || 'infinite'}...`);

      setupRabbit(connectionString)
        .then((channel) => {
          clearInterval(retry);
          resolve(channel);
        })
        .catch((err) => {
          if (maxTries > 0 && tries >= maxTries) {
            console.log('Maximum tries reached. Aborting...')
            clearInterval(retry);
            reject(err);
          }
        });
    }, 2000);
  });
}

async function main() {
  try {
    const channel = await getChannel(RABBITMQ_URL)
    const server = dgram.createSocket('udp4');

    server.on('error', (err) => {
      console.log(`server error:\n${err.stack}`);
      server.close();
    });

    server.on('message', (msg, rinfo) => {
      console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
      const newLocation = Location.fromString(msg.toString('utf8'));
      console.log(newLocation);
      channel.publish('location', Location.user, new Buffer(JSON.stringify(newLocation.toJSON())));
    });

    server.on('listening', () => {
      var address = server.address();
      console.log(`server listening ${address.address}:${address.port}`);
    });

    server.bind(3000);

  } catch (err) {
    console.log('Error getting RabbitMQ channel.');
    console.error(err.message);
  }
}

main();