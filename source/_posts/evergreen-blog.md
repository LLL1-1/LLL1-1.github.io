---
title: 个人博客（本站）
date: 2026-11-01 21:30:00
banner: /images/projects/waimai/cover-blog.jpg
repo: https://github.com/LLL1-1/LLL1-1.github.io
categories:
  - 项目
tags:
  - Hexo
  - Nunjucks
  - GitHub Actions
---

你现在看到的这个站点。用 Hexo 生成静态页，托管在 GitHub Pages 上，主题是在 NexT 的基础上把布局层整个换掉做出来的定制皮肤。

## 技术栈

| 部分 | 实现 |
| --- | --- |
| 静态生成 | Hexo 7 |
| 模板 | Nunjucks（覆盖 NexT 的 layout） |
| 样式 | 单一 `custom.css`，无预处理器 |
| 交互 | 一个 `fluid.js`，原生 JS |
| 部署 | GitHub Actions 构建 → Pages 制品 |

## 几个刻意为之的地方

- **皮肤只有一个入口**：所有样式集中在 `source/css/custom.css`，所有脚本在 `fluid.js`，模板里各引用一次。之前是内联 `<style>` + 配置里重复注入，改一处要翻三个文件。
- **开屏动效不做兜底底色**：蓝色长条靠每条自身 `scaleY(1.01)` 与邻居重叠来消除发丝缝，而不是垫一层底板——垫底板会让抽离过程看起来发糊。
- **首页三栏随正文滚动**：两侧的资料栏和项目栏是 `position: absolute` 而不是 `fixed`，它们跟着内容走，滚到文章区就贴在两侧，不会一直浮在屏幕上。
- **项目栏自动更新**：这篇和外卖那篇都只是「分类 = 项目」的普通文章，首页右侧项目栏和项目页都由模板自动取最新几篇，不需要手工维护列表。

## 部署流程

改完源码直接推送，GitHub Actions 会 `hexo generate` 并作为 Pages 制品发布，仓库里不存构建产物：

```bash
git add .
git commit -m "更新文章"
git push origin HEAD:master
```

推送后大约一到两分钟生效。
