---
title: installing and setting up kubectl on Linux
date: 2021-10-17 20:43:44
update:
categories:
- [kubernetes]
tags:
- [kubectl]
- [kubernetes]
- [Linux]
cover:
---



##  安装kubectl

1. 获取kubectl安装包

   ```shell
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   ```

2. 下载kubectl校验文件

   ```shell
   curl -LO "https://dl.k8s.io/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256"
   ```

3. 验证文件

   ```shell
   echo "$(<kubectl.sha256) kubectl" | sha256sum --check
   ```

   输出：

   ```shell
   kubectl: OK
   ```

4. 验证kubectl配置

   ```shell
   kubectl cluster-info
   ```

   

## kubectl配置和插件

### 自动补全

1. 安装bash-completion

   ```shell
   yum install bash-completion
   ```

2. 测试是否安装完成（type后有空格）

   ```shell
   type _init_completion
   ```

   如果有输出则正常

### 启用kubectl自动补全功能

1. 方法1：

   ```shell
   echo 'source <(kubectl completion bash)' >>~/.bashrc
   ```

   此方法会在bash启动时自动执行 `.bashrc` 文件中的 `source <(kubectl completion bash)` 命令

2. 方法2：

   ```shell
   kubectl completion bash >/etc/bash_completion.d/kubectl
   ```

   此方法为bash-completion负责自动加载 `/etc/bash_completion.d` 路径下的所有补全脚本



### 安装 kubectl convert 插件

> 一个 Kubernetes 命令行工具 `kubectl` 的插件，允许你将清单在不同 API 版本间转换。 在将清单迁移到具有较新 Kubernetes 版本的未弃用 API 版本时，这个插件特别有用。

1. 下载最新发行版

   ```shell
   curl -LO https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl-convert
   ```

2. 安装

   ```shell
   sudo install -o root -g root -m 0755 kubectl-convert /usr/local/bin/kubectl-convert
   ```

3. 验证

   ```shell
   kubectl convert --help
   ```

   
