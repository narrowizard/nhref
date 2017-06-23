var log = require('narrolog');
var args = require('optimist').options('p', {
    alias: "project"
}).options('d', {
    alias: "dest"
}).options('t', {
    alias: "type"
}).argv;

var finder = require('./finder').finder;

global.DEBUG = true;

(function () {
    // 设置网站根目录
    global.rootPath = args.p ? args.p : ".";
    global.destPath = args.d ? args.d : "../dest";
    global.resolveType = args.t ? args.t : "browser";

    var src = args._;
    if (src.length == 0) {
        src[0] = ".";
    }
    // 解析路径,查找目标文件
    finder(src);
    // finder(["C:\\code\\php\\kaogps\\application\\home\\view\\default\\layout"])
})();