---
title: bing2 网站页面加载优化
date: 2019-03-24 20:05:35
update:
categories:
- [前端]
- [bing2]
tags:
- [bing2]
- [懒加载]
- [CDN]
---

网站：[http://bing.tzz6.xyz](http://bing.tzz6.xyz)

编写的最初版本的页面加载速度过慢，而且要等待主页所有图片都加载完成才能进入网站主页，所以后续版本对页面的加载速度进行了优化。由于主页是使用瀑布流方式进行展示的，所以最先加入了懒加载的显示方式来保证缩短进入主页的加载时间。加入图片懒加载后，主页中放置的原图同样需要很长的请求下载时间，所以后来修改为了生成缩略图进行展示，然后主页启用腾讯CDN加速，加快图片加载速度。

<!-- more -->

# 懒加载



参考链接：[https://cloud.tencent.com/developer/article/1139722](https://cloud.tencent.com/developer/article/1139722)

实现方式：首先将页面上的图片的 src 属性设为空字符串，而图片的真实路径则设置在data-original属性中，当页面滚动的时候需要去监听scroll事件，在scroll事件的回调中，判断我们的懒加载的图片是否进入可视区域,如果图片在可视区内将图片的 src 属性设置为data-original 的值，这样就可以实现延迟加载。

```html
<img class="lazyload" lazyload="true" data-original='imagePath'>
```



```js
var viewHeight = document.documentElement.clientHeight;//可视区高度
function lazyload() {
    var eles = document.querySelectorAll('img[data-original][lazyload]')
    Array.prototype.forEach.call(eles, function (item, index) {
        var rect;
        if (item.dataset.original === "")
            return;
        rect = item.getBoundingClientRect();//获得页面中某个元素的左，上，右，下相较于浏览器视窗的位置
        if (rect.bottom >= 0 && rect.top < viewHeight) {
            !function () {
                var img = new Image();
                img.src = item.dataset.original;
                img.onload = function () {
                    item.src = img.src;
                };
                item.removeAttribute("data-original");//下次不再遍历
                item.removeAttribute("lazyload");
            }()
        }
    })
}

lazyload();
document.addEventListener("scroll", lazyload)
```



# 生成缩略图

使用python中的pillow库来生成对应的缩略图。

```python
from PIL import Image

img = Image.open(file_path)
w, h = img.size
img.thumbnail(((int)(w / 4), (int)(h / 4)))
img.save(file_path)
```



以下是`thumbnail()`函数实现方式:

缩略图函数可以传入两个参数，第一个为生成的缩略图大小，但不能大于原图大小；第二个为缩略图生成的采样方式，提供四种方式：（此参数可不选，默认为 BICUBIC )

​	NEAREST：最近滤波。从输入图像中选取最近的像素作为输出像素。它忽略了所有其他的像素。

​	BILINEAR：双线性滤波。在输入图像的2x2矩阵上进行线性插值。注意：PIL的当前版本，做下采样时该滤波器使用了固定输入模板。

​	BICUBIC：双立方滤波。在输入图像的4x4矩阵上进行立方插值。注意：PIL的当前版本，做下采样时该滤波器使用了固定输入模板。

​	ANTIALIAS：平滑滤波。这是PIL 1.1.3版本中新的滤波器。对所有可以影响输出像素的输入像素进行高质量的重采样滤波，以计算输出像素值。在当前的PIL版本中，这个滤波器只用于改变尺寸和缩略图方法。

```python
def thumbnail(self, size, resample=BICUBIC):
    """
    Make this image into a thumbnail.  This method modifies the
    image to contain a thumbnail version of itself, no larger than
    the given size.  This method calculates an appropriate thumbnail
    size to preserve the aspect of the image, calls the
    :py:meth:`~PIL.Image.Image.draft` method to configure the file reader
    (where applicable), and finally resizes the image.

    Note that this function modifies the :py:class:`~PIL.Image.Image`
    object in place.  If you need to use the full resolution image as well,
    apply this method to a :py:meth:`~PIL.Image.Image.copy` of the original
    image.

    :param size: Requested size.
    :param resample: Optional resampling filter.  This can be one
       of :py:attr:`PIL.Image.NEAREST`, :py:attr:`PIL.Image.BILINEAR`,
       :py:attr:`PIL.Image.BICUBIC`, or :py:attr:`PIL.Image.LANCZOS`.
       If omitted, it defaults to :py:attr:`PIL.Image.BICUBIC`.
       (was :py:attr:`PIL.Image.NEAREST` prior to version 2.5.0)
    :returns: None
    """

    # preserve aspect ratio
    x, y = self.size
    if x > size[0]:
        y = int(max(y * size[0] / x, 1))
        x = int(size[0])
    if y > size[1]:
        x = int(max(x * size[1] / y, 1))
        y = int(size[1])
    size = x, y

    if size == self.size:
        return

    self.draft(None, size)

    im = self.resize(size, resample)

    self.im = im.im
    self.mode = im.mode
    self._size = size

    self.readonly = 0
    self.pyaccess = None
```



# CDN加速

项目中使用[腾讯CDN](https://cloud.tencent.com/product/cdn)，为图片展示首页进行加速，目前首页加载速度本地测试 1.5s 以内。