---
title: 网站开启CDN加速
date: 2019-01-16 05:34:54
update:
categories:
tags:
---

# CDN
腾讯云和七牛云CDN都有免费额度

[七牛云CDN](https://portal.qiniu.com/financial/price?ref=developer.qiniu.com)每个月 CDN-HTTP 下载流量 1GB 免费（仅HTTP免费）。

[腾讯云CDN](https://cloud.tencent.com/document/product/228/562)用户每月均可享受 10 GB 免费流量包，接入加速域名后于次月 1 号发放至您的账户。新开通 CDN 的用户还会在开通后的 6 个月内每月收到腾讯云赠送的 50 GB 流量包。

我使用的是腾讯CDN，接下来就是按照腾讯云CDN配置方法。
<!-- more -->
# 开通CDN
[腾讯CDN控制台](https://console.cloud.tencent.com/cdn)开通CDN，需要实名认证-补充服务信息-选择付费方式。付费方式可以选择按使用流量收费，就可以直接从赠送的6个月的流量包中扣除。

# 接入域名

## 需要
- 域名已备案
  
## 接入域名

在 [域名管理](https://console.cloud.tencent.com/cdn/access) 页面，选择添加域名

### 域名配置
![](https://main.qcloudimg.com/raw/9eb6362d91925027758c55fff6f8b219.png)

域名中填写要加速的域名，例如 [tzz6.xyz](tzz6.xyz),同时后面[添加CNAME](#配置CNAME)时可以直接按照这个域名来配置。

源站设置中直接填写服务器IP即可，如果不是默认端口，后面添加端口即可，例如 `127.0.0.1:443`

### 加速服务配置
![](https://main.qcloudimg.com/raw/5a1a60e71ac4bd92f333c42298fcab36.png)

博客类网站选择静态加速
[我的博客](tzz6.xyz)网站由Wordpress驱动,加载速度慢主要是因为需要下载`.css  .js  .png` 类型文件，所以可以在缓存配置中添加

| 类型     | 内容                 | 刷新时间 |
| -------- | -------------------- | -------- |
| 文件类型 | `.css;.js;.png;.gif` | 1天      |

你也可以通过浏览器开发者工具-Network查看加载速度慢的元素。
也可以添加全路径文件来缓存指定的文件，加快访问速度。
我的全部设置

| 类型       | 内容                                                                           | 刷新时间 |
| ---------- | ------------------------------------------------------------------------------ | -------- |
| 文件类型   | `.css;.js;.png;.gif`                                                           | 1天      |
| 全路径文件 | `/wordpress/wp-content/themes/wordstar/assets/fonts/fontawesome-webfont.woff2` | 1天      |
| 全部       | all                                                                            | 1天      |

# 配置CNAME

我的域名是在 阿里云 ，在域名解析页面中添加一条CNAME解析，如果你之前存在 [域名配置](###域名配置) 中填写的域名的对应解析，需要先删除再添加CNAME解析。

主机记录根据对应的域名配置的前缀进行填写，如果直接为 `tzz6.xyz` 这种域名，则填写 `@` ，如果前缀为`www`，则填写`www`,其它类似。

记录值填写 CDN 分配的域名，然后保存即可。
![](https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/%7BD9EDBBE1-1519-40C1-B4D8-6558E3EB3CBF%7D.png.jpg)

# CDN验证
CDN的生效需要一段时间，随后可以通过站长之家的工具测试是是否生效。

**[Ping检测](http://ping.chinaz.com)**：地图下面会显示对应的CDN信息
![](https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/%7B91925569-DD19-4CE6-BB16-104C1D67CAD6%7D.png.jpg)

**[国内测速](http://tool.chinaz.com/speedtest)**:测试网站的打开速度