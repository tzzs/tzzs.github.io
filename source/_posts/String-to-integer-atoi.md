---
title: String to integer atoi
date: 2020-04-03 02:24:10
update:
categories:
- [Algorithm]
- [C]
tags:
- [LeetCode CN]
- [Online Judge]
- [C]
---
C语言解法 100%/100%， 欢迎访问我的Github[https://github.com/tzzs/LeetCode-CN](https://github.com/tzzs/LeetCode-CN) 。
1. 找到整数起始位置，即先去掉前面的空格，找到非空格有效字符，标志位置1，即整数计算开始
2. 开始进行数字的求和，从读取到的第一个数字开始求和，到下一位的时候即为之前的求和*10 加上 当前值（例如前面值为1，当前位为5，则目前和为1*10+5=15，下一位为3，则求和为15*10+3，153）
3. 在C语言中将字符转换为int可以直接通过ASCii码进行计算，字符0的ASCii码为48，一直到字符9的ASCii码为57，直接使用字符减去48即为字符对应的整数。
4. 最终在求和过程中需要判断是否超出最大值，当你计算完可能已经越界，所以需要先判断在进行计算，即进行一个你想计算：先减去当前值，再除以10，判断当前值是否大于计算结果，如果大于则越界。
5. 最终返回计算结果即可。
```c
int myAtoi(char *str)
{
    int res = 0, sflag = 0, pos = 1;
    for (int i = 0;; i++)
    {
        char s = str[i];
        // printf("[%c]", s);
        // 未到起始字符
        if (!sflag) {
            if (s == 32)
            {
                continue;
            }
            else if (s == '+')
            {
                sflag = 1;
                continue;
            }
            else if (s == '-')
            {
                sflag = 1;
                pos = -1;
                continue;
            }
        }
        
        // 计算当前字符值并加上res*10
        if (s >= 48 && s <= 57)
        {
            sflag = 1;
            if (pos < 0)
            {
                if (res >= (INT_MIN + (s - 48)) / 10)
                {
                    res = res * 10 - (s - 48);
                }
                else
                {
                    return INT_MIN;
                }
            }
            else
            {
                if (res <= (INT_MAX - (s - 48)) / 10)
                {
                    res = res * 10 + (s - 48);
                }
                else
                {
                    return INT_MAX;
                }
            }
        }
        else
        {
            return res;
        }
    }
    return res;
}

```
