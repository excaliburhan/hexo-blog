---
title: 用nw.js制作一个自己的markdown app
date: 2016-10-09
categories:
  - node
---

## 1. 什么是 nw.js

nw.js，前身 nodeWebkit，顾名思义，是基于 node+webkit 运行的。加上支持各类 npm 包，可以让前端很容易通过 HTML 和 JavaScript 制作属于自己的客户端 app。

## 2. 开始使用 nw.js

首先，你需要下载[nw.js](http://nwjs.io/)。一般来说，开发 app 的时候需要下载 sdk 版本，集成了 devtool，方便调试。而生产环境则应该使用 normal 版本，因为它更小巧灵活。

以我使用的 v0.17.4(Mac 版本为例，下同)为例，将你下载的放入你的开发目录，如 nwjs 目录下。新建一个 package.json，熟悉 npm 的应该都知道，这是一个配置 json 文件，而 nw.js 需要这个文件提供必要的信息。以下是我的 markdown 编辑器(LittleMD，以下用 LittleMD 作指代)的配置信息。

```json
{
  "main": "index.html", // 入口文件
  "name": "LittleMD", // 名称
  "version": "0.0.2", // 版本号
  "description": "a markdown app via nwjs", // 描述
  "window": {
    // nw.js窗口配置
    "title": "LittleMD", // 入口html的title不存在时，则使用这个
    "icon": "icon.png", // icon
    "toolbar": true, // 是否隐藏窗口的工具条
    "frame": true, // 是否显示外层的框架，如最大化最小化
    "position": "center", // 初始化位置
    "width": 1000, // 初始化宽度
    "height": 800 // 初始化高度
  },
  "dependencies": {
    // 各类依赖
    "emojify.js": "^1.1.0",
    "gulp-less": "^3.1.0",
    "highlight.js": "^9.7.0",
    "jquery": "^3.1.0",
    "marked": "^0.3.6",
    "phantom-html2pdf": "^3.0.0",
    "phantomjs-prebuilt": "^2.1.12",
    "qiniu": "^6.1.11",
    "taboverride": "^4.0.3"
  }
}
```

可以看到，`package.json` 和 npm 包的配置很像，所以上手也很快，只要记得配置相关的 nw.js 的配置即可，更多配置请看[Manifest 文档](http://docs.nwjs.io/en/latest/References/Manifest%20Format/#manifest-format)。

然后，新建一个 index.html，与 package.json 的入口路径一致，恭喜你，你已经拥有了一个最简单的 app。

当然，此时打开 nwjs.app，只会看到一片空白，因为 html 内容就是空白的。你需要编辑 html 文件让它呈现内容。当然，在此之前，我们首先建立几个基本目录，构建我们的项目目录。一般来说，需要 js/css/images，分别存放 js 文件/css 文件/图片资源文件，最后的结构如图。

![alt](https://o2znrmehg.qnssl.com/ghost/2016/10/09/qq20161009-0-2x-1475999110974.png?imageView2/1/w/300)

至此，我们的 app 项目已经有了一个雏形。

## 3. 制作一个 markdown

经过上一步之后，我们已经有了基本的项目结构了。下面就是着手编辑我们的入口文件 `index.html` 。

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>LittleMD.md</title>
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <div id="body">
      <textarea id="editor"></textarea>
      <div id="preview"></div>
    </div>
  </body>
  <script src="/app.js"></script>
</html>
```

`style.css` 就是我们的样式文件，`app.js` 就是我们所需要的 js 文件。我建议把 `app.js` 放在 body 后，而 head 之间，我们还需要初始化一些 nw.js 的内容。

editor 是 LittleMD 的编辑框，preview 则是预览区。

接下来，编写 css，让 LittleMD 有编辑器的样子。

```css
body {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  font-family: PingFang SC, Hiragino Sans GB, Microsoft Yahei, WenQuanYi Micro Hei, sans-serif;
  font-size: 16px;
  line-height: 20px;
}

#body {
  display: flex;
  height: 100%;
  overflow: hidden;
}
#editor {
  box-sizing: border-box;
  flex: 1;
  padding: 0 5px;
  margin: 0;
  line-height: 20px;
  color: #f9f9f5;
  background-color: #2d2d2d;
  resize: none;
  outline: none;
  border: none;
}
#preview {
  box-sizing: border-box;
  flex: 1;
  padding: 0 10px;
  overflow-y: scroll;
}
```

你可以采用浮动，然后左右各占 50%的写法，不过我建议还是采用 flex 布局。1 是更加简单，2 是方便以后扩展(比如增加行号显示)。而且，既然是 webkit 的内核，你都不需要考虑兼容性，这是 nw.js 很棒的一点。

现在打开 nwjs.app，你可以看到一个有界面的 app 了，虽然它还没有功能。

![alt](https://o2znrmehg.qnssl.com/ghost/2016/10/09/qq20161009-1-2x-1476000546973.png?imageView2/1/w/600)

现在，编写你的 js 文件。我喜欢采用 `app.js` 作为入口 js 的做法，这样可以让你更少地修改 `index.html` 。利用 require 各个功能 js 的做法，利于你将功能分块。

`app.js`

```javascript
const main = require('./js/main.js');
main.init();
```

此外，我们需要 main.js，负责页面初始化；editor.js，负责编辑器功能。

`main.js`

```javascript
const editor = require('./editor.js');

