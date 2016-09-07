var fs = require('fs');
var log = require('narrolog');
var minify = require("html-minifier").minify;
var jsdom = require('jsdom');
var url = require('url');
var qs = require('querystring');
var request = require('request');
var crypto = require('crypto');
var path = require('path');
var md5file = require('md5-file');

var file = require('./file');

var minifyConfig = {
    removeAttributeQuotes: true,
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true
};

/**
 * $p 公共jquery对象,用于解析partial view
 */
var $p;

// 创建一个公共的window,用来解析partial view
jsdom.env('', function (err, publicWindow) {
    if (err) {
        log.err(err);
        return;
    }
    $p = require('jquery')(publicWindow);
});

/**
 * resolve 解析文件,替换引用标签,加上hash值
 * @param files 文件名(数组)
 */
exports.resolve = function (files) {
    files.forEach(function (value, index, array) {
        fs.readFile(value, function (err, data, aa) {
            if (err) {
                return log.error(err);
            }
            // 压缩
            // var html = minify(data.toString(), minifyConfig);
            var html = data.toString();
            // 在这里判断是partial view 还是完整的document 
            var htmlTest = /<\s*(html)\s*>/i;
            if (htmlTest.test(html)) {
                // 完整的document,创建一个新的window
                jsdom.env(html, function (err, window) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    var $ = require("jquery")(window);
                    var scripts = $("script");
                    resolveScripts(scripts, value, function () {
                        var destHtml = getHtml(window);
                        file.write(value, destHtml);
                    });
                });
            } else {
                // 使用全局的$p解析
                // 增加一个新元素
                html = "<narro>" + html + "</narro>";
                var element = $p(html);
                var scripts = element.find("script");
                resolveScripts(scripts, value, function () {
                    var destHtml = element.html();
                    file.write(value, destHtml);
                });
            }
        });
    });
}

/**
 * resolveScripts 解析scripts对象,以一个html文件为单位
 * @param jquery object script
 * @param callback 成功回调
 */
function resolveScripts(scripts, filepath, callback) {
    var pending = 0;
    var count = scripts.length;
    scripts.each(function (index, element) {
        var target = scripts.eq(index);
        var src = target.attr("src");
        if (!src) {
            pending++;
            return;
        }
        resolveSrc(src, filepath, function (md5) {
            if (md5) {
                var urlObject = url.parse(src);
                var params = qs.parse(urlObject.query);
                params._ = md5;
                urlObject.query = qs.stringify(params);
                urlObject.search = "?" + urlObject.query;
                src = url.format(urlObject);
                target.attr("src", src);
            } else {
                log.warning(src, "not found!");
            }
            pending++;
            if (pending == count) {
                // 当前文件所有的url解析完毕
                callback();
            }
        });
    });
}

/**
 * resolveSrc 解析url,获取文件
 * @param src url 地址
 * @param filepath html文件路径
 * @param callback 回调函数,若成功,传回md5参数,否则传null
 */
function resolveSrc(src, filepath, callback) {
    var h = /^\s*https?:\/\//i;
    var r = /^\s*\//i;
    if (h.test(src)) {
        // 完整的url
        request(src, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                var md5 = crypto.createHash('md5').update(body).digest('hex');
                callback(md5);
            } else {
                log.error(err);
                callback();
            }
        });
    } else if (r.test(src)) {
        // 从网站根目录计算
        callback();
    } else {
        // 以当前路径为目标
        var urlObject = url.parse(src);

        var target = path.join(path.dirname(filepath), urlObject.pathname);
        md5file(target, function (err, hash) {
            callback(hash);
        });
    }
}

/**
 * getHtml 获取html string 
 */
function getHtml(window) {
    return getDocTypeAsString(window) + window.document.documentElement.outerHTML;
}

/**
 * getDocTypeAsString 获取doctype
 */
function getDocTypeAsString(window) {
    var node = window.document.doctype;
    return node ? "<!DOCTYPE "
        + node.name
        + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
        + (!node.publicId && node.systemId ? ' SYSTEM' : '')
        + (node.systemId ? ' "' + node.systemId + '"' : '')
        + '>\n' : '';
};