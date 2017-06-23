var fs = require('fs');
var filewalker = require('filewalker');
var path = require('path');
var log = require('narrolog');

var resolver = require('./resolver').resolve;
var resolver2 = require('./resolver2').resolve;

var regexp = /\.(html)$/;

/**
 * finder 解析src数组,遍历src文件夹(或文件),获取与regexp匹配的文件
 */
exports.finder = function (src) {
    var files = [];
    var pending = 0;
    src.forEach(function (value, index, array) {
        fs.stat(value, function (err, stats) {
            if (err) {
                return;
            }
            if (stats.isFile()) {
                files.push({ p: "", c: value });
            } else if (stats.isDirectory()) {
                pending++;
                filewalker(value, {
                    matchRegExp: regexp
                }).on('dir', function (p, s, fullpath) {
                    if (p.indexOf(".") == 0) {
                        return;
                    }
                    log.info('enter', p);
                }).on('file', function (p, s, fullpath) {
                    files.push({ p: value, c: p });
                }).on('error', function (err) {
                    log.error(err);
                }).on('done', function () {
                    pending--;
                    if (pending == 0) {
                        // html解析完毕
                        if (global.resolveType == "regexp") {
                            log.info("using regexp mode!")
                            resolver2(files);
                        } else {
                            log.info("using browser mode!")
                            resolver(files);
                        }
                    }
                }).walk();
            }
        });
    });
}