---
title: Windows 增加多个可用SSH公钥
description: 之前由于使用Github Pages作为博客地址导致国内访问速度过慢，增加了腾讯云CDN依旧有大量数据缓存失败，所以更换了国内Coding作为博客镜像（之前用过Gitee Pages，但是普通用户无法自定义域名），在Hexo增加Coding仓库配置时，无法识别新增的SSH公钥，显示 Permissi
pubDate: '2020-02-23'
tags:
  - SSH
  - Coding
  - Windows
categories:
  - Windows
cover: https://46c4ts1tskv22sdav81j9c69-wpengine.netdna-ssl.com/wp-content/uploads/prod/2020/08/windows-logo-social.png
---

之前由于使用Github Pages作为博客地址导致国内访问速度过慢，增加了腾讯云CDN依旧有大量数据缓存失败，所以更换了国内Coding作为博客镜像（之前用过Gitee Pages，但是普通用户无法自定义域名），在Hexo增加Coding仓库配置时，无法识别新增的SSH公钥，显示 `Permission denied (publickey)`, 看了一下Coding的官方论坛，他们根本没有解决办法😂，以下为出现问题的过程以及找到的解决办法。

# 1. 新增公钥

想要通过SSH访问Coding，需要先新增一个公钥，同时在Coding端增加公钥配置

```bash
ssh-agent -t rsa -C "your.email@example.com"

# Creates a new ssh key, using the provided email as a label
# Generating public/private rsa key pair.
Enter file in which to save the key (/Users/you/.ssh/id_rsa): [Press enter]  // 推荐使用默认地址，如果以前的有用，就改为新的名字例如 id_ras_Coding_email@example.com 这个文件路径后面会用到
Enter passphrase (empty for no passphrase):   //此处点击 Enter 键即可，也可以填写密码，填写密码后每次使用 SSH 方式推送代码时都会要求输入密码，由于这个 Key 也不是用于军事目的，所以也无需设置密码。
```

然后将生成的`.pub`公钥添加到Coding的公钥配置中，使用命令测试连接是否成功

```bash
ssh -T git@e.coding.net
```

输入 `yes` 允许新增host，如果显示已经通过则正常，但是我在验证过程中依旧显示

```bash
Permission denied (publickey)
```

# 2. 发现解决问题的方法

首先解释一下相关名词

## SSH

全称 Secure Shell ，一个允许两台电脑之间通过安全的连接进行数据交换的网络协议，通过加密博爱挣了数据库的保密性和完整性。SSH采用公钥加密技术来验证远程主机，以及允许远程主机验证用户。

## ssh-keygen

用于为SSH生成、管理和转换认证密钥，支持RSA和DSA两种认证密钥，生成密钥就是使用的此命令。

## ssh-agent

一种用于保存公钥身份验证所使用的私钥的程序，如果私钥交给ssh-agent保管，其它程序需要验证身份的时候可以将验证申请交给ssh-agent来完成整个认证过程。

---

同时ssh-agent也可能带来问题，在Windows下尝试使用SSH进行身份验证时就可能出现`Permission denied (publickey)` 的问题，**主要可能的原因就是公钥未加载到ssh-agent中**，`ssh-add -l`可以查看相应的ssh key是否被加载，这就到了下一个问题，ssh-add命令无法使用。

# 3. 发现ssh-add无法使用

输入命令

```sh
ssh-add -l
```

就出现了 ` Error connecting to agent: No such file or directory` 的问题。

这是由于Windows下的服务**OpenSSH Authentication Agent** 未启动的原因，

1. Windows下键入 WIN+R 输入 services.msc
2. 找到**OpenSSH Authentication Agent**服务，将启动类型修改为 **自动** ，同时启动此服务。

此时 `ssh-add `命令就能够使用了。

# 4. 将Coding的ssh key添加到ssh-agent下

使用以下命令添加ssh key到ssh-agent下

```bash
ssh-add /Users/you/.ssh/id_ras_Coding_email@example.com  # 这就是上面生成ssh key时写的地址
```

此时再通过 `ssh-add -l` 查看ssh-agent中管理的ssh key就有了新增的key。

# 5. 测试Coding

```bash
ssh -T git@e.coding.net
```

此时就能验证成功了

```bash
Warning: Permanently added 'e.coding.net,(RSA) to the list of known hosts.
Coding 提示: Hello Frank, You've connected to Coding.net via SSH. This is a personal key.
Frank，你好，你已经通过 SSH 协议认证 Coding.net 服务，这是一个个人公钥.
```
