#!/bin/sh

# Input file containing cron jobs
input_file="/etc/crontabs/cron_motion.cron"

# Initialize an empty string to hold the JSON array
json_array="["

# Read each line from the input file
while IFS= read -r line; do
    # Extract the cron expression from each line
    cron_expr=$(echo "$line" | awk '{print $1, $2, $3, $4, $5}')
    
    # Remove leading and trailing spaces
    cron_expr=$(echo "$cron_expr" | xargs)
    
    # Add the cron expression to the JSON array
    if [ "$json_array" != "[" ]; then
        json_array="$json_array,"
    fi
    json_array="$json_array\"$cron_expr\""
done < "$input_file"

# Close the JSON array
json_array="$json_array]"

# Print the JSON array

echo "HTTP/1.1 200 OK
Content-type: application/json
Pragma: no-cache

${json_array}
"