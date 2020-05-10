const express = require('express')
const path = require('path')
const moment = require('moment')
const fs = require('fs')
const mysql = require("mysql");

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const viewsDir = path.join(__dirname, 'views')
app.use(express.static(viewsDir))
app.use(express.static(path.join(__dirname, './public')))

app.get('/', (req, res) => res.redirect('/newPage'))
app.get('/newPage', (req, res) => res.sendFile(path.join(viewsDir, 'newPage.html')))
app.get('/viewPage', (req, res) => res.sendFile(path.join(viewsDir, 'viewPage.html')))
app.get('/editPage', (req, res) => res.sendFile(path.join(viewsDir, 'editPage.html')))
const db_config={
    host:"118.24.5.251",
    user:"game",
    password:"game123",
    port:"13306",
    database:"file_info"
}
const connect=mysql.createConnection(db_config);
//开始链接数据库
connect.connect(function(err){
    if(err){
        console.log(`mysql连接失败: ${err}!`);
    }else{
        console.log("mysql连接成功!");
    }
});
var count = 0;
function newFileName() {
    var current = moment().format("mmssSSS")
    var index = count++;
    return current + String(index).padStart(3,'0') + '.txt';
}

function checkPath() {
    var dir = "./files/" + moment().format("YYYY/MM/DD/HH/");
    var fulldir = path.join(__dirname, dir)
    console.log(fulldir)
    fs.mkdirSync(fulldir, { recursive: true }, (err) => {
        if (err) throw err;
    });
    return fulldir;
}
app.post('/saveFile', async (req, res) => {
    const { fileName,content } = req.body;
    var path = checkPath();
    var uniqueName = newFileName();
    var fullName = path + uniqueName;
    fs.writeFile(fullName,content,(err)=>{
        if(err) throw err;
    })

    let sql = "INSERT INTO file_info (original_name,full_name,file_status) VALUES(?,?,0)";
    console.log(sql);
    connect.query(sql,[fileName,fullName],(err,result) => {
        if(err){
            console.log(`SQL error: ${err}!`);
            return res.status(500).send({err:result.message});
        }else{
            console.log(result);
            return res.status(200).send({ok:true,msg:" save success"});
        }
    })
})
app.get('/getFileList', async (req, res) => {

    let sql = "SELECT * FROM file_info";
    console.log(sql);
    connect.query(sql,(err,result) => {
        if(err){
            console.log(`SQL error: ${err}!`);
            return res.status(500).send({err:result.message});
        }else{
            console.log(result);
            return res.status(200).send({ok:true,data:result});
        }
    })
})
app.get('/download', async (req, res) => {
    let id = req.query.id;
    let sql = "SELECT * FROM file_info WHERE id = ?";
    console.log(sql);
    connect.query(sql,[id],(err,result) => {
        if(err){
            console.log(`SQL error: ${err}!`);
            return res.status(500).send({err:result.message});
        }else{
            console.log(result);
            if(result.length > 0){
                console.log(result[0].full_name);
                res.set({
                    "Content-Type":"application/octet-stream",
                    "Content-Disposition":"attachment; filename=" + result[0].original_name
                });
                fs.createReadStream(result[0].full_name).pipe(res);
                // res.sendFile();
            }else{
                return res.status(404).send({msg:"file not exist"});
            }
        }
    })
})

app.get('/getFileInfo', async (req, res) => {
    let id = req.query.id;
    let sql = "SELECT * FROM file_info WHERE id = ?";
    console.log(sql);
    connect.query(sql,[id],(err,result) => {
        if(err){
            console.log(`SQL error: ${err}!`);
            return res.status(500).send({err:result.message});
        }else{
            console.log(result);
            if(result.length > 0){
                console.log(result[0].full_name);
                let data = fs.readFileSync(result[0].full_name,'utf8');
                console.log(data)
                return res.status(200).send({ok:true,data:data});
                // res.sendFile();
            }else{
                return res.status(404).send({msg:"file not exist"});
            }
        }
    })
})
app.listen(8080, () => console.log('Listening on port 8080!'))

