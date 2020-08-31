---
title: >-
  Warning: Accessing non-existent property 'lineno' of module exports inside
  circular dependency
date: 2020-09-01 00:01:28
update:
categories:
- [Blog, Hexo]
tags:
- Hexo
- Node.js
---

这几天更新了Blog，但是持续没有将版本发布出去，本来以为是缓存的问题等几个小时就好了，但是今天仍然无法访问。

我本地执行 `hexo server` 发现是能够正常访问的，这应该就是Travis的问题了。

于是我就去GitHub仓库上看Index.html的内容，发现是空的，此时就能够断定是Hexo编译静态内容出错了，然后去看Travis的持续集成日志，发现了一下错误。
```shell
$ hexo clean
(node:5773) Warning: Accessing non-existent property 'lineno' of module exports inside circular dependency
(Use `node --trace-warnings ...` to show where the warning was created)
(node:5773) Warning: Accessing non-existent property 'column' of module exports inside circular dependency
(node:5773) Warning: Accessing non-existent property 'filename' of module exports inside circular dependency
(node:5773) Warning: Accessing non-existent property 'lineno' of module exports inside circular dependency
(node:5773) Warning: Accessing non-existent property 'column' of module exports inside circular dependency
(node:5773) Warning: Accessing non-existent property 'filename' of module exports inside circular dependency
INFO  Deleted database.
```

经过查看GitHub上Hexo的issue得知是由于node.js的版本过高导致的，因此我把travis中node.js的版本由 stable 修改为 12 ，至此问题完美解决。

**问题原因**

此问题是由于在Node.js中使用了stylus，同样Hexo基于Node.js实现，因此在stylus中存在循环依赖的情况下hexo也会收到影响，导致命令执行失败。

此问题已经在新版本中的stylus中修复，不知为何Node.js的Stable版本仍未更新。

[stylus pull 代码修复链接](https://github.com/stylus/stylus/pull/2538)
