var fs = require('fs');
var log = require('narrolog');
var minify = require("html-minifier").minify;
var jsdom = require('jsdom');

var minifyConfig = {
    removeAttributeQuotes: true,
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true
};

/**
 * resolve 解析文件,替换引用标签,加上hash值
 */
exports.resolve = function (files) {
    for (var i = 0; i < files.length; i++) {
        fs.readFile(files[i], function (err, data) {
            if (err) {
                return log.error(err);
            }
            // 压缩
            // var html = minify(data.toString(), minifyConfig);
            var html = data.toString();
            log.info(html);
            // 创建window
            jsdom.env(html, function (err, window) {
                if (err) {
                    console.error(err);
                    return;
                }
                var $ = require("jquery")(window);
                var scripts = $("script");
            });
        });
    }
}