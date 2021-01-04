---
title: Typero自动上传图片到Tencent COS
date: 2020-11-29 20:50:21
update:
categories:
- [Python]
tags:
- Python
- Typora
- 对象存储
---

## Python实现上传脚本

1. 我使用的是腾讯的COS所以直接去官网查找对应的SDK，我是参考以下接口写的，实现也比较简单。

   [Python SDK 高级接口](https://cloud.tencent.com/document/product/436/35151#.E9.AB.98.E7.BA.A7.E6.8E.A5.E5.8F.A3.EF.BC.88.E6.8E.A8.E8.8D.90.EF.BC.89)

2. 需要使脚本符合Typero的规范。

   > You could config a custom command to upload images, using tools that is not listed in above options, or event write your own tools / scripts. Typora will append all images that needs to be uploaded after the custom command you filled.
   >
   > Then, Typora will fetch image urls from the last N lines of the standard output of your custom command. (N is the number of images to upload).
   >
   > For example, if you write a tool `upload-image.sh`, then you can input `[some path]/upload-image.sh` in the command filed. Typora will call `[some path]/upload-image.sh "image-path-1" "image-path-2"` to upload two images located in `image-path-1` and `image-path-2`. Then the command may return something like:
   >
   > ```
   > Upload Success:
   > http://remote-image-1.png
   > http://remote-image-2.png
   > ```
   >
   > Then Typora will get the two remote image url from the output, and replace the original local images used in the Markdown document.
   >
   > You could click the “Test Uploader” button to verify your custom commands.

      上面内容是Typero的文档中描述的，意思就是需要调用上传命令的时候从命令行中获取图片地址，上传完成后返回对应的在线图片地址。

      ```python
      import sys

      sys.argv
      ```

   可以通过以上方法获取写入的命令行参数，第一位是py文件名，从第二个开始为传输参数。

3. 综合以上内容, 以下就是脚本内容了。为了保护密钥的安装，使用了读取配置文件的方法实现密钥的写入。

   https://github.com/tzzs/qcloud_cos/blob/master/upload_for_md.py

## 设置Typero

偏好设置 > 图像 > 上传服务设定 > 上传服务:Custom Command > 自定义命令输入以下命令

```
activate WEB && python E:/upload_for_md.py
```

> 注：由于我的环境下存在多个python，所以先使用conda激活指定的python环境，然后进行脚本的调用。脚本需要写绝对路径



其它配置只勾选了这个，其它为手动上传（默认），防止放错图片就直接上传了。

- [x] 对本地位置的图片启用上述规则
