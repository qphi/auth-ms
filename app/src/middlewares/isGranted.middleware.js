// https://snyk.io/blog/node-js-timing-attack-ccc-ctf/
function secureStringCompare(a, b) {
    let mismatch = 0;
    for (let i = 0; i < a.length; ++i) {
        mismatch |= (a.charCodeAt(i) ^ b.charCodeAt(i));
    }
    return mismatch === 0;
}

module.exports = (request, response, next) => {
    if (
        request.headers.host === process.env.AUTH_MS_HOST ||
        (
            typeof request.applicationSettings !== 'undefined' &&
            secureStringCompare(request.applicationSettings.host, request.headers.host) &&
            (
                typeof request.params.ms_id === 'undefined' ||
                secureStringCompare(request.applicationSettings.MS_UUID, request.params.ms_id)
            )
        )
    ) {
        next();
    }

    else {
        response.status(403).send();
    }
}