#!/usr/bin/env python
import platform
import subprocess
import os
import sys
from pathlib import Path


def execute(*args, stdout=None, stderr=None):
    path = args[0]
    if os.path.exists(path):
        if os.access(path, os.X_OK):
            process = subprocess.run(args, stdout=stdout, stderr=stderr)
            return process.returncode == 0
        else:
            raise PermissionError(f"{path} is not executable")
    else:
        raise FileNotFoundError(f"{path} does not exist")


script_path = Path(__file__)
root_path = script_path.parent.parent.resolve()
venv_path = os.path.join(root_path, 'venv')
system = platform.system()

if system == 'Linux' or system == 'Darwin':
    python_path = os.path.join(venv_path, 'bin', 'python')
    pip_path = os.path.join(venv_path, 'bin', 'pip')
elif system == 'Windows':
    python_path = os.path.join(venv_path, 'Scripts', 'python.exe')
    pip_path = os.path.join(venv_path, 'Scripts', 'pip.exe')
else:
    raise OSError("Unknown operating system")


if not os.path.isdir(venv_path) or not os.listdir(venv_path):
    print(f"Creating virtual environment at {venv_path}")
    subprocess.run(['python', '-m', 'venv', venv_path])
else:
    print(f"Using virtual environment at {venv_path}")

if execute(python_path, '-c', 'import qiskit', stderr=subprocess.DEVNULL):
    print("Qiskit is installed")
else:
    print("Installing Qiskit...")
    if execute(pip_path, 'install', 'qiskit', stdout=subprocess.DEVNULL):
        print("Installed Qiskit")
        sys.exit(0)
    else:
        raise RuntimeError("Failed to install Qiskit")
