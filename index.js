const net = require('net');
const Location = require('./location');

const CONNECTION_TIMEOUT = 90 * 1000 // 90 seconds in milliseconds

class ConnectionPool {
  constructor() {
    this.pool = [];
  }

  push(socket) {
    console.log(`incoming connection from ${socket.remoteAddress}`);
    const connection = new Connection(socket);

    if (!connection.isDestroyed) {
      this.pool.push(connection);
    }
  }

  check() {
    this.pool = this.pool.filter((conn) => !conn.isDestroyed);
  }
}

class Connection {
  constructor(socket) {
    this.socket = socket;
    this.user = null;

    socket.setEncoding('utf8').setKeepAlive(true).setTimeout(CONNECTION_TIMEOUT);

    socket.on('data', this.onData.bind(this));
    socket.on('end', this.onEnd.bind(this));
    socket.on('timeout', this.onTimeout.bind(this));
  }

  get isDestroyed() {
    return this.socket.destroyed;
  }

  get isLoggedIn() {
    return this.user !== null;
  }


  write(data) {
    this.socket.write(data.toString());
  }

  end() {
    this.socket.end();
  }




  onData(data) {
    try {
      const loc = Location.fromString(data.toString());
      console.log('Message received', loc);
    } catch (err) {
      console.log('Error receiving data', data.toString());
    }

    this.socket.write(data);
  }

  onEnd() {
    console.log('Connectiong closed!');
    // this.socket.destroy();
  }

  onTimeout() {
    console.log('Connection timed out...');
    this.end();
  }
}

const pool = new ConnectionPool();

const server = new net.Server();//net.createServer(pool.push.bind(pool))

server.on('connection', pool.push.bind(pool));
server.on('error', (err) => {
  // handle errors here
  throw err;
});

// grab a random port.
server.listen(3000, '0.0.0.0', () => {
  console.log('opened server on', server.address());
});

setInterval(() => {
  pool.check();
}, 10000)