#!/bin/bash

# Path to the file where cron jobs will be written
CRON_FILE="/etc/crontab/cron_motion.cron"

# Path to the script to be executed after updating cron jobs
SCRIPT_TO_RUN="/cron_update.sh"

# Create a temporary file to hold new cron jobs
TEMP_CRON_FILE=$(mktemp)

# Ensure POST_CRON is not empty
if [ -n "$POST_CRON" ]; then
    # Process POST_CRON and write to the temporary file
    POST_CRON=$(echo "$POST_CRON" | sed 's/^\[\(.*\)\]$/\1/' | sed 's/"//g')
    CRON_JOBS=$(echo "$POST_CRON" | tr ',' '\n')

    # Write the new cron jobs to the temporary file
    echo "$CRON_JOBS" | while IFS= read -r JOB; do
        echo "$JOB" >> "$TEMP_CRON_FILE"
    done

    # Move the temporary cron file to the target location
    mv "$TEMP_CRON_FILE" "$CRON_FILE"

  
    # Execute the script
    if [ -x "$SCRIPT_TO_RUN" ]; then
        "$SCRIPT_TO_RUN"
    else
        echo "Script $SCRIPT_TO_RUN is not executable or not found."
        exit 1
    fi

    echo "Content-Type: application/json"
    echo ""
    echo "success"
else
    echo "Content-Type: application/json"
    echo ""
    echo "Schedule is empty; no cron jobs to process."
fi
