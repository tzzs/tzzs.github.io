---
title: How to config a proxy for WSL2
date: 2022-06-06 11:27:07
update:
categories:
  - [WSL2]
tags:
  - [wsl2]
  - [proxy]
cover:
---

I met some problems when I downloaded some files from GitHub on WSL2. I cannot download files when I connect to GitHub directly. So, I try to use a proxy to solve the problem. I have tried serval solutions which do not work.

Now, there is a way to solve the problem with the following content.

# Preparation:

1. Open the function of Allow LAN in your proxy software.

2. Get the port(eg. Clash’s default port is 7890) of the proxy.

# Solution:

1. Add the following code at the end of `.bashrc`

   ```bash
   ipip=$(grep nameserver /etc/resolv.conf | sed 's/nameserver //')
   proxy_port=7890

   showproxy()
   {
   echo ''
   echo 'Show Proxy:'
   echo "http_proxy=$http_proxy"
   echo "https_proxy=$https_proxy"
   echo "ftp_proxy=$ftp_proxy"
   echo "ALL_PROXY=$ALL_PROXY"
   echo ''
   }

   proxy () {
                   export ALL_PROXY=socks5://${ipip}:${proxy_port}
                   export ftp_proxy=http://$ipip:$proxy_port/
                   export http_proxy=http://$ipip:$proxy_port/
                   export https_proxy=http://$ipip:$proxy_port/
                   showproxy
                   curl -vv http://google.com
           }

   noproxy () {
           unset ALL_PROXY
           unset ftp_proxy
                   unset http_proxy
                   unset https_proxy
                   showproxy
           curl myip.ipip.net
           }

   proxy
   ```

2. Enabling environment variables

   ```bash
   source .bashrc
   ```

3. Now, you can use the following command to activate proxy and deactivate proxy in shell.

   ```bash
   # activate
   proxy

   # deactivate
   noproxy
   ```

**And have a nice day!**
