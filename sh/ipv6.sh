#!/bin/bash

# 检查是否存在IPv6地址
ipv6_address=$(ip -6 addr show | grep inet6)

if [ -n "$ipv6_address" ]; then
    # 如果存在IPv6地址，则显示地址并询问用户是否要关闭IPv6
    echo "系统已配置IPv6地址："
    echo "$ipv6_address"
    read -p "是否要关闭IPv6？(Y/n): " -n 1 -r disable_choice
    echo  # 添加换行
    disable_choice=${disable_choice:-Y}  # 如果用户未输入任何内容直接按回车，则将其视为选择了"Y"
    if [ "$disable_choice" = "Y" ] || [ "$disable_choice" = "y" ]; then
        # 用户选择关闭IPv6
        echo "net.ipv6.conf.all.disable_ipv6=1" > /etc/sysctl.d/disable-ipv6.conf
        echo "net.ipv6.conf.default.disable_ipv6=1" >> /etc/sysctl.d/disable-ipv6.conf
        sysctl -p -f /etc/sysctl.d/disable-ipv6.conf
        echo "IPv6已被关闭。"
    else
        echo "未执行任何更改。"
    fi
else
    # 如果不存在IPv6地址，则询问用户是否要打开IPv6
    read -p "系统未配置IPv6地址。是否要打开IPv6？(Y/n): " -n 1 -r enable_choice
    echo  # 添加换行
    enable_choice=${enable_choice:-Y}  # 如果用户未输入任何内容直接按回车，则将其视为选择了"Y"
    if [ "$enable_choice" = "Y" ] || [ "$enable_choice" = "y" ]; then
        # 用户选择打开IPv6
        rm /etc/sysctl.d/disable-ipv6.conf
        sysctl -p
        echo "IPv6已被打开。"
    else
        echo "未执行任何更改。"
    fi
fi
