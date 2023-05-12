/*
脚本原作者：聪聪
原脚本地址：https://raw.githubusercontent.com/congcong0806/surge-list/master/Script/ipcheck.js
修改：TributePaulWalker
Surge：

[Panel]
网络信息 = script-name=网络信息, title="网络信息", content="请刷新", style=info, update-interval=60

[Script]
网络信息 = type=generic,timeout=10,script-path=https://raw.githubusercontent.com/TributePaulWalker/Profiles/main/JavaScript/Surge/ipcheck.js

*/

let url = "http://ip-api.com/json/?lang=zh-CN"

$httpClient.get(url, function(error, response, data){
    let jsonData = JSON.parse(data)
    let ip = jsonData.query
    let country = jsonData.country
    let emoji = getFlagEmoji(jsonData.countryCode)
    let city = jsonData.city
    let isp = jsonData.isp
    
  body = {
    title: "网络信息",
    content: getIP() +`\n节点IP: ${ip}\n节点ISP: ${isp}\n节点位置: ${emoji}${country} - ${city}`,
    icon: "key.icloud",
    'icon-color': "#5AC8FA"
  }
  $done(body);
});


function getFlagEmoji(countryCode) {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char =>  127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

function getIP() {
  const { v4, v6 } = $network;
  let info = [];
  if (!v4 && !v6) {
    info = ['網路可能切換', '請手動重整面板更新 IP'];
  } else {
    if (v4?.primaryAddress) info.push(`设备IP : ${v4?.primaryAddress}`);
    if (v6?.primaryAddress) info.push(`设备IP : ${v6?.primaryAddress}`);
    if (v4?.primaryRouter && getSSID()) info.push(`路由器IP : ${v4?.primaryRouter}`);
    if (v6?.primaryRouter && getSSID()) info.push(`路由器IP : ${v6?.primaryRouter}`);
  }
  info = info.join("\n");
  return info;
}

function getSSID() {
    return $network.wifi?.ssid;
}
