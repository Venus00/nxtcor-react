#!/bin/sh

# Set the content type to JSON
echo "Content-Type: application/json"
echo ""

# Variable assignments
ip_address=$(ip route | grep eth0 | awk '/src/ {print $7}')
gateway=$(ip route | awk '/default/ {print $3}')
mask=$(ifconfig eth0 | grep Mask | cut -d: -f4)
dhcp=$(cat /etc/network/interfaces.d/eth0 | grep -q dhcp && echo true)
dns_primary="$(cat /etc/resolv.conf | grep nameserver | cut -d' ' -f2 | sed -n '1p')"
dns_secondary="$(cat /etc/resolv.conf | grep nameserver | cut -d' ' -f2 | sed -n '2p')"
# dns_secondary=$(cat /sys/class/net/${network_interface:-eth0}/address)
# Output JSON
cat <<EOF
{
  "ip_address": "$ip_address",
  "gateway": "$gateway",
  "mask": "$mask",
  "dhcp": "$dhcp",
  "dns_p": "$dns_primary",
  "dns_s": "$dns_secondary"
}
EOF