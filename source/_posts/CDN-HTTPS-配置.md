---
title: CDN HTTPS 配置
date: 2019-01-16 07:05:26
update:
categories:
- [CDN]
- [HTTPS]
tags:
cover: https://img.alicdn.com/tfs/TB1jxiiG49YBuNjy0FfXXXIsVXa-1530-1140.png
---

在 [CDN-高级工具-证书管理界面](https://console.cloud.tencent.com/cdn/tools/certificate/deploy) 进行配置证书。

## 1.选择要配置证书的域名

## 2.选择证书

如果对应的域名在腾讯云托管了证书，可以直接选择使用。

如果选择自有证书，`证书内容`中填写 `_public.crt` 文件中的编码，`私钥内容`填写 `.key` 文件中的内容。

**注**：如果出现 `证书链无法补齐，您可以自行补齐证书链` 问题，可以在 [证书链下载/修复](https://myssl.com/chain_download.html) 页面进行证书链补齐，选择 **`上传证书`** 选择 `_public.crt` 结尾的文件上传,即之前填写的证书文件，点击 **`获取证书链`** 按钮，即可生成完整的证书链，将生成的证书链复制粘贴到 `证书内容` 中.
<!-- more -->
## 3.选择回源方式

HTTP: 全部通过HTTP进行回源。

协议跟随：根据你访问网站的方式进行回源，HTTP方式访问即通过HTTP回源，HTTPS方式访问通过HTTPS进行回源。

## 4.提交
提交后，CDN会进行部署，然后会显示当前的证书状态。如果显示配置成功，可以浏览器访问HTTPS域名（如 [https://tzz6.xyz](https://tzz6.xyz) )测试，如果正常打开，即配置完成。