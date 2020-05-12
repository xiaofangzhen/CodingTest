/**
 * Created by Administrator on 2020/5/13.
 */

const mysql = require("mysql");
const db_config={
    host:"118.24.5.251",
    user:"game",
    password:"game123",
    port:"13306",
    database:"file_info"
}
function Db() {
    var connect;
    this.getConnect = function() {
        return connect;
    };
    this.init = function () {
        connect = mysql.createConnection(db_config);
        //开始链接数据库
        connect.connect(function(err){
            if(err){
                console.log(`mysql连接失败: ${err}!`);
            }else{
                console.log("mysql连接成功!");
            }
        });
    }
};
module.exports = Db;