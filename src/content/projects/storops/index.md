---
title: StorOps
pubDate: 2026-09-06
order: 1
---

StorOps 是一个 Claude Agent Skill，同时也是一个跨平台 CLI，帮助 **AI 编码代理安全地理解和管理本地存储空间**。

## 核心能力

- 扫描磁盘占用，定位空间去向
- 识别文件/目录的用途：是什么、为什么在这、能否删除、应否迁移
- 规划清理与迁移方案
- 执行存储移动与清理（带强制确认机制）
- 操作完成后自动校验结果

## 技术栈

Python 3.11+；Windows 端基于 WizTree 做全盘扫描，Linux/macOS 端基于 gdu/du；规则定义使用 YAML，输出支持 JSON。

## 当前状态

MVP 阶段：Windows 支持最完整，Linux/macOS 支持较新，尚无正式 release 版本号。

## 使用场景

作为 Claude Code 等编码代理的 Skill 加载后，可以回答"C 盘为什么满了""能不能把 LM Studio / Ollama / Docker 缓存迁到别的盘""这个路径删了安不安全"这类问题，并在每次写操作前征求确认。
