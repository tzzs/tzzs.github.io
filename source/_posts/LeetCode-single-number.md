---
title: '[LeetCode] single number'
date: 2020-08-31 23:16:19
update:
categories:
- LeetCode
tags:
- LeetCode
---

[Single Number](https://leetcode-cn.com/problems/single-number/)

给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。

**说明**

你的算法应该具有线性时间复杂度。 你可以不使用额外空间来实现吗？

**示例 1:**
```c
输入: [2,2,1]
输出: 1
```

**示例 2:**
```c
输入: [4,1,2,1,2]
输出: 4
```

**解题**

1. 由于每个相同的元素都会出现两次，又因为两个相同的元素的异或为0。 a^a = 0
2. 并且异或存在交换律，因此 a^b^a = b
3. 因此本题中直接将所有元素进行异或即可。

**代码**
```c
int singleNumber(int* nums, int numsSize)
{
    int res = 0;

    for (int i = 0; i < numsSize; i++)
    {
        res ^= nums[i];
    }

    return res;
}
```
