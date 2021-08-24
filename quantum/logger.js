`use strict`;

const fs = require('fs');


function formatDate(date) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hour = date.getHours();
  let minute = date.getMinutes();
  let second = date.getSeconds();
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function createFile(file) {
  fs.writeFile(file, '', function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log('File ' + file + ' created');
    }
  });
}

function logToFile(fileName, logLevel, message) {
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
    createFile(fileName);
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
