---
title: LeetCode 整数反转
date: 2018-12-29 03:10:36
update:
categories:
- LeetCode
tags:
- LeetCode
---
![题目](https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/%E6%89%B9%E6%B3%A8%202018-12-29%20030945.jpg)

> 我采用的策略

1. 去除最后面的0

    不断进行 `x % 10 == 0` 判断，如果最后一位为0，则执行 `x //= 10` 。 使用 // 来执行除法，会将产生小数直接抛弃，只剩下整数。

2. 判断正数还是负数

    正数：直接将数字进行反转
    负数：将除负号外进行反转，返回时添加负号

3. 数字反转

    将数字转化为字符串，使用字符串倒序 `x[::-1]` 进行反转，反转完成后再转化为 int 类型。其中负数对应的字符串反转要避免符号位，即 `x[:0:-1]` 。

4. 判断溢出

    最后要判断反转的结果是否在范围内，不在就返回为 0 。 使用 2**31 来计算次方会比 pow() 计算更快。

TIME: 64ms
```python
class Solution:
    def reverse(self, x):
        """
        :type x: int
        :rtype: int
        """
        max = 2**31-1
        min = -2**31
        while x > 10 and x % 10 == 0:
            x //= 10
        if x >= 0:
            x = int(str(x)[::-1])
            return 0 if x > max or x < min else x
        else:
            x = -int(str(x)[:0:-1])
            return 0 if x > max or x < min else x
```
