const httpInstance = require('http');
const portNumber = 8080;
const fs = require('fs');

const httpServer = httpInstance.createServer((request, response) => {
  if (request.url.endsWith('.js')) {
    response.writeHead(200, { 'Content-Type': 'application/javascript' });
    readFile('.' + request.url, response);
  } else if (request.url.endsWith('.css')) {
    response.writeHead(200, { 'Content-Type': 'text/css' });
    readFile('.' + request.url, response);
  } else {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    readFile('index.html', response);
  }
});

// Setup the server to listen on port 8080
httpServer.listen(portNumber, () => {
  console.log('Server is listening on port ' + portNumber);
});


function readFile(filename, response) {
  return fs.readFile(filename, function (error, data) {
    if (error) {
      response.writeHead(404);
      response.write('Error: File not found');
    } else {
      response.write(data);
    }
    response.end();
  });
}
