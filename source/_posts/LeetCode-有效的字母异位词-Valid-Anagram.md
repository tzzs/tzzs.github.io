---
title: LeetCode 有效的字母异位词 Valid Anagram
date: 2018-12-30 06:00:11
update:
categories:
- LeetCode
tags:
---
Given two strings s and t , write a function to determine if t is an anagram of s.

__Example 1:__ 
```
Input: s = "anagram", t = "nagaram"
Output: true
```

__Example 2:__ 
```
Input: s = "rat", t = "car"
Output: false
```
__Note:__

You may assume the string contains only lowercase alphabets.

__Follow up:__

What if the inputs contain unicode characters? How would you adapt your solution to such case?



__PYTHON3:__

解法：先进行排序，然后判断字符串是否相同
```python
class Solution:
    def isAnagram(self, s, t):
        """
        :type s: str
        :type t: str
        :rtype: bool
        """
        return sorted(s)==sorted(t)
```

