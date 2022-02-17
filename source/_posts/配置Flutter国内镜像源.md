---
title: 配置Flutter国内镜像源
date: 2022-02-17 22:33:03
update:
categories:
  - [Flutter]
tags:
  - [flutter]
cover:
---

## Windows

新增两个环境变量

- PUB_HOSTED_URL
  - https://pub.flutter-io.cn
- FLUTTER_STORAGE_BASE_URL
  - https://storage.flutter-io.cn

## Linux

```sh
export PUB_HOSTED_URL=https://pub.flutter-io.cn
export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn
```

## 参考信息

1. 【在中国网络环境下使用 Flutter】 https://flutter.cn/community/china
