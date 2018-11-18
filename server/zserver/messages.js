const util = require('util');

const wss = require('../websocket');
const SmartHome = require('../lib');

const {
    handleIncoming,
    handleLeaving,
    handleChange,
    handleStatus,
    handleAttReport
} = require('./devices');

const msgMap = {
    devIncoming,
    devLeaving,
    devChange,
    devStatus,
    attReport,
    devInterview
}

async function devIncoming(msg) {
    console.log('Device: ' + msg.data + ' is joining the network!');
    wss.broadcast('Device: ' + msg.data + ' is joining the network!');
    try {   
        await handleIncoming(msg);
    } catch(e) {
        console.error(e.stack);
    }
}

function devChange(msg) {
    console.log(`devChange: ${msg.endpoints[0].device.modelId}: ${ util.inspect(msg.data, { depth: 10 }) }`);
    wss.broadcast(`devChange: ${msg.endpoints[0].device.modelId}: ${ util.inspect(msg.data, { depth: 10 }) }`);
    handleChange(msg);
}

function attReport(msg) {
    console.log(`attReport: ${msg.endpoints[0].device.modelId}: ${ util.inspect(msg.data, { depth: 10 }) }`);
    wss.broadcast(`attReport: ${msg.endpoints[0].device.modelId}: ${ util.inspect(msg.data, { depth: 10 }) }`);
    handleAttReport(msg);
}

function devStatus(msg) {
    console.log(`devStatus: ${msg.endpoints[0].device.modelId}: ${ util.inspect(msg.data, { depth: 10 }) }`);
    wss.broadcast(`devStatus: ${msg.endpoints[0].device.modelId}: ${ util.inspect(msg.data, { depth: 10 }) }`);
    handleStatus(msg);
}

function devInterview(msg) {
    console.log(`devInterview: status: ${ util.inspect(msg.status, 10) }, data: ${ msg.data }`);
    wss.broadcast(`devInterview: status: ${ util.inspect(msg.status, 10) }, data: ${ msg.data }`);
}

function devLeaving(msg) {
    console.log(`devLeaving: ${msg.data}`);
    wss.broadcast(`devLeaving: ${msg.data}`);
    handleLeaving(msg);
}

module.exports = msgMap;
