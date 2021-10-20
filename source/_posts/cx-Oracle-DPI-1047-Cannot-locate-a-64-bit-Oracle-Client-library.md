---
title: 'cx_Oracle DPI-1047: Cannot locate a 64-bit Oracle Client library'
date: 2021-08-14 22:19:58
update:
categories:
- [Python]
- [Oracle]
tags:
- [Python]
- [Oracle]
cover: https://www.fujitsu.com/emeia/imagesgig5/oracle-db580x224_tcm158-40873_tcm158-2750236-32.jpg
---

# QUESTION

```
DatabaseError: DPI-1047: Cannot locate a 64-bit Oracle Client library: "The specified module could not be found". See https://oracle.github.io/odpi/doc/installation.html#windows for help
```



1. 检查是否安装对应版本的instantclient

2. 检查环境变量是否配置，如未配置需要使用cx_Oracle.init_oracle_client(lib_dir)进行配置

3. 运行instantclient目录下的genezi.exe检查是否能够正常运行，如果显示msvcr120.dll 找不到，则存在vc++环境未配置的问题。

   ```
   Download and install the correct Visual Studio Redistributable from Microsoft. Instant Client 19 requires the Visual Studio 2017 redistributable. Instant Client 18 and 12.2 require the Visual Studio 2013 redistributable. Instant Client 12.1 requires the Visual Studio 2010 redistributable.
   
   ```

4. 安装后重新运行即可

   
   本文参考：https://blog.csdn.net/tinyleaf/article/details/82990879?utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromMachineLearnPai2%7Edefault-2.control&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromMachineLearnPai2%7Edefault-2.control

   