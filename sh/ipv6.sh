#!/bin/bash

# 提示用户选择是否禁用或启用 IPv6
echo "请选择是否禁用或启用 IPv6？"
echo "1. 禁用"
echo "2. 启用"
read -p "请输入选项（1 或 2）: " choice

# 根据用户的选择更新 IPv6 设置
if [ "$choice" = "1" ]; then
    # 禁用 IPv6
    sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1
    sudo sysctl -w net.ipv6.conf.default.disable_ipv6=1
    echo "IPv6 已被禁用。"
elif [ "$choice" = "2" ]; then
    # 启用 IPv6
    sudo sysctl -w net.ipv6.conf.all.disable_ipv6=0
    sudo sysctl -w net.ipv6.conf.default.disable_ipv6=0
    echo "IPv6 已被启用。"
else
    echo "无效的选择。请键入 '1' 或 '2'。"
fi

# 重新加载配置以立即应用更改
sudo sysctl -p
