#!/bin/sh

NZ_BASE_PATH="/opt/nezha"
NZ_AGENT_PATH="${NZ_BASE_PATH}/agent"

# 颜色定义
red='\033[0;31m'
green='\033[0;32m'
plain='\033[0m'

# 错误输出函数
err() {
    printf "${red}%s${plain}\n" "$*" >&2
}

# 成功输出函数
success() {
    printf "${green}%s${plain}\n" "$*"
}

# sudo权限检查
sudo() {
    myEUID=$(id -ru)
    if [ "$myEUID" -ne 0 ]; then
        if command -v sudo > /dev/null 2>&1; then
            command sudo "$@"
        else
            err "ERROR: sudo is not installed on the system, the action cannot be proceeded."
            exit 1
        fi
    else
        "$@"
    fi
}

# 主卸载函数
uninstall() {
    echo "Starting to uninstall nezha-agent..."
    
    # 检查安装目录是否存在
    if [ ! -d "$NZ_AGENT_PATH" ]; then
        err "nezha-agent installation not found in $NZ_AGENT_PATH"
        exit 1
    fi

    # 查找所有配置文件
    config_files=$(find "$NZ_AGENT_PATH" -name "config*.yml" 2>/dev/null)
    
    if [ -z "$config_files" ]; then
        echo "No configuration files found"
    else
        echo "Found configuration files, stopping services..."
        # 遍历所有配置文件并停止相关服务
        for config in $config_files; do
            echo "Stopping service for config: $config"
            sudo "${NZ_AGENT_PATH}"/nezha-agent service -c "$config" uninstall >/dev/null 2>&1
        done
    fi

    echo "Removing nezha-agent files..."
    # 删除agent目录
    sudo rm -rf "$NZ_AGENT_PATH"
    
    # 如果基础目录为空则一并删除
    if [ -z "$(ls -A "$NZ_BASE_PATH" 2>/dev/null)" ]; then
        sudo rm -rf "$NZ_BASE_PATH"
    fi

    success "nezha-agent has been completely uninstalled"
}

# 执行卸载
uninstall
