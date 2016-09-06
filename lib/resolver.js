var fs = require('fs');
var log = require('narrolog');
var minify = require("html-minifier").minify;
var $;
// 创建window
require("jsdom").env("", function (err, window) {
    if (err) {
        console.error(err);
        return;
    }

    $ = require("jquery")(window);
});

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
            var html = minify(data.toString(), minifyConfig);
            log.info(html);
            var document = $(html);
            var scripts = document.find("script");
        });
    }
}