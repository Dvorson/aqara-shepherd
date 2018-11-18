const Promise = require("bluebird");

const { 
    addDevice,
    updateDevice,
    addEndpoint,
    updateEndpoint,
    addCluster,
    updateClusterByEndpoint
} = require('../db');

async function handleIncoming({ data, endpoints }) {
    const endpointIds = [];
    const clusterIds = [];
    await Promise.each(endpoints, async ({ device, clusters, profId, epId, devId, inClustersList, outClustersList }) => {
        const { type, ieeeAddr, nwkAddr, manufId, manufName, powerSource, modelId, status, joinTime } = device;
        const { _id: deviceId } = await addDevice({ type, ieeeAddr, nwkAddr, manufId, manufName, powerSource, modelId, status, joinTime });
        const { _id: endpointId } = await addEndpoint({ deviceId, profId, epId, devId, inClustersList, outClustersList });
        endpointIds.push(endpointId);
        await Promise.each(Object.keys(clusters), async (clusterName) => {
            if (!clusters[clusterName]) return;
            const { dir: { value: dir }, attrs: { cid, sid, ...attrs } } = clusters[clusterName];
            const clusterId = await addCluster({ deviceId, endpointId, epId, clusterName, dir, attrs });
            clusterIds.push(clusterId);
        });
        await updateEndpoint({ _id: endpointId }, { clusters: clusterIds });
    });
    await updateDevice({ ieeeAddr: data }, { endpoints: endpointIds, isUnRegistered: false });
}

async function handleLeaving({ data }) {
    await updateDevice({ ieeeAddr: data }, { isUnRegistered: true });
}

async function handleChange({ data: { data: { ...attrs }, cid }, endpoints }) {
    await Promise.each(endpoints, async ({ device: { ieeeAddr }, epId }) =>
        await updateCluster({ ieeeAddr, epId, cid }, attrs)
    );
}

async function handleStatus({ endpoints, data }) {
    const { device: { ieeeAddr } } = endpoints[0];
    await updateDevice({ ieeeAddr }, { status: data });
}

async function handleAttReport({ data: { cid, data: { ...attrs } }, endpoints }) {
    const { device: { ieeeAddr}, epId } = endpoints[0];
    await updateClusterByEndpoint({ ieeeAddr, epId, cid }, attrs)
}

module.exports = {
    handleIncoming,
    handleLeaving,
    handleChange,
    handleStatus,
    handleAttReport
}