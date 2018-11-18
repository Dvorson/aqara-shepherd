
const asyncRoute = require('../helpers/asyncRoute');
const { getDevices } = require('../routes/api/devices');
const { zserver } = require('../zserver');

module.exports = function routes(app) {

    app.get('/api/devices', asyncRoute(getDevices));

    app.get('/api/permitJoin', (req, res) => {
        zserver.permitJoin(180);
        res.status(200).send('OK');
    });
  
};