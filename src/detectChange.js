// https://github.com/Persper/code-analytics/blob/master/persper/graphs/detect_change.py
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports) {

    function getIntersectedLength(a, b) {
        let start, end;
        if (a[0] >= b[0])
            start = a[0];
        else
            start = b[0];

        if (a[1] <= b[1])
            end = a[1];
        else
            end = b[1];

        if (start > end)
            return 0
        else
            return end - start + 1;
    }

    function detectChange (addDels, funcs) {
        // return empty object by default
        const adds = addDels['adds'], dels = addDels['dels'];
        const res = {};

        // changeType should one of 'adds' or 'dels'
        // use colon format id (cf) as key
        function updateRes(cf, numLines, changeType) {
            if (res.hasOwnProperty(cf)){
                res[cf][changeType] += numLines;
            }
            else {
                res[cf] = { 'adds': 0, 'dels': 0 };
                res[cf][changeType] = numLines;
            }
        }

        for (let i = 0; i < funcs.length; i++) {
            const fc = funcs[i];
            for (let j = 0; j < adds.length; j++) {
                if (fc['range'][0] <= adds[j][0] && adds[j][0] <= fc['range'][1]) {
                    updateRes(fc.cf, adds[j][1], 'adds');
                    break;
                }
            }
            for (let k = 0; k < dels.length; k++) {
                const interLength = getIntersectedLength(fc['range'], dels[k]);
                if (interLength > 0) {
                    updateRes(fc.cf, interLength, 'dels');
                    break;
                }
            }
        }

        for (let cf in res) {
            res[cf] = res[cf]['adds'] + res[cf]['dels'];
        }
        return res;
    }

    exports.detectChange = detectChange;
    // only for test
    exports.getIntersectedLength = getIntersectedLength;
    return exports;
});
