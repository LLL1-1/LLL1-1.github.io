# 五点整改说明

本次改动全部在本地完成并验证，尚未 commit / push。

## 0. 追加：本地渲染与线上对齐（2026-09 追加）

线上 GitHub Pages 实际发布的是 `a3f804b` 那次构建的 `public/`（76 个文件逐个哈希比对，
**100% 一致**；比 HEAD 旧两个提交）。对比后发现我的皮肤与线上有 6 处取值差异，
已全部按线上取值改回，**保留重构结构**：

| 位置 | 线上取值（已采用） | 改前本地 |
| --- | --- | --- |
| `.board` max-width | 700px | 900px |
| `.board` | 额外 `margin-left/right: auto` | 无 |
| `.home-layout` | max-width 1200px + `padding: 0 20px` | 1920px，无 padding |
| `.profile-card` | left 30px / width 210px | 100px / 220px |
| `.projects-card` | right 30px / width 280px | 100px / 260px |
| 媒体查询 1100px | card 180/240px、board 600px | 170/200px、board 700px |
| 媒体查询 1400px | 线上没有 | 有一档（已删） |

同时撤掉了我之前加的两处兜底（`html { background: #fff }`、字体族补 `sans-serif`），
因为线上没有，留着会与线上产生可见/可计算差异。

**验证（不是逐字节，而是渲染等价）**：

- 声明级比对：线上内联皮肤 279 条声明，本地 `custom.css` 279 条，**集合完全相同、零差异**。
- 规则级比对：两边各 **132 条规则**，选择器集合相同、每条规则体也相同，**零差异**。
- 标记级比对：去掉重构引入的 `<link>`/`<script>`/`<noscript>` 三个标签后，
  逐字符比较。抽查 10 个页面（首页/归档/标签/分类/关于/项目/两篇文章/标签页/分类页）：
  **9 个完全一致**；`/about/` 只差邮箱的 HTML 实体编码（`&#x33;` vs `&#51;` 之类），
  解码后是同一个 `3393119358@qq.com`，渲染无差别。
- 图片：`avatar.jpg`/`banner.png`/`bg.jpg` 与线上逐字节相同；`thumb-1/2/3.svg`、
  `landscape-bg.svg` 仅行尾 LF/CRLF 不同，规范化后内容完全一样。

**刻意没有对齐的部分（都不影响渲染）**：

- 线上 `public/css/custom.css`（6075 字节）是旧的"中国山水画风格"，样式全部作用于
  NexT 的类名（`.main-inner`、`.post-block`、`.site-title`…）。本站模板自己拼 DOM，
  这些类名一个都不存在，所以它是**死代码**。线上之所以有它，是因为旧版工作流用了
  `git add -f public/*`，只会新增/修改、**从不同步删除**，于是 09-07 的旧文件一直残留。
  我没有把这堆死代码复制回来。
- `public/css/main.css`、`landscape-bg.svg`、`logo-algolia…svg` 没有任何页面引用。

## 0.1 追加：左侧「目录栏」外移 + 卡片重叠修正

需求：把带「长青」和头像的左侧目录栏（`.profile-card`）移到中间文章栏外面，
落在背景图左边那面蓝色墙壁附近。

**先把背景图量了出来**（`bg.jpg` 是 3840×2160，我写了个 baseline JPEG 解码器读像素）：

- 左边蓝色墙壁的内侧边界在**恰好 25.0%** 图宽处（x=960/3840），右侧墙壁在 75%。
- `.site-bg` 是 `fixed` + `cover` + 居中，所以屏幕上墙壁边缘 =
  `(vw - W·s)/2 + 0.25·W·s`，其中 `s = max(vw/W, vh/H)`。
- 关键结论：**这块墙壁在屏幕上并不宽**。1440×900 时约 320px，1920×1080 时约 480px，
  而卡片本身 210px —— 宽屏下墙壁装不下一张 210px 的卡片。

**改法**：让卡片始终紧贴文章栏外侧，而不是钉在 `left: 30px`。

- `.profile-card`：`left: max(20px, calc(50vw - 580px))`
  （文章栏是居中 700px 面板，左边缘 = `50vw - 350px`；卡片 210px + 20px 间距 → `50vw - 580px`）
- `.projects-card`：`right: max(20px, calc(50vw - 370px))`，与左侧镜像对称
- 隐藏断点从 900px 提到 **1340px**：实测右侧 280px 卡片在约 1330px 处开始压到文章栏，
  原来的 900px 早就重叠了

实测（文章栏 = 居中 700px 面板）：

| 视口 | 文章栏 | 左卡片 | 间距 | 右卡片 | 间距 |
| --- | --- | --- | --- | --- | --- |
| ≤1340 | — | 隐藏 | — | 隐藏 | — |
| 1440 | 370..1070 | 140..350 | 20 | 810..1090 | 20 |
| 1600 | 450..1150 | 220..430 | 20 | 890..1170 | 20 |
| 1920 | 610..1310 | 380..590 | 20 | 1050..1330 | 20 |
| 2560 | 930..1630 | 700..910 | 20 | 1370..1650 | 20 |

