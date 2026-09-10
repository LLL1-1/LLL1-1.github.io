#!/usr/bin/env node
/**
 * apply-patches.js — re-apply local fixes to dependencies after every install.
 *
 * WHY THIS EXISTS
 *   hexo-deployer-git spawns git through hexo-util's spawn wrapper. That wrapper
 *   captures git's stdout/stderr with ANONYMOUS PIPES whenever stdio is not
 *   'inherit'. In a WRITE_RESTRICTED-token environment every CreatePipe(NULL)
 *   fails with ERROR_ACCESS_DENIED, so deployment dies with:
 *
 *     error: cannot create standard input pipe for git-receive-pack 'origin': Permission denied
 *     fatal: unable to fork
 *
 *   ...and when the child is instead created with a console-isolation flag it
 *   dies during DLL init with STATUS_DLL_INIT_FAILED (0xC0000142), the Windows
 *   "应用程序无法正常启动" popup.
 *
 *   The fix injects a non-interactive, pager-free environment into the spawn so
 *   git never tries to page output or block on a credential prompt:
 *
 *     GIT_PAGER=cat  LESS=x4  GIT_TERMINAL_PROMPT=0  GCM_INTERACTIVE=never
 *
 * WHY NOT patch-package
 *   patch-package itself must be installed from the registry, which is not
 *   reachable on this machine (npmjs.org is blocked; only a mirror is). A
 *   dependency-free, idempotent postinstall avoids that network dependency
 *   entirely and cannot leave a half-applied state.
 *
 * RUNS FROM: package.json "postinstall"
 * IDEMPOTENT: re-running makes no further change.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/** The environment block inserted into the git() spawn options. */
const ENV_BLOCK = `      env: {
        ...process.env,
        GIT_PAGER: 'cat',
        LESS: 'x4',
        GIT_TERMINAL_PROMPT: '0',
        GCM_INTERACTIVE: 'never'
      }`;

/** One patch: a file plus a literal before/after replacement. */
const PATCHES = [
  {
    name: 'hexo-deployer-git: non-interactive, pager-free git environment',
    file: path.join(ROOT, 'node_modules', 'hexo-deployer-git', 'lib', 'deployer.js'),
    // Only change the git() helper, and only in its original shape.
    before: `  function git(...args) {
    return spawn('git', args, {
      cwd: deployDir,
      verbose: verbose,
      stdio: 'inherit'
    });
  }`,
    after: `  function git(...args) {
    return spawn('git', args, {
      cwd: deployDir,
      verbose: verbose,
      stdio: 'inherit',
      // Non-interactive, pager-free environment (see scripts/apply-patches.js).
      ${ENV_BLOCK.trimStart()}
    });
  }`,
    // Already-applied marker.
    marker: "GIT_TERMINAL_PROMPT: '0'",
  },
];

let changed = 0;
let skipped = 0;
let failed = 0;

for (const p of PATCHES) {
  if (!fs.existsSync(p.file)) {
    console.log(`[apply-patches] SKIP (missing): ${p.name}`);
    skipped++;
    continue;
  }

  const source = fs.readFileSync(p.file, 'utf8');

  if (source.includes(p.marker)) {
    console.log(`[apply-patches] already applied: ${p.name}`);
    skipped++;
    continue;
  }

  if (!source.includes(p.before)) {
    console.error(`[apply-patches] FAILED (unexpected file contents): ${p.name}`);
    console.error(`[apply-patches]   ${p.file}`);
    failed++;
    continue;
  }

  fs.writeFileSync(p.file, source.replace(p.before, p.after), 'utf8');
  console.log(`[apply-patches] applied: ${p.name}`);
  changed++;
}

console.log(`[apply-patches] done: ${changed} applied, ${skipped} skipped, ${failed} failed`);

// A failure must not break `npm install` outright, but it must be visible.
if (failed > 0) {
  console.error('[apply-patches] some patches could not be applied — deployment may need a manual fix.');
}
