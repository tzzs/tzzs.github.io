---
title: Nginx uWsgi 重新运行Django项目
date: 2019-02-20 22:23:13
update:
categories:
- [NGINX]
- [uWSGI]
- [Django]
tags:
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
