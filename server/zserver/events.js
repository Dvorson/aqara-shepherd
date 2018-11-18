const util = require('util');

const msgMap = require('./messages');
const wss = require('../websocket');

const eventTypes = {
    ready,
    error,
    permitJoining,
    ind
}

function ready() {
    console.log('Server is ready.');
    console.log('Waiting for incoming messages...');
}

function permitJoining(joinTimeLeft) {
    // console.log(joinTimeLeft);
    wss.broadcast(`Join time left: ${joinTimeLeft}s`);
}

function ind(msg) {
    if (typeof msgMap[msg.type] === "undefined") {
        console.log("========================");
        console.log(`Unknown message type: ${ msg.type }`);
        console.log(util.inspect({ msg }, { depth: 10 }));
        console.log("========================");
        wss.broadcast(util.inspect({ msg }, { depth: 10 }));
    } else msgMap[msg.type](msg)
}

function error(err) {
    console.error(err);
}

module.exports = eventTypes;
