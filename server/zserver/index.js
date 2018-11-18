const fs = require('fs');
const ZShepherd = require('zigbee-shepherd');

const eventMap = require('./events');
const { devicePort } = require('../../config');

const isDevicePresent = fs.existsSync(devicePort);

if (!isDevicePresent) {
    throw new Error(`No zigbee dongle found on ${devicePort}`);
}

const zserver = new ZShepherd(devicePort)

Object.keys(eventMap).forEach((eventType) => zserver.on(eventType, eventMap[eventType]));


[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
    process.on(eventType, () => zserver.stop(function (err) {
        if (!err) console.log('shepherd is stopped.');
        process.exit();
    }));
})

zserver.start(function(err) {
    if (err)
        console.log(err);
});

module.exports = { zserver };