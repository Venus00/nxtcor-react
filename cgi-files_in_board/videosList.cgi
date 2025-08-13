#!/bin/sh

# Directory to list files from
DIRECTORY="/mnt/mmcblk0p1"

# Check if directory is provided
if [ -z "$DIRECTORY" ]; then
  echo "Usage: $0 <directory>"
  exit 1
fi

# Check if the provided path is a directory
if [ ! -d "$DIRECTORY" ]; then
  echo "Error: $DIRECTORY is not a directory."
  exit 1
fi

# List all files in the directory and format them as a JSON array
echo "HTTP/1.1 200 OK
Content-type: application/json
Pragma: no-cache
"
echo '{"videos":['
find "$DIRECTORY" -maxdepth 1 -type f -print | awk -v RS='\n' '
BEGIN {
  first = 1
}
{
  if (!first) {
    printf ", "
  }
  first = 0
  printf "\"%s\"", $0
}
'
echo ']}'