const { getAllDevices } = require('../../db');

async function getDevices(req, res) {
    res.json(await getAllDevices());
}

module.exports = {
    getDevices
}