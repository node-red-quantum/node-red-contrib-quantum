const path = require('path');
const appRoot = require('app-root-path').path;
const fileSystem = require('fs');
const pythonShell = require('python-shell').PythonShell;
const pythonPath = path.resolve(appRoot, 'venv/bin/python');

/**
 * Runs a Python script and returns collected messages
 * @param {string}   scriptPath Directory path to the script (excludes file name)
 * @param {string}   scriptName File name of the script
 * @param {string[]} args       Arguments to pass to the script
 * @param {Function} callback   Callback function to invoke with the script results
*/
module.exports = function(scriptPath, scriptName, args, callback) {
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
