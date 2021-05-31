---
title: Maven project cannot load maven repository depedency
date: 2021-01-15 23:56:43
update:
categories:
- [Java, Maven]
tags:
- [Maven]
---

涉及的错误信息：
1. parent.relativePath points at wrong local
2. Could not transfer artifact org.springframework.boot:spring-boot-starter-parent:pom:2.4.1 from/to

今天碰了一个错误，就是新建的Spring Boot的项目，但是发现pom.xml中的依赖一直无法自动下载，手动更新也不行，昨天晚上搞了2个小时也没找到什么原因。今天突然在IDEA中的一个错误信息显示控制台中，发现我原来设置的仓库地址【D:\Program Files\Apache】只有 **D:\Program** 这一部分s是蓝色的高亮状态。我突然想起来是不是因为路径中不能有空格的原因，最后把Maven仓库地址修改为了【D:\dev\maven-repository】，果然就好了，🤡竟是我自己。
