#!/usr/bin/env bash

# This script sets up a Python virtual environment and installs Qiskit.
# Note that this is designed to be run in Linux environments and has not
# been fully tested.

# Check if python is installed. If no, exit unsuccessfully.
if ! command -v python &>/dev/null; then
  echo "Error: failed to find Python in PATH"
  exit 127
fi

# Check if virtual environment exists. If no, create it.
venv=$PWD/venv
if [ ! -d $venv ] || [ -z $venv ]; then
  echo "Creating virtual environment at $venv"
  python -m venv $venv
else
  echo "Using virtual environment at $venv"
fi

# Check if Qiskit package is installed. If yes, exit successfully.
python=$venv/bin/python
if [ -x $python ]; then
  if $python -c "import qiskit" &>/dev/null; then
    echo "Qiskit is installed"
    exit 0
  fi
else
  echo "Error: failed to execute $python"
  exit 126
fi

# Install Qiskit within the virtual environment using pip.
pip=$venv/bin/pip
if [ -x $pip ]; then
  echo "Installing Qiskit in virtual environment"
  $pip install qiskit
else
  echo "Error: failed to execute $pip"
  exit 126
fi
