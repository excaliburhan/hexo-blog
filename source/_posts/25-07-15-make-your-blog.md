---
title: 从 0 到 1 部署你的博客
date: 2025-07-15 15:08:48
categories:
  - site
tags:
  - site
---

## 0️⃣ 前言

一直以来用阿里云的 ecs 部署了一个博客应用，但是自从进入阿里之后就一直没更新，应用也无法访问了。

本身搞博客应用就是为了端到端（从前端到后端），系统地了解项目工程和流水线工作原理的，趁着有时间重新梳理一下整个过程。

## 1️⃣ 环境准备

博客项目技术方案：采用 Hexo + Node.js + Nginx 来搭建。

[Hexo](https://hexo.io/zh-cn/) 其实是一个静态博客框架，其实不依赖 Node.js， Hexo + Nginx 就部署出来博客，这里 Node.js 主要是为了部署 Webhooks 的服务进行自动更新，后面会展开。

## 2️⃣ 搭建 Hexo 博客

### 1. 初始化博客

没有特殊需求的情况下，建议采用 hexo-cli 来初始化你的博客。

```bash
npm install hexo-cli -g
hexo init blog
cd blog
```

目前初始化的 hexo 是 7.x 的版本，依赖使用 pnpm 管理，你也可以安装下 pnpm：

```bash
npm install pnpm -g
pnpm install
```

本地测试使用下面命令，默认会在 4000 端口起一个服务：

```bash
hexo server
```

不过实际上我们部署博客不需要使用 server，可以用生成的静态 html 来访问，server 更多的是给基于 hexo 需要开发插件等使用的，比如主题。

### 2. 发布新文章

hexo 的文章是 markdown 的，你可以使用命令行来创建文章，它会在 `source/_posts` 目录下创建对应文件：

```bash
hexo new "my-first-post"
```

### 3. 博客主题

具体的博客主题可以参考：[Hexo 博客主题](https://hexo.io/themes/)，实际上已经很少有人维护了，毕竟 hexo 本身也比较老了。

我这边用了一个 [replica](https://github.com/sabrinaluo/hexo-theme-replica) 的仿 github 风格，实际上默认主题也是 ok 的，具体配置参考文档即可，难度不高。

## Hexo 部署

hexo 会提供一些部署方案供你选择，我这边主要介绍两种：一种是部署到 Github Pages 的，适合没有自己站点，白嫖 github 的；另外一种是自己建服务器，可以部署到自己的站点，用自定义域名的。

## 3️⃣ Github Pages 部署

hexo 提供了 `hexo deploy` 命令来部署到 Github Pages，但是需要配置下 `_config.yml`。

```yaml
## 前面配置省略...
## Docs: https://hexo.io/docs/one-command-deployment
deploy:
  type: 'git'
  repo: 'git@github.com:excaliburhan/hexo-blog.git'
  branch: 'gh-pages'
```

repo 的地址可以是 ssh，也可以是 https（需要提供 token），我因为本地 mac 和 ecs 服务器都会添加 ssh key 到 github 上，所以直接用了 ssh 的形式。

其他更多的用法可以参考插件配置：[hexo-deployer-git](https://github.com/hexojs/hexo-deployer-git)

此外，你也需要安装在插件的 npm 依赖：

```bash
npm install hexo-deployer-git -S
```

运行 `hexo deploy` 命令，它会在你根目录创建一个 `.deploy_git` 的目录，里面会生成你的博客静态 html，然后推送到你指定的分支，这里我用了 `gh-pages`。

然后我们看一下对应仓库的 Pages 配置，让他变成一个可访问的站点：

![](https://xp-assets.oss-cn-hangzhou.aliyuncs.com/img/blog/gh.png)

选择 ` Deploy from branch`，分支选择 `gh-pages`，没有的话需要创建一下，当然你也可以直接选择 `main` 分支。

后续推送 `gh-pages` 分支就会自动部署了，一般地址会根据你仓库来生成，比如：

`https://excaliburhan.github.io/hexo-blog`

当然你用 `hexo deploy` 之后，会自动帮你更新 `gh-pages` 分支内容的，实现自动更新。

## 4️⃣ 阿里云 ECS 部署

一般想要玩一下个人网站的话，可以参考下 ECS 这个方案，首先你得有一台 ECS 服务器：[阿里云 ECS](https://www.aliyun.com/product/ecs)。

进入购买页面，个人站点没啥特别要求的，建议直接买这个配置：

![](https://xp-assets.oss-cn-hangzhou.aliyuncs.com/img/blog/buy-ecs.png)

目前是有 2C2G 3M 带宽 99 元的套餐的，还是比较划算的，而且第二年续费也能享受 99 元活动。我因为已经续费过了，现在界面不显示对应活动了。

镜像我就直接选了 Alibaba Cloud Linux，是基于 CentOS 继续维护的（CentOS 后续不维护了）。

### 登录 ECS

登录 ECS 有很多种选择，你可以通过通过 ECS 的控制台直接进入，比如 Workbench 方式：

![](https://xp-assets.oss-cn-hangzhou.aliyuncs.com/img/blog/ecs-workbench.png)

进入之后就是一个 Web 版的 SSH 终端，当然你也可以通过 SSH 登录，那我建议你参考一下这个 [SSH 免登文档](https://help.aliyun.com/zh/ecs/user-guide/bind-a-key-pair-to-enable-ssh-passwordless-logon?spm=a2c4g.11186623.help-menu-25365.d_4_1_4_2_0.229629d40xsNAY&scm=20140722.H_2857275._.OR_help-T_cn~zh-V_1)。

默认 ECS 的安全组应该是开放了 80、443 端口的，这是后续访问 HTTP、HTTPS 必须配置的。如果没有的话，你也可以通过 `安全组 - 快速添加` 直接生成一个安全组策略。

### 安装必要依赖

#### 1. 安装 git

安装一下必要的环境和依赖，首先安装下 git：

```bash
yum install -y git
```

#### 2. 安装 nvm 和 node

安装 node，我这里安装了 [nvm](https://github.com/nvm-sh/nvm) 来进行 node 版本管理：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

然后安装 node，推荐使用 lts 版本：

```bash
nvm install --lts

# 查看 node 版本
# v22.17.0
node -v
```

顺便安装在 pnpm：

```bash
npm install -g pnpm
```

#### 3. 安装 zsh

安装一下 zsh：

```bash
yum install -y zsh
```

切换成 zsh

```bash
chsh -s /bin/zsh
```

当然也可以考虑安装 [oh-my-zsh](https://github.com/ohmyzsh/ohmyzsh)：

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

### 安装和配置 Nginx

安装一下 `Nginx` 来做 HTTP 和反向代理的管理：

```bash
yum install -y nginx
```

配置 Nginx，这里我直接使用默认配置，然后启动 Nginx：

```bash
systemctl start nginx
```

这时候你可以用公网 IP 访问 80 端口，如果能访问到 Nginx 页面，说明配置成功。

### 结合 acme.sh 生成 ssl 证书

现在网站一般都需要 https 了，需要生成 ssl 证书，这里我使用 `acme.sh` 来生成。

[acme.sh](https://github.com/acmesh-official/acme.sh) 是一个免费、开源的证书生成工具，可以自动生成证书，然后自动更新证书。

#### 1. 安装 acme.sh

```bash
curl  https://get.acme.sh | sh
```

可以设置一下 alias，方便以后使用：

```bash
echo 'alias acme.sh=~/.acme.sh/acme.sh' >> ~/.zshrc && source ~/.zshrc
```

#### 2. 设置默认 CA

`acme.sh` 现在被 zeroSSL 收购了，而 zeroSSL 需要注册账号，我还是比较习惯 letsencrypt，所以默认 CA 设置成 letsencrypt

```bash
acme.sh --set-default-ca  --server  letsencrypt
```

#### 3. 验证签发证书

生成 ssl 证书有多种方式，比如 `webroot`、`nginx`、`dns` 等，可以参考这个 [issue 证书文档](https://github.com/acmesh-official/acme.sh/wiki/How-to-issue-a-cert)

不过实践下来，感觉还是 webroot 比较方便，一方面我们因为 http 的访问地址一般都会 rewrite 到 https，`nginx` 可能会因此失败；另一方面需要自动更新，`dns` 方案比较麻烦，尤其是 aliyun 的 api 我试了经常失败。

我需要配置的域名是： `excaliburhan.com` 、 `www.excaliburhan.com` 和 `api.excaliburhan.com`。我们先修改下创建一下 web 文件目录：

```bash
mkdir -p /home/www/letsencrypt
```

修改下 nginx 的配置：

```nginx
# http 配置
server {
	listen 80;
	server_name example.com www.example.com;

	location /.well-known/acme-challenge {
		root /home/www/letsencrypt;
	}

	location / {
		rewrite	^/(.*)$ https://$host/$1 permanent;
	}
}
```

签发证书：

```bash
acme.sh --issue -d excaliburhan.com -d www.excaliburhan.com -d api.excaliburhan.com -w /home/www/letsencrypt
```

`-w` 的地址可以根据你的需要做对应调整。

最后签发成功之后如图：

![](https://xp-assets.oss-cn-hangzhou.aliyuncs.com/img/blog/ssl-issue.png)

#### 4. 安装证书到 nginx 目录

一般我们会安装证书到 nginx 目录，后续自动更新也会自动执行这个过程：

```bash
acme.sh --install-cert -d excaliburhan.com -d www.excaliburhan.com -d api.excaliburhan.com \
--key-file       /etc/nginx/conf/certs/excaliburhan.com.key  \
--fullchain-file /etc/nginx/conf/certs/excaliburhan.com.crt \
--ca-file         /etc/nginx/conf/certs/excaliburhan.com.ca.crt \
--reloadcmd     "systemctl restart nginx"
```

`key-file` 这些的目录地址可以根据你实际需要去修改。

#### 5. 修改 nginx https 的配置

```nginx
server {
  listen 443 ssl http2 reuseport;
  server_name excaliburhan.com www.excaliburhan.com;

  # cert 证书
  ssl_certificate /etc/nginx/conf/certs/excaliburhan.com.crt;
  ssl_certificate_key /etc/nginx/conf/certs/excaliburhan.com.key;
  ssl_trusted_certificate /etc/nginx/conf/certs/excaliburhan.com.ca.crt;

  location / {
    # 博客目录，根据实际情况修改
    root /home/hexo-blog/public;
    index index.html index.htm;
  }
}
```

然后重启一下 nginx `systemctl restart nginx`。

#### 6. acme.sh 自动更新

```bash
acme.sh --auto-upgrade
# acme.sh --upgrade --auto-upgrade
# --upgrade 会拉取 github 的代码进行更新，有时候会比较慢，我是没开的
```

acme.sh 默认会给你创建一条 crontab 的任务：

```bash
crontab -l
# 每个人会有点不同，比如我是每天 0 点 53 分执行
# 53 0 * * * "/root/.acme.sh"/acme.sh --cron --home "/root/.acme.sh" > /dev/null
```

letsencrypt 证书有效期是 90 天，acme.sh 默认自动更新是 60 天后更新，如果没到则会直接跳过，你可以在通过下面命令具体 Renew 的时间：

```bash
acme.sh --list
# Main_Domain       KeyLength  SAN_Domains                                CA               Created               Renew
# excaliburhan.com  "2048"     www.excaliburhan.com,api.excaliburhan.com  LetsEncrypt.org  2025-07-18T07:27:56Z  2025-09-16T07:27:56Z
```

### DNS 解析配置

你需要 DNS 的服务商来进行 DNS 解析，从而可以通过你的域名来访问网站，我这里用了阿里云的 DNS 服务。你可以参考：[DNS 解析](https://dnsnext.console.aliyun.com/authoritative/domains/?GroupId=-2)

一般来说，你需要 3 条记录，`*`、`@` 和 `www`，记录值就是你的公网 IP：

![](https://xp-assets.oss-cn-hangzhou.aliyuncs.com/img/blog/dns.png)。

这时候，你就可以用 https 的方式访问你的网站了。

## 5️⃣ Github Webhooks 自动更新

上面阿里云 ECS 部署篇幅比较长，所以这部分自动更新的单独放在一起说了。

首先你可以简单了解下文档：[Github Webhooks](https://docs.github.com/en/webhooks/using-webhooks)。

### 1. 创建 Webhooks

通过 `仓库 - Settings - Webhooks`，创建一个新的 Webhook，创建完成后，后续你 push 仓库的时候就会触发这个 Webhook。

![github-webhooks](https://xp-assets.oss-cn-hangzhou.aliyuncs.com/img/blog/github-webhooks.png)

利用触发的 Webhook 自动拉取最新代码和你的博客内容，从而实现自动更新的效果。

### 2. API Server

你需要一个自己的 api server 应用，可以使用 `Express` 或者简单的 `Node Http Server`，这里具体逻辑就不展开了，推荐两种方案：

- Express 这类需要自己处理的，可以借助 [@octokit/webhooks](https://github.com/octokit/webhooks) 来完成验签这类工作，会轻松很多

- Node Http Server 可以使用 [github-webhook](https://github.com/rvagg/github-webhook)，直接安装依赖启动即可，比如：

```bash
github-webhook \
  --port=9999 \
  --path=/webhook \
  --secret=mygithubsecret \
  --log=/var/log/webhook.log \
  --rule='push:ref == refs/heads/master && repository.name == myrepo:echo "yay!"'
```

对应的 `echo "yay!"` 更换成你需要执行的 `sh` 脚本即可，比如这样，进入对应目录，拉取最新代码，然后执行 `npm run build`：

```sh
cd /home/hexo-blog
git pull
npm run build
```

当然最好的还是自己写 API Server，可以定制自己的一些逻辑。

### 3. PM2 守护进程

无论是何种方式，Webhooks 本质都是一个 Node 的服务，最好使用 `PM2` 这样的守护进程：

- 服务挂了之后自动重启
- 自带一些日志能力

## 6️⃣ 图片资源处理

为了更好的体验，常规上我们会把图片放在 OSS 或者 CDN 来进行一些资源优化，下面我主要介绍一下 `阿里云 OSS` 和 `七牛云 CDN` 的方案。

### 阿里云 OSS

开通 OSS 服务之后，配置一下 [OSS Bucket](https://oss.console.aliyun.com/bucket)：

![oss](https://xp-assets.oss-cn-hangzhou.aliyuncs.com/img/blog/oss.png)

几个要点：

- 地域：选择有地域属性，计费会更低一点，国内场景够用了
- 存储类型：标准存储，当然你也可以选择 `低频访问`、`归档存储`，能力和计费上都有一点区别
- 存储冗余类型：本地冗余存储足够了

上传图片你会得到类似的 oss 地址：`https://xp-assets.oss-cn-hangzhou.aliyuncs.com/gakki.jpg`。

当然 oss 是不支持图片压缩的，也无法根据用户所在地提供最近的地址，这些需要开启 CDN 服务。阿里云的 CDN 现在基本没有白嫖证书了，下面介绍七牛云的方案。

### 七牛云 CDN + 自定义域名 + 免费证书

开启 CDN 前提是需要 OSS 存储服务的，七牛云也有类似的服务，这里就不展开了，可以直接参考 [七牛云 Kodo](https://www.qiniu.com/products/kodo)。

如果需要通过类似自定义域名访问：`https://static.excaliburhan.com/gakki.jpg`，首先你需要一个 CA 证书。七牛云是可以白嫖这种证书的，但是有效期只有 90 天。

#### 1. 购买证书

选择 TrustAisa 的 DV 限免证书，0 元下单：

![qn-ca](https://xp-assets.oss-cn-hangzhou.aliyuncs.com/img/blog/qn-ca.png)

购买之后需要你填写对应的信息，我这里验证方式选了 `DNS`，加密算法选了 RSA，ECC 会有一些兼容性的情况：

![qn-fill-ca](https://xp-assets.oss-cn-hangzhou.aliyuncs.com/img/blog/qn-fill-ca.png)

#### 2. DNS 验证

当你填写完基本信息之后，需要你去 DNS 解析增加记录，保证能够完整验证，否则就会一直审核中了。

主机记录和记录值都会在你的购买订单里显示给你，创建一个 `TXT` 记录，验证成功后等待订单生效即可：

![qn-dns](https://xp-assets.oss-cn-hangzhou.aliyuncs.com/img/blog/qn-dns.png)

#### 3. 配置域名

然后你可以通过域名管理，新增刚才申请的域名，按照要求填写信息即可：

![qn-domain](https://xp-assets.oss-cn-hangzhou.aliyuncs.com/img/blog/qn-domain.png)

对应的源站选择你的七牛云存储即可。等待七牛云域名管理生效之后，就可以使用类似地址进行访问了：

`https://static.excaliburhan.com/gakki.jpg`。

#### 4. 自动更新免费证书？

查了一下七牛云的 API 和相关页面，貌似没有自动更新免费证书的能力（或者说复杂度太高）。

当然在域名管理里看到可以授权七牛云代申请免费证书的入口：`域名管理 - HTTPS 配置 - 修改配置`

![qn-free](https://xp-assets.oss-cn-hangzhou.aliyuncs.com/img/blog/qn-free.png)

这种方式需要你在 DNS 解析添加一条 `CNAME` 的记录，看起来并没有自动更新的能力，所以大概率 90 天后你还需要手动执行这个过程。

## 7️⃣ 总结

整个过程下来还是踩了不少坑，一方面是因为太久没搞这种从前到后的工程了，另外一方面 acme.sh 的证书签发方式按照文档也会遇到一些实际问题。

不过整体弄完效果还是可以的，但大概率这一篇博客之后，又会进入长期休眠状态了 😃
