### v0.3.0 - 01-09-2021
- Added Shor's algorithm node
- Added Histogram Simulator node
- Added `python-interactive` dependency
- Added Python virtual environment setup script for PowerShell environments
- Updated README to include more indepth documentation
- Updated documentation for various nodes
- Updated Script node so that it waits for all qubits to arrive before outputting
- Removed `string.prototype.replaceall` and `async-mutex` dependencies.
- Fixed IBM Quantum System node not raising an error if internet is not available
- Fixed issues with arbitrary errors being raised on Windows
- Fixed Quantum Register node from freezing execution
- Fixed issues with Python virtual environment setup script
- Fixed Quantum Circuit node not raising an error if the Python virtual environment cannot be found. Will then attempt to automatically run the installation script (works on Bash environments only)
- Fixed various minor bugs

### v0.2.0 - 25-08-2021
- Added Bloch Sphere node
- Added Multi-Controlled-U-Gate node
- Added Grover's algorithm node
- Added IBM Quantum System node
- Updated documentation
- Updated front end interface for gate nodes

### v0.1.1 - 09/08/2021
- Fixed incorrect path to the Python executable
- Fixed Python error messages sometimes being incomplete
- Removed `dedent-js` dependency from production release
- Removed `app-root-path` dependency
- Removed `python-shell` dependency

### v0.1.0 - 07/08/2021
 - Initial development release
