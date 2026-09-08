---
title: 技术分享：Hexo 博客搭建心得
date: 2026-09-04 09:00:00
tags:
  - Hexo
  - 博客
  - 教程
categories:
  - 技术
---

## 为什么选择 Hexo

搭建个人博客有很多选择，WordPress、Hugo、Jekyll、Hexo……最终选择 Hexo 的原因很简单：

1. **轻量快速** — 基于 Node.js，生成速度极快
2. **Markdown 写作** — 专注于内容，不必纠结排版
3. **主题丰富** — 社区活跃，高质量主题众多
4. **一键部署** — 配合 GitHub Pages，零成本托管

## 搭建过程

### 环境准备

```bash
# 安装 Hexo CLI
npm install -g hexo-cli

# 初始化项目
hexo init my-blog
cd my-blog
npm install
```

### 主题选择

经过对比，最终选择了 **NexT** 主题。它的优势在于：

- 文档完善，配置项丰富
- 中文社区支持好
- 自定义空间大，适合深度改造

### 部署到 GitHub Pages

```bash
# 安装部署插件
npm install hexo-deployer-git --save

# 一键部署
hexo deploy
```

## 踩过的坑

### 图片路径问题

Hexo 的图片路径相对复杂，建议：

- 使用 `/images/xxx.png` 的绝对路径
- 或者开启 `post_asset_folder` 使用相对路径

### 中文文件名

Markdown 文件使用中文名可能导致构建失败，建议用英文或拼音命名文件，中文作为标题。

## 总结

搭建博客只是第一步，持续输出优质内容才是关键。希望这个小站能记录下技术路上的点滴，也希望能帮到同样在折腾博客的朋友。
