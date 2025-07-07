/*
 * NAS智能切换模块 - 简化版
 * 检测指定WiFi时自动切换到直连模式
 * 支持通过参数配置
 * 更新日期：2024.12.19
 */

// 解析参数函数
function getParams(argument) {
  if (!argument) return {};
  return Object.fromEntries(
    argument
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}

// 从参数获取配置
let params = getParams($argument);
let config = {
  target_wifi: params.target_wifi || "Xiaomi_8222_5G", // 指定的 Wi-Fi SSID
  proxy_group: params.proxy_group || "🖲️ NAS", // 策略组名称
  direct_node: params.direct_node || "🌐 全球直连", // 直连节点名称
};

let $ = nobyda();

(async () => {
  try {
    // 检查是否在Surge环境中
    if (!$.isSurge) {
      console.log("当前不在Surge环境中，脚本退出");
      $done({});
      return;
    }

    // 获取当前策略
    const current = await $.getPolicy(config.proxy_group);

    // 获取当前连接的 Wi-Fi SSID
    const network = $.ssid;

    // 判断是否需要切换
    if (network && network === config.target_wifi) {
      // 在目标WiFi下，切换到直连节点
      if (current !== config.direct_node) {
        await $.setPolicy(config.proxy_group, config.direct_node);
        $.notify("🖲️ NAS策略切换", `检测到目标WiFi: ${network}`, `切换到: ${config.direct_node}`);
        console.log(`策略变更: ${current} -> ${config.direct_node}`);
      } else {
        console.log(`已在目标WiFi下，策略无需变更: ${current}`);
      }
    } else {
      // 不在目标WiFi下，不进行任何切换
      console.log(`不在目标WiFi下，保持当前策略: ${current}`);
    }

  } catch (err) {
    $.notify("🖲️ NAS脚本错误", "", `出现错误: ${err.message || err}`);
    console.error("脚本执行错误:", err);
  } finally {
    $done({});
  }
})();

function nobyda() {
  const isHTTP = typeof $httpClient != "undefined";
  const isLoon = typeof $loon != "undefined";
  const isQuanX = typeof $task != "undefined";
  const isSurge =
    typeof $network != "undefined" && typeof $script != "undefined";

  const ssid = (() => {
    if (isQuanX && typeof $environment !== "undefined") {
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
  };

  const getPolicy = (groupName) => {
    if (isSurge) {
      if (typeof $httpAPI === "undefined") return Promise.resolve("API不可用");
      return new Promise((resolve) => {
        $httpAPI(
          "GET",
          "v1/policy_groups/select",
          {
            group_name: encodeURIComponent(groupName),
          },
          (b) => resolve(b.policy || "获取失败"),
        );
      });
    }
    if (isLoon) {
      if (typeof $config.getPolicy === "undefined") return "API不可用";
      const getName = $config.getPolicy(groupName);
      return Promise.resolve(getName || "获取失败");
    }
    if (isQuanX) {
      if (typeof $configuration === "undefined") return Promise.resolve("API不可用");
      return new Promise((resolve) => {
        $configuration
          .sendMessage({
            action: "get_policy_state",
          })
          .then(
            (b) => {
              if (b.ret && b.ret[groupName]) {
                resolve(b.ret[groupName][1]);
              } else resolve("获取失败");
            },
            () => resolve("获取失败"),
          );
      });
    }
    return Promise.resolve("不支持的环境");
  };

  const setPolicy = (group, policy) => {
    if (isSurge && typeof $httpAPI !== "undefined") {
      return new Promise((resolve) => {
        $httpAPI(
          "POST",
          "v1/policy_groups/select",
          {
            group_name: group,
            policy: policy,
          },
          (b) => resolve(!b.error),
        );
      });
    }
    if (isLoon && typeof $config.setSelectPolicy !== "undefined") {
      const result = $config.setSelectPolicy(group, policy);
      return Promise.resolve(result);
    }
    if (isQuanX && typeof $configuration !== "undefined") {
      return new Promise((resolve) => {
        $configuration
          .sendMessage({
            action: "set_policy_state",
            content: {
              [group]: policy,
            },
          })
          .then(
            (b) => resolve(!b.error),
            () => resolve(false),
          );
      });
    }
    return Promise.resolve(false);
  };

  return {
    getPolicy,
    setPolicy,
    isSurge,
    isQuanX,
    isLoon,
    notify,
    ssid,
  };
}