**一个要你确认的取舍**：墙壁在屏幕上偏窄，卡片要在「紧贴文章栏」和「整体落在墙上」
之间二选一。现在选的是**紧贴文章栏外侧 20px**（即你说的"移到文章栏外面"）。
在 1440×900 这类比例下卡片正好压在墙上（墙壁内边缘 320px，卡片 140..350）；
但在更宽的视口（如 1920）卡片会随文章栏一起右移，约一半落在天空区。
若你更想让它整体压在墙上，把它改成不跟随文章栏即可，例如
`left: max(20px, min(200px, calc(50vw - 580px)))` 或 `left: 9vw`，说一声我就调。

## 0.2 追加：修掉"卡片压住正文"的真正原因（重要）

第一次改完你看到的截图里，两侧卡片直接盖在文章正文上。原因不是定位数值，
而是**包含块**问题：

- `.board`（白色面板）有 `backdrop-filter: blur(10px)`。这个属性会让该元素
  成为后代 `position: fixed` 元素的**包含块**（Chrome 行为，`transform`/`filter`/`contain` 同理）。
- 两张卡片原本是 `.board` 的后代，所以它们的 `left/right/top` 全都相对**面板**
  解析，而不是视口 —— `left: 143px` 变成了「面板左边缘 +143px」，直接落到正文上。
- 顺带一个隐患：`.board` 还有 `overflow: hidden`，会把固定在它里面的卡片裁掉。

**修法**（两处）：

1. DOM 结构调整：新增 `{% block overlays %}`，把两张卡片从 `.board` 里移出来，
   作为 `<body>` 的直接子元素 —— 它们本来就是页面级浮层，不属于面板内容。
   见 `themes/next/layout/_layout.njk` 与 `index.njk`。
2. 顺手把面板的入场/视差从 `transform: translateY()` 换成 `margin-top`，
   让 `.board` 彻底不再产生包含块（避免以后再踩同一个坑）。配套：
   `themes/next/source/js/fluid.js` 里的过渡监听由 `transform` 改为 `margin-top`。

**另外修正我上一版的一个推导错误**：右侧项目栏搬出面板后，`right` 的参照从
「面板」变成「视口」，我当时少减了一个卡片宽度，导致它同样压住正文。
现在 `.projects-card` 用 `right: max(20px, calc(50vw - 650px))`。

**用真实 Chrome 实测（playwright-core + 本机 Chrome）**：

| 视口 | 文章栏 | 左卡片 | 间距 | 右卡片 | 间距 |
| --- | --- | --- | --- | --- | --- |
| ≤1340 | — | 隐藏 | — | 隐藏 | — |
| 1366 | 333..1033 | 103..313 | 20 | 1053..1333 | 20 |
| 1440 | 370..1070 | 140..350 | 20 | 1090..1370 | 20 |
| 1920 | 610..1310 | 380..590 | 20 | 1330..1610 | 20 |
| 2560 | 930..1630 | 700..910 | 20 | 1650..1930 | 20 |

**重叠视口数：0**。另外抽查 8 类页面：只有首页出现这两张卡片，
面板入场动画正常（`opacity: 1`、`margin-top` 随滚动变化）、无 JS 报错。


**注意**：这条是**故意让本地与线上不再完全一致**的改动（你明确要求移动它）。
其余部分仍保持与线上渲染等价。

## 1. `_config.yml` 的 url 占位符

`url: http://example.com` → `url: https://lll1-1.github.io`。
影响：绝对地址、RSS/feed、sitemap 以及任何 `url_for` 生成的链接不再指向 example.com。
验证：生成物中已无 `example.com`。

## 2. 皮肤不再是"两处注入 + 一份死文件"

改前的事实（比原先判断的更糟）：

- `_config.next.yml` 里 `custom:` 和 `inject.head` 各写了一份 `css/custom.css`；
  但自定义的 `_layout.njk` 自己拼 `<head>`，**两个入口都不会被渲染** —— 等于配了也没用。
- 真正生效的样式，是内联在 `themes/next/layout/_layout.njk` 里的 18000 字符 `<style>`。
- 而 `source/css/custom.css` 里躺着的还是旧的"中国山水画风格"，既没被引用也不符合现状。
- 另外首页 `index.njk` 里还有一段内联 `<script>`。

改后：单一来源，只引用一次。

| 内容 | 唯一位置 | 引用方式 |
| --- | --- | --- |
| 全部样式 | `source/css/custom.css` | `_layout.njk` 里 `<link rel="stylesheet" href="/css/custom.css">` |
| 全部交互 | `themes/next/source/js/fluid.js` | `_layout.njk` 里 `<script src="/js/fluid.js" defer>` |
| 皮肤说明 | `_config.next.yml` 注释 | 说明为什么 `custom:` / `inject:` 不再需要 |

