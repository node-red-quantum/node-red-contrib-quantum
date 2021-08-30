#!/usr/bin/env pwsh

# Run with `powershell -ExecutionPolicy Bypass -File .\bin\pyvenv.ps1`

# This script sets up a Python virtual environment and installs dependencies.
# Note that this script is designed to be run in a Windows PowerShell environment.

# Use Windows paths by default.
$venv="$((Get-Location).tostring())\venv"
$python="python"
$python_path="$venv\Scripts\python.exe"
$pip_path="$venv\Scripts\pip.exe"

# Check if python is installed. If no, exit unsuccessfully.
if (!(Get-Command $python -errorAction SilentlyContinue)) {
  "Error: failed to find $python in PATH"
  Exit
}

# Check if virtual environment exists. If no, create it.
if (!(Test-Path -Path $venv)) {
  "Creating virtual environment at $venv..."
  Invoke-Expression "$python -m venv $venv"
  if ($LastExitCode -eq 0) {
    "Successfully created virtual environment"
  } else {
    "Error: failed to create virtual environment"
    Exit
  }
} else {
  "Using virtual environment at $venv"
}

# Check that Python path exists. If not, exit unsuccessfully.
if (!(Get-Command $python_path -errorAction SilentlyContinue)) {
  "Error: failed to find $python_path"
  Exit
}

# Check that pip path exists. If not, exit unsuccessfully.
if (!(Get-Command $pip_path -errorAction SilentlyContinue)) {
  "Error: failed to find $pip_path"
  Exit
}

# Dependencies list (empty value means use latest version).
$packages = @{"qiskit"=""; "matplotlib"="3.3.4"; "pylatexenc"=""}

# Install package dependencies.
foreach ($i in $packages.GetEnumerator()) {
  # Check if the package is installed. If no, install package.
  Invoke-Expression "$python_path -c `"import $($i.Name)`"" >$null 2>&1
  if ($LastExitCode -ne 0) {
    "Installing $($i.Name)..."
		
    # If package requires specific version, add it to the command.
    if ($i.Value) {
      $pkg_cmd="$($i.Name)==$($i.Value)"
    } else {
      $pkg_cmd="$($i.Name)"
    }
		
    # Install package.
    Invoke-Expression "$pip_path install --quiet $pkg_cmd"
    if ($LastExitCode -eq 0) {
      "Successfully installed $($i.Name)"
    } else {
      "Error: failed to install $($i.Name)"
    }
  } else {
    "$($i.Name) is installed"
  }
}
