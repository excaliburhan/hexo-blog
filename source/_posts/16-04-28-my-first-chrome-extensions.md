---
title: 知乎日报Web版 - 我的第一个Chrome插件
date: 2016-04-28
categories:
  - chrome extension
---

## 前言

抱着用 Mac 也要看知乎日报的崇高想法，偶然间看到[izzyleung](https://github.com/izzyleung)总结的知乎 api，萌生了自己做一个 Chrome 插件版的知乎日报。

## Chrome 插件入门

Chrome 插件只需要基础前端就可以入门，当然部分高阶 api 还是需要研究研究的，好在知乎日报 Web 版涉及的不多，下面对主要涉及部分做一个简单的介绍。

## Chrome 插件开发调试

1. 浏览器 url 进入插件地址
2. 加载已解压的扩展程序...打开你的项目地址
3. 完工，开发！但是前提是你的项目里有必需的一些文件，否则会报错

## Chrome 插件开发必需文件

1. manifest.json - 清单文件
2. popup.html - 其实非必需，但是没有就没有页面
3. 没了

## Manifest 文件

Chrome 插件的核心，是一个 json 格式的清单文件，必需命名为 manifest.json。

这里突然想起一件事，就是 json 文件千万别想着写注释，说起来都是泪。当初为了方便记忆，在 json 文件写了很多注释，结果 Chrome 一直报错，Google 之后才发现[json 文件不能用注释](https://plus.google.com/+DouglasCrockfordEsq/posts/RK8qyGVaGSr)，借着 Google 翻译了解了，大致是为了防止利用注释来制定解析规则。

- 必须的字段

```json
{
  "name": "知乎日报Web版", // 插件名称
  "version": "1.0.0", // 版本信息，才用x.y.z格式，更新时必须版本上升
  "manifest_version": 2 // 必须为2
}
```

- 最好提供的字段

```json
{
  "description": "知乎日报Chrome扩展Web版本 - Build By 韩小平", // 插件简介
  "icons": {
    "16": "prod/static/img/icon16.png",
    "48": "prod/static/img/icon48.png",
    "128": "prod/static/img/icon128.png"
  }, // icon文件，建议提供3种不同大小的，Chrome会在不同情况是用对应大小的图片
  "default_locale": "en" // 默认语言，选择后，目录中必须有_lcoales目录，然后建立语言目录，例如en，再在en里面建立manifest.json清单文件，太复杂了，被我pss了
}
```

- 选填字段

```json
{
  "browser_action": {
    "default_icon": "prod/static/img/icon16.png",
    "default_title": "知乎日报Web版",
    "default_popup": "prod/template/popup.html"
  }, // 浏览器行为，设置默认的popup页
  "background": {
    "persistent": true,
    "scripts": ["prod/static/js/vendors/zepto-1.1.6.min.js"]
  }, // 背景页，打开扩展就会常驻，主要用于数据传递
  "options_page": "prod/template/options.html", // 选项页，如果不设置，右键插件[选项]会处于置灰状态
  "permissions": [
    "tabs", // tab权限
    "contextMenus", // 自定义右键菜单，目前并没有用
    "cookies", // cookies权限，目前并没有用，目前设置存在localStorage，换电脑不会同步，以后考虑换cookies，因为chrome会同步
    "notifications", // 弹出通知，目前并没有用
    "alarms", // 提醒，目前并没有用
    "webNavigation", // web导航，目前并没有用
    "\u003Call_urls\u003E" // <all_urls>，最好采用unicode写法，获取对应网址的权限，你也可以写具体网址，如: "https://*.google.com"，当你需要请求对应网址的资源是需要
  ], // 插件权限，Chrome插件的权限都需要指定，从而使用相对应的Chrome api
  "web_accessible_resources": [
    "prod/static/img/icon16.png",
    "prod/static/img/icon48.png",
    "prod/static/img/icon128.png"
  ], // 资源白名单
  "content_scripts": [], // 脚本白名单
  "content_security_policy": "script-src 'self' https://ssl.google-analytics.com 'unsafe-eval'; object-src 'self'", // 安全策略
  "homepage_url": "https://github.com/excaliburhan/zhDaily" // 插件主页
}
```

## Chrome api 简析

我的插件用到 Chrome api 的地方并不多，理论上你不调用它的 api 也是完全可以的。

现在的需求：不重复打开相同的日报页面。如果用原生的 location 方法，可能会无限打开，所以需要调用 chrome.tabs 相关方法。用代码举个例子，如下。

```js
function openPage(fileName, query) {
  chrome.tabs.query(
    {
      windowId: chrome.windows.WINDOW_ID_CURRENT,
    },
    function (tabs) {
      var reg = new RegExp('^chrome.*' + fileName + '.html(\\?{0,1})' + query + '$', 'i'),
        isOpened = false,
        tabId,
        i;
      // 每个tab注册状态(是否打开/id)
      for (i = 0; i < tabs.length; i++) {
        if (reg.test(tabs[i].url)) {
          isOpened = true;
          tabId = tabs[i].id;
          break;
        }
      }
      if (!isOpened) {
        if (query) {
          query = '?' + query;
        }
        chrome.tabs.create({
          url: 'prod/template/' + fileName + '.html' + query,
          active: true,
        });
      } else {
        chrome.tabs.update(tabId, { highlighted: true });
      }
    },
  );
}
```

1. chrome.tabs.query 和 chrome.windows 获取当前打开多有 tabs 的数组
2. 正则判断需要打开的页面是否已经打开
3. 如果没有，利用 chrome.tabs.create 打开新页面，等同于 location.href = 'xxx'
4. 如果已经打开，利用 chrome.tabs.update 的方法切换到对应页面

总体来说，调用 api 的需要你看文档，然后就是编程的思维了。Chrome 提供的 api 很多，所以可以实现很多很多功能，具体还有待多多开发。

## 吃我一发安利

最后，安利一发我的插件 - 知乎日报 Web 版。

插件地址:

[https://chrome.google.com/webstore/detail/%E7%9F%A5%E4%B9%8E%E6%97%A5%E6%8A%A5web%E7%89%88/hgenmoheeaicmomkkkkkoeeihmdpacio](https://chrome.google.com/webstore/detail/%E7%9F%A5%E4%B9%8E%E6%97%A5%E6%8A%A5web%E7%89%88/hgenmoheeaicmomkkkkkoeeihmdpacio)

项目地址:

[https://github.com/excaliburhan/zhDaily](https://github.com/excaliburhan/zhDaily)

欢迎各位下载试用，反馈功能。Follow 或者 Star 一下项目也不是不可以~~
