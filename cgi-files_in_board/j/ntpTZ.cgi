#!/bin/sh

# Set the Content-Type header to application/json
echo "Content-Type: application/json"
echo ""


FILE="/etc/ntp.conf"

i=0
json="{"

# Read each line of the file
while IFS= read -r line
do
    # Skip empty lines and lines that start with #
    [[ -z "$line" || "$line" =~ ^# ]] && continue

    # Extract the second field of each line using awk
    value=$(echo "$line" | awk '{print $2}')

    # Skip lines where the value is empty
    [ -z "$value" ] && continue

    # Construct the JSON key
    key="server_$i"

    # Append to the JSON string, ensuring proper quoting
    json="${json}\"${key}\":\"${value}\","
    i=$((i+1))
done < "$FILE"

# Add tz_name and tz_data to JSON
tz_name=$(cat /etc/timezone)
tz_data=$(cat /etc/TZ)

# Add tz_name and tz_data to the JSON string
json="${json}\"tz_name\":\"${tz_name}\",\"tz_data\":\"${tz_data}\","

# Remove the trailing comma and close the JSON object
json="${json%,}}"

# Output the JSON string
echo "$json"