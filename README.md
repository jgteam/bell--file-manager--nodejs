# File-Manager API (Stack: Node.js)

💡 Dieses Repo ist im Zusammenhang mit der [besonderen Lernleistung im Fach Informatik von Jannis Günsche](https://github.com/jgteam/bell--paper) entstanden.

💡 Dieses Projekt wurde auch in drei anderen Softwarestacks umgesetzt:
- [File Manager API in Deno](https://github.com/jgteam/bell--file-manager--deno)
- [File Manager API in PHP](https://github.com/jgteam/bell--file-manager--php)
- [File Manager API in PHP (ohne JavaScript)](https://github.com/jgteam/bell--file-manager--php--nojs)

## Stack

Es handelt sich hier um eine **MEN**-Stack Applikation.

- M: MariaDB (MySQL, etc)
- E: Express (NPM-Module)
- N: Nodejs

Weitere Software, welche zum Einsatz kommt:

- body-parser (NPM-Module)
- cookie-parser (NPM-Module)
- express-session (NPM-Module)
- express-fileupload (NPM-Module)
- mysql (NPM-Module)
- (nodemon (NPM-Module))
- uuid (NPM-Module)
- jQuery

## Vorbereitung
Benenne `config.SAMPLE.js` zu `config.js` um und ersetze die Platzhalter-Werte mit deinen eigenen.
Beachte die Tabellenstruktur, welche in dieser Datei beschrieben wird.

## Installation
```
npm install
```

## Benutzung 
Start server:
```
npm start
```

### API

💡 Die API-Schnittstelle ist in alles Softwarestacks identisch aufgebaut.

❗ Die `rootURL` (hier *http://localhost/*) ist je nach Aufsetzung des Servers unterschiedlich.

**Upload:**

```POST```: ```http://localhost/upload```

**Upload-Parameter:**

```file```: Typ: *file*

❗ Beachte: Benutze *enctype="multipart/form-data"* um einen Dateiupload zu ermöglichen.

❗ Beachte: Es können neben Textdateien auch andere Dateiformate u.U. auf den Server hochgeladen werden, was ein Sicherheitsrisiko darstellt.

**Upload-Responses:**
Beschreibung | HTTP-Status-Code | JSON-Response Beispiel
--- | --- | ---
Erfolgreicher Upload | 200 | `{"status":true,"download":"http://localhost/download/1234567890--12ab3456-abcd-12a3-a123-123ab45c6d7e","filename":"filename.txt","filetype":"text/plain","filesize":16000,"md5":"ef16af3769aa57977d1555eee6575af3"}`
Upload fehlgeschlagen, da keine Datei durch den `file`-Parameter bereitgestellt wurde | 400 | `{"status":false,"message":"No file uploaded"}`
*Internal server error* | 500 | `{"status":false,"message":"Internal server error"}`

**Download:**

```GET```: ```http://localhost/download/{fileid}```

**Download-Parameter:**

```fileid```(: Typ: *URL-String/Fileid*)

**Download-Responses:**
Beschreibung | HTTP-Status-Code | JSON-Response Beispiel
--- | --- | ---
Erfolgreicher Download | 200 | *Anstelle von einer JSON-Response wird der Dateidownload gestartet*
Download fehlgeschlagen, da der *fileid*-Parameter nicht definiert wurde | 400 | `{"status":false,"message":"Fileid not defined"}`
Download fehlgeschlagen, da der *fileid*-Parameter leer war | 400 | `{"status":false,"message":"Fileid empty"}`
Download fehlgeschlagen, da die Datei auf dem Server nicht gefunden wurde | 404 | `{"status":false,"message":"File not found"}`

**Sessionbasierter Verlauf:**

```GET```: ```http://localhost/getDownloadHistory```

und 

```GET```: ```http://localhost/getUploadHistory```

**Verlauf-Parameter:**

*Keine, da die benötigte Session-ID über die gesetzten Cookies übermittlet wird.*

**Verlauf-Responses:**
Beschreibung | HTTP-Status-Code | JSON-Response Beispiel
--- | --- | ---
Verlauf vorhanden | 200 | `[{"status":true,"download":"http://localhost/download/1234567890--12ab3456-abcd-12a3-a123-123ab45c6d7e","filename":"filename.txt","filetype":"text/plain","filesize":16000,"md5":"ef16af3769aa57977d1555eee6575af3"}]`
Verlauf nicht vorhanden | 404 | `null`
Funktion wird noch nicht unterstützt | 501 | `{"status":false,"message":"Not implemented"}`
