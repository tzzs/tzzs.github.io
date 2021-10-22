---
title: 修改wordpress的翻译文件
date: 2018-11-20 18:31:09
update:
categories: 
- Blog
- WordPress
tags:
- WordPress
cover: https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/20211023-wordpress.gif
---

之前WordPress博客的首页部分内容翻译错误，就想手动修改一下。

# 使用 Xftp 登录服务器
1、找到wordpress的安装目录

2、在 _/wordpress/wp-content/languages/themes_ 目录下，找到你主题的对应翻译文件。

每个主题都有两个 .mo .po 类型的文件

![F9Zas1.jpg](https://s1.ax1x.com/2018/11/20/F9Zas1.jpg)

其中po文件,即Portable Object(可移植对象) 是翻译人员进行编写的翻译文件
```po
#: inc/main-funtions.php:469
msgid "Github"
msgstr "Github"

#: inc/main-funtions.php:461
msgid "LinkedIn"
msgstr "领英"

#: inc/main-funtions.php:449
msgid "Facebook"
msgstr "脸书"
```
mo 文件 Machine Object(机器对象) 是由 po 文件编译成的二进制文件,应用程序可以通过读取 .mo 文件进行对应语言的翻译显示。

我们将要修改主题翻译的 .po 文件下载下来。

# 修改翻译

我们只能修改 .po 文件后再将其编译为 .mo 文件，其中编译软件可以使用 [Poedit](https://poedit.net/) 。
使用 [Poedit](https://poedit.net/) 打开下载的 .po 文件，
![F9ubNV.jpg](https://s1.ax1x.com/2018/11/20/F9ubNV.jpg)
修改想要修改的翻译内容，修改完成后点击左上角 文件 - 编译为mo - 保存文件。

# 上传覆盖

编译完成后将编译完成的 .mo 文件上传到服务器，将原来的mo文件覆盖。
此时重新打开 wordpress 博客首页，翻译就已经生效了。






