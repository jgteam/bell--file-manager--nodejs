const express = require('express');
const app = express();
const http = require('http').Server(app);
const mysql = require('mysql');
const uuid = require('uuid');

const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');

const Mysqlconfig = require('./mysql.conf');

const port = process.env.PORT || "3000";

// eg: "https://example.com/"
const rootURL = "http://localhost:3000/";

// enable files upload
app.use(fileUpload({
    createParentPath: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));



// https://www.w3schools.com/nodejs/nodejs_mysql.asp
const con = mysql.createConnection({
    host: Mysqlconfig.host,
    user: Mysqlconfig.user,
    password: Mysqlconfig.password,
    database: Mysqlconfig.database
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to MariaDB Server!");
});

function uniqueID() {
    return Date.now() + "--" + uuid.v4();
}

function getFileDownloadURL(fileid) {
    return rootURL + "download/" + fileid;
}

function getFileSourceURL(fileid) {
    return rootURL + "view/" + fileid;
}

function getFileName(fileid) {

    return new Promise(function (resolve, reject) {

        con.query("SELECT * FROM files_nodejs WHERE id = " + con.escape(fileid), function (err, result, fields) {
            if (err) throw err;

            if(result.length < 1) {
                resolve(false);
            } else {
                resolve(result[0].filename);
            }
        });

    });

}









app.get('/', function(req, res){
    res.sendFile(__dirname + '/form.html');
});

app.post('/upload', async function(req, res){

    // https://attacomsian.com/blog/uploading-files-nodejs-express
    try {
        if(!req.files) {
            res.json({
                "status": false,
                "message": "No file uploaded"
            });
        } else {

            var fileid = uniqueID();
            var file = req.files.file;
            var filename = file.name;

            file.mv("./filestorage/" + fileid);

            // https://www.w3schools.com/nodejs/nodejs_mysql_insert.asp
            var sql = "INSERT INTO files_nodejs (id, filename) VALUES (" + con.escape(fileid) + ", " + con.escape(filename) + ")";
            con.query(sql, /*function (err, result) {
                if (err) throw err;
            }*/);

            res.json({
                "status": true,
                "filename": filename,
                "download": getFileDownloadURL(fileid)
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: false,
            message: 'Internal Server Error 500'
        });
    }
});

app.get('/download/:fileid', async function(req, res){

    var fileid = req.params.fileid;

    var filename = await getFileName(fileid);

    if(filename === false) {
        res.status(404).json({"status":false, "message": "File not found!"});
    } else {

        res.status(200).download("./filestorage/" + fileid, filename + "");

    }
});


http.listen(port, function(){
    console.log('Listening on port ' + port);
});