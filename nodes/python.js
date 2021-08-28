'use strict';

const os = require('os');
const path = require('path');
const fileSystem = require('fs');
const pythonExecutable = os.platform() === 'win32' ? 'venv/Scripts/python.exe' : 'venv/bin/python';
const pythonPath = path.resolve(__dirname + '/..', pythonExecutable);
const {PythonInteractive} = require('python-interactive');


if (!fileSystem.existsSync(pythonPath)) {
  throw new Error(`cannot resolve path for Python executable: ${pythonPath}`);
}


/**
 * The global Python shell for the project.
 *
 * This shell instance will be maintained throughout the entire lifetime of a flow. Any variables,
 * functions, and objects which are created will be kept in memory until the flow ends.
*/
module.exports.PythonShell = new PythonInteractive();
module.exports.PythonShellClass = PythonInteractive;
