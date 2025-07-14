---
title: CSS学习笔记(2) - 边框渐变和字体渐变
date: 2016-07-27
categories:
  - css
---

## 扩展渐变

有了线性渐变和径向渐变作用于背景的相关基础，有助于我们理解边框渐变和字体渐变。

## 边框渐变

要实现边框渐变，我们需要借助 border-image 这个 css 属性。

```css
.box {
  width: 100px;
  height: 100px;
  border: 3px solid transparent;
  border-image-source: linear-gradient(red, blue);
  border-image-slice: 1;
  border-image-width: 1;
}
```

上述代码中，border-image-source 表示边框来源，可以是 url，也可以是指定的颜色，和 background-image 类似。

border-image-slice 表示图像边界向内偏移的值，可以是数值，百分比，或者是关键词 fill(表示保留图像的中间部分)。

border-image-width 需要和 border 配合使用，参数是数值。如果要达到完美的渐变边框，该值应该小于 border-width 的值，如果大于则会出现 border 覆盖文字的效果。

具体代码效果可以参见[demo1](http://codepen.io/excaliburhan/pen/RRyQEP)。

当然，我们也可以使用 radial-gradient 来实现径向渐变。然后，border-image 不支持 radius 效果，也就是说，使用 border-radius 的渐变边框是不生效的。所以，将径向渐变作用于边框渐变，并不是一个好主意。

## 文字渐变

css 实现文字渐变，目前采用的方法还是有点 tricky。

### background-clip + text-fill-color

方法一是利用 background-clip+text-fill-color，这种方法本质上是把背景渐变作用于文字上，实现文字渐变的效果。

```css
.box {
  background-image: linear-gradient(0, red, blue);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

这两个属性目前都需要-webkit 前缀，即在 webkit 内核的浏览器才有效。具体效果参见[demo2](http://codepen.io/excaliburhan/pen/pbVLZO)。

值得注意的是，这种实现方法不能设置背景色，否则见渐变效果会失效。

### mask-image

方法二的核心是利用 mask-image 属性，给文字盖上一层渐变的 mask。

```css
.box2 {
  color: red;
  mask-image: linear-gradient(180deg, transparent, red);
}
```

同样需要注意的是，这种写法也不能设置 background 的背景颜色，否则会失效。

方法二的代码行数更少，但是实际使用起来还是推荐方法一。原因嘛，mask-image 才用的是蒙层，设置的渐变颜色是蒙层的颜色，需要反色处理，实际使用限制也更大一些，不如方法一直观。

以上就是 CSS 实现关于边框渐变和字体渐变的一些拙见。
