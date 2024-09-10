#!/bin/sh

# Source the config file to load the HTTP server variables
if [ -f /root/http.conf ]; then
    . /root/http.conf
else
    echo "Config file not found!" > '/tmp/http.log'
    exit 1
fi


# Variables loaded from /root/http.conf
TO="$receiverEndpoint"
Subject="$messageSubject"
SNAPSHOT_ENABLED="$snapshot"

TIME="$(date -R)"
snapshot="/tmp/snapshot.jpg"
url="http://127.0.0.1/image.jpg"

# Initialize the JSON payload
payload="{\"subject\":\"$Subject\", \"timestamp\":\"$TIME\""

# Conditionally handle the snapshot
if [ "$SNAPSHOT_ENABLED" = "true" ]; then
    wget -q -O "$snapshot" "$url"
    # Encode the snapshot in base64 and escape double quotes
    snapshot_base64=$(base64 -w 0 "$snapshot" | sed 's/"/\\"/g')
    # Append the base64-encoded snapshot to the JSON payload
    payload=$(printf "%s, \"snapshot\":\"%s\"" "$payload" "$snapshot_base64")
fi

# Close the JSON payload
payload=$(printf "%s}" "$payload")

# Write payload to a temporary file
payload_file=$(mktemp /tmp/payload.XXXXXX)
echo "$payload" > "$payload_file"

# Send the HTTP POST request with JSON payload from the file
curl -X POST "$TO" \
     -H "Content-Type: application/json" \
     --data @"$payload_file"

# Clean up temporary file
rm "$payload_file"