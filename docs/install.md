---
layout: default
---

## Installation
Node-RED Quantum requires at minimum [Node.js 12.0.0](https://nodejs.org/en/), [Node-RED 1.0](https://nodered.org), and [Python 3](https://www.python.org/) (version 3.6 or greater is recommended). You must also start Node-RED from a Bash or PowerShell environment, as it is required to execute scripts which prepare the Python virtual environment.

Node-RED Quantum can be installed in a variety of ways: using the Node-RED interface, building from source, or through Docker. If you are having trouble installing the package, using a different means of installation may help resolve issues.

### Node-RED Palette Manager
1. Install Node-RED locally by following the installation instructions on the [Node-RED website](https://nodered.org/docs/getting-started/local).
2. Once Node-RED has been installed, start the application by entering the `node-red` command in the terminal.
3. Open the Node-RED interface by navigating to the IP address the server is running at in your browser. This will usually be [`http://127.0.0.1:1880/`](http://127.0.0.1:1880/).
4. In Node-RED, open the drop-down menu at the top-right corner of the interface and navigate to the **Palette Manager**. Select **Install** and enter *'quantum'* in the search bar.
5. Install the **node-red-contrib-quantum** package. Once installed, the quantum nodes provided by this library will show in the **Palette** (on the left-side of the Node-RED editor). Please note that installation may take a few minutes, as background tasks for preparing the Python virtual environment and installing dependencies need to complete.

### Building From Source
1. Clone the repository from [GitHub](https://github.com/node-red-quantum/node-red-contrib-quantum) with the command `git clone https://github.com/node-red-quantum/node-red-contrib-quantum.git`.
2. Navigate to your local copy with `cd node-red-contrib-quantum`, and run the `npm run setup` command. This will automatically install dependencies, prepare the Python virtual environment, and link the package to Node-RED. This process may take a few minutes.
3. Once the set up is complete, open Node-RED by running the `npm start` command in the terminal. This will start the Node-RED application.
4. Open Node-RED by navigating to the IP address the server is running at in your browser, which will usually be [`http://127.0.0.1:1880/`](http://127.0.0.1:1880/). The quantum nodes should now appear in the Node-RED **Palette**.

### Docker
1. Install `docker` and `docker-compose`. The installation guide can be found on the [official Docker website](https://docs.docker.com/get-docker/).
2. Clone the repository from [GitHub](https://github.com/node-red-quantum/node-red-contrib-quantum) with the command `git clone https://github.com/node-red-quantum/node-red-contrib-quantum.git`.
3. Navigate to your local copy with `cd node-red-contrib-quantum`, and run `docker-compose -p quantum up` to start the development container. You can also add `-d` option to run it in detached mode. Depending on your system setup, you may need to run this with root permissions.
4. Once the set up is complete, Node-RED will automatically start and will usually be available at [`http://127.0.0.1:1880/`](http://127.0.0.1:1880/).
