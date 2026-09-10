---
title: Remote Pulse 隐私政策
pubDate: 2026-09-11
order: 3
---

**Remote Pulse 不收集、不存储、不传输任何个人数据。**

本扩展采集的所有系统指标均只用于本地展示：

- CPU/内存/磁盘/网络/GPU/Docker 数据来自本机或已连接的 Remote-SSH 远程主机，仅在 VS Code 扩展进程与 Webview 内渲染
- 不向任何第三方服务器发送采集到的指标或使用数据
- 不包含遥测、统计上报或第三方跟踪
- 历史趋势数据仅保留在内存中（最近 30 分钟），Webview 关闭即释放，不落盘持久化

## 数据说明

| 数据类型 | 是否收集 |
| --- | --- |
| 系统性能指标（CPU/内存/磁盘/网络/GPU/Docker） | 否（仅本地采集与展示，不出站上报） |
| 个人身份信息 | 否 |
| 使用统计 | 否 |

## 联系方式

如有隐私相关问题，请通过 [GitHub Issues](https://github.com/tzzs/remote-pulse/issues) 反馈。
