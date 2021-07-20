#!/usr/bin/env bash

# This script sets up a Python virtual environment and installs Qiskit.
# Note that this is designed to be run in POSIX-compatible environments
# which use Bash and has not been fully tested.

# Check OS for paths.
venv="$PWD/venv"
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
  python="python"
  python_path="$venv/Scripts/python.exe"
  pip_path="$venv/Scripts/pip.exe"
else
  python="python3"
  python_path="$venv/bin/python"
  pip_path="$venv/bin/pip"
fi

# Check if python is installed. If no, exit unsuccessfully.
if ! command -v "$python" &>/dev/null; then
  echo "Error: failed to find Python 3 in PATH"
  exit 1
fi

# Check if virtual environment exists. If no, create it.
if [[ ! -d "$venv" ]] || [[ -z "$venv" ]]; then
  echo "Creating virtual environment at $venv..."
  if "$python" -m venv "$venv"; then
    echo "Successfully created virtual environment"
  else
    echo "Error: failed to create virtual environment"
    exit 1
  fi
else
  echo "Using virtual environment at $venv"
fi

# Check if Qiskit package is installed. If yes, exit successfully.
if [[ -x "$python_path" ]]; then
  if "$python_path" -c "import qiskit" &>/dev/null; then
    echo "Qiskit is installed"
    exit 0
  fi
else
  echo "Error: failed to execute $python_path"
  exit 1
fi

# Install Qiskit within the virtual environment using pip.
if [[ -x "$pip_path" ]]; then
  echo "Installing Qiskit..."
  if "$pip_path" install --quiet qiskit; then
    echo "Successfully installed Qiskit"
  else
    echo "Error: failed to install Qiskit"
    exit 1
  fi
else
  echo "Error: failed to execute $pip_path"
  exit 1
fi
