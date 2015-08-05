var testModule = require("./index");
var fs = require('fs');

var c = {
  succeed: function (msg) {
    console.log("succeed: " + msg);
    //fs.rmdirSync("C:/tmp");
    //fs.mkdirSync("C:/tmp");
    process.exit();
  },
  fail: function (msg) {console.log("fail: " + msg); process.exit();},
  done: function (msg) {console.log("done: " + msg); process.exit();}
};

var e = {};
testModule.pubPush(e, c);
