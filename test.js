const net = require('net');
const Location = require('./location');

const socket = new net.Socket();

socket.on('connect', () => {
  console.log('Connected');
  socket.setEncoding('utf8').setKeepAlive(true);

  const data = new Location(54, -56.6432, 8.8764);
  socket.write(data.toString());
});

socket.on('error', (err) => {
  console.error(err);
})

socket.on('end', () => {
  console.log('Connection closed');
});

socket.on('timeout', () => {
  console.log('Timeout');
});

socket.on('lookup', console.log.bind(null, 'lookup'));

socket.on('data', (data) => {
  console.log('data', data.toString('utf8'));
});

socket.connect(17153, '0.tcp.ngrok.io')