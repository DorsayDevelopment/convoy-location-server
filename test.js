const dgram = require('dgram');
const client = dgram.createSocket('udp4');
const Location = require('./location');

const t = new Location(22, 22.6773, -87.45664);

const message = Buffer.from(t.toString());
client.send(message, 3000, 'localhost', (err) => {
  client.close();
});