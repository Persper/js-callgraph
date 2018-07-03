/*
Copyright (c) 2011 Andrei Mackenzie
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const levenshtein = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    let tmp, i, j, prev, val, row;
    // swap to save some memory O(min(a,b)) instead of O(a)
    if (a.length > b.length) {
        tmp = a;
        a = b;
        b = tmp;
    }

    row = Array(a.length + 1);
    // init the row
    for (i = 0; i <= a.length; i++) {
        row[i] = i;
    }

    // fill in the rest
    for (i = 1; i <= b.length; i++) {
        prev = i;
        for (j = 1; j <= a.length; j++) {
            if (b[i-1] === a[j-1]) {
                val = row[j-1]; // match
            } else {
                val = Math.min(row[j-1] + 1, // substitution
                      Math.min(prev + 1,     // insertion
                               row[j] + 1));  // deletion
            }
            row[j - 1] = prev;
            prev = val;
        }
        row[a.length] = prev;
    }
    return row[a.length];
}

module.exports.levenshtein = levenshtein;
