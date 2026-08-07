---
title: Nginx uWsgi 重新运行Django项目
description: Django项目重新运行指南，重载Nginx配置并重启uWSGI服务
pubDate: '2019-02-20'
tags:
  - Nginx
  - uWSGI
  - Django
categories:
  - Nginx
  - uWSGI
  - Django
---

### 重新启动NGINX
重新加载网站配置文件
```sh
nginx -s reload
```

### 重新启动uWSGI
```sh
ps -ef | grep uwsgi
kill -9 [pid]
uwsgi --ini uwsgi.ini
```
我是直接杀死进程然后重新运行的，也可以将uWSGI运行的PID存入到文件中，然后通过`uwsgi --reload file.pid` 。

[uWSGI Docs 管理uWSGI服务器](https://uwsgi-docs-zh.readthedocs.io/zh_CN/latest/Management.html)
