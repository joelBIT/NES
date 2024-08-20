const httpInstance = require('http');
const portNumber = 8080;
const fs = require('fs');

const httpServer = httpInstance.createServer((request, response) => {
  if (request.url.endsWith('.js')) {
    readFile('.' + request.url, response, 'application/javascript');
  } else if (request.url.endsWith('.css')) {
    readFile('.' + request.url, response, 'text/css');
  } else {
    readFile('index.html', response, 'text/html');
  }
});

httpServer.listen(portNumber, () => {
  console.log('Server is listening on port ' + portNumber);
});

function readFile(filename, response, contentType) {
  return fs.readFile(filename, function (error, data) {
    if (error) {
      response.writeHead(404);
      response.write('Error: File not found');
    } else {
      response.writeHead(200, { 'Content-Type': contentType });
      response.write(data);
    }
    response.end();
  });
}
