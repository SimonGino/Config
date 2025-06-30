// 配置常量
const CONFIG = {
    // WiFi 白名单 - 在这些网络下使用 Snell 节点
    wifiWhitelist: ["Redmi_9944_5G", "Redmi_9944"],
    // 代理组名称
    proxyGroup: '🔰 节点选择',
    // Snell 节点名称
    snellNode: '日本snell',
    // SS 节点名称
    ssNode: '鸡总日本',
};

// 消息常量
const MESSAGES = {
    wallModeDisabled: '墙中墙模式🚫',
    wallModeEnabled: '墙中墙模式✅',
    errorTitle: '防火墙',
};

let $ = nobyda();

/**
 * 确定目标策略节点
 * @returns {string} 目标节点名称
 */
function determineTargetPolicy() {
    const network = $network.wifi?.ssid;
    
    // 如果没有 WiFi 连接，使用 SS 节点
    if (!network) {
        return CONFIG.ssNode;
    }
    
    // 如果是白名单 WiFi，使用 Snell 节点，否则使用 SS 节点
    const isWhitelistedWifi = CONFIG.wifiWhitelist.includes(network);
    return isWhitelistedWifi ? CONFIG.snellNode : CONFIG.ssNode;
}

/**
 * 切换策略并发送通知
 * @param {string} targetPolicy 目标策略名称
 */
async function switchPolicy(targetPolicy) {
    try {
        await $.setPolicy(CONFIG.proxyGroup, targetPolicy);
        
        const isSnellNode = targetPolicy === CONFIG.snellNode;
        const title = isSnellNode ? MESSAGES.wallModeDisabled : MESSAGES.wallModeEnabled;
        const message = `网络切换至 ${targetPolicy}`;
        
        $notification.post(title, '', message);
    } catch (error) {
        throw new Error(`策略切换失败: ${error.message || error}`);
    }
}

/**
 * 主执行函数
 */
(async () => {
    try {
        // 获取当前策略
        const currentPolicy = await $.getPolicy(CONFIG.proxyGroup);
        
        // 验证获取到的策略
        if (!currentPolicy || typeof currentPolicy !== 'string') {
            throw new Error('无法获取当前策略状态');
        }
        
        // 只有当前策略是 SS 节点时才执行切换逻辑
        if (currentPolicy !== CONFIG.ssNode) {
            return;
        }
        
        // 确定目标策略并执行切换
        const targetPolicy = determineTargetPolicy();
        await switchPolicy(targetPolicy);
        
    } catch (error) {
        const errorMsg = error.message || error.toString() || '未知错误';
        $notification.post(MESSAGES.errorTitle, '', `出现错误: ${errorMsg}`);
        console.log(`[Network-Changed] Error: ${errorMsg}`);
    }
})().finally(() => $done({}))

function nobyda() {
    const isHTTP = typeof $httpClient != "undefined";
    const isLoon = typeof $loon != "undefined";
    const isQuanX = typeof $task != "undefined";
    const isSurge = typeof $network != "undefined" && typeof $script != "undefined";
    const ssid = (() => {
        if (isQuanX && typeof ($environment) !== 'undefined') {
            return $environment.ssid;
        }
        if (isSurge && $network.wifi) {
            return $network.wifi.ssid;
        }
        if (isLoon) {
            return JSON.parse($config.getConfig()).ssid;
        }
    })();
    const notify = (title, subtitle, message) => {
        console.log(`${title}\n${subtitle}\n${message}`);
        if (isQuanX) $notify(title, subtitle, message);
        if (isHTTP) $notification.post(title, subtitle, message);
    }
    const read = (key) => {
        if (isQuanX) return $prefs.valueForKey(key);
        if (isHTTP) return $persistentStore.read(key);
    }
    const adapterStatus = (response) => {
        if (!response) return null;
        if (response.status) {
            response["statusCode"] = response.status;
        } else if (response.statusCode) {
            response["status"] = response.statusCode;
        }
        return response;
    }
    const getPolicy = (groupName) => {
        if (isSurge) {
            if (typeof ($httpAPI) === 'undefined') return 3;
            return new Promise((resolve) => {
                $httpAPI("GET", "v1/policy_groups/select", {
                    group_name: encodeURIComponent(groupName)
                }, (b) => resolve(b.policy || 2))
            })
        }
        if (isLoon) {
            if (typeof ($config.getPolicy) === 'undefined') return 3;
            const getName = $config.getPolicy(groupName);
            return getName || 2;
        }
        if (isQuanX) {
            if (typeof ($configuration) === 'undefined') return 3;
            return new Promise((resolve) => {
                $configuration.sendMessage({
                    action: "get_policy_state"
                }).then(b => {
                    if (b.ret && b.ret[groupName]) {
                        resolve(b.ret[groupName][1]);
                    } else resolve(2);
                }, () => resolve());
            })
        }
    }
    const setPolicy = (group, policy) => {
        if (isSurge && typeof ($httpAPI) !== 'undefined') {
            return new Promise((resolve) => {
                $httpAPI("POST", "v1/policy_groups/select", {
                    group_name: group,
                    policy: policy
                }, (b) => resolve(!b.error || 0))
            })
        }
        if (isLoon && typeof ($config.getPolicy) !== 'undefined') {
            const set = $config.setSelectPolicy(group, policy);
            return set || 0;
        }
        if (isQuanX && typeof ($configuration) !== 'undefined') {
            return new Promise((resolve) => {
                $configuration.sendMessage({
                    action: "set_policy_state",
                    content: {
                        [group]: policy
                    }
                }).then((b) => resolve(!b.error || 0), () => resolve());
            })
        }
    }
    const get = (options, callback) => {
        if (isQuanX) {
            options["method"] = "GET";
            $task.fetch(options).then(response => {
                callback(null, adapterStatus(response), response.body)
            }, reason => callback(reason.error, null, null))
        }
        if (isHTTP) {
            if (isSurge) options.headers['X-Surge-Skip-Scripting'] = false;
            $httpClient.get(options, (error, response, body) => {
                callback(error, adapterStatus(response), body)
            })
        }
    }
    return {
        getPolicy,
        setPolicy,
        isSurge,
        isQuanX,
        isLoon,
        notify,
        read,
        ssid,
        get
    }
}
