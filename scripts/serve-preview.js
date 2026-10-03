#!/usr/bin/env node
'use strict';
/**
 * serve-preview.js — 本地预览用的极简静态服务器。
 *
 * 服务 public/ 目录（hexo generate 的产物），不做任何改写、不监听文件变化，
 * 比 `hexo server` 少一层中间件，排查问题时更干净。
 *
 * 用法：
 *   node scripts/serve-preview.js            # 端口 4000
 *   node scripts/serve-preview.js 5000       # 指定端口
 *   node scripts/serve-preview.js 4000 --watch   # 文件变化时自动重新生成
 *
 * 打开：http://localhost:<端口>/
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const args = process.argv.slice(2);
const portArg = args.find((a) => /^\d+$/.test(a));
const port = Number(portArg || 4000);
const watch = args.includes('--watch');
const root = path.resolve(__dirname, '..', 'public');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

if (!fs.existsSync(root)) {
  console.error('[serve-preview] public/ 不存在，请先执行：npx hexo generate');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }).end('bad request');
    return;
  }
  let file = path.join(root, urlPath);
  if (!path.resolve(file).startsWith(root)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' }).end('forbidden');
    return;
  }
  try {
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404</h1><p>' + urlPath + '</p>');
      console.log('404 ' + urlPath);
      return;
    }
    const body = fs.readFileSync(file);
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(body);
    console.log('200 ' + urlPath);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }).end('error: ' + e.message);
    console.log('500 ' + urlPath + ' ' + e.message);
  }
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error('[serve-preview] 端口 ' + port + ' 已被占用，换一个：node scripts/serve-preview.js ' + (port + 1));
  } else {
    console.error('[serve-preview] ' + e.message);
  }
  process.exit(1);
});

server.listen(port, '0.0.0.0', () => {
  console.log('[serve-preview] serving ' + root);
  console.log('[serve-preview] http://localhost:' + port + '/');
  if (watch) {
    console.log('[serve-preview] --watch: 监视 source/ 与 themes/，变化时重新 generate');
    let timer = null;
    const regen = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        console.log('[serve-preview] 重新生成…');
        const p = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['hexo', 'generate'], {
          cwd: path.resolve(__dirname, '..'),
          stdio: 'inherit',
        });
        p.on('exit', (code) => console.log('[serve-preview] hexo generate 退出码 ' + code));
      }, 300);
    };
    for (const dir of ['source', 'themes']) {
      const abs = path.resolve(__dirname, '..', dir);
      if (fs.existsSync(abs)) fs.watch(abs, { recursive: true }, regen);
    }
  }
});

// 被 Hexo 当插件加载时保持无副作用
if (typeof hexo !== 'undefined') { /* noop */ }
