const fs = require('fs');
const ZShepherd = require('zigbee-shepherd');
const EventEmitter = require('events');
const util = require('util');

const wss = require('../websocket');
const SmartHome = require('../lib');

const isDevicePresent = fs.existsSync('/dev/ttyACM0');
let zserver = isDevicePresent ? new ZShepherd('/dev/ttyACM0') : new EventEmitter();

if (!isDevicePresent) {
    console.log("No zigbee dongle found");
    zserver = {
        permitJoin(sec) {
            return console.log("Fake permit join");
        },
        start(cb) {
            console.log("Fake start");
            return cb();
        },
        on() {},
        ...zserver
    }
}

const msgMap = {
    devIncoming,
    devChange,
    attReport
}

const switches = [];

function devIncoming(msg) {
    console.log('Device: ' + msg.data + ' joining the network!');
    wss.broadcast('Device: ' + msg.data + ' joining the network!');
    msg.endpoints.forEach(function (ep) {
        console.log(util.inspect(`Endpoint: ${ep.dump()}`, { depth:10 }));  // endpoint information
        wss.broadcast(util.inspect(`Endpoint: ${ep.dump()}`, { depth:10 }));
        if (ep.clusters.has('genOnOff')) {
            switches.push(ep);
            SmartHome.emit("EPJoin:Switch", { ep });
            /* setInterval(function () {
                ep.functional('genOnOff', 'toggle', {}, function (err) {
                    if (!err)
                        console.log('SWITCH TOGGLE!');
                        wss.broadcast('SWITCH TOGGLE!');
                });
            }, 5000); */
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

});

zserver.start(function(err) {
    if (err)
        console.log(err);
});

module.exports = { zserver };