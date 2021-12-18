---
title: JDK8 环境下生成WebService Client的问题
date: 2020-02-10 11:20:53
update:
categories:
- [Java, WebService]
tags:
- [JDK8]
- [WebService]
- [IDEA]
---

在学习WebService的过程中，用JAVA实现了WebService。但是在使用IDEA生成WebService Client的时候出现了错误。

## 环境

JDK：openjdk version "1.8.0_41"

IDEA：IntelliJ IDEA 2019.3.2 (Ultimate Edition)

SYSTEM：Windows 10

## 错误信息

> java.lang.AssertionError: org.xml.sax.SAXParseException; systemId: jar:file:/path/to/glassfish/modules/jaxb-osgi.jar!/com/sun/tools/xjc/reader/xmlschema/bindinfo/binding.xsd; lineNumber: 52; columnNumber: 88; schema_reference: Failed to read schema document '**xjc.xsd**', because 'file' access is not allowed due to restriction set by the **accessExternalSchema** property.



## 解决方案

​		错误信息中显示由于 accessExternalSchema 属性设置的限制而不允许 ‘file’ 访问，所以导致读取方案文档 ’xjc.xsd' 失败。

​		在搜索解决方法的过程中，发现 jaxb-xjc 在 JDK8 下存在此BUG.[xjc fails with permission exception in JDK 8 b98,b99 even if -disableXmlSecurity is set](https://bugs.openjdk.java.net/browse/JDK-8020999?page=com.atlassian.jira.plugin.system.issuetabpanels%3Aall-tabpanel) 这是在 openjdk 的 JDK Bug System 提出的bug，并且显示官方已经修复此问题，但不知为何我新下载的Java版本还是有此问题。

​		在XML解析器初始化之前，JDK会首先搜索系统的porperties配置文件寻找解析器的配置项，如果没有则会搜索`$JAVA_HOME/jre/lib` (Windows下为 `%JAVA_HOME%/jre/lib` ) 路径下的 `jaxp.properties` 文件，如果还没有就会在classpath上的 .jar 包中寻找，如果仍然没有则使用默认配置。

​	对于此问题我们需要强行修改 accessExternalSchema 的属性设置，以下为问题的解决方案，在`$JAVA_HOME/jre/lib` (Windows下为 `%JAVA_HOME%/jre/lib` ) 路径下的`jaxp.properties`文件(不存在则新建)中新增一行：

```properties
javax.xml.accessExternalSchema = all
```

保存之后，重新去IDEA生成WebService Client即可成功。

## 注

### JAXB

​		Java Architecture for XML Binding，简称JAXB，允许Java开发人员将Java类映射为XML表达方式。JAXB提供两种主要特性：将一个Java对象序列化为XML，以及方向操作，将XML解析成Java对象。

### xjc

​		XML Java Complier，XML Java编译器，是JAXB的一部分，可以将XML模式或其它类型模式文件转换为Java类。其中JAXB的schemagen 工具与其作用相反，能够执行 xjc 的反向操作，通过一组标注的Java类创建一个XML模式。
