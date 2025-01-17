// https://stackoverflow.com/questions/5869216/how-to-store-node-js-deployment-settings-configuration-files

/*
--
-- Tabellenstruktur für Tabelle `files_nodejs`
--
CREATE TABLE `files_nodejs` ( `id` VARCHAR(64) NOT NULL , `filename` VARCHAR(512) NOT NULL , `uploadtimestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`id`)) ENGINE = InnoDB;
*/

const config = {};

// DB-Server
config.host = "localhost";
config.user = "user";
config.password = "password";
config.database = "dbname";

// Webserver
config.port = "3000";
config.rootURL = "http://localhost:3000/";

// Session Secret
config.sessionSecret = "shouldBeChanged!";

module.exports = config;

