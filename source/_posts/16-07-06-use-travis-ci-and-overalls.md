---
title: 持续集成+覆盖率测试 Travis CI和Overalls使用心得
date: 2016-07-06
categories:
  - ci
---

## 什么是 Travis CI

> Travis CI 是在软件开发领域中的一个在线的，分布式的持续集成服务，用来构建及测试在 GitHub 托管的代码。这个软件的代码同时也是开源的，可以在 GitHub 上下载到，尽管开发者当前并不推荐在闭源项目中单独使用它。

Travis CI 可以设置 github 托管的项目在 push 或者 pull 等时机触发构建与测试，进行持续集成，简单说，是一个基于 Github 的免费持续集成服务。

## 如何使用 Travis CI

- 1.登陆 Travis CI 官网，使用 github 授权登录，[官网地址](https://travis-ci.org/)

![alt](https://o2znrmehg.qnssl.com/ghost/2016/07/06/3-pic-1467773139613.jpg)

- 2.添加持续集成的项目，如下图所示，点击+号添加需要持续集成的项目。

![alt](https://o2znrmehg.qnssl.com/ghost/2016/07/06/4-pic_hd-1467773781180.jpg)

- 3.继续操作，选择需要持续集成的项目，点击齿轮进行详细配置。

![alt](https://o2znrmehg.qnssl.com/ghost/2016/07/06/5-pic_hd-1467774145213.jpg)

- 4.配置持续集成的条件，一般选择红线部分开启即可。

![alt](https://o2znrmehg.qnssl.com/ghost/2016/07/06/6-pic_hd-1467774254393.jpg)

## 配置.travis.yml 文件

在你的项目中建立.travis.yml 文件，这是一种 yaml 语言的配置文件，基本格式如下：

```yaml
branches:
  only:
    - master
language: node_js
node_js:
  - '4.2.2'
  - '6.0.0'
script:
  - make test-all
after_success: cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js
#env:
#  global:
#  - xxx: xxx
```

以上格式就是指该项目，持续集成的分支是 master，环境是 node_js， 版本是 4.2.2 和 6.0.0。项目默认会安装 package.json 中的依赖，之后会执行 make test-all 命令。

## 使用 Overalls 进行覆盖率测试

覆盖率测试的主要原理是，通过 istanbul 收集到 mocha 的 cover 信息，然后通过 coveralls 的工具，结合 token 传到平台上。

- 1.通过 github 登录 Overalls 官网，[官网地址](https://coveralls.io)

- 2.添加 Repo。

![alt](https://o2znrmehg.qnssl.com/ghost/2016/07/06/8-pic_hd-1467776646416.jpg)

- 3.添加.coveralls.yml 文件，配合 Travis CI 账号是用，一般.coveralls.yml 配置如下：

```yaml
service_name: travis-pro
repo_token: xxx
```

- 4.编写测试文件，nodejs 用 mocha 的例子结果如下：

![alt](https://o2znrmehg.qnssl.com/ghost/2016/07/06/7-pic_hd-1467776934375.jpg)

## 为 README.md 增加 badge

Travis CI 和 Overalls 配置好后，会在项目每次 push 的时候进行测试，测试结果可以用 badge 的形式在 README 中体现。

makedown 格式的 badge 如下：

```markdown
[![Build Status](https://api.travis-ci.org/excaliburhan/api-koa.svg?branch=master)](https://api.travis-ci.org/excaliburhan/api-koa)
[![Coverage Status](https://coveralls.io/repos/github/excaliburhan/api-koa/badge.svg?branch=master)](https://coveralls.io/github/excaliburhan/api-koa?branch=master)
```

最后的效果如下：
[![Build Status](https://api.travis-ci.org/excaliburhan/api-koa.svg?branch=master)](https://api.travis-ci.org/excaliburhan/api-koa)
[![Coverage Status](https://coveralls.io/repos/github/excaliburhan/api-koa/badge.svg?branch=master)](https://coveralls.io/github/excaliburhan/api-koa?branch=master)

## 自定义 badge

这里推荐一下[shields.io](http://shields.io/)，可以自定义 badge，自定义格式如下：

![alt](https://o2znrmehg.qnssl.com/ghost/2016/07/06/9-pic-1467777324314.jpg)
