#!/bin/bash

# SMTP server settings for Gmail
SMTP_SERVER="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USERNAME="j.brayer@nextronic.io"
SMTP_PASSWORD="OghranTamazirt99"

# Recipient email address
TO="jawadbrayer99@gmail.com"

# Email subject and body
SUBJECT="Hello from Curl"
BODY="This is the email body sent using Curl and SMTP."

# Construct the email message
MESSAGE="Subject: $SUBJECT "
TIME="$(date -R)"
snapshot="/tmp/snapshot4cron.jpg"
url="http://127.0.0.1/image.jpg"

wget -q -O "$snapshot" "$url"

# Send the email using Curl

curl -v --url "smtp://$SMTP_SERVER:$SMTP_PORT" \
     --ssl-reqd \
     --mail-from "$SMTP_USERNAME" \
     --mail-rcpt "$TO" \
     --user "$SMTP_USERNAME:$SMTP_PASSWORD" \
     -H 'Subject: Motion detection' \
     -F "=(;type=multipart/mixed" \
     -F "=$TIME;type=text/plain" \
     -F "file=@$snapshot;type=image/jpeg;encoder=base64" \
     -F "=)"