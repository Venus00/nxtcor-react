#!/bin/sh


# Path to the script to run
SCRIPT_TO_RUN="/var/www/cgi-bin/j/email_alert.sh"

# Check if the script exists
if [ ! -f "$SCRIPT_TO_RUN" ]; then
  echo "Script $SCRIPT_TO_RUN not found!"
  exit 1
fi

# Run the script
echo "Running $SCRIPT_TO_RUN..." > /tmp/log.txt
sh "$SCRIPT_TO_RUN"  # or use ./"$SCRIPT_TO_RUN" if the script has executable permissions

# Optionally, you can use bash if the script requires it
# bash "$SCRIPT_TO_RUN"

echo "Finished running $SCRIPT_TO_RUN." >> /tmp/log.txt
