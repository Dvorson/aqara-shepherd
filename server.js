const ZShepherd = require('zigbee-shepherd');
const zserver = new ZShepherd('/dev/tty.usbmodem1411');
const util = require('util');

const msgMap = {
    devIncoming,
    devChange,
    attReport
}

const switches = [];

function devIncoming(msg) {
    console.log('Device: ' + msg.data + ' joining the network!');
    msg.endpoints.forEach(function (ep) {
        console.log(util.inspect(ep.dump(), { depth:10 }));  // endpoint information
        if (ep.clusters.has('genOnOff')) {
            switches.push(ep);
            setInterval(function () {
                ep.functional('genOnOff', 'toggle', {}, function (err) {
                    if (!err)
                        console.log('SWITCH TOGGLE!');
                });
            }, 5000);
        }
    });
}

function devChange(msg) {
    console.log(`devChange: ${msg.endpoints[0].device.modelId}: ${ util.inspect(msg.data, { depth: 10 }) }`);
    if (msg.data.cid === "genOnOff") {
        msg.data.data.onOff ? console.log("Door open") : console.log("Door closed");
    }
}

function attReport(msg) {
    console.log(`attReport: ${msg.endpoints[0].device.modelId}: ${ util.inspect(msg.data, { depth: 10 }) }`);
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
        console.log(util.inspect(msg, { depth: 10 }));
        console.log("========================");
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