var fs = require('fs');
var log = require('narrolog');

exports.write = function (filepath, data) {
    fs.writeFile(filepath, data, function (err) {
        if (err) {
            log.error(err);
            return;
        }
        log.info(filepath, "finished!");
    });
}