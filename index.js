const dgram = require('dgram');
const Location = require('./location');
const amqplib = require('amqplib');

async function getChannel(connectionString) {
  const client = await amqplib.connect(connectionString);
  return await client.createChannel();
}

getChannel('amqp://localhost')
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
  });
