---
title: Linux Ubuntu开机显示LOGO后逐渐黑屏
date: 2019-08-16 14:59:25
update:
categories:
- [Linux,Ubuntu]
tags:
- [Linux]
- [Ubuntu]
---

之前在VMware中安装了Ubuntu用于开发，只分配了20G的空间，这两天一直提醒硬盘空间不足，未产生影响就没有扩充空间。

今天虚拟机重启后突然无法进入图形界面，网上看了很多方法，我开始也以为是桌面环境被损坏，修改了很多配置仍未解决，最后才看到可能是磁盘不足无法加载的问题。

1. 无法进入图形界面时，可以使用CRTL+ALT+F2进入命令行模式。
2. 输入用户名和密码，登录系统
3. 查找无用的软件包或大文件进行删除，保证有剩余可用空间

```bash
find /var/ -type f -size +100M  -print0 | xargs -0 ls -lh # 查找大于100M的文件并进行排序
或
find . -type f -size +50M # 查找大于50M的文件
```
<!-- more -->
我发现找到的很多是安装的无用软件，一下为删除方式。

1. 使用`dkpg -l | grep -i "文件名"` 查找对应的软件包
2. 软件删除 `apt remove 包名`

查看剩余的空间
```bash
df
```

有剩余空间后，重新启动即可。