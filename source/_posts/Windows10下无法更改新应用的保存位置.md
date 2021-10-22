---
title: Windows10下无法更改新应用的保存位置
date: 2020-12-16 22:55:34
update:
categories:
- [Windows, Windows10]
tags:
- [Windows]
- [Windows10]
cover: https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/20211023-windows10-laptop.png
---



​		前两天重新安装了Windows，今天正好想要从Windows Store里面安装软件，就想起来要修改一下软件安装位置（不然C盘占用的太多了）。但是发现无法修改，抛出错误代码0x80070002。

​		试了几个方法都没有用，最终在神奇的知乎找到了解决办法。



解决办法：

​		删除想要移动的盘符内（我要修改到D盘，就是D盘内）的`WindowsApps`,  `WpSystem`,   `WUDownloadCache`,  `用户同名文件夹`，删除可能需要管理权限，WindowsApps如果无法删除的话，建议使用强力删除工具进行删除，然后再去设置里修改就完成了。