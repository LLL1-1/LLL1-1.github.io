'use strict';

/**
 * project-list.js —— 项目列表 helper
 *
 * 约定：一篇「分类为 项目」的文章就是一个项目。
 * 于是新增项目只需要写一篇文章（分类填「项目」），
 * 首页右侧项目栏和 /projects/ 页面都会自动跟着更新，不用再改模板。
 *
 * 模板里用法：
 *   {% for post in get_project_posts(3) %}   // 最新 3 个
 *   {% for post in get_project_posts() %}    // 全部
 *
 * 注意：本文件会被 Hexo 当作插件脚本加载，所以不要写 shebang
 * （`#!/usr/bin/env node` 会被包进函数体里变成语法错误）。
 */
hexo.extend.helper.register('get_project_posts', function (limit) {
  var posts = hexo.locals.get('posts');
  if (!posts) return [];

  var list = posts.sort('-date').toArray().filter(function (post) {
    if (!post.categories || !post.categories.length) return false;
    return post.categories.toArray().some(function (category) {
      return category.name === '项目';
    });
  });

  return typeof limit === 'number' ? list.slice(0, limit) : list;
});
