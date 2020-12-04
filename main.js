// --- Setup and Dependencies

const express = require('express');
const app = express();
const http = require('http').Server(app);
const mysql = require('mysql');
const uuid = require('uuid');

const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');

const config = require('./config');

const port = config.port;
const rootURL = config.rootURL;

// --- Middlewares

// enable files upload
app.use(fileUpload({
    createParentPath: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// --- Mysql
// https://www.w3schools.com/nodejs/nodejs_mysql.asp
const con = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to MariaDB Server!");
});

// --- Functions
function uniqueID() {
    return Date.now() + "--" + uuid.v4();
}

function getFileDownloadURL(fileid) {
    return rootURL + "download/" + fileid;
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

// --- Router for "upload" and "download"
app.post('/upload', async function(req, res){

    // https://attacomsian.com/blog/uploading-files-nodejs-express
    try {

        if(!req.files) {
            res.status(400).json({
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

            res.status(200).json({
                "status": true,
                "filename": filename,
                "download": getFileDownloadURL(fileid)
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
}).get('/download/:fileid', async function(req, res){

    var fileid = req.params.fileid;

    var filename = await getFileName(fileid);

    if(filename === false) {
        res.status(404).json({"status":false, "message": "File not found"});
    } else {

        res.status(200).download("./filestorage/" + fileid, filename + "");

    }
}).get('/download', async function(req, res) {
    res.status(400).json({"status":false, "message": "Fileid not defined"});
});



// --- Static files
app.get('/', function(req, res){
    res.sendFile(__dirname + '/form.html');
});


// --- Start listening
http.listen(port, function(){
    console.log('Listening on port ' + port);
});