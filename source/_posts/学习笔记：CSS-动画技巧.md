---
title: 学习笔记：CSS 动画技巧
date: 2026-09-06 10:00:00
tags:
  - CSS
  - 前端
categories:
  - 技术
---

## 前端动画的几种实现方式

在前端开发中，动画效果是提升用户体验的重要手段。以下是几种常用的动画实现方式。

### 1. CSS Transition

最简单的动画方式，适合状态之间的平滑过渡：

```css
.button {
  background: #30a9de;
  transition: all 0.3s ease;
}
.button:hover {
  background: #2a8ab5;
  transform: translateY(-2px);
}
```

### 2. CSS Animation

适合复杂的多帧动画，可以定义关键帧：

```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.card {
  animation: float 3s ease-in-out infinite;
}
```

### 3. JavaScript 动画

最灵活的方式，适合需要精确控制的场景：

```javascript
element.animate([
  { transform: 'translateY(0)', opacity: 1 },
  { transform: 'translateY(-20px)', opacity: 0 }
], {
  duration: 500,
  easing: 'ease-in-out'
});
```

### 性能优化建议

- 优先使用 `transform` 和 `opacity`，它们不会触发重排
- 使用 `will-change` 提示浏览器即将发生的动画
- 避免同时动画大量 DOM 元素

动画的核心原则是：**让界面活起来，但不要让用户分心**。
