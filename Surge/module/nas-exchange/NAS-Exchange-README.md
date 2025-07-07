# NAS-Exchange - NAS智能切换模块

## 模块说明

NAS-Exchange 是一个用于 Surge 的智能策略切换模块，可以根据当前 WiFi 网络和 IPv6 连接状态自动切换指定策略组的节点。

## 功能特性

- 🏠 **WiFi 检测**: 检测到指定 WiFi 时自动切换到直连模式
- 🌐 **IPv6 检测**: 在非指定 WiFi 下，根据 IPv6 可用性智能选择节点
- 🔄 **自动切换**: 网络变化时自动触发策略切换
- ⚙️ **参数配置**: 支持通过模块参数自定义所有配置
- 🛡️ **环境检测**: 自动检测 Surge 环境，确保兼容性

## 工作原理

1. **目标 WiFi 检测**: 当连接到指定的 WiFi 时，切换到直连节点
2. **IPv6 检测**: 在其他网络环境下，检测 IPv6 可用性
   - 有 IPv6：切换到 home 节点
   - 无 IPv6：切换到 fallback 节点
3. **智能切换**: 只有在需要时才进行策略切换，避免不必要的变更

## 安装方法

### 方法一：本地安装
1. 将 `NAS-Exchange.sgmodule` 文件放入 Surge 配置目录
2. 在 Surge 中启用该模块
3. 根据需要配置参数

### 方法二：配置文件引用
在 Surge 配置文件中添加：
```
[Module]
NAS-Exchange = NAS-Exchange.sgmodule, tag=NAS智能切换, enabled=true, TARGET_WIFI=你的WiFi名称, PROXY_GROUP=你的策略组名称
```

## 参数配置

| 参数 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| TARGET_WIFI | 目标 WiFi SSID | `Xiaomi_8222_5G` | `My-Home-WiFi` |
| PROXY_GROUP | 策略组名称 | `🖲️ NAS` | `NAS服务器` |
| DIRECT_NODE | 目标WiFi下使用的节点 | `🌐 全球直连` | `DIRECT` |
| HOME_NODE | IPv6可用时使用的节点 | `home` | `家庭服务器` |
| FALLBACK_NODE | 默认节点（无IPv6时） | `🇭🇰 香港节点` | `香港01` |

### 参数详细说明

- **TARGET_WIFI**: 指定的 WiFi SSID，当检测到此 WiFi 时会切换到直连模式
- **PROXY_GROUP**: 要控制的策略组名称，必须与 Surge 配置中的策略组名称完全一致
- **DIRECT_NODE**: 在目标 WiFi 下使用的节点，通常设置为直连或内网节点
- **HOME_NODE**: 检测到 IPv6 时使用的节点，适合有 IPv6 的环境
- **FALLBACK_NODE**: 默认使用的节点，当既不在目标 WiFi 也没有 IPv6 时使用

## 使用示例

### 基础配置
```
[Module]
NAS-Exchange = NAS-Exchange.sgmodule, tag=NAS切换, enabled=true, TARGET_WIFI=Home-WiFi, PROXY_GROUP=NAS
```

### 完整配置
```
[Module]
NAS-Exchange = NAS-Exchange.sgmodule, tag=NAS智能切换, enabled=true, TARGET_WIFI=Xiaomi_8222_5G, PROXY_GROUP=🖲️ NAS, DIRECT_NODE=🌐 全球直连, HOME_NODE=home, FALLBACK_NODE=🇭🇰 香港节点
```

### 多环境配置
```
[Module]
NAS-Exchange-Home = NAS-Exchange.sgmodule, tag=家庭NAS, enabled=true, TARGET_WIFI=Home-WiFi-5G, PROXY_GROUP=家庭NAS, DIRECT_NODE=DIRECT, HOME_NODE=家庭服务器, FALLBACK_NODE=香港节点
NAS-Exchange-Office = NAS-Exchange.sgmodule, tag=办公NAS, enabled=true, TARGET_WIFI=Office-WiFi, PROXY_GROUP=办公NAS, DIRECT_NODE=内网直连, HOME_NODE=办公服务器, FALLBACK_NODE=新加坡节点
```

## 策略组配置示例

确保你的 Surge 配置中包含相应的策略组：

```
[Proxy Group]
🖲️ NAS = select, 🌐 全球直连, home, 🇭🇰 香港节点, 🇯🇵 日本节点, 🇺🇸 美国节点
```

## 触发条件

该模块会在以下情况下自动执行：
- 网络发生变化（WiFi 连接/断开）
- IPv6 状态发生变化
- 手动触发网络变化事件

## 日志说明

模块运行时会输出详细的日志信息：
- `检测到目标WiFi: [WiFi名称]，切换到直连模式`
- `检测到IPv6网络，切换到home节点`
- `未检测到IPv6，切换到香港节点`
- `策略变更: [原策略] -> [新策略]`
- `策略无需变更，当前已是: [当前策略]`

## 注意事项

1. **Surge 环境检测**: 模块会自动检测是否在 Surge 环境中运行，非 Surge 环境会自动退出
2. **策略组名称**: 参数中的策略组名称必须与 Surge 配置中的名称完全一致
3. **节点名称**: 所有节点名称都必须存在于对应的策略组中
4. **WiFi 名称**: TARGET_WIFI 参数必须与实际的 WiFi SSID 完全匹配（区分大小写）

## 故障排除

### 常见问题

**Q: 模块不工作，没有自动切换**
A: 检查以下几点：
- 确认策略组名称是否正确
- 确认节点名称是否存在于策略组中
- 查看 Surge 日志中是否有错误信息

**Q: WiFi 检测不准确**
A: 确认 TARGET_WIFI 参数与实际 WiFi SSID 完全一致，包括大小写

**Q: IPv6 检测不工作**
A: 模块使用 Surge 内置的 $network.v6 进行检测，确保 Surge 有权限访问网络信息

### 调试方法

1. 开启 Surge 的脚本日志
2. 观察模块执行时的日志输出
3. 检查策略组和节点配置是否正确
4. 测试网络变化是否触发模块执行

## 兼容性

- ✅ Surge iOS
- ✅ Surge Mac
- ✅ Surge tvOS
- ❌ Loon（虽然包含适配代码，但建议在 Surge 中使用）
- ❌ Quantumult X（虽然包含适配代码，但建议在 Surge 中使用）

## 更新日志

- **2024.12.19**: 
  - 模块化版本发布
  - 增加参数配置支持
  - 增加 Surge 环境检测
  - 优化日志输出
  - 增加错误处理

## 致谢

基于原始 nas-exchanged.js 脚本改造，感谢原作者的贡献。

## 支持

如果遇到问题，请检查：
1. Surge 版本是否支持模块功能
2. 模块参数配置是否正确
3. 策略组和节点名称是否匹配
4. 网络环境是否符合预期