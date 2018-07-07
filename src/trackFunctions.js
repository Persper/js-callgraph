const { levenshtein } = require('./levenshtein');

function trackFunctions(forwardFuncs, bckwardFuncs, threshold=0.5) {
    const idMap = {};
    for (let ffunc of forwardFuncs) {
        let isHandled = false;

        // Basic: compare cf
        for (let bfunc of bckwardFuncs) {
            // Found ffunc's corresponding bfunc
            // ffunc's cf doesn't change
            if (ffunc['cf'] === bfunc['cf']) {
                isHandled = true;
                break
            }
        }
        if (isHandled)
            continue;

        // If execution reaches here, then ffunc's cf is changed
        // Heuristic 1: function name
        for (let bfunc of bckwardFuncs) {
            if (ffunc['name'] && ffunc['name'] === bfunc['name']) {
                idMap[ffunc['cf']] = bfunc['cf'];
                isHandled = true;
                break;
            }
        }
        if (isHandled)
            continue;

        // Heuristic 2: enclosing function & levenshtein distance
        // Set lowestRatio to 1000 should be sufficiently large
        let bestFitCf = null, lowestRatio = 1000;
        for (let bfunc of bckwardFuncs) {
            // enclosing function heuristic
            // Stop considering bfunc if encFuncs are different
            if (ffunc['encFunc'] !== bfunc['encFunc'])
                continue

            // levenshtein heuristic
            let d = levenshtein(ffunc['code'], bfunc['code']);
            let ratio = d / ffunc['code'].length;
            if (ratio < threshold && ratio < lowestRatio) {
                lowestRatio = ratio;
                bestFitCf = bfunc['cf'];
            }
        }
        if (bestFitCf)
            idMap[ffunc['cf']] = bestFitCf;
    }
    return idMap;
}

module.exports.trackFunctions = trackFunctions;
