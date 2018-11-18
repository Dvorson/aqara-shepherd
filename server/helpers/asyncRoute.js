module.exports = (routeHandler) => (req, res, next) => {
    
    const routeRes = routeHandler(req, res, next);

    if (routeRes && routeRes.catch) {
        routeRes.catch((err) => next(err));
    }
    
}
