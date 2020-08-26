---
title: Linux下安装Oracle客户端
date: 2019-08-12 15:17:25
update:
categories:
- [Linux]
- [Oracle]
tags:
---

### 下载RPM包
RPM版本： 需要手动安装

ZIP版本： 解压配置即可使用

oracle-instantclient12.2-basic-12.2.0.1.0-1.x86_64.rpm # **基础包**

oracle-instantclient12.2-sqlplus-12.2.0.1.0-1.x86_64.rpm # **SQLplus**

oracle-instantclient12.2-precomp-12.2.0.1.0-1.x86_64.rpm # **预编译工具**

<!-- more -->
### 安装Alien

\# 如果已安装可以跳过

Ubuntu 默认包为deb格式，无法直接使用rpm安装RPM包，需要安装 `alien`

```
sudo apt instal alien
```

### 安装依赖

```
sudo apt install libaio*
```

### 安装RPM包

可以使用通配符进行安装

默认安装位置为：/usr/lib/oracle/12.2/client64
```
sudo alien -i oracle-*.rpm
```

### 配置环境变量

**BUG**:在非root用户下，`/etc/profile`中的环境变量对当前用户不生效。

建议两个文件下都添加.

`$HOME/.bashrc` 路径下为当前用户环境变量

`/etc/profile` 为全局环境变量，对所有用户生效

```
sudo vi /etc/profile
vi ~/.bashrc
```

```
# 添加环境变量
export ORACLE_HOME=/usr/lib/oracle/12.2/client64  
export ORACLE_BASE=/usr/lib/oracle/12.2
export LD_LIBRARY_PATH=$ORACLE_HOME/lib:$LD_LIBRARY_PATH # 共享库
export PATH=$ORACLE_HOME/bin:$PATH # 可执行文件路径
export NLS_LANG="AMERICAN_AMERICA.AL32UTF8" # 语言及文件编码
export NLS_DATE_FORMAT="YYYY-MM-DD HH24:MI:SS" # 时间格式
export NLS_TIMESTAMP_FORMAT="YYYY-MM-DD HH24:MI:SS" # 
export TNS_ADMIN=$ORACLE_HOME/network/admin # 多个Oracle版本时指向TNS配置文件位置，仅有一个Oracle版本时可不加
```

```
# 添加环境变量 无注释版
export ORACLE_HOME=/usr/lib/oracle/12.2/client64
export ORACLE_BASE=/usr/lib/oracle/12.2
export LD_LIBRARY_PATH=$ORACLE_HOME/lib:$LD_LIBRARY_PATH
export PATH=$ORACLE_HOME/bin:$PATH
export NLS_LANG="AMERICAN_AMERICA.AL32UTF8"
export NLS_DATE_FORMAT="YYYY-MM-DD HH24:MI:SS"
export NLS_TIMESTAMP_FORMAT="YYYY-MM-DD HH24:MI:SS"
export TNS_ADMIN=$ORACLE_HOME/network/admin
```

```
# 使环境变量生效
source /etc/profile
. .bashrc

# 查看环境变量
echo $PATH 

# 如果含有Oracle/lib的路径却无法正常使用或未找到，重新启动即可生效
```

### 添加配置
以下操作需要管理员权限
1. 在`$ORACLE_HOME`路径下创建`network/admin`目录
```
sudo mkdir -p /usr/lib/oracle/12.2/client64/network/admin
```
2. 在`admin`目录下创建 `tnsnames.ora` 文件
```
cd /usr/lib/oracle/12.2/client64/network/admin
touch tnsnames.ora
```
3. 配置`tnsnames.ora`

结尾为查看虚拟机适配器IP地址方法
```
vim tnsnames.ora



# 添加以下内容
ORCL =
  (DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.137.1)(PORT = 1521))
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = orcl)
    )
  )
```

### 测试连接

```
# 测试$ORACLE_HOME能否正常输出
echo $ORACLE_HOME
# 如果不能，执行以下命令或重新启动
source /etc/profile


# 测试远程连接
sqlplus /nolog

# 如果能够正常登录，则已完成安装
```


### 补充内容
#### 查看windows下虚拟机网络适配机本机IP地址

```cmd
> ipconfig



# 找到下面的 VMware Network Adapter IPv4地址即为 192.168.137.1
# 默认适配器为VMnet8
Ethernet adapter VMware Network Adapter VMnet8:

   Connection-specific DNS Suffix  . :
   Link-local IPv6 Address . . . . . : fe80::24b2:a7bd:f00c:bd48%7
   IPv4 Address. . . . . . . . . . . : 192.168.137.1
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . :
```

