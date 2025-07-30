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


下载并保存 NGINX 的签名密钥：

```bash
curl --output /usr/share/keyrings/nginx-keyring.gpg  \
      https://unit.nginx.org/keys/nginx-keyring.gpg
```

这样可以消除安装过程中出现的“packages cannot be authenticated”警告。

配置Unit的软件仓库，请创建名为/etc/apt/sources.list.d/unit.list的文件，内容如下：
``` 
deb [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/debian/ bookworm unit
deb-src [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/debian/ bookworm unit
```

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

Percona Distribution for MySQL 8.0 的安装请看 [官方教程](https://docs.percona.com/percona-server/8.0/apt-repo.html)，以下给出具体命令：


```bash
apt update
apt install curl
wget https://repo.percona.com/apt/percona-release_latest.generic_all.deb
apt install gnupg2 lsb-release ./percona-release_latest.generic_all.deb
```
启用8.0版本存储库、更新 `apt` 缓存并安装 Percona Server：
```bash
apt-get update
percona-release setup ps80
apt-get install percona-server-server
```

安装完成后，启动并设置数据库开机自启：
```bash
systemctl enable --now mysql
```

#### 给 StarWiki 分配数据库、数据库用户

以root用户进入mysql
```bash
mysql -u root -p
```

创建数据库 (请使用你自己的密码)
```sql
CREATE DATABASE mediawiki;
CREATE USER 'mediawiki'@'localhost' IDENTIFIED BY 'some_password';
GRANT ALL PRIVILEGES ON mediawiki.* TO 'mediawiki'@'localhost';
FLUSH PRIVILEGES;
exit
```


### 部署 StarWiki

克隆 StarWiki 仓库到 `/var/www/mediawiki/`：
```bash
git clone --depth 1 https://github.com/YangHuaTeam/StarWiki /var/www/mediawiki/
```

#### 配置文件cache、sitemap存放文件夹

创建 StarWiki 需要的文件夹，并赋予 NGINX Unit 运行用户 `unit:unit` 权限：
```bash
mkdir -p /var/www/mediawiki/sitemap /var/www/mediawiki/cache
chown -R unit:unit /var/www/mediawiki/sitemap /var/www/mediawiki/cache
```

#### 提交你网站SSL证书到 nginx unit 

你需要[将你的 SSL 证书（包含私钥和证书链）上传到 NGINX Unit](https://unit.nginx.org/certificates/#ssl-tls-certificates)。首先，确保你的证书文件（例如 `bundle.pem`）包含私钥和完整的证书链。然后，使用 `curl` 命令上传：

```bash
curl -X PUT --data-binary @/path/to/your/bundle.pem --unix-socket /var/run/control.unit.sock http://localhost/certificates/bundle
```

这会创建一个名为 `bundle` 的证书，你可以在 NGINX Unit 的配置中引用它。

> 💡 **Tips**  
> 如果没有bundle.pem文件，可以使用`cat cert.pem ca.pem key.pem > bundle.pem`命令生成（如果没有ca.pem文件，则使用`cat cert.pem key.pem > bundle.pem`）。



#### 为 StarWiki 配置 nginx unit 

```bash
curl -X PUT --data-binary @unit-conf.json --unix-socket /var/run/control.unit.sock http://localhost/config

```

#### 配置 StarWiki 本体

此时打开网站，会出现配置页面，按说明配置即可。
配置完毕后会生成  /var/www/mediawiki/LocalSettings.php

#### 应用整合包额外提供的插件、优化

在 LocalSettings.php 添加：

```php

wfLoadSkin("Citizen");
$wgCitizenThemeColor = "#ffae67"; // 皮肤主题色

$wgDefaultSkin = "Citizen";
$wgDefaultMobileSkin = "Citizen";


$wgJobRunRate = 0; # 我们将使用专门的 mw-jobqueue.service 运行 job

```

#### 配置使用S3存储桶存放文件

请前往插件页 [Extension:AWS](https://www.mediawiki.org/wiki/Extension:AWS) 查看插件使用说明。

LocalSettings.php 配置示例：

```php
wfLoadExtension("AWS");
$wgAWSBucketName = "seekstar";
// $wgFileBackends["s3"]["use_path_style_endpoint"] = true;
$wgAWSRegion = "cn-hongkong";
$wgFileBackends["s3"]["endpoint"] =
    "https://oss-cn-hongkong-internal.aliyuncs.com"; # 阿里云内网直连S3服务
$wgAWSBucketDomain = "s3.seekstar.org";
# $wgDebugLogGroups["FileOperation"] = "/var/www/mediawiki/S3.log";
// Configure AWS credentials.
// THIS IS NOT NEEDED if your EC2 instance has an IAM instance profile.
$wgAWSCredentials = [
    "key" => "xxxxx",
    "secret" => "xxxxx",
    "token" => false,
]; 
```


#### 配置后台任务

为了让 MediaWiki 的后台任务（如邮件通知、页面更新等）能够正常运行，你需要安装并启用一些 `systemd` 服务单元。
```bash
ln -sf /var/www/mediawiki/systemd-units/mwjobrunner /usr/local/bin/mwjobrunner
chmod +x /usr/local/bin/mwjobrunner
ln -sf /var/www/mediawiki/systemd-units/*.service /etc/systemd/system/
ln -sf /var/www/mediawiki/systemd-units/*.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now mw-jobqueue.service
systemctl enable --now mw-generateSitemap.timer
systemctl enable --now mw-processEchoEmailBatch.timer
```

## 常见问题

## 版权

这个整合包只是整合了一些常用插件罢了，我们仅仅提供了 部署方案 + 文档，由我们贡献的那部分，我们使用 [Unlicense](https://unlicense.org/) 协议授权给你。
