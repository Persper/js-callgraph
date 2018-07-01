const { levenshtein } = require('./levenshtein');

function trackFunctions(forwardFuncs, bckwardFuncs, threshold=0.5) {
    const idMap = {};
    for (let ffunc of forwardFuncs) {
        let isHandled = false;
        // heuristic 1: function name
        for (let bfunc of bckwardFuncs) {
            if (ffunc['name'] && ffunc['name'] === bfunc['name']) {
                if (ffunc['cf'] !== bfunc['cf'])
                    idMap[ffunc['cf']] = bfunc['cf'];
                isHandled = true;
                break;
            }
        }

        if (isHandled)
            break;

        // heuristic 2: levenshtein distance
        for (let bfunc of bckwardFuncs) {
            let d = levenshtein(ffunc['code'], bfunc['code']);
            if (d / ffunc['code'].length < threshold)
                if (ffunc['cf'] !== bfunc['cf'])
                    idMap[ffunc['cf']] = bfunc['cf'];
        }
    }
    return idMap;
}

module.exports.trackFunctions = trackFunctions;
