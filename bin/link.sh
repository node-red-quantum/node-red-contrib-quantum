#!/usr/bin/env bash

# This script sets up a Node-RED user directory and installs the package.
# Note that this is designed to be run in POSIX-compatible environments
# which use Bash and has not been fully tested.


# Check if NPM is installed. If no, exit unsuccessfully.
if ! command -v npm &>/dev/null; then
  echo "Error: failed to find NPM in PATH"
  exit 1
fi

# Set path variables.
package="node-red-contrib-quantum"
repo_path="$PWD"
red_path="$HOME/.node-red"

# Check if Node-RED user directory exists. If no, create it.
if [[ ! -d "$red_path" ]]; then
  echo "Creating Node-RED user directory at $red_path..."
  if mkdir "$red_path"; then
	echo "Successfully created Node-RED user directory"
  else
	echo "Error: failed to create Node-RED user directory"
  fi
else
  echo "Using Node-RED user directory at $red_path"
fi

# Change directory into Node-RED user directory
cd "$red_path"

# Check if package is already installed. If no, install it.
if [[ ! $(npm list -p | grep "$package") ]]; then
  echo "Installing $package..."
  if npm install --silent "$repo_path"; then
    echo "Successfully linked $package with Node-RED"
  else
    echo "Error: failed to link $package with Node-RED"
    exit 1
  fi
else
  echo "$package is linked to Node-RED"
fi
