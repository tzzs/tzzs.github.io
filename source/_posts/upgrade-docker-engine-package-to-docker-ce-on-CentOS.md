---
title: upgrade docker engine package to docker-ce on CentOS
date: 2021-10-17 21:18:17
update:
categories:
- [kubernetes]
tags:
- [kubectl]
- [kubernetes]
- [Linux]
cover: https://www.docker.com/sites/default/files/d8/styles/large/public/2021-08/Moby-run.png?itok=oGhAc1XC
---

> Older version of Docker were called `docker` or `docker-engine`. The Docker Engine package is now called `docker-ce` .

1. uninstall old versions

   ```shell
   sudo yum remove docker \
                     docker-client \
                     docker-client-latest \
                     docker-common \
                     docker-latest \
                     docker-latest-logrotate \
                     docker-logrotate \
                     docker-engine
   ```

2. set up the repository

   ```shell
   sudo yum install -y yum-utils
   
   sudo yum-config-manager \
       --add-repo \
       https://download.docker.com/linux/centos/docker-ce.repo
   ```

3. install Docker Engine

   ```shell
   sudo yum install docker-ce docker-ce-cli containerd.io
   ```

4. start Docker

   ```shell
   sudo systemctl start docker
   ```

5. verify that Docker Engine is installed correctly by running the `hello-world` image.

   ```shel
   sudo docker run hello-world
   ```

6. upgrade Docker Engine 

   ```shell
   yum -y upgrade docker-ce
   ```

7. view docker version number

   ```shell
   docker version --format {{.Server.Os}}-{{.Server.Version}}
   ```
