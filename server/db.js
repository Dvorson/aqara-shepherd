const { MongoClient, ObjectId } = require('mongodb');
const Promise = require('bluebird');

const { dbConnectionString, dbName } = require('../config');

const getClient = () => MongoClient.connect(dbConnectionString, { promiseLibrary: Promise });

const getDb = () => getClient()
    .then((client) => client.db(dbName))
    .catch(console.log);

async function addDevice(data) {
    const { ieeeAddr } = data;
    const db = await getDb();
    const collection = await db.collection('devices');
    return await collection
        .findOneAndUpdate({ ieeeAddr }, { $set: data }, { upsert: true, returnOriginal: false })
        .then((result) => {
            return result.value
        })
        .catch((e) => console.log(e));
}

async function getDevice(query) {
    const db = await getDb();
    const collection = await db.collection('devices');
    return await collection
        .findOne(query)
        .catch(console.log);
}

async function getAllDevices(query = {}) {
    const db = await getDb();
    const collection = await db.collection('devices');
    return await collection
        .aggregate(
            { $match: query },
            { 
                $project: {
                    endpoints: 0
                }
            },
            { $lookup:
                {
                    from: 'endpoints',
                    localField: '_id',
                    foreignField: 'deviceId',
                    as: 'endpoints'
                }
            },
            { 
                $project: {
                    endpoints: 1
                }
            }
        )
        .toArray();
    /* return Promise.map(devicesWithEndpoints, async (device) => {
        const endpointsWithClusters = await Promise.map(device.endpoints, async (endpoint) => {
            const clusters = await Promise.map(endpoint.clusters, async (clusterId) => await getCluster({ _id: clusterId }));
            return { ...endpoint, clusters }
        });
        return { ...device, endpoints: endpointsWithClusters }
    }); */
}

async function updateDevice(query, data) {
    const db = await getDb();
    const collection = await db.collection('devices');
    return await collection
        .updateOne(query, { $set: data })
        .catch(console.log);
}

async function addEndpoint(data) {
    const { deviceId, epId } = data;
    const db = await getDb();
    const collection = await db.collection('endpoints');
    return await collection
        .findOneAndUpdate({ deviceId, epId }, { $set: data }, { upsert: true, returnOriginal: false })
        .then((result) => result.value)
        .catch(console.log);
}

async function getEndpoint(query) {
    const db = await getDb();
    const collection = await db.collection('endpoints');
    return await collection
        .findOne(query)
        .catch(console.log);
}

async function getAllEndpoints(query) {
    const db = await getDb();
    const collection = await db.collection('endpoints');
    return await collection.find(query).toArray();
}

async function updateEndpoint(query, data) {
    const db = await getDb();
    const collection = await db.collection('endpoints');
    return await collection
        .findOneAndUpdate(query, { $set: data })
        .then((result) => result.value)
        .catch(console.log);
}

async function addCluster(data) {
    const { deviceId, endpointId, clusterName } = data;
    const db = await getDb();
    const collection = await db.collection('clusters');
    return await collection
        .findOneAndUpdate({ deviceId, endpointId, clusterName }, { $set: data }, { upsert: true, returnOriginal: false })
        .then((result) => result.value)
        .catch(console.log);
}

async function getCluster(query) {
    const db = await getDb();
    const collection = await db.collection('clusters');
    return await collection
        .findOne(query)
        .catch(console.log);
}

async function getAllClusters(query) {
    const db = await getDb();
    const collection = await db.collection('clusters');
    return await collection.find(query).toArray();
}

async function updateCluster({ ieeeAddr, epId, cid }, attrs) {
    const db = await getDb();
    const collection = await db.collection('clusters');
    const { _id: deviceId } = await getDevice({ ieeeAddr });
    const { _id: endpointId } = await getEndpoint({ deviceId, epId });
    return await collection
        .updateOne(
            {
                deviceId,
                endpointId,
                clusterName: cid
            },
            { $set: attrs }
        )
        .catch(console.log);
}

module.exports = { 
    addDevice,
    getDevice,
    getAllDevices,
    updateDevice,
    addEndpoint,
    getEndpoint,
    getAllEndpoints,
    updateEndpoint,
    addCluster,
    getCluster,
    getAllClusters,
    updateCluster
} 