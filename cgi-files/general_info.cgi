#!/bin/sh

# Set the content type to JSON
echo "Content-Type: application/json"
echo ""

# Source the file to import the variables
source /tmp/webui/sysinfo.txt

# Output JSON
cat <<EOF
{
  "flash_size": "$flash_size",
  "flash_type": "$flash_type",
  "fw_build": "$fw_build",
  "fw_variant": "$fw_variant",
  "fw_version": "$fw_version",
  "mj_version": "$mj_version",
  "network_address": "$network_address",
  "network_gateway": "$network_gateway",
  "network_hostname": "$network_hostname",
  "network_interface": "$network_interface",
  "network_macaddr": "$network_macaddr",
  "overlay_root": "$overlay_root",
  "ptz_support": "$ptz_support",
  "sensor": "$sensor",
  "sensor_ini": "$sensor_ini",
  "soc": "$soc",
  "soc_family": "$soc_family",
  "soc_has_temp": "$soc_has_temp",
  "soc_vendor": "$soc_vendor",
  "tz_data": "$tz_data",
  "tz_name": "$tz_name",
  "uboot_version": "$uboot_version",
  "ui_password": "$ui_password"
}
EOF
