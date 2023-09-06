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

let args = getArgs();
let url = `https://ipinfo.io?token=${args.token}`;
$httpClient.get(url, function (error, response, data) {
    let jsonData = JSON.parse(data);
    let ip = jsonData.ip;
    let country = jsonData.country;
    let emoji = getFlagEmoji(jsonData.country);
    let city = jsonData.city;
    let isp = jsonData.org;

    body = {
        title: "节点信息-ipinfo.io",
        content: `IP: ${ip}\nISP: ${isp}\n位置: ${emoji}${country} - ${city}`,
        icon: "network",
        'icon-color': "#5AC8FA"
    };
    $done(body);

});

function getFlagEmoji(countryCode) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

function getArgs() {
    return Object.fromEntries(
      $argument
        .split("&")
        .map((item) => item.split("="))
        .map(([k, v]) => [k, decodeURIComponent(v)])
    );
  }
