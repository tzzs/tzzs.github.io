---
title: springboot thymeleaf不渲染页面返回字符串
description: Spring Boot页面不渲染而返回字符串，解析@RestController与@Controller的区别
pubDate: '2019-03-30'
---



错误信息：

```
This application has no explicit mapping for /error, so you are seeing this as a fallback.

Sat Mar 30 01:59:07 CST 2019

There was an unexpected error (type=Internal Server Error, status=500).

Error resolving template [index], template might not exist or might not be accessible by any of the configured Template Resolvers

org.thymeleaf.exceptions.TemplateInputException: Error resolving template [index], template might not exist or might not be accessible by any of the configured Template Resolvers
```





# @RestController 与 @Controller



