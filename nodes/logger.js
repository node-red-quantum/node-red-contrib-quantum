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

function logToFile(fileName, logLevel, message) {
  if (process.env.NODE_ENV !== 'dev') {
    return;
  }

  let dir = dirname(fileName);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  let now = new Date();
  let timestamp = formatDate(now);
  let log = `[${timestamp}] [${logLevel}] ${message}\n`;
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
  fatal(message) {
    logToFile(fileName, 'FATAL', message);
  },
  error(message) {
    logToFile(fileName, 'ERROR', message);
  },
  warn(message) {
    logToFile(fileName, 'WARN', message);
  },
  info(message) {
    logToFile(fileName, 'INFO', message);
  },
  debug(message) {
    logToFile(fileName, 'DEBUG', message);
  },
  trace(message) {
    logToFile(fileName, 'TRACE', message);
  },
};
