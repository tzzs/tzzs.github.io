---
title: 连接网络bat
date: 2018-12-15 02:04:15
update:
categories:
- bat
tags:
---

```bat
@echo off
title=NetKeeper-WiFi
::
::设置参数
::
SET netkeeper="D:\Program Files\NetKeeper\NetKeeper.exe"
SET nkTask="NK.exe"
SET wifi="D:\Program Files (x86)\kingsoft\kwifi\kwifi.exe"
SET wifiTask="kwifi.exe"

:: 获取管理员身份
echo Obtaining administrator identity ...
cd /d %~dp0
%1 start "" mshta vbscript:createobject("shell.application").shellexecute("""%~0""","::",,"runas",1)(window.close)&exit

:: 判断网络是否连接
echo;
echo Start network connection test ...
echo; >> ping.log
echo; >> ping.log
echo;
echo *********************%date% %time%********************* >> ping.log
::baidu DNS
ping /n 2 180.76.76.76>>ping.log
ping /n 2 180.76.76.76>tmp.log
echo; >> ping.log
for /f %%i in ('findstr /n "超时" tmp.log') do (set r=%%i)
del tmp.log

:: 判断是否连接网络
if defined r (
echo Start the network connection ...

::关闭wifi进程
echo close the wifi task ...
taskkill /f /t /im %wifiTask%

:: 启动netkeeper
echo;
echo start NetKeeper ...
start "" %netkeeper%

:: 等待连接
echo;
echo Waiting for the program to complete ...
echo please wait 30 seconds ...
timeout /t 30

:: 关闭NK进程
echo;
echo close the task ...
taskkill /f /t /im %nkTask%

:: 启动wifi
echo;
echo start kwifi ...
start "" %wifi%

:: 执行完成 关闭窗口
echo;
echo execution completed ...
echo Off automatically after 5 seconds ...
timeout /t 5

) else (

taskkill /f /t /im %nkTask%

echo;
echo Network connected ...
echo;
echo Off automatically after 5 seconds ...
echo;
timeout /t 10

)
```