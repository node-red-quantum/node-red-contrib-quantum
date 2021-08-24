`use strict`;

const fs = require('fs');


function formatDate(date) {
  let year = date.getFullYear();
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

  let now = new Date();
  let timestamp = formatDate(now);
  let log = `[${timestamp}] [${logLevel}] ${message}\n`;
  fs.appendFile(fileName, log, function(err) {
    if (err) {
      console.log(err);
    }
  });
}

class Logger {
  constructor(fileName) {
    this.fileName = fileName;
    this.info('Logger created');
  }

  fatal(message) {
    logToFile(this.fileName, 'FATAL', message);
  }

  error(message) {
    logToFile(this.fileName, 'ERROR', message);
  }

  warn(message) {
    logToFile(this.fileName, 'WARN', message);
  }

  info(message) {
    logToFile(this.fileName, 'INFO', message);
  }

  debug(message) {
    logToFile(this.fileName, 'DEBUG', message);
  }

  trace(message) {
    logToFile(this.fileName, 'TRACE', message);
  }
}


let fileName = formatDate(new Date());
fileName = fileName.replace(/ /g, '_');
module.exports.Logger = new Logger(`logs/${fileName}.log`);
