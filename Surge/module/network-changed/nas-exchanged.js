let config = {
  target_wifi: "Xiaomi_8222_5G", // 指定的 Wi-Fi SSID
  proxy_group: "🖲️ NAS", // 策略组名称
  direct_node: "🌐 全球直连", // 在指定路由器下使用的节点
  home_node: "home", // 有IPv6时使用的节点
  fallback_node: "🇭🇰 香港节点", // 默认节点（无IPv6时）
};

let $ = nobyda();

(async () => {
  try {
    // 获取当前策略
    const current = await $.getPolicy(config.proxy_group);

    // 获取当前连接的 Wi-Fi SSID
    const network = $.ssid;

    let targetPolicy;

    if (network && network === config.target_wifi) {
      // 如果在指定的路由器下，使用直连节点
      targetPolicy = config.direct_node;
      console.log(`检测到目标WiFi: ${network}，切换到直连模式`);
    } else {
      // 不在指定路由器下，检查IPv6
      const hasIPv6 = await checkIPv6();
      
      if (hasIPv6) {
        targetPolicy = config.home_node;
        console.log("检测到IPv6网络，切换到home节点");
      } else {
        targetPolicy = config.fallback_node;
        console.log("未检测到IPv6，切换到香港节点");
      }
    }

    // 如果当前策略与目标策略一致，则不进行变更
    if (current !== targetPolicy) {
      // 切换策略
      await $.setPolicy(config.proxy_group, targetPolicy);
      $.notify("🖲️ NAS策略变更", `从 ${current} 切换至 ${targetPolicy}`, "");
      console.log(`策略变更: ${current} -> ${targetPolicy}`);
    } else {
      console.log(`策略无需变更，当前已是: ${current}`);
    }
  } catch (err) {
    $.notify("🖲️ NAS脚本错误", "", `出现错误: ${err.message || err}`);
    console.error("脚本执行错误:", err);
  } finally {
    $done({});
  }
})();

// 检查IPv6连接性的函数
async function checkIPv6() {
  // 直接通过 Surge 的 $network 变量判断是否存在 IPv6 地址
  // 这比外部网络请求更准确、更快速
  const hasIPv6 = $network && $network.v6 && $network.v6.primaryAddress;
  return Promise.resolve(!!hasIPv6);
}

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
