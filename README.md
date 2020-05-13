# CodingTest

# 运行环境
node v12.16.1
mysql v5.6
# mysql 配置

编辑 db.js
···bash
const db_config={
    host:"118.24.5.251",	//mysql 地址
    user:"game",			//账号
    password:"game123",		//密码
    port:"13306",			//端口
    database:"file_info"	//用户名
}
···
db_config中mysql的地址是外网ip，可以直接使用。

导入表结构，将sql/file_info.sql导入mysql中
# 运行程序
1.下载代码
git clone https://github.com/xiaofangzhen/CodingTest.git
2.安装依赖
npm install
3.运行程序
npm start
4.打开浏览器访问:ip:8080

# 系统说明
1.编辑锁
当有用户进行编辑时，会在数据库中将文件标记为锁定状态，即file_status=1；同时将user_ip设置为当前用户的ip
2.当用户要进行编辑时，会判断文件是否被锁定；没锁定则可以编辑。如果处于锁定状态，判断user_ip是否等于当前用户ip，ip相等可以编辑
3.每次修改后，会将文件的版本+1。
4.在编辑完成后，对文件进行保存时，会判断文件的版本是否和打开时一致，如果不一致则无法保存，提示用户重新加载文件
5.用户打开文件后，会锁定1分钟，1分钟之后解锁，其他用户可以进行编辑
6.文件保存在，工程目录下的files/下。目录根据日期进行划分。

