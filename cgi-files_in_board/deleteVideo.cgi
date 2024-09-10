#!/usr/bin/haserl

<%
# Function to parse JSON and extract videoUrl
if [ "$REQUEST_METHOD" = "POST" ]; then
    # Read the POST data


    # Check if videoUrl is empty
    if [ -z "$POST_videoUrl" ]; then
        echo "Content-Type: application/json"
        echo ""
        echo "{\"status\": \"error\", \"message\": \"Video URL is required "$POST_videoUrl"\"}"
    else
        # Sanitize input



        # Check if the file exists
        if [ -f "$POST_videoUrl" ]; then
            # Delete the file
            rm "$POST_videoUrl"

            if [ $? -eq 0 ]; then
                echo "Content-Type: application/json"
                echo ""
                echo "{\"status\": \"success\", \"message\": \"Video deleted successfully\"}"
            else
                echo "Content-Type: application/json"
                echo ""
                echo "{\"status\": \"error\", \"message\": \"Failed to delete video\"}"
            fi
        else
            echo "Content-Type: application/json"
            echo ""
            echo "{\"status\": \"error\", \"message\": \"File not found\"}"
        fi
    fi
fi

%>