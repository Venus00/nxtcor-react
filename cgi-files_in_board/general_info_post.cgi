#!/usr/bin/haserl
<%

if [ "$REQUEST_METHOD" = "POST" ]; then
    # Read the entire POST data into a variable
        if [ -z "$POST_network_hostname" ]; then
                echo "Content-Type: application/json"
                echo ""
                echo "warning"

        else
                if echo "$POST_network_hostname"; then
                        echo "$POST_network_hostname" > /etc/hostname
                        echo "Content-Type: application/json"
                        echo ""
                        echo "success"
                fi
        fi
fi

%>