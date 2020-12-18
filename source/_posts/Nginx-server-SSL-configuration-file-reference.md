---
title: ' Nginx server SSL configuration file reference'
date: 2020-12-19 02:02:13
update:
categories:
- [Nginx]
tags:
- [Nginx]
- [HTTPS]
- [SSL]
---



以下配置文件供参考，此配置在当前网站可用。

```conf
server {
  listen 80;
  # 请求域名
  server_name xxx.com;
  # rewrite 用于将所有http请求自动转换为https
  rewrite ^(.*)$ https://$host$1 permanent;
  root /web;
  location / {
    root /web/public;
    index index.html;
  }
}

server {
  # Https默认请求端口
  listen       443 ssl;
  # 请求域名
  server_name xxx.com;

  location / {
    # 项目根目录
    root /web/public;
    # 请求主页名 会与上面的路径拼接获取对应文件
    index index.html;
  }
  
  # 证书pem与key文件的位置
  ssl_certificate pem_path;
  ssl_certificate_key key_path;
  ssl_session_timeout 5m;
  # 加密套件类型
  ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
  # TLS协议类型
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
  ssl_prefer_server_ciphers on;

  error_page 404 /404.html;
  location = /40x.html {
    root /web/html;
  }

  error_page 500 502 503 504 /50x.html;
  location = /50x.html {
    root /web/html;
  }
}
```

