# Surge Config

仅自用配置。

## 维护目标
- Surge 与 Clash Meta 各维护一份主配置。
- 保持规则顺序一致：`domainset -> non_ip -> ip -> final`。
- 最小化改动，优先只改策略组、自定义域名、订阅地址。

## 主配置文件
- Surge: `Surge/Surge skk.conf`
- Clash Meta: `clash-meta/skk.yaml`

> `clash-meta` 目录当前仅保留 `skk.yaml`。

## 配置来源
- Sukka 规则体系：[SukkaW/Surge](https://github.com/SukkaW/Surge)
- Surge 文档索引：[nssurge.com/llms.txt](https://nssurge.com/llms.txt)

## 隐私与安全
- 不要提交真实订阅地址、节点密码、控制器密钥。
- 公开仓库请使用占位值：
  - `https://example.com/provider1.yaml`
  - `https://example.com/provider2.yaml`
- 需要远程控制时再开启 `allow-lan`，并使用强 `secret`。

## 脚本
### IPv6
```sh
bash <(curl -fsSL https://raw.githubusercontent.com/SimonGino/Config/master/sh/ipv6.sh)
```

### uninstall_nezha_agent
```sh
bash <(curl -fsSL https://raw.githubusercontent.com/SimonGino/Config/master/sh/uninstall_nezha_agent.sh)
```
