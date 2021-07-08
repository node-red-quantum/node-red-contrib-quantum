const path = require('path');
const appRoot = require('app-root-path').path;
const fileSystem = require('fs');
const pythonShell = require('python-shell').PythonShell;
const pythonPath = path.resolve(appRoot, 'venv/bin/python');

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
