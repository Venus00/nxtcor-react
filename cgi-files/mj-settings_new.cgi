#!/usr/bin/haserl
<%in p/common.cgi %>

<%
page_title="Majestic Settings"
label="$GET_tab"
[ -z "$label" ] && label="system"

json_conf=$(wget -q -T1 localhost/api/v1/config.json -O -)
json_schema=$(cat $(get_schema) | jsonfilter -e "@.properties.$label")
json_load "$json_schema"

if [ "$REQUEST_METHOD" = "POST" ]; then
        case "$POST_action" in

                update_restart)
                        OIFS=$IFS
                        IFS=$'\n'
                        for yaml_param in $(printenv | grep POST__ | sort); do
                                param=$(echo ${yaml_param#POST_} | cut -d= -f1)
                                newval=$(echo ${yaml_param#POST_} | cut -d= -f2)
                                setting=${param//_/.}
                                oldval=$(yaml-cli -g "$setting")

                                if [ -z "$newval" ] && [ -n "$oldval" ]; then
                                        yaml-cli -d "$setting"
                                elif [ "$newval" != "$oldval" ]; then
                                        yaml-cli -s "$setting" "$newval"
                                fi
                        done
                        IFS=$OIFS
                        killall -1 majestic
                        echo "Content-Type: application/json"
                        echo ""
                        echo "success"
                        ;;
        esac


fi
%>