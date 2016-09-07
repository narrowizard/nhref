var fs = require('fs');
var log = require('narrolog');
var minify = require("html-minifier").minify;
var jsdom = require('jsdom');
var url = require('url');
var qs = require('querystring');

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
    for (var i = 0; i < files.length; i++) {
        fs.readFile(files[i], function (err, data) {
            if (err) {
                return log.error(err);
            }
            // 压缩
            // var html = minify(data.toString(), minifyConfig);
            var html = data.toString();
            // 在这里判断是partial view 还是完整的document 
            var htmlTest = /<\s*(html)\s*>/i;
            if (htmlTest.test(html)) {
                log.info(html);
                // 完整的document,创建一个新的window
                jsdom.env(html, function (err, window) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    var $ = require("jquery")(window);
                    var scripts = $("script");
                    resolveScripts(scripts);
                    var destHtml = getHtml(window);
                    log.info(destHtml);
                });
            } else {
                // 使用全局的$p解析
                // 增加一个新元素
                html = "<narro>" + html + "</narro>";
                var element = $p(html);
                log.info(html);
                var scripts = element.find("script");
                resolveScripts(scripts);
                var destHtml = element.html();
                log.info(destHtml);
            }
        });
    }
}

/**
 * resolveScripts 解析scripts对象
 * @param jquery object script
 */
function resolveScripts(scripts) {
    var pending = 0;
    for (var i = 0; i < scripts.length; i++) {
        pending++;
        var target = scripts.eq(i);
        var src = target.attr("src");
        // 添加md5
        if (!src) {
            pending--;
            continue;
        }
        var urlObject = url.parse(src);
        var params = qs.parse(urlObject.query);

        params._ = "anewmd5value";
        urlObject.query = qs.stringify(params);
        urlObject.search = "?" + urlObject.query;
        src = url.format(urlObject);

        target.attr("src", src);
        pending--;
    }
}

/**
 * resolveSrc 解析url,获取文件
 * @param src url 地址
 * @param target 目标jquery对象
 */
function resolveSrc(src) {
    var h = /^\s*http(s):\/\//;
    if (h.test(src)) {
        // 完整的url

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