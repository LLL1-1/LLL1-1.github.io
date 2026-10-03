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
    // 主图完全滚出后头像消失
    if (avatar && banner) {
      var bannerBottom = banner.offsetTop + banner.offsetHeight;
      avatar.classList.toggle('fade-out', y + window.innerHeight >= bannerBottom);
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
