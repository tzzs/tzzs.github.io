---
title: SSH连接WSL
date: 2019-12-13 00:02:52
update:
categories:
- [WSL]
tags:
- [WSL]
- [Linux]
- [Windows]
---

##  重装 openssh-server

😭 之前用自带的 ssh 进行连接，发现根本连接不上，所以干脆直接进行重装

```shell
sudo apt-get remove openssh-server
sudo apt-get install openssh-server
```

## 修改 sshd_config 配置文件

```shell
sudo vi /etc/ssh/sshd_config

在文件中使用 /PasswordAuthentication
将搜索到的这行取消注释 键盘输入i 进入insert模式，删除 # 即可
```

## 重启 ssh 服务

```shell
sudo service ssh restart
```

## 连接

ssh 工具中连接配置

host: 127.0.0.1

port: 22

或者直接使用命令行

```shell
ssh user@127.0.0.1
```

user为WSL中用户名，然后回车，如果第一次连接会有提示，输入yes，然后输入密码即可
---
