---
title: Thrift Support
pubDate: 2026-08-05
order: 1
---

Thrift Support 是一个面向 **Apache Thrift IDL** 的 VS Code 语言智能扩展，覆盖语法高亮、格式化、诊断、导航、补全、重命名/重构，并提供 CI 可用的 CLI 与性能门禁。

![Thrift 诊断与格式化预览](/images/projects/vsce-thrift-support/format-diagnostics.png)

## 功能特性

### 语法高亮

- 完整的 Thrift 语法支持：关键字、数据类型、字符串、注释和数字字面量
- 支持所有 Thrift 原生类型（包含 `uuid`）和容器类型
- 智能语法着色，提升代码可读性

### 代码格式化

- **文档格式化**：一键格式化整个 Thrift 文件
- **选择格式化**：格式化选中的代码块
- **智能对齐**：自动对齐字段类型、字段名和注释
- **可配置选项**：自定义缩进、行长度等格式化规则

### 代码导航

- **跳转到定义**：快速导航到类型定义
- **包含文件解析**：支持跟踪 `include` 语句
- **工作区搜索**：在整个工作区中查找定义

### 编辑器语义能力

- **语义令牌**：基于 AST 为类型、字段、枚举、服务、方法、常量生成 Semantic Tokens
- **调用层级**：支持 service/interaction 方法的 incoming/outgoing calls
- **类型层级**：支持 service `extends` 全链路、typedef 别名链路及顶层类型条目

### 代码重构

- **标识符重命名（F2）**：跨文件更新引用，内置冲突检测
- **抽取类型（typedef）**：从选区或当前字段推断类型并生成 `typedef`
- **移动类型到文件**：将 `struct/enum/service/typedef` 移到新的 `.thrift` 文件并自动插入 `include`

### 高级特性

- 实验性语法支持：流式传输（stream）、数据收集（sink）、交互模式（interaction）

## 性能表现

- **增量解析**：编辑时只重新解析受影响的代码块，缓存命中响应 <5ms
- **智能缓存**：LRU-K 多级缓存 + 内存压力自动驱逐
- **并发分析**：最多同时分析 3 个文件，配合防抖/节流避免 UI 卡顿
- **大文件支持**：>10000 行文件按顶层块边界分块格式化
- **CI 性能门禁**：内置基准测试，1000 行文件解析 <500ms、格式化 <500ms

## 获取

在 VS Code 扩展市场搜索 **Thrift Support**（`tanzz.thrift-support`）安装，或通过 Open VSX 与下方下载入口获取。
