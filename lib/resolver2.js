var path = require('path');
var fs = require('fs');
var log = require('narrolog');
var url = require('url');
var qs = require('querystring');
var resolveSrc = require('./resolver').resolveSrc;
var file = require('./file');

/**
 * resolve 解析文件,替换引用标签,加上hash值
 * @param files 文件名(数组)
 */
exports.resolve = function (files) {
    var scriptRegexpG = /<\s*script\s*src=(["'])([^\1>]+)\1\s*>/g
    var scriptRegexp = /<\s*script\s*src=(["'])([^\1>]+)\1\s*>/
    files.forEach(function (value, index, array) {
        var filepath = path.join(value.p, value.c);
        fs.readFile(filepath, function (err, data, aa) {
            if (err) {
                return log.error(err);
            }
            // 压缩
            // var html = minify(data.toString(), minifyConfig);
            var html = data.toString();
            var scripts = html.match(scriptRegexpG)
            if (scripts) {
                var count = scripts.length;
                var pending = 0;
                for (var i = 0; i < scripts.length; i++) {
                    var temp = scripts[i];
                    var matchData = scriptRegexp.exec(temp);
                    (function () {
                        var src = matchData[2];
                        // 替换html
                        resolveSrc(src, filepath, function (md5) {
                            if (md5) {
                                var urlObject = url.parse(src);
                                var params = qs.parse(urlObject.query);
                                params._ = md5;
                                urlObject.query = qs.stringify(params);
                                urlObject.search = urlObject.query;
                                var newSrc = url.format(urlObject);
                                html = html.replace(src, newSrc);
                            } else {
                                log.warning(src, "not found!");
                            }
                            pending++;
                            if (pending == count) {
                                // 写入文件
                                // log.info(html)
                                var destPath = path.join(value.p, global.destPath, value.c);
                                file.write(destPath, html);
                            }
                        });
                    }());
                }
            }
        });
    });
}