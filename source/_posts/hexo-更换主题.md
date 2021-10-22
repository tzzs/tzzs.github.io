---
title: hexo 更换主题
date: 2018-11-16 21:14:38
updated:
comments: true
categories:
- [Blog,Hexo]
tags:
- [Hexo]
cover: https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/20211023-hexo.png
---

# 选择主题

可以在 [有哪些好看的 Hexo 主题?](https://www.zhihu.com/question/24422335) 找个自己喜欢的主题，我选择的是 [hexo-theme-next](https://github.com/theme-next/hexo-theme-next) 主题

# 下载主题

打开在 Hexo 根目录 打开 CMD
```shell
mkdir theme/next
git clone https://github.com/theme-next/hexo-theme-next themes/next
```

# 安装主题
打开 _config.yml 配置文件,
![[_config.yml]](a.jpg)
修改主题为 next
```
$ hexo g # 重新生成静态文件
$ hexo s # 本地预览效果
$ hexo d # 部署到Github
```
