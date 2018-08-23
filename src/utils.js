const fs = require('fs');
const path = require('path');

/**
 * Collect all the files in the given directory, recursively
 */
function collectFiles(dir, filelist) {
    let files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = collectFiles(path.join(dir, file), filelist);
        }
        else if (file.endsWith(".js")) {
            filelist.push(path.join(dir, file));
        }
    });
    return filelist;
}

module.exports.collectFiles = collectFiles;
