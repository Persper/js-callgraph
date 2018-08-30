/*******************************************************************************
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

const { levenshtein } = require('./levenshtein');
const { isAnon } = require('./astutil.js');

/* Given two list of objects (each represent a function),
use various heuristics to pair up objects that might represent a same function.

Args:
    funcList1 - A list of objects, each represents a function
    funcList2 - Same as funcList1

Example function object:

    {
        'name': a valid function name | 'anon' | 'global',
        'file': a valid file name,
        'range': a list of two integers,
        'code': code of the function | null (for global context),
        'encFuncName': a valid function name | 'anon' | 'global' | null (for global context),
        'cf': a string representing the colon format id
    }

Returns:
    A mapping from a colon format id in funcList1 to another colon format id in funcList2
*/
function trackFunctions(funcList1, funcList2, editDistThres=0.5) {
    let idMap = {};
    const lst1 = funcList1;
    // Create a shallow copy of funcList2
    let lst2 = funcList2.slice();

    for (let func1 of lst1) {
        let isHandled = false;

        // Basic: compare cf
        // If two function has same colon format id,
        // they are the same function wlp.
        let i = lst2.length;
        while (i--) {
            let func2 = lst2[i];
            if (func1['cf'] === func2['cf']) {
                // Remove paired functions for performance
                lst2.splice(i, 1);
                isHandled = true;
                break;
            }
        }

        if (isHandled)
            continue;

        // If execution reaches here, then func1's cf is changed
        // Heuristic 1: function name (only for named functions)
        // 'global' is handled here
        if (!isAnon(func1['name'])) {
            const sameNameLst = nameFilter(func1, lst2);
            if (sameNameLst.length > 0) {
                let selectedFunc = null;
                if (sameNameLst.length > 1)
                    selectedFunc = editDistSelector(func1, sameNameLst);
                else
                    selectedFunc = sameNameLst[0];
                // Remove paired funciton for performance
                lst2.splice(lst2.indexOf(selectedFunc), 1);
                idMap[func1['cf']] = selectedFunc['cf'];
                isHandled = true;
            }
        }

        if (isHandled)
            continue;

        // Heuristic 2: enclosing function name & levenshtein distance
        const sameEncNameLst = enclosingFilter(func1, lst2);
        if (sameEncNameLst.length > 0) {
            const selectedFunc = editDistSelector(func1, sameEncNameLst, editDistThres);
            if (selectedFunc) {
                idMap[func1['cf']] = selectedFunc['cf'];
                lst2.splice(lst2.indexOf(selectedFunc), 1);
            }
        }
    }

    return idMap;
}

/* filters return a list (could be empty) */
function nameFilter (origFunc, funcLst) {
    return propFilter(origFunc, funcLst, 'name');
}

function enclosingFilter(origFunc, funcLst) {
    return propFilter(origFunc, funcLst, 'encFuncName')
}

function propFilter (origFunc, funcLst, propName) {
    let filteredLst = [];
    for (let candidate of funcLst)
        if (origFunc[propName] === candidate[propName])
            filteredLst.push(candidate);
    return filteredLst;
}

/* selectors return a single function object or null */
function editDistSelector (origFunc, funcLst, threshold=100) {
    // Set lowestRatio to 1000 should be sufficiently large
    let selectedFunc = null, lowestRatio = 100;
    for (let candidate of funcLst) {
        let d = levenshtein(origFunc['code'], candidate['code']);
        let ratio = d / origFunc['code'].length;
        if (ratio < threshold && ratio < lowestRatio) {
            lowestRatio = ratio;
            selectedFunc = candidate;
        }
    }
    return selectedFunc;
}

module.exports.trackFunctions = trackFunctions;
