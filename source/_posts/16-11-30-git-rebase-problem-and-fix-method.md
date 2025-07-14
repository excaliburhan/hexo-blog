---
title: 记一次Git分支衍合导致的问题和解决方法
date: 2016-11-30
categories:
  - git
---

## 事件还原

公司项目需要开发 2.0 版本，在原来仓库的基础上，checkout 出来一个新分支，记为`origin/v2`，大家都从`v2`分支 checkout 出 feature 分支进行开发。

部分同事完成自己的 feature 分支之后，提交了几个 commit，为了方便记为`commit-1, commit-2, commit-3`，并 merge 到了`origin/v2`分支。

而我 checkout 出的 feature 分支，叫`feature-xxx`。开发完了之后，进行 commit，记为`commit-4`操作。此时，我的 commit history 是没有 commit1-3 的纪录的，所以进行 rebase 操作。

<!--more-->

- `git fetch origin v2`
- `git rebase origin v2`
- `git push origin feature-xxx`

发现 changed files 比我正常改的多很多，但是并没有冲突，于是使用了终极奥义`git push -f origin feature-xxx`。最后结果是 changed files 和我修改的一致，于是 merge 到`origin/v2`，以为没问题了。（太天真了...)

后来，同事在 fetch 和 rebase 之后，发现和我一样的 changed files 数量不一致的问题。查看 git log 发现，commit tree 上有很多重复的 commit 信息，而且 commit1-3 不见了。

## 问题原因

查了 git 的文档，发现了一个问题。`git rebase`远程的分支正确写法应该是`git rebase origin/branchName`，而省略的话则是 rebase 默认的分支。在这个例子中，`git rebase origin v2` = `git rebase origin/master`。等于说 commit history 被强行拉回 master 分支了。所以在 master 之后的 commit 信息才会消失。而`git push -f`命令强行修改了 commit history，所以我的 commit-4 还在。

## 解决方法

如果能迅速发现问题，其实还是比较好解决的。

- 把我的修改内容本地保存
- 查找到出问题前的最后 merge 到`origin/v2`的 commit hash 值
- `git reset hash`
- 本地保存的文件进行修改
- 正确进行 fetch/rebase

## 如何避免

- 正确的 git 操作
- 应该尽量避免使用`git push -f`

git 作为大部分团队使用的团队工具，使用的时候一定要小心谨慎！

努力学习正确的 git 操作 ing！
