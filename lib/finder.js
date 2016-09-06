var fs = require('fs');
var filewalker = require('filewalker');
var path = require('path');
var log = require('narrolog');

var resolver = require('./resolver').resolve;

var regexp = /\.(html)$/;

/**
 * finder 解析src数组,遍历src文件夹(或文件),获取与regexp匹配的文件
 */
exports.finder = function (src) {
    var files = [];
    var pending = 0;
    for (var i = 0; i < src.length; i++) {
        var temp = i;
        fs.stat(src[temp], function (err, stats) {
            if (err) {
                return;
            }
            if (stats.isFile()) {
                files.push(src[temp]);
            } else if (stats.isDirectory()) {
                pending++;
                filewalker(src[temp])
                    .on('dir', function (p) {
                        if (p.indexOf(".") == 0) {
                            return;
                        }
                        log.info('enter', p);
                    })
                    .on('file', function (p, s) {
                        p = path.join(src[temp], p);
                        if (regexp) {
                            if (regexp.test(p)) {
                                files.push(p);
                            }
                        } else {
                            files.push(p);
                        }
                    })
                    .on('error', function (err) {
                        log.error(err);
                    })
                    .on('done', function () {
                        pending--;
                        if (pending == 0) {
                            // html解析完毕
                            resolver(files);
                        }
                    })
                    .walk();
            }
        });
    }
}