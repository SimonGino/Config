let config = {
    all_switch: ["Redmi_9944_5G", "Redmi_9944"],
};

(async () => {
    const network = $network.wifi.ssid;
    if (network) {
        const isIncluded = config.all_switch.includes(network);
        if (isIncluded) { //if the script was last run in cellular env.
            await new Promise((resolve) => {
                $httpAPI("POST", "v1/policy_groups/select", {
                    group_name: '🔰 节点选择',
                    policy: '日本snell'
                }, (b) => resolve(!b.error || 0))
            });
            $notification.post('墙中墙坐牢模式开启,节点开始切换', '', `网络切换至 日本snell`);
        } else {
            await new Promise((resolve) => {
                $httpAPI("POST", "v1/policy_groups/select", {
                    group_name: '🔰 节点选择',
                    policy: '鸡总日本'
                }, (b) => resolve(!b.error || 0))
            });
            $notification.post('墙中墙坐牢模式解除,节点开始切换', '', `网络切换至 鸡总日本`);
        }
    } else {
        await new Promise((resolve) => {
            $httpAPI("POST", "v1/policy_groups/select", {
                group_name: '🔰 节点选择',
                policy: '鸡总日本'
            }, (b) => resolve(!b.error || 0))
        });
        $notification.post('墙中墙坐牢模式解除,节点开始切换', '', `网络切换至 鸡总日本`);
    }
})().catch((err) => $notification.post('防火墙', '', `出现错误: ${err.message || err}`))
    .finally(() => $done({}))
