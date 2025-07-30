# StarWiki - 一个开箱即用的 MediaWiki 整合包

本项目是基于 MediaWiki，为 [✨寻星知识库](https://www.seekstar.org) 定制的一个MediaWiki整合包。

把它开源出来是希望它也可以对大家有所帮助。

搭配教程使用该整合包，你可以轻松快速地得到一个 有SEO优化（[Manual:GenerateSitemap.php](https://www.mediawiki.org/wiki/Manual:GenerateSitemap.php/zh)）、外观优美（[Skin:Citizen](https://www.mediawiki.org/wiki/Skin:Citizen)）、用S3存储桶保存文件（[Extension:AWS](https://www.mediawiki.org/wiki/Extension:AWS)）、有一些性能调优（[Manual:Performance_tuning](https://www.mediawiki.org/wiki/Manual:Performance_tuning/zh)） 的 MediaWiki 实例。

## 单服务器快速上手

本教程使用一台 Debian 12 VPS 操作

**以下操作使用root账户进行。**

### 准备 MediaWiki 依赖的运行环境

#### 网络服务器 + php 环境

参考[官方教程](https://unit.nginx.org/installation/#debian) 安装跑php应用要用到的 nginx unit


[TODO] Supported architectures: arm64, x86-64.

    Download and save NGINX’s signing key:

curl --output /usr/share/keyrings/nginx-keyring.gpg  \
      https://unit.nginx.org/keys/nginx-keyring.gpg

This eliminates the “packages cannot be authenticated” warnings during installation.

To configure Unit’s repository, create the following file named /etc/apt/sources.list.d/unit.list:

deb [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/debian/ bookworm unit
deb-src [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/debian/ bookworm unit

``` bash
apt update
apt install unit unit-php
systemctl enable --now unit 
``` 

安装 MediaWiki 需要的 php 拓展

```bash
apt install php-curl php-apcu php-gd php-imagick php-intl php-mbstring php-mysql php-xml php-igbinary

``` 

#### 数据库

我们这里推荐使用 Percona Distribution for MySQL 8.0 ，而非oracle mysql。

Percona Distribution for MySQL 8.0 的安装请看 [官方教程](https://docs.percona.com/percona-distribution-for-mysql/8.0/installing.html)，以下给出具体命令：

[TODO]  AI请阅读 https://docs.percona.com/percona-distribution-for-mysql/8.0/installing.html ，在此处生成数据库安装文案与命令
[TODO] AI请阅读 https://docs.percona.com/percona-distribution-for-mysql/8.0/installing.html ，在此处生成systemctl数据库启动命令

#### 给 StarWiki 分配数据库、数据库用户

[TODO] 给 StarWiki 分配数据库、数据库用户


### 部署 StarWiki

[TODO] git clone --depth 1 https://github.com/YangHuaTeam/StarWiki 到 /var/www/mediawiki/

#### 配置文件cache、sitemap存放文件夹

[TODO] 创建 /var/www/mediawiki/sitemap/ 、 /var/www/mediawiki/cache/ 并 chown 给 unit:unit

#### 提交你网站SSL证书到 nginx unit 


[TODO]AI请阅读 https://unit.nginx.org/certificates/#ssl-tls-certificates，生成上传证书到http://localhost/certificates/bundle的指南

#### 为 StarWiki 配置 nginx unit 

```
curl -X PUT --data-binary @unit-conf.json --unix-socket /var/run/control.unit.sock http://localhost/config

```

#### 配置 StarWiki 本体

此时打开网站，会出现配置页面，按说明配置即可。
配置完毕后会生成  /var/www/mediawiki/LocalSettings.php

#### 配置后台任务

[TODO] 安装 systemd-units 文件夹下的单元们

## 常见问题

## 版权

这个整合包只是整合了一些常用插件罢了，我们仅仅提供了 部署方案 + 文档，由我们贡献的那部分，我们使用 [Unlicense](https://unlicense.org/) 协议授权给你。
