---
title: 在Docker Alpine中安装uwsgi
date: 2019-02-19 22:22:46
update:
categories:
- [Linux,Alpine]
- [Docker]
tags:
---
uWSGI是一个由unbit提供的Web应用服务器，实现了WSGI规范。

在Docker中下载了一个 `python:3.6-alpine` 的镜像，相比其它版本，更加精简。但同时也缺少了很多必要的包，在镜像中直接安装`uwsgi`时会发生错误。

`pip install uwsgi` 可能会产生无法编译或找不到python包的头文件错误。

## 解决办法

```bash
apk add --no-cache gcc make libc-dev linux-headers pcre-dev
```

## Dockerfile 
```dockerfile
FROM python:3.6-alpine
MAINTAINER tzz <tzzchn@outlook.com>
ENV TZ "Asia/Shanghai"

ADD . /webdata/bing2
WORKDIR /webdata/bing2


RUN echo https://mirrors.ustc.edu.cn/alpine/latest-stable/main > /etc/apk/repositories; \
    echo https://mirrors.ustc.edu.cn/alpine/latest-stable/community >> /etc/apk/repositories
RUN \ 
apk update && \
apk add --no-cache gcc make libc-dev linux-headers && \
pip install  -r /webdata/bing2/requirements.txt && \ 
uwsgi --ini /webdata/bing2/uwsgi.ini

EXPOSE 80 8000 8080 9090
```
