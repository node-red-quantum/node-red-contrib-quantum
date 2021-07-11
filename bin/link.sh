#!/usr/bin/env bash

# This script sets up a Node-RED user directory and installs the package.
# Note that this is designed to be run in Linux environments and has not
# been fully tested.


# Check if NPM is installed. If no, exit unsuccessfully.
if ! command -v npm &>/dev/null; then
  echo "Error: failed to find NPM in PATH"
  exit 1
fi

# Set path variables.
package="node-red-contrib-quantum"
repo_path=$PWD
red_path=$HOME/.node-red

# Install dependencies for package.
if npm install; then
  echo "Successfully installed dependencies for $package"
else
  echo "Failed to install dependencies for $package"
  exit 1
fi

# Check if Node-RED user directory exists. If no, create it.
if [ ! -d $red_path ]; then
  echo "Creating Node RED user directory at $red_path"
  mkdir $red_path
else
  echo "Using Node-RED user directory at $red_path"
fi

# Change directory into Node-RED user directory
cd $red_path

# Check if package is already installed. If no, install it.
if [[ ! $(npm list -p | grep $package) ]]; then
  echo "Installing $package"
  if npm install $repo_path; then
    echo "Successfully linked $package with Node-RED"
  else
    echo "Failed to link $package with Node-RED"
    exit 1
  fi
else
  echo "$package is linked to Node-RED"
fi
