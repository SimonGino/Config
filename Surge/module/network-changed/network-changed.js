let config = {
    all_switch: ["WRT32X", "WRT32X Extreme"], 
  };

(async () => {
    const network = $network.wifi.ssid;

    console.log(network)
    if (network) {

        const isIncluded = config.all_switch.includes(network);
console.log(isIncluded)
        if (isIncluded) { //if the script was last run in cellular env.
            await new Promise((resolve) => {
                $httpAPI("POST", "v1/policy_groups/select", {
                    group_name: '🔰 节点选择',
                    policy: '日本snell'
                }, (b) => resolve(!b.error || 0))
            });
            $notification.post('墙中墙模式开启，节点开始切换', '', `网络切换至 日本snell`);
        }else{
            await new Promise((resolve) => {
                $httpAPI("POST", "v1/policy_groups/select", {
                    group_name: '🔰 节点选择',
                    policy: '✈️ MESL'
                }, (b) => resolve(!b.error || 0))
            });
            $notification.post('墙中墙模式解除，节点开始切换', '', `已从切换至 ✈️ MESL`);
        }
    } else {
         }
})().catch((err) => $notification.post('防火墙', '', `出现错误: ${err.message||err}`))
    .finally(() => $done({}))
