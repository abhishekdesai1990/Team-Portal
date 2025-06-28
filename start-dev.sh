#!/bin/bash

# Start TeamPortal API and Angular App

echo "Starting TeamPortal API server..."
cd api && npm start &
API_PID=$!

echo "Waiting for API to start..."
sleep 3

echo "Starting Angular development server on port 4201..."
cd ..
ng serve --port 4201 --open

echo "Shutting down API server..."
kill $API_PID
