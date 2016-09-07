var fs = require('fs');
var log = require('narrolog');
var mkdirp = require('mkdirp');
var path = require('path');

exports.write = function (filepath, data) {
    mkdirp(path.dirname(filepath), function (err) {
        if (err) {
            log.error(err);
            return;
        }
        fs.writeFile(filepath, data, function (err) {
            if (err) {
                log.error(err);
                return;
            }
            log.info(filepath, "finished!");
        });
    })
}