# shell script grants execute (+x) permission to a the motion script if a motion ENABLED is set to true.
#It then waits for two hours (using sleep 7200) before removing the execute permission (chmod -x).
#This process ensures temporary execution rights, which are automatically revoked after the set duration.
#If ENABLED is not true, the script takes no action (removing the execute permission (chmod -x)) just as protection




# Define the file path
CONFIG_FILE="/etc/majestic.yaml"

# Script to be given +x permission
SCRIPT_PATH="/usr/sbin/motion.sh"

# Initialize variables
in_motionDetect=false

# Read the file line by line
while IFS= read -r line; do
    # Check if the line contains 'motionDetect:' to mark the start of the section
    if echo "$line" | grep -q "^motionDetect:"; then
        in_motionDetect=true
    elif echo "$line" | grep -q "^[^[:space:]]"; then
        # Reset the flag if we encounter a new top-level key
        in_motionDetect=false
    fi

    # If we are in the motionDetect section, check for 'enabled:'
    if [ "$in_motionDetect" = true ] && echo "$line" | grep -q "enabled:"; then
        ENABLED=$(echo "$line" | awk '{print $2}')
        break
    fi
done < "$CONFIG_FILE"

# Check the value of ENABLED
if [ "$ENABLED" = "true" ]; then
    echo "Motion detection is enabled"

    # Give execute permission
    chmod +x "$SCRIPT_PATH"

    # Wait for 2 hours

    # Remove execute permission

    (
        sleep 7100
        chmod -x "$SCRIPT_PATH"
    ) &

else
    echo "Motion detection is disabled"
    chmod -x "$SCRIPT_PATH"
fi