---
title: Approach to start minikube on a single-core server
date: 2021-10-17 22:10:28
update:
categories:
- [kubernetes]
tags:
- [kubectl]
- [kubernetes]
- [Linux]
cover: https://ucc.alicdn.com/pic/developer-ecology/3923c02976574632b9293a7df64ae055.jpg
---

I have an Aliyun server with single-core and 2GB memory. I installed minikube on it today. But I found it couldn't run minikube. `minikube needs 2 CPUs or more and 2GB of free memory`

There is a way to run minikube on a single-core server with following command.

```shell
minikube start --force
```
