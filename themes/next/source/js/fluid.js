/**
 * fluid.js — 站点交互脚本（皮肤的一部分）
 * 由 themes/next/layout/_layout.njk 以 <script src="/js/fluid.js" defer> 引入一次。
 */
'use strict';

(function() {
  // 首页长条抽离开篇动效：动画播完后移除节点（仅首页存在该节点）
  (function() {
    var intro = document.getElementById('stripIntro');
    if (!intro) return;
    setTimeout(function() { intro.remove(); }, 700);
  })();

  // 除首页外的分页（归档 / 项目 / 标签 / 分类 / 关于）：第一次进来直接滚一段。
  //   目标 = 660px；页面不够长就滚到它能滚到的底部。
  //   字体/图片会改变文档高度，所以前 1 秒内校正几次；
  //   用户一旦自己滚动就立刻交出控制权，不跟他抢滚动条。
  //   首页与文章页都不参与：首页 body 没有 no-home-intro 类，
  //   文章页有自己的小头图，用 is-post-page 跳过。
  (function() {
    if (!document.body.classList.contains('no-home-intro')) return;
    if (document.body.classList.contains('is-post-page')) return;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    var TARGET = 660;
    var settled = false;
    function maxScroll() {
      return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    }
    function place() {
      if (settled) return;
      window.scrollTo({ top: Math.min(TARGET, maxScroll()), behavior: 'auto' });
    }

    place();
    [120, 400, 900].forEach(function(ms) { setTimeout(place, ms); });
    window.addEventListener('load', place);
    ['wheel', 'touchstart', 'keydown'].forEach(function(ev) {
      window.addEventListener(ev, function() { settled = true; }, { passive: true, once: true });
    });
  })();

  // 侧栏定位上下文对齐 + 竖直对齐：
  //  .page-body 是空块，在文档流里排在文章面板之后；先用负 margin-top 把它抬到
  //  面板内容区顶边（= 第 1 篇文章顶边），这样栏内 top 才是相对“第 1 篇”算的。
  //  再取第 1 篇高度的一半作为 top，使两栏上边界落在第 1 篇的中线上。
  //  字体/图片加载会改变高度，量一次并在 resize/load 后重算。
  (function() {
    var cards = document.querySelectorAll('.index-card');
    var board = document.querySelector('.board');
    var body = document.querySelector('.page-body');
    if (!cards.length || !board || !body) return;
    function sync() {
      var boardHeight = board.getBoundingClientRect().height;
      var padTop = parseFloat(getComputedStyle(board).paddingTop) || 0;
      // 抬到面板内容区顶边
      body.style.marginTop = (-boardHeight + padTop) + 'px';
      // 上边界 = 第 1 篇中线
      body.style.setProperty('--card1-h', cards[0].getBoundingClientRect().height + 'px');
    }
    sync();
    window.addEventListener('resize', sync);
    window.addEventListener('load', sync);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
    var imgs = document.querySelectorAll('.index-card img');
    for (var i = 0; i < imgs.length; i++) {
      if (!imgs[i].complete) imgs[i].addEventListener('load', sync, { once: true });
    }
  })();

  // 滚动条：滚动时显示，停顿后隐藏
  (function() {
    var timer;
    window.addEventListener('scroll', function() {
      document.body.classList.add('scrolling');
      clearTimeout(timer);
      timer = setTimeout(function() {
        document.body.classList.remove('scrolling');
      }, 600);
    }, { passive: true });
  })();

  // 导航栏滚动变色 + 回到顶部 + 箭头淡出 + 面板视差 + 头像固定
  var nav = document.getElementById('nav');
  var backTop = document.getElementById('backTop');
  var scrollDown = document.querySelector('.scroll-down');
  var board = document.querySelector('.board');
  var avatar = document.querySelector('.avatar-box');
  var banner = document.querySelector('.banner');
  window.addEventListener('scroll', function() {
    var y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);
    backTop.classList.toggle('show', y > 400);
    if (scrollDown) {
      scrollDown.classList.toggle('hide', y > 80);
    }
    // 面板视差
    if (board && board.classList.contains('visible')) {
      board.style.setProperty('--lift', Math.min(y * 0.3, 120) + 'px');
    }
    // 主图滚掉约七成后头像才淡出；滚回顶部会重新出现。
    // 这里不能用「主图完全滚出视口」作为条件：主图高 100vh，等于视口高度，
    // 于是 y + innerHeight >= bannerBottom 在页面顶端就成立（0 + 900 >= 900），
    // 结果一动就淡出，而且滚回顶部判定仍成立、类不会被移除，只能刷新才恢复。
    if (avatar && banner) {
      avatar.classList.toggle('fade-out', y > banner.offsetHeight * 0.7);
    }
  }, { passive: true });

  // 打字机效果
  (function() {
    var el = document.getElementById('typed');
    if (!el) return;
    var text = el.textContent;
    el.textContent = '';
    var i = 0;
    function type() {
      if (i < text.length) {
        el.textContent += text.charAt(i++);
        setTimeout(type, 120);
      }
    }
    setTimeout(type, 800);
  })();

  // 面板滚动浮现（入场动画结束后移除过渡，让视差即时跟随）
  (function() {
    var board = document.querySelector('.board');
    if (!board) return;
    board.addEventListener('transitionend', function once(e) {
      if (e.propertyName === 'margin-top') {
        board.style.transition = 'opacity 0.7s ease';
        board.removeEventListener('transitionend', once);
      }
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) {
            board.classList.add('visible');
            io.disconnect();
          }
        });
      }, { threshold: 0.1 });
      io.observe(board);
    } else {
      board.classList.add('visible');
    }
  })();
})();
