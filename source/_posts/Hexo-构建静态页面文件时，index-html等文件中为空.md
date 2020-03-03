---
title: Hexo 构建静态页面文件时，index.html等文件中为空
date: 2020-03-04 02:17:10
update:
categories:
- [Git]
- [Blog,Hexo]
tags:
- [Git]
- [Hexo]
---
1. 增加了Pages的自动化构建后，发现页面访问不了了，以为和上次一样是本地的CDN抽风导致无法访问的。后来F12看了一下页面内容只有一行，也以为是加载的问题。去代码仓库看才发现真的只有懒加载的一行js加载代码。

2. 后来以为是Travis环境的问题，因为我在本地测试可以正常编译构建成功。

3. 在网上看到可能是由于nodejs package依赖的问题，使用命令

   ```shell
   npm ls --depth 0
   ```

   并且让我真的找到了依赖不存在的问题，然而问题并没有这么简单 ￣へ￣, 安装了所有依赖项依旧有此问题.

4. 在一个博客中看到他也出现了此问题,并且最终是由于thems为空导致的,我突然就想起来thems下面的Butterfly文件夹下的所有内容被Git识别成了一个大的文件,去远程仓库看果然是空的.

5. 下面就是想办法让Git识别它, 后来发现主要原因就是Butterfly也是一个Git库, 当上层的Git认为它是一个仓库是就把他识别为了一整个文件.

   解决办法就是将Butterfly下的.git文件删除掉,然后Git重新添加整个文件夹.

   ```shell
   git rm --cache themes/Butterfly
   git add themes/Butterfly
   ```

   然后提交本次修改, 等待Travis自动构建部署完成后就能看到界面了.

注: 可能由于浏览器缓存导致你看到的还是之前的空白页,可以按F12,将Network-Disable cache选中,这样它就不会从本机读取缓存了.
