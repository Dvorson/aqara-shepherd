const WebSocket = require('ws');

const { switches = [] } = require('../zserver');
const { wssport } = require('../../config');

const wss = new WebSocket.Server({
    port: wssport,
    perMessageDeflate: {
      zlibDeflateOptions: { // See zlib defaults.
        chunkSize: 1024,
        memLevel: 7,
        level: 3,
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      // Other options settable:
      clientNoContextTakeover: true, // Defaults to negotiated value.
      serverNoContextTakeover: true, // Defaults to negotiated value.
      serverMaxWindowBits: 10,       // Defaults to negotiated value. 
      // Below options specified as default values.
      concurrencyLimit: 10,          // Limits zlib concurrency for perf.
      threshold: 1024,               // Size (in bytes) below which messages should not be compressed.
    }
});

wss.on('connection', function connection(ws) {
  console.log('wss client connected');
  ws.on('message', (msg) =>
    msg === 'toggle' && switches.forEach((endpoint) =>
      endpoint.functional('genOnOff', 'toggle', {}, function (err) {
        if (!err) {
          console.log('SWITCH TOGGLE!');
          wss.broadcast('SWITCH TOGGLE!');
        }
      })
    )
  );
});

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
};

module.exports = wss;