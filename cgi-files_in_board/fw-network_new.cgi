#!/usr/bin/haserl
<%in p/common.cgi %>

<%
page_title="Network Settings"
params="address dhcp gateway hostname nameserver netmask interface wlan_ssid wlan_password"

network_list="$(ls /sys/class/net | grep -e eth0 -e wlan0)"
network_nameserver="$(cat /etc/resolv.conf | grep nameserver | cut -d' ' -f2)"
network_netmask="$(ifconfig ${network_interface} | grep Mask | cut -d: -f4)"
network_dhcp="$(cat /etc/network/interfaces.d/${network_interface} | grep -q dhcp && echo true)"
hostname="$(cat /etc/hostname)"
network_wlan_ssid="$(fw_printenv -n wlanssid)"
network_wlan_password="$(fw_printenv -n wlanpass)"

if [ "$REQUEST_METHOD" = "POST" ]; then
        case "$POST_action" in
                update)
                        for p in $params; do
                                eval network_${p}=\$POST_network_${p}
                        done

                        [ -z "$network_interface" ] && set_error_flag "Default network interface cannot be empty."
                        if [ "$network_interface" = "wlan0" ]; then
                                [ -z "$network_wlan_ssid" ] && set_error_flag"WLAN SSID cannot be empty."
                                [ -z "$network_wlan_password" ] && set_error_flag "WLAN Password cannot be empty."
                        fi

                        if [ "$network_dhcp" = "false" ]; then
                                network_mode="static"
                                [ -z "$network_address" ] && set_error_flag "IP address cannot be empty."
                                [ -z "$network_netmask" ] && set_error_flag "Networking mask cannot be empty."
                        else
                                network_mode="dhcp"
                        fi

                        if [ -z "$error" ]; then
                                command="setnetwork"
                                command="${command} -i $network_interface"
                                command="${command} -m $network_mode"
                                command="${command} -h $hostname"

                                if [ "$network_interface" = "wlan0" ]; then
                                        command="${command} -s $network_wlan_ssid"
                                        command="${command} -p $network_wlan_password"
                                fi

                                if [ "$network_mode" != "dhcp" ]; then
                                        command="${command} -a $network_address"
                                        command="${command} -n $network_netmask"
                                        [ -n "$network_gateway" ] && command="${command} -g $network_gateway"
                                        [ -n "$network_nameserver" ] && command="${command} -d $network_nameserver"
                                fi

                                echo "$command" >> /tmp/webui.log
                                eval "$command" > /dev/null 2>&1

                                update_caminfo
                                echo "Content-Type: application/json"
                echo ""
                echo "success"
                        fi
                        ;;
        esac
fi
%>