module.exports = {
  init() {
    $(() => {
      $('#editor').bind('input click', () => {
        // reload
        editor.reload();
      });
    });
  },
};
```

`editor.js`

```javascript
const marked = require('marked');
const $ = global.$;
const hljs = global.hljs;

module.exports = {
  reload() {
    marked.setOptions({
      highlight: (code) => hljs.highlightAuto(code).value,
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false,
    });
    const preview = $('#preview');
    const editorDom = $('#editor');
    const text = editorDom.val();
    preview.html(marked(text));
  },
};
```

可能你也注意到了，我在 editor.js 中引入了一个 marked，这是一个 npm 包，是一个 markdown 语法的解析器。需要先使用 `npm install marked` 进行安装。此外，我还引入了 `jquery` 和 `highlight.js` 两个库，需要在 index.html 的 head 标签中引入。

个人建议，新建一个 vendors 目录用来存放引入的库文件，和自己的 js 进行区分。

```html
<script src="/vendors/jquery-3.1.0.min.js"></script>
<script src="/vendors/highlight.pack.js"></script>
<script>
  global.gui = require('nw.gui'); // nw.js的gui界面
  global.window = window;
  global.$ = $;
  global.hljs = hljs;
</script>
```

现在打开 nwjs.app，你会发现，你在编辑框输入，预览区会实时更新内容。当然，现在预览区的样式还十分简陋，你可以根据自己需要编写它的样式。

## 4. 如何 debug

开发 app 的时候，免不了需要 debug。根据官方的 devtool 使用方法，你可以在 app.js 中 `init()` 函数前加入如下代码。

```javascript
const gui = require('nw.gui');
const win = gui.Window.get();
win.showDevTools();
```

这样，你就会在打开 nwjs.app 的同时打开一个 dev 窗口了。

## 5. 更多的 features

显然，这是的 LittleMD 是十分简陋的，我们需要加入更多的功能。这里，我对一些功能的实现提供一点思路。

- 菜单

作为一个编辑器，我们还是需要基本的菜单的。参照 nw.js 的[菜单文档](http://docs.nwjs.io/en/latest/References/Menu/)。建立一个 `menu.js`。

```javascript
module.exports = {
  openFile() {
    editor.chooseFile('#openFile', filename => {
      editor.loadFile(filename)
    })
  },

  initMenu() {
    const win = global.gui.Window.get()
    const menubar = new global.gui.Menu({ type: 'menubar' })
    const fileMenu = new global.gui.Menu()

    // for Mac
    menubar.createMacBuiltin('LittleMD')

    fileMenu.append(new global.gui.MenuItem({
      label: 'Open...',
      click: this.openFile,
      modifiers: 'cmd',
      key: 'o',
    }))
    ... // other code
    menubar.append(new global.gui.MenuItem({
      label: 'File',
      submenu: fileMenu,
    }))
    win.menu = menubar
  },
}
```

`createMacBuiltin` 方法会建立一些常用的 Mac 界面菜单，上例中，我又加入了一个打开文件的菜单，其他功能与此类似。

这里简单介绍下打开文件的实现，利用了 nw.js 提供的 html5 的功能。首先，你需要在 `index.html` 中加入一个隐藏的 input，如下例子。

```html
<input style="display: none;" id="openFile" type="file" />
```

在 `editor.js` 中加入 `chooseFile` 方法。

```javascript
chooseFile(selector, callback) { // save
  const chooser = $(selector)
  chooser.change(() => {
    callback(chooser.val())
  })
  chooser.trigger('click')
},
```

然后在 `menu.js` 中加入 `openFile` 方法。

```javascript
openFile() {
  editor.chooseFile('#openFile', filename => {
    editor.loadFile(filename)
  })
},
```

这样，你在 File 菜单中点击 `Open...` 就会打开新文件了，而 `editor.loadFile` 则是将文件内容载入到编辑框中，利用 nodejs 中 fs 的 readFile 很容易搞定，这里就略过了。

- 代码高亮

还记得前面引入的 `highlight.js` 吗，结合 `marked` ，可以做到实时 `reload` 的时候转化为代码高亮的 dom 结构。具体逻辑参看[marked highlight](https://github.com/chjj/marked)。实现代码在上面气势已经给出，就是 `reload` 中的 highlight 设置。

```javascript
highlight: code => hljs.highlightAuto(code).value,
```

再打开 app 看下，是不是有代码高亮了，当然前提是引入相关样式。具体可以参看[highlight.js](https://highlightjs.org/)。

- emoji

一个有逼格的编辑器，怎么能没有 emoji。这里采用了[emoji-cheat-sheet](http://www.webpagefx.com/tools/emoji-cheat-sheet/)的语法。

你可以改写 marked 语法实现 `:smile:` 到 emoji 表情的映射，也可以采用别人的库，例如[emojify.js](https://github.com/Ranks/emojify.js)。`emojify.js`定制更方便，当然如果有自己的需要，那还是改写 parser 更好。

以下是以 `emojify.js` 为例写的，在 `editor.js` 的 `reload` 结尾加入以下语句即可。

```javascript
emojify.run(preview.get(0));
```

- 图片上传

markdown 编辑图片时，如果是本地图片，需要传到第三方的空间，未免麻烦。由于我使用了七牛的 cdn，这里以七牛的 sdk 为例实现了图片上传功能。

核心功能实现参见[七牛 sdk](http://o9gnz92z5.bkt.clouddn.com/code/v6/sdk/nodejs.html)。

- 导出 pdf

利用 `phantomjs` 实现，LittleMD 采用了一个 npm 包 `phantom-html2pdf` 实现了这个功能。当然这个包有不少坑，后面再提。

## 6. 一些问题与反思

npm 包功能强大，实现很多功能都很方便。但是，很多项目年久失修，缺乏维护，所以，必要时候要学会自己修改源码。比如上面提到的 `phantom-html2pdf` 这个包，实际使用发现导出的 pdf 一直是空的。debug 之后才发现，由于 node 版本原因，它依赖的 `phantomjs-prebuilt` 没有执行文件，而且执行路径也是错误的。修改之后，实现了具体功能。

## 7. 最后

目前(2016-10-09)已经发布了 v0.02 版本，欢迎试用并提出你的意见，[地址](https://github.com/excaliburhan/LittleMD/releases)。
