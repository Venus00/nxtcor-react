#!/bin/sh

# Input file containing key=value pairs
input_file="/root/email.conf"

# Initialize an empty string to hold the JSON object
json_object="{"

# Read each line from the input file
while IFS='=' read -r key value; do
    # Trim whitespace from key and value
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)

    # Skip empty lines or lines without '='
    if [ -z "$key" ] || [ -z "$value" ]; then
        continue
    fi

    # Escape double quotes in value for JSON compatibility
    value=$(echo "$value" | sed 's/"/\\"/g')

    # Add the key-value pair to the JSON object
    if [ "$json_object" != "{" ]; then
        json_object="$json_object,"
    fi
    json_object="$json_object\"$key\":\"$value\""
done < "$input_file"

# Close the JSON object
json_object="$json_object}"

# Output HTTP response
echo "HTTP/1.1 200 OK"
echo "Content-type: application/json"
echo "Pragma: no-cache"
echo
echo "$json_object"