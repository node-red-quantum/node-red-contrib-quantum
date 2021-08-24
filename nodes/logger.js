`use strict`;

const fs = require('fs');
const {dirname} = require('path');


function formatDate(date) {
  let year = String(date.getFullYear());
  let month = String(date.getMonth() + 1).padStart(2, '0');
  let day = String(date.getDate()).padStart(2, '0');
  let hour = String(date.getHours()).padStart(2, '0');
  let minute = String(date.getMinutes()).padStart(2, '0');
  let second = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function logToFile(fileName, logLevel, id, message) {
  if (process.env.NODE_ENV !== 'dev') {
    return;
  }

  let dir = dirname(fileName);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  let now = new Date();
  let timestamp = formatDate(now);
  let log = `[${timestamp}] [${logLevel}] [${id}] ${message}\n`;
  fs.appendFile(fileName, log, function(err) {
    if (err) {
      console.error(`Failed to log to file ${fileName}: ${err}`);
    }
  });
}


let fileName = formatDate(new Date());
fileName = fileName.replace(/ /g, '_');
fileName = `logs/${fileName}.log`;

module.exports = {
  fatal(id, message) {
    logToFile(fileName, 'FATAL', id, message);
  },
  error(id, message) {
    logToFile(fileName, 'ERROR', id, message);
  },
  warn(id, message) {
    logToFile(fileName, 'WARN', id, message);
  },
  info(id, message) {
    logToFile(fileName, 'INFO', id, message);
  },
  debug(id, message) {
    logToFile(fileName, 'DEBUG', id, message);
  },
  trace(id, message) {
    logToFile(fileName, 'TRACE', id, message);
  },
};
