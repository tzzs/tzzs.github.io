---
title: Windows下迁移User下的用户目录到非系统盘
date: 2020-12-15 23:49:58
update:
categories:
- [Windows, Windows10]
tags:
- [Windows]
cover: https://46c4ts1tskv22sdav81j9c69-wpengine.netdna-ssl.com/wp-content/uploads/prod/2020/08/windows-logo-social.png
---



1. 先进入Windows的修复模式，进入修复模式的命令行功能。

   如果能够登录Windows, 按住Shift点击重启,则能够直接进入修复模式.

   如果无法进入Windows界面, (我的主板是ASUS, 目前没找到好的办法可以直接从BIOS进入), 可以在见到ASUS图标后, 按住关机键强制重启, 重复三次, 则可进入.

2. 使用diskpart命令查看盘符（😭我的Windows里的盘符与diskpart的不一致,导致我重启了N多次）

   此时CMD一般显示的是X盘, 这是正常的不要惊慌.

   ```shell
   # 进入diskpart工具
   diskpart
   
   # 查看所有的硬盘
   list disk
   
   # 进入系统盘所在的硬盘
   select disk 2 
   
   # 查看当前硬盘的磁盘盘符 C: D:
   LIST VOLUME
   ```

3. 根据查看的盘符编写命令

   想要将C:\Users\XXX 迁移到 D:\Users\XXX

   在diskpart中查看到的盘符分别为 G: 和 H: , 但是这里有个问题要注意, 等下G:\Users设置软链接的时候依旧要链到D:\Users , **这点很重要(因为我重启了好几次)**.

   ```shell
   # robocopy 文件复制   /E 复制子目录(包括空目录) /COPYALL 复制所有文件信息  /XJ 排除接合点(I don't know what this is.) /XD排除某个文件
   robocopy "G:\Users" "D:\Users" /E /COPYALL /XJ /XD "G:\Users\Administrator"
   
   # 如果上一步复制失败,说有某个文件夹正在使用就可以使用/XD跳过对应的文件夹
   # 如果仅迁移当前用户,则可以仅复制 G:\Users\userName 目录 到 D:\Users\userName
   
   # 删除G:\Users目录, 应为删除后才能创建软连接
   # rmdir 删除文件夹 /S 递归删除 /Q 安静模式,不会确认是否需要删除
   rmdir "C:\Users" /S /Q
   
   # 上两步成功,就基本成功了
   # mklink 创建软链接 /J 链接类型为目录链接
   mklink "G:\Users" "D:\Users" /J
   ```

4. 执行完成以上步骤后, 开机确认, 打开C:\Users 确认是否与 D:\Users 内容不同, 如果不相同可能就是mklink链接目录不对(即diskpart中的盘符与Windows开机后的盘符不一致, 按照第三步重新编写命令执行).

