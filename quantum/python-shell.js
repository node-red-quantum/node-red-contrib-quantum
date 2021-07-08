const path = require('path');
const appRoot = require('app-root-path').path;
const fileSystem = require('fs');
const pythonScript = require('python-shell').PythonShell;
const pythonPath = path.resolve(appRoot, 'venv/bin/python');
const childProcess = require('child_process');


function processQueue(process, commandQueue) {
  if (commandQueue.length > 0 && commandQueue[0].pending) {
    commandQueue[0].pending = false;
    process.stdin.write(commandQueue[0].command);
  }
};

function createPromise(process, commandQueue) {
  return new Promise((resolve, reject) => {
    process.stdout.removeAllListeners();
    process.stderr.removeAllListeners();

    process.stdout.on('data', function(data) {
      let done = false;

      if (data.match(/#CommandStart#/)) {
        data = data.replace(/#CommandStart#/, '');
      } if (data.match(/#CommandEnd#/)) {
        data = data.replace(/#CommandEnd#/, '');
        done = true;
      } if (commandQueue.length > 0) {
        commandQueue[0].data += data;
      }

      if (done) {
        cmd = commandQueue.shift();
        if (cmd.errorData.trim()) {
          reject(cmd.errorData);
        } else {
          resolve(cmd.data);
        }
        processQueue(process, commandQueue);
      }
    });

    process.stderr.on('data', function(data) {
      if (data.includes('>>>')) {
        data = data.replaceAll('>>>', '');
      } if (data.includes('...')) {
        data = data.replaceAll('...', '');
      } if (commandQueue.length > 0) {
        commandQueue[0].errorData += data;
      }
      processQueue(process, commandQueue);
    });
  });
}

class PythonShell {
  /**
   * Initialises a new Python shell instance.
   *
   * Each instance of PythonShell spawns its own shell, separate from all other instances.
   * @param {string} path Location of the Python executable. Uses venv executable by default.
  */
  constructor(path) {
    this.path = path ? path : pythonPath;
    this.process = childProcess.spawn(this.path, ['-u', '-i']);
    this.process.stdout.setEncoding('utf8');
    this.process.stderr.setEncoding('utf8');
    this.commandQueue = [];
  }

  /**
   * Executes a string of Python code and returns the output via a Promise.
   *
   * Calls to this function must be done asynchronously through the use of 'async' and 'await'.
   *
   * @param {string} command Python command(s) to be executed. May be a single command or
   * multiple commands which are separated by a new line. If undefined, an empty line is executed.
   *
   * @param {function(string, string):void} callback Callback function to be run on completion.
   * If command execution was succesful, arg0 of the callback function is the result and arg1 is
   * null. If the command returned an error, arg0 of the callback function is null and arg1 is the
   * error message. If undefined, the output is returned by the Promise, and any errors are returned
   * as strings rather than Error objects.
   *
   * @return {Promise<string>} Returns a Promise object which will run the callback function,
   * passing the command output as a parameter. If the command is successful the Promise is
   * resolved, otherwise it is rejected.
  */
  async execute(command, callback) {
    command = command ? command : '';
    const promise = createPromise(this.process, this.commandQueue);

    command = 'print("#CommandStart#")\n' + command + '\nprint("#CommandEnd#")';
    if (command.charAt[command.length-1] != '\n') command += '\n';
    this.commandQueue.push({'command': command, 'data': '', 'errorData': '', 'pending': true});
    processQueue(this.process, this.commandQueue);

    return promise
        .then((value) => {
          return callback !== undefined ? callback(value.trim(), null) : value.trim();
        })
        .catch((err) => {
          return callback !== undefined ? callback(null, err.trim()) : err.trim();
        });
  }
}

/**
 * The global Python shell for the project.
 *
 * This shell instance will be maintained throughout the entire lifetime of a flow. Any variables,
 * functions, and objects which are created will be kept in memory until the flow ends.
*/
module.exports.PythonShell = new PythonShell();

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

  pythonScript.run(scriptName, options, callback);
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

  pythonScript.runString(code, options, callback);
};
