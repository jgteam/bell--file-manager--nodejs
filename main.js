// --- Setup and Dependencies

const express = require('express');
const app = express();
const http = require('http').Server(app);
const mysql = require('mysql');
const uuid = require('uuid');

// Sessions: https://www.tutorialspoint.com/expressjs/expressjs_sessions.htm
const cookieParser = require('cookie-parser');
const session = require('express-session');

const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');

// Config-Variablen laden
const config = require('./config');

const port = config.port;
const rootURL = config.rootURL;

// --- Middlewares

// Session und Cookies
app.use(cookieParser());
app.use(session({secret: config.sessionSecret, resave: false, saveUninitialized: false}));

// Ermöglicht Dateiuploadsa
app.use(fileUpload({
    createParentPath: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// --- Mysql
// Neue Verbindung mit dem Datenbankserver aufbauen
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
// Generiert eine einzigartige ID (fileid)
function uniqueID() {
    return Date.now() + "--" + uuid.v4();
}

// Gibt die URL für den Dateidownload zurück
function getFileDownloadURL(fileid) {
    return rootURL + "download/" + fileid;
}

// Gibt entweder "false" zurück (falls die Fileid nicht in der Datenbank hinterlegt ist) oder den Dateinamen, welcher in der Datenbank hinterlegt ist.
function getFileName(fileid) {

    // Neues Versprechen erstellen, da die Funktion mit await aufgerufen wird
    return new Promise(function (resolve, reject) {

        // SELECT-QUERY ausführen
        con.query("SELECT * FROM files_nodejs WHERE id = " + con.escape(fileid), function (err, result, fields) {
            if (err) throw err;

            // Ergebnis überprüfen
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
    // UPLOAD

    // https://attacomsian.com/blog/uploading-files-nodejs-express
    try {

        if(!req.files) {
            // Falls keine Datei über POST übergeben wurde

            // Error-Antwort erstellen
            res.status(400).json({
                "status": false,
                "message": "No file uploaded"
            });

        } else {
            // Falls eine Datei über POST übergeben wurde

            // Fileid generieren
            var fileid = uniqueID();

            // Dateiobjekt in Variable schreiben
            var file = req.files.file;
            // Dateinamen auslesen
            var filename = file.name;

            // Datei in dem/den Ordner filestorage mit der fileid als Dateinamen speichern/verschieben
            file.mv("./filestorage/" + fileid);

            // https://www.w3schools.com/nodejs/nodejs_mysql_insert.asp
            // fileid und filename in die Datenbank aufnehmen
            var sql = "INSERT INTO files_nodejs (id, filename) VALUES (" + con.escape(fileid) + ", " + con.escape(filename) + ")";
            con.query(sql);


            // Antwort erstellen
            var response = {
                "status": true,
                "download": getFileDownloadURL(fileid),
                "filename": filename,
                // Weitere Eigenschaften
                "filetype": file.mimetype,
                "filesize": file.size,
                "md5": file.md5
            };

            // Antwort im Verlauf speichern
            if(!req.session.uploads) {
                req.session.uploads = [response];
            } else {
                var uploads = req.session.uploads;
                uploads.push(response);
                req.session.uploads = uploads;
            }


            // Erfolgs-Antwort übermitteln
            res.status(200).json(response);

        }

    } catch (err) {
        // Errorcatching, falls was mit dem Dateiupload nicht klappen sollte

        // Error-Antwort erstellen und in der Konsole den Error ausgeben
        console.log(err);
        res.status(500).json({
            status: false,
            message: 'Internal server error'
        });

    }

}).get('/download/:fileid', async function(req, res){
    // DOWNLOAD

    // fileid-Parameter in Variable schreiben
    var fileid = req.params.fileid;

    // Prüfen ob Datei/fileid existiert und falls ja, den Namen der Datenbank entnehmen
    var filename = await getFileName(fileid);

    if(filename === false) {
        // Datei ist nicht in der Datenbank vermerkt

        // Error-Antwort erstellen
        res.status(404).json({"status":false, "message": "File not found"});

    } else {
        // Datei ist in der Datenbank vermerkt

        // fileid im Verlauf speichern
        if(!req.session.downloads) {
            req.session.downloads = [fileid];
        } else {
            var downloads = req.session.downloads;
            downloads.push(fileid);
            req.session.downloads = downloads;
        }


        // Dateidownload-Antwort erstellen
        res.status(200).download("./filestorage/" + fileid, filename + "");

    }
}).get('/download', async function(req, res) {
    // PSEUDO-DOWNLOAD
    // fileid-Parameter fehlt

    // Error-Antwort erstellen
    res.status(400).json({"status":false, "message": "Fileid not defined"});
}).get('/getUploadHistory', async function(req, res) {
    // Upload-Verlauf übermitteln

    if(req.session.uploads) {
        res.status(200).json(req.session.uploads);
    } else {
        // Verlauf ist leer

        res.status(404).json(null);
    }

}).get('/getDownloadHistory', async function(req, res) {
    // Download-Verlauf übermitteln

    if(req.session.downloads) {
        res.status(200).json(req.session.downloads);
    } else {
        // Verlauf ist leer

        res.status(404).json(null);
    }

});

// --- Static files
app.get('/', function(req, res){
    // Übermittelt beim Aufrufen von der rootURL die HTML-Form (form.html)
    res.sendFile(__dirname + '/form.html');
}).get('/history', function(req, res){
    // Übermittelt beim Aufrufen von /history die HTML-Datei hist.html
    res.sendFile(__dirname + '/hist.html');
});

// --- Start listening
http.listen(port, function(){
    console.log('Listening on port ' + port);
});