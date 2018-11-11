const EventEmitter = require('events');
const SmartHome = new EventEmitter();

SmartHome.switches = [];

SmartHome.on("EPJoin:Switch", ({ ep }) => SmartHome.switches.push(ep));

module.exports = SmartHome;