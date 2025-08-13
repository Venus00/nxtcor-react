#!/usr/bin/haserl --upload-limit=100 --upload-dir=/tmp
<%in p/common.cgi %>
<%
page_title="Interface Settings"
config_file="/etc/webui/webui.conf"

if [ "$REQUEST_METHOD" = "POST" ]; then
        case "$POST_action" in
                access)
                        password_default="$POST_password_default"
                        if [ -z "$password_default" ]; then
                                echo "Content-Type: application/json"
                echo ""
                echo "warning empty password"
                exit 0

                        fi

                        password_confirm="$POST_password_confirm"
                        if [ "$password_default" != "$password_confirm" ]; then
                echo "Content-Type: application/json"
                echo ""
                echo "warning Password does not match!"
                exit 0
                        fi

                        echo "root:${password_default}" | chpasswd
                        update_caminfo
            echo "Content-Type: application/json"
            echo ""
            echo "success password updated"
            redirect_to "/" "success" "Password updated."
                        ;;
        esac
fi

ui_username="$USER"
%>