顺带修掉的两个小问题：

- 首页那段移除开屏长条的脚本并入了 `fluid.js`；并补了 `<noscript>` 兜底，
  否则禁用 JS 时 16 条蓝色长条会永久盖住整页。
- `body` 字体族原本以 `serif` 结尾、没有通用兜底，已补齐 `sans-serif`。

关于白闪：样式表从内联改成外链，理论上多一次请求。为把风险降到最低，
`html`/`body` 都补了与原默认一致的白色底，最终观感不变（原 `body` 背景是
`rgba(240,243,246,.65)`，压在白底上，所以补白色不会盖住 `.site-bg` 背景图）。

**等价性证明**：把 `HEAD` 里 `public/index.html` 的内联 CSS 抽出、去掉缩进后，
与新的 `source/css/custom.css`（排除头部注释）逐字符比较，除下面两处有意改动外**完全相同**：

- `html { background: #fff }` 兜底
- 字体族补 `sans-serif`

（比较时还差一处 `left/right: 60px → 100px`，见文末"另外"一节。）

## 3. `public/` 不再进版本控制

- `git rm -r --cached public`：仅取消跟踪，**本地文件保留**，工作区不受影响。
- `.gitignore` 增加 `public/`，从此是"被忽略"而不是"未跟踪"。
- 删除的 `.github/` 那行：它既让 workflow 本身游离在版本控制外，又和远程实际
  已跟踪 `.github/` 矛盾。改 `.gitignore` 后主题自带的 `themes/next/.github/`
  会冒出来，已单独加规则忽略。

## 4. `deploy.yml` 改为 Actions 制品部署

- 构建 → `upload-pages-artifact` → `deploy-pages`，生成物不落库、不回写源码。
- 加 `concurrency: pages`（防止两次构建互相覆盖）、`workflow_dispatch`（可手动重发）。
- 用 `npm ci` 替代 `npm install`，去掉多余的 `npm install hexo-theme-next`
  （主题是 `themes/next/` 普通目录，且它自己没有任何 npm 依赖）。
- 构建时 `touch public/.nojekyll`，避免 Pages 走 Jekyll。
- 旧流程的 `git add -f public/*` 有个隐性 bug：**只加新增和修改，不同步删除**，
  文章改名或目录调整后旧页面会永久留在线上。新流程不再有这个问题。

**一次性手动操作**：仓库 Settings → Pages → Source 选 **GitHub Actions**。
在改这个设置之前，线上仍停留在上一次分支发布的版本（不会坏，只是不更新）。

## 5. 顺手修掉的构建期报错

`scripts/` 下的 `.js` 会被 Hexo 当插件脚本加载，而 `apply-patches.js` 是带 shebang
的 CLI，于是每次跑 hexo 都会报：

```
ERROR Script load failed: scripts\apply-patches.js
SyntaxError: Invalid or unexpected token
```

（生成本身没受影响，但日志一直是脏的。）文件顶部加了 `typeof hexo !== 'undefined'`
守卫：被 Hexo 加载时立刻返回、零副作用；`npm install` 的 postinstall 路径照常工作。
`package.json` 的 `postinstall` 调用方式没有改动。

## 验证记录

- `npx hexo clean && npx hexo generate`：77 个文件、无 ERROR。
- 插件加载模拟：`apply-patches.js` 被 Hexo 加载时零副作用、不抛错；postinstall 仍为幂等。
- 本地 server 全量请求：

```
200 /                                       200 /js/fluid.js
200 /archives/                              200 /images/bg.jpg
200 /tags/                                  200 /images/avatar.jpg
200 /categories/                            200 /images/banner.png
200 /about/                                 200 /2026/09/10/hello-world/
200 /projects/                              200 /2026/09/04/技术分享：Hexo-博客搭建心得/
200 /css/custom.css                         200 /2026/09/07/Hello-World-0/
```

- 23 个生成的 HTML 全部引用 `custom.css`；每页恰好 1 次链接、1 次脚本。
- `<noscript>` 只出现在首页。
- YAML 全部可解析；`fluid.js` 通过 `node --check`。

## 另外（未列入五点，但必须提醒）

工作区里原本就有一处**未提交**的改动：`themes/next/layout/_layout.njk` 中
`profile-card` / `projects-card` 的 `left/right: 60px → 100px` 外加
`transition: left 0.3s ease`（即"固定到两侧留白区"那次收尾）。
线上目前是 **60px**，因为它没进上一个提交。这次已一并纳入暂存区，
推上去之后线上才会变成 100px。

## 待你决定

改动全部已 staged（`public/` 的 76 处删除 + 10 个源文件改动），**尚未 commit / push**。
要推的话我会用这个提交信息：

```
部署改为 Actions 制品发布；皮肤收敛为单一来源；修正站点 url
```
