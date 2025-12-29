#!/bin/bash

echo "========================================"
echo "Namos App - USB Debugging Setup"
echo "========================================"
echo ""
echo "This script will set up USB debugging for React Native"
echo "It will forward port 8081 (Metro bundler) to your device"
echo ""
echo "Make sure:"
echo "1. Your Android device is connected via USB"
echo "2. USB debugging is enabled on your device"
echo "3. You have authorized this computer on your device"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "Checking ADB connection..."
adb devices

echo ""
echo "Setting up port forwarding..."
adb reverse tcp:8081 tcp:8081

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "SUCCESS! Port forwarding is set up."
    echo "========================================"
    echo ""
    echo "Your device can now connect to Metro bundler on localhost:8081"
    echo ""
    echo "Next steps:"
    echo "1. Start Metro bundler: npm start"
    echo "2. Run the app: npm run android"
    echo ""
else
    echo ""
    echo "========================================"
    echo "ERROR! Failed to set up port forwarding."
    echo "========================================"
    echo ""
    echo "Troubleshooting:"
    echo "1. Make sure your device is connected and authorized"
    echo "2. Try running: adb devices"
    echo "3. Make sure ADB is in your PATH"
    echo ""
fi

read -p "Press Enter to exit..."

