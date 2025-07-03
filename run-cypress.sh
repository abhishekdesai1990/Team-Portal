#!/bin/bash

# Cypress Test Runner Script
echo "🚀 Starting Cypress Tests for Team Portal"
echo ""

# Check if Angular dev server is running
if ! curl -s http://localhost:4200 > /dev/null 2>&1; then
    echo "⚠️  Angular dev server is not running on http://localhost:4200"
    echo "Please start the dev server first:"
    echo "  npm start"
    echo ""
    echo "Then run this script again or use:"
    echo "  npm run e2e:open  (for interactive mode)"
    echo "  npm run e2e       (for headless mode)"
    exit 1
fi

echo "✅ Angular dev server is running"
echo ""

# Ask user which mode to run
echo "Choose testing mode:"
echo "1) Interactive (opens Cypress UI)"
echo "2) Headless (runs all tests in terminal)"
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo "🎮 Opening Cypress in interactive mode..."
        npm run cypress:open
        ;;
    2)
        echo "🏃 Running Cypress tests in headless mode..."
        npm run cypress:run
        ;;
    *)
        echo "❌ Invalid choice. Please run again and choose 1 or 2."
        exit 1
        ;;
esac
