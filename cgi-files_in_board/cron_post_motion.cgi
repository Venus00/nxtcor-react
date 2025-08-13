#!/usr/bin/haserl
<%
CRON_FILE="/etc/crontabs/cron_motion.cron"

# Path to the script to be executed after updating cron jobs
SCRIPT_TO_RUN="/var/www/cgi-bin/j/cron_update.sh"

# Create a temporary file to hold new cron jobs
TEMP_CRON_FILE=$(mktemp)

if [ "$REQUEST_METHOD" = "POST" ]; then
    # Read the entire POST data into a variable

        if echo "$POST_cron"; then

                # Create a temporary file to hold the new crontab entries
                TEMP_CRON_FILE=$(mktemp)

                POST_CRON=$(echo "$POST_cron" | sed 's/^\[\(.*\)\]$/\1/' | sed 's/"//g')
                CRON_JOBS=$(echo "$POST_CRON" | tr ',' '\n')


                if [ -n "$POST_CRON" ]; then
                # Write the new cron jobs to the temporary file
                        echo "$CRON_JOBS" | while IFS= read -r JOB; do
                            echo "$JOB /var/www/cgi-bin/j/motion_execution.sh" >> "$TEMP_CRON_FILE"
                        done

                        # Install the new crontab, overwriting the existing one
                        mv "$TEMP_CRON_FILE" "$CRON_FILE"


                        # Clean up
                        rm "$TEMP_CRON_FILE"
                        if [ -x "$SCRIPT_TO_RUN" ]; then
                            "$SCRIPT_TO_RUN"
                        else
                            echo "Script $SCRIPT_TO_RUN is not executable or not found."
                            exit 1
                        fi
                        echo "Content-Type: application/json"
                        echo ""
                        echo "success $TEMP_CRON_FILE"
                else

                        echo "Content-Type: application/json"
                        echo ""
                        echo "Schedule is empty; no cron jobs to process."
                fi
        fi

fi

%>