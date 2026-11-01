---
title: 外卖点餐平台（双端）
date: 2026-11-01 20:00:00
banner: /images/projects/waimai/cover.png
repo: https://github.com/LLL1-1/waimai
categories:
  - 项目
tags:
  - Spring Boot
  - Java
  - MyBatis-Plus
  - MySQL
  - Redis
  - WebSocket
---

一个前后端分离的外卖点餐系统，分为**管理端**和**用户端**：管理端负责菜品、套餐、订单和营业状态，用户端负责浏览菜单、加购物车、下单和支付。后端是典型的 Spring Boot 三层结构，前端是两套独立的静态页面，由 Nginx 托管。

## 技术栈

| 层次 | 选型 |
| --- | --- |
| 语言 / 运行时 | JDK 25 |
| 框架 | Spring Boot 4.1.1 |
| 持久层 | MyBatis-Plus 3.5.17（`mybatis-plus-spring-boot4-starter`） |
| 数据库 | MySQL 9.x |
| 缓存 | Redis（Windows 上用 Memurai） |
| 鉴权 | JWT + 拦截器（jjwt 0.12.x） |
| 实时通知 | WebSocket |
| 接口文档 | springdoc + Swagger UI |
| 部署 | Maven 多模块 + Nginx 反向代理 |

## 代码结构

后端拆成三个 Maven 模块，职责分得很开：

```text
Code/backend/            # 父工程，artifactId = sky-take-out
├── sky-common/          # 常量、异常、统一返回、配置属性、工具类
├── sky-pojo/            # entity / DTO / VO
└── sky-server/          # controller / service / mapper / config / websocket
Code/frontend/
├── admin/               # 管理端页面（Nginx 8082）
├── user/                # 用户端页面（Nginx 8083）
└── images/              # 菜品、套餐图片
```

`common` 和 `pojo` 不依赖 Spring 上下文，`server` 才是唯一有启动类的模块，好处是改 DTO 不会牵动业务逻辑，也方便以后把 `common` 抽成公共依赖。

## 管理端

菜品管理是使用频率最高的页面，支持按名称、分类、状态组合查询，以及起售/停售和批量删除：

![菜品管理](/images/projects/waimai/admin-dish.png)

新增菜品时可以在同一个弹窗里录入口味（比如「辣度：不辣/微辣/中辣」），口味作为独立表存储，和菜品是一对多关系：

![新增菜品](/images/projects/waimai/admin-add-dish.png)

分类和员工管理是标准的增删改查。员工不做物理删除，只用 `status` 字段禁用，避免历史订单里的操作人变成空值：

![分类管理](/images/projects/waimai/admin-category.png)

![员工管理](/images/projects/waimai/admin-employee.png)

订单页只展示**已支付**的订单，可以接单、拒单、派送、完成：

![订单管理](/images/projects/waimai/admin-order.png)

## 用户端

用户端是单页式的点餐流程：选分类 → 加购物车 → 填地址 → 下单 → 模拟支付 → 等待接单。

![用户点餐](/images/projects/waimai/user-ordering.png)

支付做成了可演示的闭环：下单后状态是「待付款」，支付成功才进入「待接单」并触发 WebSocket 来单提醒。这样不用接真实微信支付也能把整条链路跑通。

## 几个实现上的取舍

- **分页统一用 MyBatis-Plus 的 `IPage`**，没有引入 PageHelper。两种分页插件混用容易出现 count 查询不一致，不如一开始就统一。
- **两套 token 分开**：管理端请求头是 `token`，用户端是 `authentication`。两类用户的生命周期完全不同，共用一套拦截器反而容易越权。
- **删除前先查引用**：删菜品要检查套餐是否引用它，删套餐要检查订单。这个检查放在 Service 层，而不是靠数据库外键——外键在批量删除时太难用。
- **密码不落配置文件**：数据库密码从环境变量 `MYSQL_PASSWORD` 读，没设置就直接启动失败。宁可起不来，也不要带着空密码跑起来。
- **营业状态放 Redis**：`SHOP_STATUS` 只有一个值却需要被两端高频读取，放缓存比每次查库合理。

## 本地跑起来

```bash
# 后端
cd Code/backend
mvn -DskipTests install
mvn -pl sky-server spring-boot:run

# 前端：先启动后端，再双击
Code/frontend/start-nginx.bat
```

- 管理端 <http://localhost:8082>，账号 `admin / 123456`
- 用户端 <http://localhost:8083>，mock code 填任意字符串即可登录
- 接口文档 <http://localhost:8080/swagger-ui.html>

> 有个小坑：不要用 `mvn -pl sky-server -am spring-boot:run`。`-am` 会把父工程一起选进 reactor，`spring-boot:run` 会在 pom 打包的父工程上执行，直接报 `Unable to find a suitable main class`。

## 后续计划

- 用缓存降低菜单查询的数据库压力
- 接入真实微信支付（需要商户号和证书）
- 订单超时自动取消与退款
- 经营报表页面

源码和完整启动说明在仓库里，入口在页面上方。
