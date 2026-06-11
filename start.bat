@echo off
REM Quick local launcher for EasyFeedback (Windows).
REM Usage: double-click start.bat, or run it from a terminal.
setlocal

REM Always run from the project root (this script's directory).
cd /d "%~dp0"

REM Node must be installed.
where node >nul 2>nul
if errorlevel 1 (
  echo Error: Node.js is not installed or not on your PATH. Install Node 20.6+ and retry.
  pause
  exit /b 1
)

REM Install dependencies on first run.
if not exist node_modules (
  echo Installing dependencies ^(first run^)...
  call npm install
)

if not defined PORT set PORT=3000

REM Load the API key from .env if present; otherwise warn.
if exist .env (
  echo Starting EasyFeedback with .env ^(http://localhost:%PORT%^) ...
  node --env-file=.env src/server.js
) else (
  echo Warning: no .env file found. Set ANTHROPIC_API_KEY in your environment,
  echo or copy .env.example to .env and add your key. Starting anyway...
  echo Starting EasyFeedback ^(http://localhost:%PORT%^) ...
  node src/server.js
)

pause
