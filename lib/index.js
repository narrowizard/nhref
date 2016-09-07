var log = require('narrolog');
var args = require('optimist').options('p', {
    alias: "project"
}).argv;

var finder = require('./finder').finder;

global.DEBUG = true;

exports.handler = function () {
    // 设置网站根目录
    global.rootPath = args.p ? args.p : ".";

    var src = args._;
    if (src.length == 0) {
        src[0] = ".";
    }
    // 解析路径,查找目标文件
    finder(src);
}

exports.handler();