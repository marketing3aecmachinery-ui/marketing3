@echo off
cd /d "%~dp0"
echo Starting AEC Marketing Dashboard... open http://localhost:3000 in your browser.
start "" http://localhost:3000
call npm run dev
