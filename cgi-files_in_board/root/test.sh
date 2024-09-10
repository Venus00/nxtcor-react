#!/bin/sh

# Path to the configuration file
CONFIG_FILE="/etc/majestic.yaml"

# Check if the configuration file exists
if [ ! -f "$CONFIG_FILE" ]; then
  echo "Configuration file $CONFIG_FILE not found!"
  exit 1
fi

# Use sed to toggle the `enabled` field in the `records` section
if grep -q "enabled: true" "$CONFIG_FILE"; then
  # Change from true to false
  sed -i 's/enabled: true/enabled: false/' "$CONFIG_FILE"
  echo "Records enabled field changed to false."
elif grep -q "enabled: false" "$CONFIG_FILE"; then
  # Change from false to true
  sed -i 's/enabled: false/enabled: true/' "$CONFIG_FILE"
  echo "Records enabled field changed to true."
else
  echo "Could not determine the current state of the enabled field."
  exit 1
fi
killall -1 majestic
echo "Content-Type: application/json"
echo ""
echo "success"