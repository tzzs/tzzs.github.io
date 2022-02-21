---
title: "[fixed]-bash: command not found when using ssh connect to server"
date: 2022-02-21 20:41:07
update:
categories:
  - [Linux]
tags:
  - [ssh]
  - [linux]
  - [github action]
  - [shell]
cover:
---

## Problem

之前在项目里面写了一个 shell 脚本，用在 Github action 中部署项目到服务器上，但是最近用 Docker 部署后，重写了这个脚本，重新启用 Github action 执行时出现以下错误。

```sh
-bash: line 50: docker: command not found
-bash: line 51: docker: command not found
-bash: line 53: docker: command not found
-bash: line 54: docker: command not found
-bash: line 57: awk: command not found
-bash: line 57: xargs: command not found
-bash: line 57: grep: command not found
-bash: line 57: docker: command not found
-bash: line 59: docker: command not found
```

## Solution

找了半天没有找到解决办法，后来就想着如何能找问题，在 VS Code 中安装了一个 shellcheck 插件，完美解决了这个问题。

shellcheck 扫描到脚本中一个变量问题，就是我在脚本中使用了 `PATH` 这个变量名称，导致后续的环境变量被全局覆盖，所以出现找不到各种可执行命令的问题。

修改 `PATH` 为其它名称，问题解决。

Just so stupid...
