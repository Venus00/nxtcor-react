#!/bin/bash

# Source the config file to load the email variables
if [ -f /tmp/email.conf ]; then
    source /tmp/email.conf
else
    echo "Config file not found!" > '/tmp/webui/email.log'
    exit 1
fi

# SMTP server settings for Gmail
SMTP_SERVER="smtp.gmail.com"
SMTP_PORT="587"

# Variables loaded from /tmp/email.conf
SMTP_USERNAME="$senderEmail"
SMTP_PASSWORD="$senderPassword"
TO="$receiverEmail"
Subject="$emailsubject"
SNAPSHOT_ENABLED="$snapshot"

TIME="$(date -R)"
snapshot="/tmp/snapshot.jpg"
url="http://127.0.0.1/image.jpg"

# Conditionally download the snapshot based on the value of $snapshot
if [ "$SNAPSHOT_ENABLED" = "true" ]; then
    wget -q -O "$snapshot" "$url"
    # Send the email with the snapshot
    curl --url "smtp://$SMTP_SERVER:$SMTP_PORT" \
         --ssl-reqd \
         --mail-from "$SMTP_USERNAME" \
         --mail-rcpt "$TO" \
         --user "$SMTP_USERNAME:$SMTP_PASSWORD" \
         -H "Subject: $Subject" \
         -F "=(;type=multipart/mixed" \
         -F "=$TIME;type=text/plain" \
         -F "file=@$snapshot;type=image/jpeg;encoder=base64" \
         -F "=)"
else
    # Send the email without the snapshot
    curl --url "smtp://$SMTP_SERVER:$SMTP_PORT" \
         --ssl-reqd \
         --mail-from "$SMTP_USERNAME" \
         --mail-rcpt "$TO" \
         --user "$SMTP_USERNAME:$SMTP_PASSWORD" \
         -H "Subject: $Subject" \
         -F "=$TIME;type=text/plain"
fi
