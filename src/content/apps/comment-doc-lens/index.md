---
title: Comment Doc Lens
pubDate: 2026-08-05
order: 1
---

Comment Doc Lens 是一个 VS Code 扩展，**在引用处以内联提示（inlay hint）展示定义注释与符号文档**。

![Comment Doc Lens 在 VS Code 中展示内联符号文档的预览图](/images/apps/comment-doc-lens/social-preview.png)

## 为什么需要它

Comment Doc Lens 把有用的定义文档放回你正在阅读的代码旁边。只要引用到的符号带有文档注释、JSDoc、docstring、Javadoc、PHPDoc，或语言服务能够返回有价值的 hover 文档，扩展就会把第一条有用摘要展示在当前行末尾。

它面向阅读和理解代码，**不会修改源文件**——不生成注释、不重写代码、不高亮 TODO，也不索引注释锚点。

## 它展示什么

扩展扫描当前可见的标识符，调用 VS Code 当前语言服务的 hover 与 definition 能力，把简洁的文档摘要渲染成 inlay hint。

适合这些场景：

- 阅读带有文档的函数、常量、变量、方法、枚举成员和对象属性
- 不跳转离开当前文件，也能看到定义处的说明
- 保持提示短小、只展示信息，默认不附带跳转交互
- 检查当前语言服务是否能提供可用文档

提示默认显示在行尾，避免插入到表达式中间。默认前缀是 `// `，默认摘要长度上限是 `120` 个字符。

## 演示

| 开启前 | 开启后 |
| --- | --- |
| ![开启前的 VS Code 编辑器](/images/apps/comment-doc-lens/demo-before.png) | ![开启后在引用行尾展示内联文档提示](/images/apps/comment-doc-lens/demo-after.png) |

## 语言支持

| 等级 | 语言 |
| --- | --- |
| 稳定推荐 | Go、TypeScript、JavaScript、TSX、JSX、Python、Java、Rust、PHP |
| 实验支持 | C#、Ruby、Kotlin、Swift、C、C++ |

非内置语言建议安装对应的推荐扩展：Go 推荐官方 Go 扩展和 `gopls`；Python 推荐 Python 扩展和 Pylance；Rust 推荐 rust-analyzer。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `Comment Doc Lens: Toggle` | 开启或关闭内联文档提示 |
| `Comment Doc Lens: Refresh` | 清理缓存并刷新提示 |
| `Comment Doc Lens: Show Language Status` | 检查当前文件语言服务状态 |
| `Comment Doc Lens: Diagnose Workspace` | 扫描工作区并输出语言服务健康报告 |
| `Comment Doc Lens: Explain Hidden Hint` | 解释当前行为什么没有显示提示 |

## 获取

在 VS Code 扩展市场搜索 **Comment Doc Lens**（`tanzz.comment-doc-lens`）安装，或通过下方下载入口安装。
