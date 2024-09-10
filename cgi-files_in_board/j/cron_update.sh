#!/bin/sh

# Create a temporary file to hold all cron jobs
TEMP_CRON_FILE=$(mktemp)

# Append the content of each cron file
for file in /etc/crontabs/*.cron; do
    cat "$file" >> "$TEMP_CRON_FILE"
done

# Install the new crontab
crontab "$TEMP_CRON_FILE"

# Clean up
rm "$TEMP_CRON_FILE"