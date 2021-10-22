---
title: django models中设置字段允许为空
date: 2018-12-11 00:51:01
update:
categories:
- [Python, Django]
tags:
- Python
- Django
cover: https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/20211023-django.jpg
---

在Django-models中定义数据库字段时，其字段默认是不允许为空的，在直接向数据库中插入非全部字段时，会直接发生下面错误：

_ sqlite3.IntegrityError: NOT NULL constraint failed: bing images.drk _

即 sqlite3 完整性错误，其中NOT NULL 约束失败，默认字段不允许为空。

可以通过在models的字段定义上设置 `null = True` 来解决

```python
url = models.CharField(max_length=200, null=True)
```

Django中源代码如下：

``` python
def formfield(self, **kwargs):
    # Passing max_length to forms.CharField means that the value's length
    # will be validated twice. This is considered acceptable since we want
    # the value in the form field (to pass into widget for example).
    defaults = {'max_length': self.max_length}
    # TODO: Handle multiple backends with different feature flags.
    if self.null and not connection.features.interprets_empty_strings_as_nulls:
        defaults['empty_value'] = None
    defaults.update(kwargs)
    return super().formfield(**defaults)
```
