const devPortMap = {
    darwin: '/dev/tty.usbmodem1411',
    linux: '/dev/ttyACM0'
};

module.exports = {
    port: 3000,
    wssport: 3001,
    dbConnectionString: 'mongodb://localhost:27017',
    dbName: 'smarthome',
    devicePort: devPortMap[process.platform]
}