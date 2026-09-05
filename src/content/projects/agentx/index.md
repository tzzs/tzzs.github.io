---
title: AgentX
pubDate: 2026-09-06
order: 1
---

AgentX 是一个本地 API 适配器，让 **Claude Code、Codex 等编码代理无需修改自身配置**，即可切换 OpenCode、DeepSeek、OpenRouter 等多个 LLM 提供商。

## 核心能力

- 本地提供 Anthropic 兼容与 OpenAI 兼容的 API 端点
- 请求协议转换：在客户端期望的协议与上游提供商实际协议之间转换
- 临时凭证注入，无需在客户端里配置各家提供商的密钥
- 会话管理

## 技术栈

TypeScript / Node.js 20+，使用原生 `fetch`、ESM 模块，测试基于内置的 `node:test`。

## 获取方式

已发布到 npm（`@tanzz/agentx`），也可直接查看源码与 issue 跟踪。
