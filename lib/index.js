var log = require('narrolog');
var args = require('optimist').argv;

var finder = require('./finder').finder;

global.DEBUG = true;

exports.handler = function () {
    var src = args._;
    if (src.length == 0) {
        src[0] = "/";
    }
    // 解析路径,查找目标文件
    finder(src);
}

exports.handler();