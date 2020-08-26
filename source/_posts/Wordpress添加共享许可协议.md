---
title: WordPress添加共享许可协议
date: 2019-01-16 07:48:04
update:
categories:
- [Blog,WordPress]
tags:
---

# 选择
在 [共享协议选择](https://creativecommons.org/choose/) 页面选择你想要的共享协议，也可以根据他给出的选项，选择后他会推荐对应的共享协议。
<!-- more -->
![许可协议要点](https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/%7B00F130EB-56E8-4DE3-A991-2CC66C7C5307%7D.png.jpg)

# 更多署名信息

可以选择添加对应的个人网站信息，在下面会即时生成对应的 html 代码。
![更多署名信息](https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/%7B30EF564D-F73B-4DB6-B06C-497ADDE65850%7D.png.jpg)


# 添加到Wordpress
![](https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/%7BF2000411-72FA-454C-90EF-DF818F778429%7D.png.jpg)

复制下面的html代码

登录到Wordpres后台管理页面，选择 **`外观-编辑-主题文件-主题页脚-footer.php`**
在后一个标签`</p>`之前添加复制的html代码，然后更新文件。
其它对齐或换行可以根据自己喜好单独调整。

```php
		<br />
		<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="知识共享许可协议" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/80x15.png" /></a><br />本作品由<span xmlns:cc="http://creativecommons.org/ns#" property="cc:attributionName">TZZ</span>采用<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">知识共享署名-相同方式共享 4.0 国际许可协议</a>进行许可。基于<a xmlns:dct="http://purl.org/dc/terms/" href="tzz6.xyz" rel="dct:source">tzz6.xyz</a>上的作品创作。
    </p>

  </div>
</footer>
</div>
<?php wp_footer(); ?>
</body></html>
```
# 最终效果
![](https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/%7B32C673DC-48E5-4E01-A5BF-58BF44F6FD52%7D.png.jpg)
完成！
