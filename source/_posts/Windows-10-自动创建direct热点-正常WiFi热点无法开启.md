---
title: 'Windows 10 自动创建direct热点,正常WiFi热点无法开启'
date: 2019-01-05 04:12:54
update:
categories:
- [Windows, Windows10]
tags:
cover: https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/20211023-windows.png
---

今天使用电脑开启热点的时候，发现可以正常开启，但是手机搜索不到，只有一个Direct-[PC名] 的热点，并且无法连接，重新安装了网卡驱动也没有效果。

Google了一下也没看到办法，后来才想到今天手机向电脑投影的时候，开启了`投影到此电脑`
![投影到此电脑](https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/%E6%89%B9%E6%B3%A8%202019-01-05%20041910.jpg)

把这个关闭，那个创建的热点就会自动关闭。再去创建热点就正常了，所以这个投影到此电脑和启动热点不能同时使用一个网卡。
