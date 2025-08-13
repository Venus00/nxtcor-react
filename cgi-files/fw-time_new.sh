#!/usr/bin/haserl
<%in p/common.cgi %>
<%
page_title="Time Settings"
tz_data=$(cat /etc/TZ)
tz_name=$(cat /etc/timezone)

if [ "$REQUEST_METHOD" = "POST" ]; then
	case "$POST_action" in
		update)
			[ -z "$POST_tz_name" ] && redirect_to "$SCRIPT_NAME" "warning" "Empty timezone name. Skipping."
			[ -z "$POST_tz_data" ] && redirect_to "$SCRIPT_NAME" "warning" "Empty timezone value. Skipping."
			[ "$tz_data" != "$POST_tz_data" ] && echo "${POST_tz_data}" > /etc/TZ
			[ "$tz_name" != "$POST_tz_name" ] && echo "${POST_tz_name}" > /etc/timezone

			rm -f /etc/ntp.conf
			for i in $(seq 0 3); do
				eval ntp="\$POST_server_${i}"
				[ -n "$ntp" ] && echo "server $ntp iburst" >> /etc/ntp.conf
			done
			echo "Content-Type: application/json"
            echo ""
            echo "success"
			;;
	esac

	update_caminfo
	echo "Content-Type: application/json"
    echo ""
    echo "success"
fi
%>