---
title: 'hexo 主题 archive 页面菜单修改后不能正常显显示” '
date: 2018-11-17 00:09:17
visible: hide
categories:
- blog
- hexo
tags:
- hexo
---

在添加 tags 和 categoies 页面后，修改hexo主题菜单后，进入 tags 或 categoies 页面后菜单能够正常显示，但 archive 页面菜单仍然只有 主页和归档两个选项，并没有自动更新菜单。

在 themes/next/layout/
tag.swig
```js
{% block title %}{{ __('title.tag') }}: {{ page.tag }} | {{ title }}{% endblock %}
```
archive.swig
```js
{% block title %}{{ __('title.archive') }} | {{ title }}{% endblock %}
```

将 archive.swig 文件中的代码修改为
archive.swig
```js
{% block title %}{{ __('title.archive') }}: {{ page.archive }} | {{ title }}{% endblock %}
```
重新生成静态文件，进行网站部署即可
```shell
$ hexo g
$ hexo d
```
