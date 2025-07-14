---
title: JS数组求并集，交集和差集
date: 2016-11-03
categories:
  - js
---

## 需求场景

最近，自己项目中有一些数组操作，涉及到一些数学集的运算，趁着完成后总结一下。

简化问题之后，现有两数组`a = [1, 2, 3]`，`b = [2, 4, 5]`，求 a，b 数组的并集，交集和差集。

## 方法选择

JS 在 ES6，ES7 之后，新增了一些数组方法，如果能够使用，那是极好的，毕竟自己写封装函数还是比较辛苦的。

### ES7

ES7 新增了一个`Array.prototype.includes`的数组方法，用于返回一个数组是否包含指定元素，结合 filter 方法。

> var boolean = array.includes(searchElement[, fromIndex])

```js
// 并集
let union = a.concat(b.filter((v) => !a.includes(v))); // [1,2,3,4,5]

// 交集
let intersection = a.filter((v) => b.includes(v)); // [2]

// 差集
let difference = a.concat(b).filter((v) => !a.includes(v) || !b.includes(v)); // [1,3,4,5]
```

### ES6

ES6 中新增的一个`Array.from`方法，用于将类数组对象和可遍历对象转化为数组。只要类数组有 length 长度，基本都可以转化为数组。结合 Set 结构实现数学集求解。

> Array.from(arrayLike[, mapFn[, thisArg]])

```js
let aSet = new Set(a);
let bSet = new Set(b);
// 并集
let union = Array.from(new Set(a.concat(b))); // [1,2,3,4,5]

// 交集
let intersection = Array.from(new Set(a.filter((v) => bSet.has(v)))); // [2]

// 差集
let difference = Array.from(new Set(a.concat(b).filter((v) => !aSet.has(v) || !bSet.has(v)))); // [1,3,4,5]
```

### ES5

ES5 可以利用 filter 和 indexOf 进行数学集操作，但是，由于 indexOf 方法中 NaN 永远返回-1，所以需要进行兼容处理。

- 不考虑 NaN(数组中不含 NaN)

```js
// 并集
var union = a.concat(
  b.filter(function (v) {
    return a.indexOf(v) === -1;
  }),
); // [1,2,3,4,5]

// 交集
var intersection = a.filter(function (v) {
  return b.indexOf(v) > -1;
}); // [2]

// 差集
var difference = a
  .filter(function (v) {
    return b.indexOf(v) === -1;
  })
  .concat(
    b.filter(function (v) {
      return a.indexOf(v) === -1;
    }),
  ); // [1,3,4,5]
```

- 考虑 NaN

```js
var aHasNaN = a.some(function (v) {
  return isNaN(v);
});
var bHasNaN = b.some(function (v) {
  return isNaN(v);
});

// 并集
var union = a
  .concat(
    b.filter(function (v) {
      return a.indexOf(v) === -1 && !isNaN(v);
    }),
  )
  .concat(!aHasNaN & bHasNaN ? [NaN] : []); // [1,2,3,4,5]

// 交集
var intersection = a
  .filter(function (v) {
    return b.indexOf(v) > -1;
  })
  .concat(aHasNaN & bHasNaN ? [NaN] : []); // [2]

// 差集
var difference = a
  .filter(function (v) {
    return b.indexOf(v) === -1 && !isNaN(v);
  })
  .concat(
    b.filter(function (v) {
      return a.indexOf(v) === -1 && !isNaN(v);
    }),
  )
  .concat(aHasNaN ^ bHasNaN ? [NaN] : []); // [1,3,4,5]
```

## 结语

由于 JS 语言的特殊性，NaN 在数组的数学集操作中有不少问题，好在 ES6 和 ES7 中，新的数组方法解决了部分情况。单从简洁性来看，ES7 的方法最简洁明了。

就是不知道新的标准要猴年马月才能被各大浏览器兼容，目前还是使用 Babel 比较靠谱。
