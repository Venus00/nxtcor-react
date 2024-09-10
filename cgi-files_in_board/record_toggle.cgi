#!/bin/sh

# Path to the configuration file
CONFIG_FILE="/etc/majestic.yaml"

# Check if the configuration file exists
if [ ! -f "$CONFIG_FILE" ]; then
  echo "Configuration file $CONFIG_FILE not found!"
  exit 1
fi

# Use awk to toggle the `enabled` field in the `records` section
awk '
  BEGIN { in_records = 0 }
  /^records:/ { in_records = 1 }
  /^$/{ if (in_records) { in_records = 0 } }
  in_records && /^  enabled: true/ {
    print "  enabled: false"
    next
  }
  in_records && /^  enabled: false/ {
    print "  enabled: true"
    next
  }
  { print }
' "$CONFIG_FILE" > "$CONFIG_FILE.tmp"

# Replace the original file with the updated one
mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"

echo "Records enabled field toggled."
killall -1 majestic
echo "Content-Type: application/json"
echo ""
echo "success"