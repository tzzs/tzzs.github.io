---
title: Downloading CanvasKit failure error when running flutter on brower
date: 2022-02-17 22:38:57
update:
categories:
- [Flutter]
tags:
- [flutter]
cover:
---

## Reason

此问题是由于国内无法直接访问 `chrome-infra-packages.appspot.com`， 导致安装包下载失败。更换全局代理后依旧无法正常安装启动，因此替换了 Flutter 的国内镜像源来解决此问题。

## Solution

### Windows

新增两个环境变量

- PUB_HOSTED_URL
  - https://pub.flutter-io.cn
- FLUTTER_STORAGE_BASE_URL
  - https://storage.flutter-io.cn

### Linux

```sh
export PUB_HOSTED_URL=https://pub.flutter-io.cn
export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn
```
