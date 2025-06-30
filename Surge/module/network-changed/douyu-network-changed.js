let config = {
  target_wifi: ["digiwin-NJ"], // 指定的 Wi-Fi SSID
  proxy_group: "🐟 斗鱼直播", // 策略组名称
  fallback_node: "✈️ 节点选择", // trojan 节点
  direct_node: "🌐 全球直连", // DIRECT 节点
};

let $ = nobyda();

(async () => {
  try {
    // 获取当前策略
    const current = await $.getPolicy(config.proxy_group);

    // 获取当前连接的 Wi-Fi SSID
    const network = $.ssid;

    let targetPolicy;

    if (network) {
      const isIncluded = config.target_wifi.includes(network);
      if (isIncluded) {
        targetPolicy = config.fallback_node;
      } else {
        targetPolicy = config.direct_node;
      }
    } else {
      targetPolicy = config.direct_node;
    }

    // 如果当前策略与目标策略一致，则不进行变更
    if (current !== targetPolicy) {
      // 切换策略
      await $.setPolicy(config.proxy_group, targetPolicy);
      $.notify("🐟 斗鱼策略变更", `从 ${current} 切换至 ${targetPolicy}`, "");
    }
  } catch (err) {
    $.notify("🐟 斗鱼脚本错误", "", `出现错误: ${err.message || err}`);
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

  const read = (key) => {
    if (isQuanX) return $prefs.valueForKey(key);
    if (isHTTP) return $persistentStore.read(key);
  };

  const adapterStatus = (response) => {
    if (!response) return null;
    if (response.status) {
      response["statusCode"] = response.status;
    } else if (response.statusCode) {
      response["status"] = response.statusCode;
    }
    return response;
  };

  const getPolicy = (groupName) => {
    if (isSurge) {
      if (typeof $httpAPI === "undefined") return 3;
      return new Promise((resolve) => {
        $httpAPI(
          "GET",
          "v1/policy_groups/select",
          {
            group_name: encodeURIComponent(groupName),
          },
          (b) => resolve(b.policy || 2),
        );
      });
    }
    if (isLoon) {
      if (typeof $config.getPolicy === "undefined") return 3;
      const getName = $config.getPolicy(groupName);
      return getName || 2;
    }
    if (isQuanX) {
      if (typeof $configuration === "undefined") return 3;
      return new Promise((resolve) => {
        $configuration
          .sendMessage({
            action: "get_policy_state",
          })
          .then(
            (b) => {
              if (b.ret && b.ret[groupName]) {
                resolve(b.ret[groupName][1]);
              } else resolve(2);
            },
            () => resolve(),
          );
      });
    }
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
          (b) => resolve(!b.error || 0),
        );
      });
    }
    if (isLoon && typeof $config.getPolicy !== "undefined") {
      const set = $config.setSelectPolicy(group, policy);
      return set || 0;
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
            (b) => resolve(!b.error || 0),
            () => resolve(),
          );
      });
    }
  };

  const get = (options, callback) => {
    if (isQuanX) {
      options["method"] = "GET";
      $task.fetch(options).then(
        (response) => {
          callback(null, adapterStatus(response), response.body);
        },
        (reason) => callback(reason.error, null, null),
      );
    }
    if (isHTTP) {
      if (isSurge) options.headers["X-Surge-Skip-Scripting"] = false;
      $httpClient.get(options, (error, response, body) => {
        callback(error, adapterStatus(response), body);
      });
    }
  };

  return {
    getPolicy,
    setPolicy,
    isSurge,
    isQuanX,
    isLoon,
    notify,
    read,
    ssid,
    get,
  };
}
