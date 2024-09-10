#!/usr/bin/haserl
<%

if [ "$REQUEST_METHOD" = "POST" ]; then
    # Read the entire POST data into a variable
        if [ -z "$POST_senderEmail" ]; then
                echo "HTTP/1.1 200 OK"
                echo "Content-Type: application/json"
                echo ""
                echo '{"status": "error", "message": "Sender Email Empty"}'
                exit 0
        fi

        if [ -z "$POST_senderPassword" ]; then
                echo "HTTP/1.1 200 OK"
                echo "Content-Type: application/json"
                echo ""
                echo '{"status": "error", "message": "Sender Password Empty"}'
                exit 0
        fi

        if [ -z "$POST_receiverEmail" ]; then
                echo "HTTP/1.1 200 OK"
                echo "Content-Type: application/json"
                echo ""
                echo '{"status": "error", "message": "Receiver Email Empty"}'
                exit 0
        fi

        if [ -z "$POST_emailsubject" ]; then
                echo "HTTP/1.1 200 OK"
                echo "Content-Type: application/json"
                echo ""
                echo '{"status": "error", "message": "Subject Empty"}'
                exit 0
        fi
        echo "senderEmail=$POST_senderEmail" > /root/email.conf
        echo "senderPassword=$POST_senderPassword" >> /root/email.conf
        echo "receiverEmail=$POST_receiverEmail" >> /root/email.conf
        echo "emailsubject=$POST_emailsubject" >> /root/email.conf
        echo "snapshot=$POST_isCheckedSnapshot" >> /root/email.conf
        # Send success response
        echo "HTTP/1.1 200 OK"
        echo "Content-Type: application/json"
        echo ""
        echo '{"status": "success", "message": "Values saved successfully"}'
        exit 0
fi
%>