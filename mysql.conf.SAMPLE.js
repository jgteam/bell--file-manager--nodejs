// https://stackoverflow.com/questions/5869216/how-to-store-node-js-deployment-settings-configuration-files

/*
--
-- Tabellenstruktur für Tabelle `files`
--

CREATE TABLE `files` (
  `id` varchar(64) NOT NULL,
  `filename` varchar(512) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


--
-- Indizes für die Tabelle `files`
--

ALTER TABLE `files`
  ADD PRIMARY KEY (`id`);
COMMIT;
*/

const config = {};

config.host = "localhost";
config.user = "user";
config.password = "password";
config.database = "dbname";

module.exports = config;

