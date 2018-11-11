const ZShepherd = require('zigbee-shepherd');
const zserver = new ZShepherd('/dev/ttyACM0');
const util = require('util');
const WebSocket = require('ws');

const msgMap = {
    devIncoming,
    devChange,
    attReport
}

const switches = [];

const wss = new WebSocket.Server({
    port: 8080,
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
});

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
};

function devIncoming(msg) {
    console.log('Device: ' + msg.data + ' joining the network!');
    wss.broadcast('Device: ' + msg.data + ' joining the network!');
    msg.endpoints.forEach(function (ep) {
        console.log(util.inspect(`Endpoint: ${ep.dump()}`, { depth:10 }));  // endpoint information
        wss.broadcast(util.inspect(`Endpoint: ${ep.dump()}`, { depth:10 }));
        if (ep.clusters.has('genOnOff')) {
            switches.push(ep);
            setInterval(function () {
                ep.functional('genOnOff', 'toggle', {}, function (err) {
                    if (!err)
                        console.log('SWITCH TOGGLE!');
                        wss.broadcast('SWITCH TOGGLE!');
                });
            }, 5000);
        }
    });
}

function devChange(msg) {
    console.log(`devChange: ${msg.endpoints[0].device.modelId}: ${ util.inspect(msg.data, { depth: 10 }) }`);
    wss.broadcast(`devChange: ${msg.endpoints[0].device.modelId}: ${ util.inspect(msg.data, { depth: 10 }) }`);
    if (msg.data.cid === "genOnOff") {
        msg.data.data.onOff ? console.log("Door open") : console.log("Door closed");
    }
}

function attReport(msg) {
    console.log(`attReport: ${msg.endpoints[0].device.modelId}: ${ util.inspect(msg.data, { depth: 10 }) }`);
    wss.broadcast(`attReport: ${msg.endpoints[0].device.modelId}: ${ util.inspect(msg.data, { depth: 10 }) }`);
    if (msg.data.cid === "genOnOff") {
        // msg.data.data.onOff ? console.log("Door closed") : console.log("Door open");
    }
}

zserver.on('ready', function () {
    console.log('Server is ready. Allow devices to join the network within 180 secs.');
    console.log('Waiting for incoming clients or messages...');
    zserver.permitJoin(180);
});

zserver.on('permitJoining', function (joinTimeLeft) {
    // console.log(joinTimeLeft);
});

zserver.on('ind', function (msg) {

    if (typeof msgMap[msg.type] === "undefined") {
        console.log("========================");
        console.log(util.inspect({ msg }, { depth: 10 }));
        console.log("========================");
        wss.broadcast(util.inspect({ msg }, { depth: 10 }));
    } else msgMap[msg.type](msg)

    /* switch (msg.type) {
        case 'devIncoming':
            
            break;
        default:
            
            break;
    } */
});

zserver.start(function (err) {
    if (err)
        console.log(err);
});
