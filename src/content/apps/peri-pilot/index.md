---
title: 外设助手（PeriPilot）
pubDate: 2026-08-06
order: 1
---

外设助手（PeriPilot）是一个面向 Windows 10/11 的轻量托盘应用，**通过 2.4G 接收器读取受支持鼠标和键盘的电量**，并提供可配置的低电量与充满电提醒。

## 首版支持

- VGN DragonFly F2 Ultra+（VID `3554` / PID `FB49`）
- VGN VXE75（VID `320F` / PID `5088`）
- 达摩鲨 N3 2.4G Type-A（接收器 VID `248A` / PID `FF30`）

## 功能特性

- Windows 自动 / 浅色 / 深色主题
- 根据 Windows 显示语言自动使用简体中文或英文，也可在设置中手动切换（繁体中文映射为简体中文）
- 自定义低电量提醒阶段
- 跨应用重启的提醒去重
- Windows Toast 通知，托盘气泡兜底

## 数据隐私

应用数据仅保存在本机 `%LocalAppData%\PeriPilot`，不创建账户、不包含遥测或云同步，也不会向任何服务器上传数据。详见[隐私政策](/apps/peri-pilot/privacy/)。
