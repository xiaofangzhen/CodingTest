const express = require('express')
const path = require('path')

const fs = require('fs')
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
const FileUtil = require('./fileUtil');
const fileUtil = new FileUtil();
const Db = require('./db');
const db = new Db();
db.init();

app.post('/saveFile', async (req, res) => {
    const { fileName,content } = req.body;
    var path = fileUtil.checkPath();
    var uniqueName = fileUtil.newFileName();
    var fullName = path + uniqueName;
    fs.writeFile(fullName,content,(err)=>{
        if(err) throw err;
    })

    let sql = "INSERT INTO file_info (original_name,full_name,file_status) VALUES(?,?,0)";
    db.getConnect().query(sql,[fileName,fullName],(err,result) => {
        if(err){
            console.log(`SQL error: ${err}!`);
            return res.status(500).send({err:err});
        }else{
            console.log(result);
            return res.status(200).send({ok:true,msg:" save success"});
        }
    })
})
app.get('/getFileList', async (req, res) => {
    let pageNo = req.query.pageNo;
    console.log(req.query)
    if(pageNo == null || parseInt(pageNo) < 0){
        pageNo = 1;
    }
    let start = (pageNo - 1)* 10;
    console.log(start)
    let sqlCount = "SELECT COUNT(*) AS num FROM file_info";
    db.getConnect().query(sqlCount,(err,result) => {
        if(err){
            console.log(`SQL error: ${err}!`);
            return res.status(500).send({err:err});
        }else{
            // console.log(result);
            var totalCount = result[0].num;
            let sql = "SELECT * FROM file_info ORDER BY id LIMIT ?,10";
            db.getConnect().query(sql,[start],(err,result) => {
                if(err){
                    console.log(`SQL error: ${err}!`);
                    return res.status(500).send({err:err});
                }else{
                    // console.log(result);
                    return res.status(200).send({ok:true,data:result,total:Math.ceil(totalCount/10)});
                }
            })
        }
    })
})

app.get('/download', async (req, res) => {
    let id = req.query.id;
    let sql = "SELECT * FROM file_info WHERE id = ?";
    console.log(sql);
    db.getConnect().query(sql,[id],(err,result) => {
        if(err){
            console.log(`SQL error: ${err}!`);
            return res.status(500).send({err:err});
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
                return res.status(200).send({err:"file not exist"});
            }
        }
    })
})

function unlockFile(id,ip) {
    let sql = "UPDATE file_info set file_status = 0 where id = ? AND user_ip = ?"
    db.getConnect().query(sql,[id,ip],(err,result) => {
        if(err){
            console.log("file unlock id : " + id + " fail");
            return false;
        }else{
            return true;
        }
    })
}

function lockFile(id,ip) {
    console.log(id,ip);
    let sql = "UPDATE file_info set file_status = 1 , user_ip = ? where id = ?"
    db.getConnect().query(sql,[ip,id],(err,result) => {
        if(err){
            console.log("file lock id : " + id + " fail");
            return false;
        }else{
            setTimeout(function(){
                unlockFile(id,ip);
            },60000);
            return true;
        }
    })
}

app.get('/getEditFileInfo', async (req, res) => {
    let id = req.query.id;
    let sql = "SELECT * FROM file_info WHERE id = ?";
    db.getConnect().query(sql,[id],(err,result) => {
        if(err){
            console.log(`SQL error: ${err}!`);
            return res.status(200).send({err:err});
        }else{
            console.log(result);
            if(result.length > 0){
                if (result[0].file_status != 1){
                    lockFile(id,req.ip);
                }else if(result[0].user_ip != req.ip){
                    return res.status(200).send({err:"file is locked"});
                }
                let data = fs.readFileSync(result[0].full_name,'utf8');
                return res.status(200).send({ok:true,data:data,version:result[0].version,id:result[0].id});
                // res.sendFile();
            }else{
                return res.status(200).send({err:"file not exist"});
            }
        }
    })
})



app.post('/lockFile', async (req, res) => {
    const { id } = req.body;
    let sql = "SELECT * FROM file_info WHERE id = ?";
    db.getConnect().query(sql,[id],(err,result) => {
        if(err){
            console.log(`SQL error: ${err}!`);
            return res.status(200).send({err:err});
        }else{
            if(result.length > 0){
                if (result[0].file_status == 1 && result[0].user_ip != req.ip){
                    return res.status(200).send({err:"file is locked"})
                }else{
                    let lock = "UPDATE file_info set file_status = 1,user_ip = ? where id = ?";
                    db.getConnect().query(lock,[req.ip,id],(err,result) => {
                        if(err){
                            return res.status(200).send({err:"file lock fail"});
                        }else{
                            setTimeout(function(){
                                unlockFile(id,req.ip);
                            },60000);
                            return res.status(200).send({ok:true,id:id});
                        }
                    })
                }
            }else{
                return res.status(200).send({err:"file not exist"});
            }
        }
    })
})

app.post('/editFile', async (req, res) => {
    const { id,version,content } = req.body;

    let sql = "SELECT * FROM file_info where id = ?";
    console.log(id,version,content);
    db.getConnect().query(sql,[id],(err,result) => {
        if(err){
            console.log(`SQL error: ${err}!`);
            return res.status(200).send({err:err});
        }else{
            console.log(result);
            if(result.length > 0){
                if(result[0].version != version){
                    return res.status(200).send({err:"file has changed"})
                }else{
                    fs.writeFile(result[0].full_name,content,(err)=>{
                        if(err) throw err;
                    })
                    let update = "UPDATE file_info set version=version+1 where id = ?";
                    db.getConnect().query(update,[id],(err,result) => {
                        console.log(result)
                        if(err){
                            console.log(`SQL error: ${err}!`);
                            return res.status(200).send({err:err});
                        }else{
                            let sql1 = "SELECT * FROM file_info WHERE id = ?"
                            db.getConnect().query(sql1,[id],(err,result) => {
                                if(err){
                                    console.log(`SQL error: ${err}!`);
                                    return res.status(200).send({err:err});
                                }else{
                                    return res.status(200).send({ok:true,msg:"save success",version:result[0].version});
                                }
                            })
                        }
                    })
                }
            }else{
                return res.status(200).send({msg:"file not exist"});
            }
        }
    })
})
app.listen(8080, '0.0.0.0',() => console.log('Listening on port 8080!'))

