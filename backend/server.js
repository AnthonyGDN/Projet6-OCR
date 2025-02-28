const http = require('http');
const app = require('./app');

/*
  The normalizePort function ensures that the port value is valid.
  It attempts to parse the provided value (string or number) into an integer.
  - If parsing fails, it returns the value as-is (potentially a named pipe).
  - If the parsed number is >= 0, it returns that number.
  - Otherwise, it returns false, indicating an invalid port.
*/
const normalizePort = val => {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
};

// Determine the port to listen on, default to 5000 if not set in environment variables.
const port = normalizePort(process.env.PORT || '5000');
app.set('port', port);

/*
  The errorHandler function deals with server-related errors.
  It provides a user-friendly message depending on the error code,
  and it terminates the process if necessary.
*/
const errorHandler = error => {
  if (error.syscall !== 'listen') throw error;
  const address = server.address();
  const bind = typeof address === 'string'
    ? 'pipe ' + address
    : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
    default:
      throw error;
  }
};

// Create an HTTP server using our Express app as a request handler.
const server = http.createServer(app);

// Attach the custom errorHandler to manage potential server errors.
server.on('error', errorHandler);

// When the server starts listening, log the port or pipe name.
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string'
    ? 'pipe ' + address
    : 'port ' + port;
  console.log('Listening on ' + bind);
});

// Finally, instruct the server to listen on the chosen port.
server.listen(port);
