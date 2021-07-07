const path = require('path');
const appRoot = require('app-root-path').path;
const fileSystem = require('fs');
const pythonShell = require('python-shell').PythonShell;
const pythonPath = path.resolve(appRoot, 'venv/bin/python');
const childProcess = require('child_process');
const pythonProcess = childProcess.spawn(pythonPath, ['-u', '-i']);
pythonProcess.stdout.setEncoding('utf8');
pythonProcess.stderr.setEncoding('utf8');

const commandQueue = [];


function processQueue() {
  if (commandQueue.length > 0 && commandQueue[0].state === 'pending') {
    commandQueue[0].state = 'processing';
    pythonProcess.stdin.write(commandQueue[0].command, encoding='utf8');
  }
};

function createPromise() {
  return new Promise((resolve, reject) => {
    pythonProcess.stdout.removeAllListeners();
    pythonProcess.stderr.removeAllListeners();

    pythonProcess.stdout.on('data', function(data) {
      let finished = false;
      if (data.match(/Command Start/)) {
        data = data.replace(/Command Start/, '');
      }
      if (data.match(/Command End/)) {
        data = data.replace(/Command End/, '');
        finished = true;
      }
      if (commandQueue.length > 0) {
        commandQueue[0].data += data;
      }
      if (finished) {
        cmd = commandQueue.shift();
        if (cmd && cmd.command) {
          if (cmd.errorData.trim()) {
            reject(cmd.errorData.trim());
          } else {
            resolve(cmd.data.trim());
          }
          processQueue();
        }
      }
    });

    pythonProcess.stderr.on('data', function(data) {
      if (data.includes('>>>')) {
        data = data.replaceAll('>>>', '');
      }
      if (data.includes('...')) {
        data = data.replaceAll('...', '');
      }
      if (commandQueue.length > 0) {
        commandQueue[0].errorData += data;
      }
      processQueue();
    });
  });
}

module.exports.executeCommand = function(command, callback) {
  callback = callback === undefined ? () => {} : callback;
  const promise = createPromise();

  command = 'print("Command Start")\n' + command + '\nprint("Command End")';
  if (command.charAt[command.length-1] != '\n') command += '\n';
  commandQueue.push({'command': command, 'data': '', 'errorData': '', 'state': 'pending'});
  processQueue();

  return promise
      .then((value) => {
        callback(value, null);
      })
      .catch((err) => {
        callback(null, err);
      });
};


/**
 * Runs a Python script file.
 * @param {string}   scriptPath Directory path to the script (excludes file name)
 * @param {string}   scriptName File name of the script
 * @param {string[]} args       Arguments to pass to the script
 * @param {Function} callback   Callback function to invoke with the script results
*/
module.exports.runScript = function(scriptPath, scriptName, args, callback) {
  if (!fileSystem.existsSync(pythonPath)) {
    throw new Error('cannot resolve Python virtual environment - execute the "npm run setup" command');
  }

  const options = {
    pythonPath: pythonPath,
    scriptPath: scriptPath,
    args: args,
  };

  pythonShell.run(scriptName, options, callback);
};

/**
 * Runs a string of Python code.
 * @param {string}   code     Python code to be executed
 * @param {string[]} args     Arguments to pass to the code
 * @param {Function} callback Callback function to invoke with the code results
*/
module.exports.runString = function(code, args, callback) {
  if (!fileSystem.existsSync(pythonPath)) {
    throw new Error('cannot resolve Python virtual environment - execute the "npm run setup" command');
  }

  const options = {
    pythonPath: pythonPath,
    args: args,
  };

  pythonShell.runString(code, options, callback);
};
