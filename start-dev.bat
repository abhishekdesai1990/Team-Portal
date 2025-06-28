@echo off

echo Starting TeamPortal API server...
cd api
start cmd /k "npm start"

echo Waiting for API to start...
timeout /t 3

echo Starting Angular development server on port 4201...
cd ..
ng serve --port 4201 --open
