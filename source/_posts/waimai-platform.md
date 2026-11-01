---
title: 外卖点餐平台（双端）
date: 2026-11-01 20:00:00
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

一个前后端分离的外卖点餐系统，分管理端和用户端：管理端负责菜品、套餐、订单和营业状态，用户端负责浏览菜单、加购物车、下单和支付。

**技术栈**：JDK 25、Spring Boot 4.1.1、MyBatis-Plus 3.5.17、MySQL 9、Redis、JWT、WebSocket、Nginx

## 已完成的功能

**管理端**

- 员工登录 + JWT 拦截器，`/admin/**` 统一鉴权
- 分类、员工、菜品、套餐的增删改查与起售/停售
- 订单管理：接单、拒单、派送、完成
- 营业状态开关（Redis 存 `SHOP_STATUS`）
- WebSocket 来单提醒 + 今日经营概览

**用户端**

- 分类 / 菜品 / 套餐浏览，购物车，地址簿
- 下单 → 模拟支付 → 待接单的完整闭环
- 我的订单

## 几个实现上的取舍

- 分页统一用 MyBatis-Plus 的 `IPage`，不引 PageHelper
- 管理端和用户端两套 token，请求头分别是 `token` 和 `authentication`
- 删除菜品、套餐前先检查引用关系，避免留下孤儿数据
- 数据库密码从环境变量 `MYSQL_PASSWORD` 读取，不写进配置文件；缺失时直接启动失败，而不是带着空密码跑起来

## 仓库

源码与启动说明：[github.com/LLL1-1/waimai](https://github.com/LLL1-1/waimai)

后续待办：缓存优化、接入真实微信支付、订单超时自动取消、报表页面。
