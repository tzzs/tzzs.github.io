---
title: Vue.js learning notes
date: 2021-12-12 20:29:44
update:
categories:
- [前端]
tags:
- [vue]
- [vue.js]
cover: https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/logo.svg
---

<div><img src="logo.svg" style="height:70px;" /></div>

<div style="text-align:center;font-size:200px">Vue.js</div>

<div STYLE="page-break-after: always;"></div>

# 目录

- [目录](#目录)
- [命令式渲染](#命令式渲染)
- [声明式渲染](#声明式渲染)
- [MVVM](#mvvm)
- [<img src="https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/logo.svg" style="width:28px;" /> Vue.js](#-vuejs)
- [核心功能](#核心功能)
- [安装/使用](#安装使用)
  - [NPM](#npm)
  - [Script](#script)
  - [@vue/cli ~~vue-cli~~](#vuecli-vue-cli)
- [基础功能](#基础功能)
  - [指令](#指令)
  - [参数](#参数)
    - [v-bind](#v-bind)
    - [v-on](#v-on)
    - [省略写法](#省略写法)
  - [属性 方法](#属性-方法)
  - [watch](#watch)
  - [computed](#computed)
  - [methods](#methods)
  - [mounted](#mounted)
  - [实例生命周期钩子](#实例生命周期钩子)
- [组件 components](#组件-components)
- [路由 router](#路由-router)
  - [安装 install](#安装-install)
    - [npm](#npm-1)
    - [@vue/cli](#vuecli)
  - [使用](#使用)
    - [router-view](#router-view)
    - [router-link](#router-link)
- [参考](#参考)

<div STYLE="page-break-after: always;"></div>

# 命令式渲染

> 命令式：一步一步告诉程序如何去做，能否达成结果取决于开发者的设计。
> 命令式渲染通常意味着手动操作 DOM

# 声明式渲染

> 声明式：只告诉程序想要什么结果，如何达成由程序保证，开发者不用关心。
> 命令式渲染通常意味着手动操作 DOM

# MVVM

![](https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/mvvm.png)

MVVM：页面输入改变数据，数据改变影响页面数据展示与渲染

M（Model）：普通的 javascript 数据对象

V（View）：前端展示页面

VM（ViewModel）：用于双向绑定数据与页面，就是 vue 的实例

<div STYLE="page-break-after: always;"></div>

# <img src="https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/logo.svg" style="width:28px;" /> Vue.js

https://vuejs.org/v2/guide/

> Vue (读音 /vjuː/，类似于 view) 是一套用于构建用户界面的渐进式框架。

# 核心功能

- 基础功能：页面渲染、表单处理提交、帮我们管理 DOM(虚拟 DOM)节点

- 组件化开发：增强代码的复用能力，复杂系统代码维护更简单

- 前端路由：更流畅的的用户体验、灵活的在页面切换已渲染组件的显示，不需与后端做多余的交互

- 状态集中管理：MVVM 响应式模型基础上实现多组件之间的状态数据同步与管理

- 前端工程化：结合 webpack 等前端打包工具，管理多种静态资源，代码，测试，发布等，整合前端大型项目。

# 安装/使用

## NPM

```shell
npm install vue
```

## Script

```html
<script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js"></script>
```

## @vue/cli ~~vue-cli~~

https://cli.vuejs.org/guide/

```shell
npm install @vue/cli

vue create app
```

# 基础功能

```html
<!-- index.html -->
<div id="app">{{ value }}</div>
```

```js
// index.js
let app = new Vue({
  el: "#app",
  data: {
    message: "Hello",
  },
});
```

## 指令

> 除 v-for 外，所有指令 attribute 的预期值都是单个 js 表达式

## 参数

### v-bind

```html
<span v-bind:title="message">I'm a span.</span>
```

> 将这个元素节点的 `title` attribute 和 Vue 实例的 `message` property 保持一致

### v-on

```html
<button v-on:click="click_method">Click</button>
```

### 省略写法

```html
<span :title="111">I'm a span.</span>

<button @click="click_method">Click</button>
```

## 属性 方法

## watch

```js
  watch: {
      test: function () {
          this.w_data = this.test
      }
  }
```

## computed

```js
  computed: {
      c_data: function () {
          return this.test.split('').reverse().join('')
      }

  },
```

## methods

```js
    methods: {
        reverse: function () {
            this.test = this.test.split('').reverse().join('')
        }
    },
```

## mounted

```js
    mounted: {function () {
      // get list
    }
```

## 实例生命周期钩子

参考[<sup>1</sup>](#refer-anchor-1) [<sup>2</sup>](#refer-anchor-2)

![Vue 实例生命周期](https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/lifecycle.png)

- 计算属性 computed 以及对应的声明周期

> 执行顺序实在 beforeMount 与 mounted 之间

# 组件 components

![](https://cos5-1255991898.cos.ap-chongqing.myqcloud.com/tk/components.png)

# 路由 router

https://router.vuejs.org/

## 安装 install

### npm

```shell
npm install vue-router
```

```js
// main.js

import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);
```

### @vue/cli

```shell
vue add router
```

## 使用

详见 Demo

### router-view

```html
<router-view></router-view>
```

### router-link

```html
<router-link to="/about">Go to about</router-link>
```

# 参考

<div id="refer-anchor-1"></div>

- [1] [https://segmentfault.com/a/1190000011381906](https://segmentfault.com/a/1190000011381906)

<div id="refer-anchor-2"></div>

- [2] [vue 中 computed、watch、methods 与生命周期的执行顺序](https://juejin.cn/post/6942030120383168542)

