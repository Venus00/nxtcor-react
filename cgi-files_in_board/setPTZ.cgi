#!/bin/sh
<%

if [ "$REQUEST_METHOD" = "POST" ]; then
    # Read the entire POST data into a variable
    if [ -z "$POST_cmd" ]; then
        echo "Content-Type: application/json"
        echo ""
        echo "warning : empty Value"
    else
        case $POST_cmd in
            "Up")
                CMD="\xff\x01\x00\x10\x00\x37\x48"
                ;;
            "Down")
                CMD="\xff\x01\x00\x08\x00\x37\x40"
                ;;
            "Left")
                CMD="\xff\x01\x00\x02\x37\x00\x3a"
                ;;
            "Right")
                CMD="\xff\x01\x00\x04\x37\x00\x3c"
                ;;
            "ZoomIn")
                CMD="\xff\x01\x00\x20\x05\x05\x2b"
                ;;
            "ZoomOut")
                CMD="\xff\x01\x00\x40\x05\x05\x4b"
                ;;
            "FocusIn")
                CMD="\xff\x01\x01\x00\x30\x30\x62"
                ;;
            "FocusOut")
                CMD="\xff\x01\x00\x80\x30\x30\xe1"
                ;;
            "IrisIn")
                CMD="\xff\x01\x02\x00\x30\x30\x63"
                ;;
            "IrisOut")
                CMD="\xff\x01\x04\x00\x30\x30\x65"
                ;;
            "STOP")
                CMD="\xff\x01\x00\x00\x00\x00\x01"
                ;;
        esac
        
        # Send the command to serial port
        printf "$CMD" > /dev/ttyS2
        
        # Return success response
        echo "Content-Type: application/json"
        echo ""
        echo "{\"status\":\"success\",\"command\":\"$POST_cmd\"}"
    fi
fi
%>