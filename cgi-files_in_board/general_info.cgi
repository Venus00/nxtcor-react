#!/bin/sh

# Set the content type to JSON
echo "Content-Type: application/json"
echo ""

# Variable assignments
fw_version=$(grep "OPENIPC_VERSION" /etc/os-release | cut -d= -f2 | tr -d '"')
network_address=$(ip route | grep ${network_interface:-eth0} | awk '/src/ {print $7}')
network_hostname=$(cat /etc/hostname)
network_macaddr=$(cat /sys/class/net/${network_interface:-eth0}/address)

# Output JSON
cat <<EOF
{
  "fw_version": "$fw_version",
  "network_address": "$network_address",
  "network_hostname": "$network_hostname",
  "network_macaddr": "$network_macaddr"
}
EOF