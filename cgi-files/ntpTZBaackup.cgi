#!/bin/sh

# Set the Content-Type header to application/json
echo "HTTP/1.1 200 OK"
echo "Content-Type: application/json"
echo "Pragma: no-cache"
echo "Date: $(TZ=GMT0 date +'%a, %d %b %Y %T %Z')"
echo "Expires: $(TZ=GMT0 date +'%a, %d %b %Y %T %Z')"
echo "Etag: \"$(cat /proc/sys/kernel/random/uuid)\""
echo "Connection: close"
echo ""

FILE="/etc/ntp.conf'"

i=0
json="{"

# Read each line of the file
while IFS= read -r line
do
    # Skip empty lines and lines that start with #
    [[ -z "$line" || "$line" =~ ^# ]] && continue

    # Split the line into key and value
    key=$(echo "server_$i")
    value=$(echo "$line" | cut -d '=' -f 2-)

    # Remove potential surrounding quotes in value
    value=$(echo "$value" | sed 's/^"//;s/"$//')

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