---
title: 'Nginx 403 error: directory index of [folder] is forbidden'
date: 2020-12-19 01:53:56
update:
categories:
- [Nginx]
tags:
- [Https]
- [Nginx]
cover: https://www.nginx.com/wp-content/uploads/2018/08/NGINX-logo-rgb-large.png
---







今天对服务器上的Nginx配置SSL证书的时候，写了一个很傻的错误，导致它出现 `Nginx 403 error: directory index of [folder] is forbidden`这个错误，在日志中显示一下内容：

```
2020/12/19 01:50:55 [error] 30312#0: *1 directory index of "/web" is forbidden, client: xxx.xxx.xxx.xxx, server: imtzz.com, request: "GET / HTTP/1.1", host: "imtzz.com"
```

显示被拒绝，我们本来以为是文件夹权限的问题，发现修改为777后依旧由此错误，最后发现是nginx的conf文件中 index 后面的index.html （写成了 index.hmtl, 导致找不到主页才会访问被拒绝）写错了🙂 ，心态爆炸。
