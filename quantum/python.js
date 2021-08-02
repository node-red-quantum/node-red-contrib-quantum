'use strict';

const os = require('os');
const path = require('path');
const appRoot = require('app-root-path').path;
const dedent = require('dedent-js');
const fileSystem = require('fs');
const pythonScript = require('python-shell').PythonShell;
const pythonExecutable =
  os.platform() === 'win32' ? 'venv/Scripts/python.exe' : 'venv/bin/python';
const pythonPath = path.resolve(appRoot, pythonExecutable);
const childProcess = require('child_process');
const Mutex = require('async-mutex').Mutex;
const mutex = new Mutex();

function createPromise(process) {
  return new Promise((resolve, reject) => {
    let outputData = '';
    let errorData = '';

    process.stdout.on('data', function(data) {
      let done = false;

      if (data.match(/#CommandStart#/)) {
        data = data.replace(/#CommandStart#/, '');
      }
      if (data.match(/#CommandEnd#/)) {
        data = data.replace(/#CommandEnd#/, '');
        done = true;
      }
      outputData += data;

      if (done) {
        process.stdout.removeAllListeners();
        process.stderr.removeAllListeners();
        if (errorData.trim()) {
          reject(errorData);
        } else {
          resolve(outputData);
        }
      }
    });

    process.stderr.on('data', function(data) {
      if (data.includes('>>>')) {
        data = data.replace(/>>>/g, '');
      }
      if (data.includes('...')) {
        data = data.replace(/.../g, '');
      }

      // When the input is a code block, the result will sometimes (seemingly non-deterministicly)
      // be a single period. This is a workaround to prevent it being added to the output.
      if (data.trim() === '.') {
        data = '';
      }

      errorData += data;
    });
  });
}

class PythonShell {
  /**
   * Initialises a new PythonShell instance.
   *
   * Each instance of PythonShell spawns its own shell, separate from all other instances.
   * @param {string} path Location of the Python executable. Uses venv executable by default.
   */
  constructor(path) {
    this.path = path ? path : pythonPath;
    this.script = '';
  }

  /**
   * Executes a string of Python code and returns the output via a Promise.
   *
   * Calls to this method must be done asynchronously through the use of 'async' and 'await'.
   *
   * @param {string} command Python command(s) to be executed. May be a single command or
   * multiple commands which are separated by a new line. If undefined, an empty line is executed.
   * @param {function(string, string):void} callback Callback function to be run on completion.
   * If command execution was succesful, arg1 of the callback function is the result and arg0 is
   * null. If the command returned an error, arg1 of the callback function is null and arg0 is the
   * error message. If undefined, the output is returned by the Promise, and any errors are returned
   * as strings rather than Error objects.
   * @return {Promise<string>} Returns a Promise object which will run the callback function,
   * passing the command output as a parameter. If the command is successful the Promise is
   * resolved, otherwise it is rejected.
   * @throws {Error} Throws an Error if the Python process has not been started.
   */
  async execute(command, callback) {
    // if (!this.process) {
    //   throw new Error('Python process has not been started - call start() before executing commands.');
    // }

    // await new Promise((resolve) => {
    //   const timer = setInterval(() => {
    //     if (!this.process.stdout.readableFlowing && !this.process.stderr.readableFlowing) {
    //       resolve();
    //       clearInterval(timer);
    //     }
    //   }, 250);
    // });

    // command = command ? dedent(command) : '';
    // this.script += '\n' + command + '\n';
    // command = '\nprint("#CommandStart#")\n' + command + '\nprint("#CommandEnd#")\n';

    // const promise = createPromise(this.process);
    // this.process.stdin.write(command);

    // return promise
    //     .then((data) => callback !== undefined ? callback(null, data.trim()) : data.trim())
    //     .catch((err) => callback !== undefined ? callback(err.trim(), null) : err.trim());

    if (!this.process) {
      throw new Error(
          'Python process has not been started - call start() before executing commands.',
      );
    }

    let promise;
    await mutex.runExclusive(async () => {
      command = command ? dedent(command) : '';
      this.script += '\n' + command + '\n';
      command =
        '\nprint("#CommandStart#")\n' + command + '\nprint("#CommandEnd#")\n';

      promise = createPromise(this.process)
          .then((data) =>
          callback !== undefined ? callback(null, data.trim()) : data.trim(),
          )
          .catch((err) =>
          callback !== undefined ? callback(err.trim(), null) : err.trim(),
          );

      this.process.stdin.write(command);
      promise = await promise;
    });

    return promise;
  }

  /**
   * Spawns a new Python process.
   *
   * This method will only execute and return if there is no process currently running. To end the
   * old process, call the stop() method.
   *
   * @return {Promise<string>} Returns a Promise object which contains Python interpreter
   * and system information. If not required, this can be ignored.
   * @throws {Error} Throws an Error object if path to the Python executable cannot be found.
   */
  start() {
    if (!this.process) {
      if (!fileSystem.existsSync(this.path)) {
        throw new Error(
            `cannot resolve path for Python executable: ${this.path}`,
        );
      }
      this.process = childProcess.spawn(this.path, ['-u', '-i']);
      this.process.stdout.setEncoding('utf8');
      this.process.stderr.setEncoding('utf8');
      this.process.stdout.setMaxListeners(1);
      this.process.stderr.setMaxListeners(1);
      return this.execute();
    }
  }

  /**
   * End a currently running Python process.
   *
   * This method will only execute if there is a process currently running. To start a new process,
   * call the start() method.
   */
  stop() {
    if (this.process) {
      this.process.stdin.end();
      this.process.kill();
      this.process = null;
      this.script = '';
    }
  }

  /**
   * End the current Python process and start a new one.
   *
   * This method acts as a wrapper for executing stop() and then start(). It will only stop a
   * process if there is a process currently running. If not, then only a new process is started.
   *
   * @return {Promise<string>} Returns a Promise object which contains Python interpreter
   * and system information. If not required, this can be ignored.
   * @throws {Error} Throws an Error if the Python executable cannot be found.
   */
  restart() {
    this.stop();
    return this.start();
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
 *
 * @param {string}   scriptPath Directory path to the script (excludes file name)
 * @param {string}   scriptName File name of the script
 * @param {string[]} args       Arguments to pass to the script
 * @param {Function} callback   Callback function to invoke with the script results
 * @throws {Error} Throws an Error if the Python executable cannot be found.
 */
module.exports.runScript = function(scriptPath, scriptName, args, callback) {
  if (!fileSystem.existsSync(pythonPath)) {
    throw new Error(`cannot resolve path for Python executable: ${pythonPath}`);
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
 *
 * @param {string}   code     Python code to be executed
 * @param {string[]} args     Arguments to pass to the code
 * @param {Function} callback Callback function to invoke with the code results
 * @throws {Error} Throws an Error if the Python executable cannot be found.
 */
module.exports.runString = function(code, args, callback) {
  if (!fileSystem.existsSync(pythonPath)) {
    throw new Error(`cannot resolve path for Python executable: ${pythonPath}`);
  }

  const options = {
    pythonPath: pythonPath,
    args: args,
  };

  pythonScript.runString(code, options, callback);
};
