---
title: 简单理解 java.lang.Throwable
date: 2022-08-15 22:05:07
update:
categories:
  - [Java]
tags:
  - [Java]
  - [throwable]
cover:
---

# java.lang.Throwable

[Throwable (Java Platform SE 8 )](https://docs.oracle.com/javase/8/docs/api/java/lang/Throwable.html)

在 Java 中 Throwable 类是所有 errors 和 exceptions 的父类。他包含了两个子类，分别为 Error 和 Exception

## Error

[Error (Java Platform SE 8 )](https://docs.oracle.com/javase/8/docs/api/java/lang/Error.html)

Error 是 Throwable 的子类，表示正常的应用程序不应该尝试捕获的严重问题。通常这种问题不是由于程序导致的。

## Exception

[Exception (Java Platform SE 8 )](https://docs.oracle.com/javase/8/docs/api/java/lang/Exception.html)

Exception 通常表示正常的应用程序可能想要捕获的问题。

Exception 又分为两种，一种为检查异常（checked exceptions），另一种为非检查异常（unchecked exceptions）。非检查异常包括 RuntimeExcetion 以及它的子类，其它类型的 Exception 均为检查异常。

对于检查异常，如果可以被抛出，则需要在方法或者构造方法中的 **throws** 子句中声明它们（这个是强制的，在代码编写中就会被 IDE 提醒）。而非检查异常则不需要强制声明处理。
