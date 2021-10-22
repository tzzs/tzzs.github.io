---
title: Ubuntu 设置消失
date: 2019-08-18 03:19:12
update:
categories:
- [Linux,Ubuntu]
tags:
cover: https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/ubuntu20211023.png
---


在之前由于空间不足，无法加载桌面时，我删除了自带软件thunder bird,后来再次进入系统时，发现系统中心的设置消失了。

可能是卸载软件时，同时将相关依赖删除了，导致设置丢失。

以下为解决方法，重新进行桌面的安装

```bash
sudo apt-get install ubuntu-desktop
```
安装完成即可修复。