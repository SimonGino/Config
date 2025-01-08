#!/bin/bash

# 检查是否以root权限运行
if [ "$EUID" -ne 0 ]; then
    echo "请使用root权限运行此脚本"
    exit 1
fi

# 检查IPv6状态
ipv6_status=$(sysctl -n net.ipv6.conf.all.disable_ipv6)
ipv6_address=$(ip -6 addr show | grep inet6)

if [ "$ipv6_status" -eq 0 ]; then
    echo "IPv6当前状态：启用"
    if [ -n "$ipv6_address" ]; then
        echo "当前IPv6地址："
        echo "$ipv6_address"
    fi

    read -p "是否要关闭IPv6？(Y/n): " -n 1 -r disable_choice
    echo
    disable_choice=${disable_choice:-Y}

    if [[ $disable_choice =~ ^[Yy]$ ]]; then
        # 关闭IPv6
        cat > /etc/sysctl.d/disable-ipv6.conf << EOF
net.ipv6.conf.all.disable_ipv6=1
net.ipv6.conf.default.disable_ipv6=1
net.ipv6.conf.lo.disable_ipv6=1
EOF
        sysctl -p /etc/sysctl.d/disable-ipv6.conf
        echo "IPv6已关闭，需要重启系统使更改生效"
    else
        echo "操作已取消"
    fi
else
    echo "IPv6当前状态：禁用"
    read -p "是否要启用IPv6？(Y/n): " -n 1 -r enable_choice
    echo
    enable_choice=${enable_choice:-Y}

    if [[ $enable_choice =~ ^[Yy]$ ]]; then
        # 启用IPv6
        if [ -f "/etc/sysctl.d/disable-ipv6.conf" ]; then
            rm -f /etc/sysctl.d/disable-ipv6.conf
        fi

        cat > /etc/sysctl.d/enable-ipv6.conf << EOF
net.ipv6.conf.all.disable_ipv6=0
net.ipv6.conf.default.disable_ipv6=0
net.ipv6.conf.lo.disable_ipv6=0
EOF
        sysctl -p /etc/sysctl.d/enable-ipv6.conf
        echo "IPv6已启用，需要重启系统使更改生效"
    else
        echo "操作已取消"
    fi
fi
