#!/usr/bin/env bash

# This script sets up a Python virtual environment and installs dependencies.
# Note that this script is designed to be run in POSIX-compatible environments
# which use Bash.


# Dependencies list.
declare -a packages=("qiskit" "matplotlib" "pylatexenc" "qiskit-finance" "qiskit-optimization")

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

# Check that Python path exists. If not, exit unsuccessfully.
if [[ ! -x "$python_path" ]]; then
  echo "Error: failed to find $python_path"
  exit 1
fi

# Check that pip path exists. If not, exit unsuccessfully.
if [[ ! -x "$pip_path" ]]; then
  echo "Error: failed to find $pip_path"
  exit 1
fi

# Install package dependencies.
for i in "${packages[@]}"; do
  # Check if the package is installed. If no, install package.
  if ! "$pip_path" list --disable-pip-version-check | grep -E "^$i " &>/dev/null; then
    echo "Installing $i..."

    # Install package.
    if "$pip_path" install --quiet --disable-pip-version-check "$i"; then
      echo "Successfully installed $i"
    else
      echo "Error: failed to install $i"
    fi
  else
    echo "$i is installed"
  fi
done
