---
title: Hexo bug
date: 2018-12-13 02:29:22
update:
categories:
- [Blog,Hexo]
tags:
- [Hexo]
cover: https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/20211023-hexo.png
---

# 修改文章的大小写后，重新部署无效

在初次提交文章后，你想要修改文章名字的大小写和分类时，部署后链接会修改，但是Github上的文章名并没有修改，所以打开链接会导致 404 错误。

## 原因
这是因为在Windos和MAC OSX 系统中 Git 会忽略对文件或目录大小写的更改，导致Github上文章名不会更新。

## 解决办法

可以先将文件名添加字母或修改为其他名字，再次部署后再进行大小写的修改，进行重新部署。
