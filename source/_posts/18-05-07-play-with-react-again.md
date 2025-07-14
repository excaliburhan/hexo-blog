---
title: 玩玩React，撸一个pwa版本的知乎日报
date: 2018-05-07
categories:
  - react
  - pwa
---

## 前言

看了一眼上一篇博客，已经有一年多没有写博客了。为了证明博客还活着，赶紧更新一篇。

太久没写博文，不知道写什么。因为我自己一直看知乎，很多段子都是上面学习的，近两年业务开发一直写的 Vue，所以我决定写一个 React 的知乎日报。

<!--more-->

## 准备工作

1. 知乎日报 api，已经有人分析过了，知乎日报 API 分析；当然这次我准备做纯前端的，所以会有跨域，所以使用了一个别人现成的，知乎日报 API 分析（解决跨域精简版）

2. 获取到 api 之后，尝试了一下接口，完美返回数据；尝试渲染一下，纳尼，图片 403 出不来。google 一下，因为知乎做了 referer 检查，简单处理方式就是加`<meta name="referrer" content="never">`这个 meta 标签

3. http 请求封装，因为比较习惯了 axios，所以封装了一下。按照个人习惯封装了一个 request.js 和一个 urls.js，request.js 主要是做请求的拦截处理，urls.js 里面包含所有的业务 api 地址，于是在 saga 里面可以直接使用 request(urls.xxx, params)进行请求。

## 页面目标

这次的页面准备做的简单点，只有一个列表页和一个详情页，因为这也是我最常使用的内容。

对于一些基本的组件，这次直接使用了 antd-mobile 的相关组件，有：轮播图、loading 图标等等，这里就不多做介绍了，主要还是看 API。

### 原生实现

为了让我们的 h5 更像一个原生 app，我们需要做一些常用的手势操作，主要做了下拉刷新（使用 antd-mobile）、下滑改变 title 和 titleBar 的背景色（监听 scroll 事件）、滑动返回（使用 hammerjs）。

此外，为了模拟 app 打开的加载图，需要使用 ios 的 splash 加载图，主要是设置 meta 标签的，具体尺寸可以参考[https://developer.apple.com/ios/human-interface-guidelines/icons-and-images/launch-screen/](https://developer.apple.com/ios/human-interface-guidelines/icons-and-images/launch-screen/)

## 优化

对于 pwa 应用，必要的优化还是需要的，这次主要采用了这么一些简单的手段

### 详情页 css 样式

因为知乎日报的详情接口会返回 css 的样式，为了保持样式一致性，直接采用这个返回的 css 文件，通过动态载入的方式进行插入。当然还要注意几点：

1. 为了保证首次加载就有样式，直接在 html 写入 css，动态加载的时候判断该 link 是否已经存在，如果存在就不再插入 css 的 link

2. 知乎返回的 css 地址是 http 的，但是也支持 https，需要自己正则替换成 https

### 懒加载

图片懒加载和路由懒加载。图片懒加载就不细说了，都有成熟的组件可以直接使用；路由懒加载，因为我使用的是 react-router-v4，所以建议采用 react-loadable 的解决方案，当然本质还是 webpack 的 code split。

```js
// router/index.js
import Loadable from 'react-loadable';
import Loading from '@/components/Loading/Loading'; // 加载过程展示内容

const createComponent = (path) =>
  Loadable({
    loader: () => import(`@/pages/${path}`), // 必须使用字符串变量
    loading: Loading,
  });

// components/Loading/Loading.js
import React from 'react';
import LoadingBar from '@/components/Loading/LoadingBar';

export default function LoadingComponent({ isLoading, error }) {
  if (isLoading) {
    // Handle the loading state
    return <LoadingBar />;
  } else if (error) {
    // Handle the error state
    return <div style={{ paddingTop: '200px', textAlign: 'center' }}>Sorry, there was a problem loading the page.</div>;
  } else {
    return null;
  }
}
```

### vw 适配

因为我们的应用主要是在手机端使用的，所以针对不同分辨率还是需要适配处理的。这里采用的 vw 的适配方案，主要借助的是 postcss-px-to-viewport，可以做到将 px 转化为 vw，当然你需要在`postcssrc.js`进行简单配置：

```js
module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      viewportWidth: 750,
      viewportHeight: 1334,
      unitPrecision: 3,
      viewportUnit: 'vw',
      selectorBlackList: ['.ignore', '.hairlines'],
      minPixelValue: 1,
      mediaQuery: false,
    },
  },
};
```

其他的 postcss 插件就不一一介绍了，根据需要自己添加吧。要注意的是，为了解决 vw 的兼容性问题，需要 hack 一下，主要是解决 IE 的问题。我使用的是 viewport-units-buggyfill，采用 css 的 content 属性进行 hack，需要注意的是，img 没有 content 会带来问题，所以你要强制设置 img 的 content 为 normal。

```css
img {
  content: normal !important;
}
```

### 缓存

除了 service-wroker 缓存 js、css 等资源文件，对于请求内容也需要做一下缓存。

因为是纯 web 的项目，这边就使用 localStorage 缓存了必要的请求结果。

1. 历史列表数据，根据 date 为 key 进行缓存

2. 详情数据，根据 id 为 key 进行缓存

3. localStorage 大小有限制，一般为 5mb，如果超过，需要 try-catch，并把 localStorage 清空

## React vs Vue 个人感受

既然决定了用 React 写（上次自己写 React 的 demo 还是 2 年前），当然要用下全家桶，顺便和 Vue 的比较一下。

React：react+react-router+react-redux

Vue: vue+vue-router+vuex

### 路由。react-router 用的 v4 版本，vue-router 用的 3.x。

1. 路由匹配。react-router 必须借助`<Switch>`组件，否则所有匹配的路由都会被渲染出来，还是有点懵逼的

2. 路由懒加载。因为 SPA 应用，为了加速首屏，路由懒加载是必不可少的，react-router 的懒加载一般是借助三方的(?)，在 v4 版本，借助 react-loadable 这个库，实现加载中和加载具体页面指向不同组件，不同的状态展示不同的组件，感觉逻辑上更出色，vue-router 如果需要实现加载中的一些显示，一般来说是借助 beforeRoute 这些钩子函数实现的，个人感觉还是更倾向于 react-router 这样的

3. router 和 route。简单来说，就是获取 router，进行 push、replace 操作，以及 route，获取 path、params 这些信息。react-router 获取 router(也就是 history)，需要引入 withRouter 高阶组件，获取 route 则是要从 props.match 中获取，相对而言，vue-router 是直接入侵 Vue.prototype.$router和Vue.prototype.$route 实现的，实际用起来，果断 vue 爽很多啦

### 状态管理。react-redux 用的 5.x，vuex 用的 3.x。

1. redux 通过 connect 把 state 和 dispatch 都映射(?)到 props 中，而 state 通过最外层的 Provider 组件递传，怎么说呢，connect 操作真的有点烦，vuex 一如既往粗暴，放到 Vue.prototype.$store 下

2. 两者都有 dispatch(action)->reducer/mutation(commit)->state 的概念，我在 react-redux 上用了 redux-saga 这个中间件，作用是处理所有异步请求或者 state 的修改操作，而在 reducer 环节，直接赋值 state，这样会让逻辑更加清晰；而 vuex 一般是在 actions 里面做这些异步处理。
