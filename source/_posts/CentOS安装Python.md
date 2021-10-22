---
title: CentOS安装Python3
date: 2018-12-13 00:17:24
update:
categories:
- [Linux]
- [CentOS]
tags:
cover: https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/20211023-python.png
---

需要运行基于 Python3 的 Django 项目，服务器默认安装的为 python2 ,需要安装Python3

__以下命令均为在 root 身份下执行，如果权限不够，请切换管理眼身份，或在每条命令前添加 `sudo ` 。__

# 安装Python3

## 创建目录
创建 python3 的下载安装目录
```shell
$ mk /usr/local/python3
```
<!--more-->

## 下载解压
可以在 python 的 [官网](https://www.python.org) 找到最新的 python3 安装包，然后使用 `wget` 命令下载下来。
这是 [Python 3.7.1](https://www.python.org/downloads/source/) 的页面，最下面找到下载地址，其中第一个为 tgz 格式的压缩包

![](https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/%E6%89%B9%E6%B3%A8%202018-12-13%20005037.jpg)

下载完成后进行解压
```shell
$ wget https://www.python.org/ftp/python/3.7.1/Python-3.7.1.tgz
$ tar -xzvf Python-3.7.1.tgz
```
## 安装依赖
在 python3 进行编译安装时，需要用到其它的依赖包，要先进行安装

```shell
$ yum install -y ncurses-libs zlib-devel mysql-devel bzip2-devel openssl-devel ncurses-devel sqlite-devel readline-devel tk-devel gdbm-devel db4-devel libpcap-devel xz-devel libffi libffi-devel
```

## 编译安装

```shell
$ cd Python-3.7.1
$ ./configure --prefix=/usr/local/python3 # 生成makefile  --prefix 设置安装路径
$ make # 编译
$ make install # 安装
```

## 配置链接
可以使用 `which python` 来查看原来python的位置
```shell
$ which python
/usr/bin/python
```
`ls -l` 查看软链接设置

```cmd
lrwxrwxrwx  1 root root           7 Nov 15 00:19 python -> python2
lrwxrwxrwx  1 root root           9 Nov 15 00:19 python2 -> python2.7
-rwxr-xr-x  1 root root        7216 Jul 13 21:07 python2.7
```

创建 python3 的软链接
```shell
$ ln -s /usr/local/python3/bin/python3 /usr/bin/python3
```

当前链接情况, `python` 和 `python2` 指向 python 2.7.5 ，`python3` 指向 python 3.7.1
```cmd
lrwxrwxrwx  1 root root           7 Nov 15 00:19 python -> python2
lrwxrwxrwx  1 root root           9 Nov 15 00:19 python2 -> python2.7
-rwxr-xr-x  1 root root        7216 Jul 13 21:07 python2.7
lrwxrwxrwx  1 root root          30 Dec 13 01:46 python3 -> /usr/local/python3/bin/python3
```

# 安装pip3

python3.7 已经附带了pip3 ，在 `/usr/local/python3/bin` 中可以看到 pip3

## 创建pip3软链接
```shell
$ ln -s /usr/local/python3/bin/pip3 /usr/bin/pip3
```

此时就可以正常使用 `python3` ，`pip3` 来使用 `python3.7.1` 了。




