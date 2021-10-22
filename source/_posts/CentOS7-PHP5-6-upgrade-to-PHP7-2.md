---
title: CentOS7 PHP5.6 upgrade to PHP7.2
date: 2019-01-08 20:32:24
update:
categories:
- [Linux, CentOS]
- [PHP]
tags:
cover: https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/20211023-php.svg
---

# 服务器信息

CentOS 7.5

Apache 2.4

PHP 5.6

# 查找已安装的 PHP Package

使用`yum list installed | grep "php"`查找已安装的php package，存档
```bash
[root@aliyun ~]# yum list installed | grep "php"
Repository base is listed more than once in the configuration
Repository updates is listed more than once in the configuration
Repository extras is listed more than once in the configuration
Repository centosplus is listed more than once in the configuration
Repository base is listed more than once in the configuration
Repository updates is listed more than once in the configuration
Repository extras is listed more than once in the configuration
Repository centosplus is listed more than once in the configuration
php56w.x86_64                        5.6.39-1.w7                     @webtatic  
php56w-cli.x86_64                    5.6.39-1.w7                     @webtatic  
php56w-common.x86_64                 5.6.39-1.w7                     @webtatic  
php56w-fpm.x86_64                    5.6.39-1.w7                     @webtatic  
php56w-gd.x86_64                     5.6.39-1.w7                     @webtatic  
php56w-ldap.x86_64                   5.6.39-1.w7                     @webtatic  
php56w-mbstring.x86_64               5.6.39-1.w7                     @webtatic  
php56w-mcrypt.x86_64                 5.6.39-1.w7                     @webtatic  
php56w-mysqlnd.x86_64                5.6.39-1.w7                     @webtatic  
php56w-pdo.x86_64                    5.6.39-1.w7                     @webtatic  
php56w-xml.x86_64                    5.6.39-1.w7                     @webtatic  
```
<!-- more -->

# 删除已安装的PHP Package
使用命令删除已安装的PHP
```bash
yum remove php-cli mod_php php-common
```


# 查找需要的PHP版本
例如，使用下面的命令可以查找PHP7.2版本的Package
```bash
yum list | grep "php72"
```

```bash
[root@aliyun ~]# yum list | grep "php72"
Repository base is listed more than once in the configuration
Repository updates is listed more than once in the configuration
Repository extras is listed more than once in the configuration
Repository centosplus is listed more than once in the configuration
Repository base is listed more than once in the configuration
Repository updates is listed more than once in the configuration
Repository extras is listed more than once in the configuration
Repository centosplus is listed more than once in the configuration
mod_php72w.x86_64                       7.2.13-1.w7                     webtatic
php72w-bcmath.x86_64                    7.2.13-1.w7                     webtatic
php72w-cli.x86_64                       7.2.13-1.w7                     webtatic
php72w-common.x86_64                    7.2.13-1.w7                     webtatic
php72w-dba.x86_64                       7.2.13-1.w7                     webtatic
php72w-devel.x86_64                     7.2.13-1.w7                     webtatic
php72w-embedded.x86_64                  7.2.13-1.w7                     webtatic
php72w-enchant.x86_64                   7.2.13-1.w7                     webtatic
php72w-fpm.x86_64                       7.2.13-1.w7                     webtatic
php72w-gd.x86_64                        7.2.13-1.w7                     webtatic
php72w-imap.x86_64                      7.2.13-1.w7                     webtatic
php72w-interbase.x86_64                 7.2.13-1.w7                     webtatic
php72w-intl.x86_64                      7.2.13-1.w7                     webtatic
php72w-ldap.x86_64                      7.2.13-1.w7                     webtatic
php72w-mbstring.x86_64                  7.2.13-1.w7                     webtatic
php72w-mysql.x86_64                     7.2.13-1.w7                     webtatic
php72w-mysqlnd.x86_64                   7.2.13-1.w7                     webtatic
php72w-odbc.x86_64                      7.2.13-1.w7                     webtatic
php72w-opcache.x86_64                   7.2.13-1.w7                     webtatic
php72w-pdo.x86_64                       7.2.13-1.w7                     webtatic
php72w-pdo_dblib.x86_64                 7.2.13-1.w7                     webtatic
php72w-pear.noarch                      1:1.10.4-1.w7                   webtatic
php72w-pecl-apcu.x86_64                 5.1.9-1.w7                      webtatic
php72w-pecl-apcu-devel.x86_64           5.1.9-1.w7                      webtatic
php72w-pecl-geoip.x86_64                1.1.1-1.2.w7                    webtatic
php72w-pecl-igbinary.x86_64             2.0.5-1.w7                      webtatic
php72w-pecl-igbinary-devel.x86_64       2.0.5-1.w7                      webtatic
php72w-pecl-imagick.x86_64              3.4.3-1.2.w7                    webtatic
php72w-pecl-imagick-devel.x86_64        3.4.3-1.2.w7                    webtatic
php72w-pecl-libsodium.x86_64            1.0.6-1.2.w7                    webtatic
php72w-pecl-memcached.x86_64            3.0.4-1.w7                      webtatic
php72w-pecl-mongodb.x86_64              1.4.1-1.w7                      webtatic
php72w-pecl-redis.x86_64                3.1.6-1.w7                      webtatic
php72w-pecl-xdebug.x86_64               2.6.0-1.w7                      webtatic
php72w-pgsql.x86_64                     7.2.13-1.w7                     webtatic
php72w-phpdbg.x86_64                    7.2.13-1.w7                     webtatic
php72w-process.x86_64                   7.2.13-1.w7                     webtatic
php72w-pspell.x86_64                    7.2.13-1.w7                     webtatic
php72w-recode.x86_64                    7.2.13-1.w7                     webtatic
php72w-snmp.x86_64                      7.2.13-1.w7                     webtatic
php72w-soap.x86_64                      7.2.13-1.w7                     webtatic
php72w-sodium.x86_64                    7.2.13-1.w7                     webtatic
php72w-tidy.x86_64                      7.2.13-1.w7                     webtatic
php72w-xml.x86_64                       7.2.13-1.w7                     webtatic
php72w-xmlrpc.x86_64                    7.2.13-1.w7                     webtatic
```

# 安装对应的PHP7.2版本Package
[根据之前存储的PHP5已安装的Package](#查找已安装的-php-package)，安装对应的PHP7.2的Package。

例如：
```bash
yum install mode_php72w php72w-cli php72w-mysqlnd
yum install php72w-fpm php72w-mbstring php72w-gd php72w-ldap php72w-pdo php72w-xml
```
这些就是我服务器上全部需要安装的包。

# 重启Apache服务器

```bash
systemctl restart httpd
```
生效可能需要几分钟，也可以直接重启服务器。

# 测试

在网站根目录下创建 `info.php` ,加入以下内容。
```php
<?php
phpinfo()
?>
```
通过访问服务器 `IP/info.php` 或 `网址/info.php` 查看当前PHP信息。