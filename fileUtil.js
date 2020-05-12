/**
 * Created by Administrator on 2020/5/13.
 */
const moment = require('moment')
const path = require('path')
const fs = require('fs')
function FileUtil() {

    var count = 0;
    this.newFileName = function () {
        var current = moment().format("mmssSSS")
        var index = count++;
        return current + String(index).padStart(3,'0') + '.txt';
    }

    this.checkPath = function () {
        var dir = "./files/" + moment().format("YYYY/MM/DD/HH/");
        var fulldir = path.join(__dirname, dir)
        console.log(fulldir)
        fs.mkdirSync(fulldir, { recursive: true }, (err) => {
            if (err) throw err;
        });
        return fulldir;
    }
};
module.exports = FileUtil;