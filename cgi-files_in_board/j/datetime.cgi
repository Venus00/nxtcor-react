#!/bin/sh

# Generate the current timestamp
time_now=$(date +%s)

# Create the JSON payload with only the current time
payload=$(printf '{"time_now":"%s"}' "$time_now")

# Output the JSON with the appropriate headers
echo "HTTP/1.1 200 OK
Content-type: application/json
Pragma: no-cache

${payload}
"