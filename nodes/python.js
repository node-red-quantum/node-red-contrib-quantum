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

module.exports = {
  /**
   * The path to the Python executable.
   *
   * This path points to the Python virtual environment and adapts depending on the platform.
  */
  PythonPath: pythonPath,

  /**
   * The global Python shell instance.
   *
   * This shell instance will be maintained throughout the entire lifetime of a flow. Any variables,
   * functions, and objects which are created will be kept in memory until the flow ends.
  */
  PythonShell: new PythonInteractive(pythonPath),

  /**
   * Class definition for creating a Python shell instance.
  */
  PythonInteractive: PythonInteractive,
};
