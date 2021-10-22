---
title: 配置Github Actions过程中的一些问题
date: 2020-12-19 00:29:52
update:
categories:
- [CI/CD]
tags:
- [CI/CD]
- [Github Actions]
cover: https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/20211023-githubaction.png
---

1. 在Actions中切换分支

    ```yml
    - name: Checkout Codes
      run: |
        git clone -b hexo https://${{secrets.CODING_TOKEN_NAME}}:${{secrets.CODINGTOKEN}}@${Coding} hexo
        cd master
        ls
      env:
        Coding: e.coding.net/imtzz/Pages.git
    ```



2. 如何使用SSH登录远程服务器

   服务器：A

   Action 服务器：B

   1. 首先需要获取服务器A的密钥，用于CI服务器B远程免密登录，并且对应的服务器A公钥要加在A的`~/.ssh/authorized_keys`中。

          ```shell
          cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
          ```

   2. 在Github Secrets中配置以下几项内容

          SERVER_IP：服务器A的IP地址
        
          SERVER_USERNAME：要登陆到服务器A使用的用户名（要与密钥匹配）
        
          SERVER_PRIVATE_KEY：服务器A密钥（id_rsa），建议复制的时候直接在文件中CTRL+A，全选粘进去。**\*不要缺少BEGIN和END那两行以及最后的空行，全都要。\***

   3. StrictHostKeyChecking配置是关闭公钥检查，会自动接受新的公钥，防止需要输入yes时终端CI处理。

        ```yml
        - name: Configure SSH 
          run: |
              mkdir -p ~/.ssh 
              echo "${KEY}" > ~/.ssh/deploy.key
              chmod 600 ~/.ssh/deploy.key
              cat >> ~/.ssh/config <<END
              Host server
                HostName $IP
                User $USERNAME
                IdentityFile ~/.ssh/deploy.key
                StrictHostKeyChecking no
              END
          env:
              IP: ${{secrets.SERVER_IP}}
              USERNAME: ${{secrets.SERVER_USERNAME}}
              KEY: ${{secrets.SERVER_PRIVATE_KEY}}

        ```



3. 解决SSH连接服务器执行命令不能自动终止

       在最后执行服务器脚本的时候发现，虽然执行完了，但是无法自己断开连接，就需要对执行命令进行修改，最后如下。
        
       deploy.sh 需要执行的脚本，server是上面config文件中配置的名称，将所有输出导向 /dev/null，即可自动关闭。
        
       ```shell
       ssh server < deploy.sh > /dev/null 2>&1
       ```



4. 其实中间碰到了不少问题，许多问题解决完就忘记了，以后想起来再写吧。