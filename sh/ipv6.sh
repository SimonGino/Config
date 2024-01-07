#!/bin/bash

# Prompt the user to choose to disable or enable IPv6
echo "你想要禁用还是启用 IPv6？（输入 'disable' 或 'enable'）"
read choice

# Check the user's choice and update the IPv6 settings accordingly
if [ "$choice" = "disable" ]; then
    # Disable IPv6
    sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1
    sudo sysctl -w net.ipv6.conf.default.disable_ipv6=1
    echo "IPv6 已被禁用。"
elif [ "$choice" = "enable" ]; then
    # Enable IPv6
    sudo sysctl -w net.ipv6.conf.all.disable_ipv6=0
    sudo sysctl -w net.ipv6.conf.default.disable_ipv6=0
    echo "IPv6 已被启用。"
else
    echo "无效的选择。请键入 'disable' 或 'enable'。"
fi

# Reload the configuration to apply the changes immediately
sudo sysctl -p
