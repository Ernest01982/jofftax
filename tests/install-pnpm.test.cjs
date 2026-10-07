const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } = require('node:fs');
const { join } = require('node:path');
const { tmpdir } = require('node:os');
const installer = import('../scripts/install-pnpm.mjs');

// Process-invocation tests only; these do not install dependencies or validate
// the resulting application. Real installation/build checks are separate.
test('portable installer rejects a missing or mismatched manager before installation', async () => {
  const { runInstaller } = await installer;
  assert.throws(() => runInstaller({ profile: 'portable', env: {} }), /pnpm 11.25.0/);
  let calls = 0;
  assert.throws(() => runInstaller({ profile: 'portable', env: { npm_execpath: 'npm-cli.js' },
    run: () => { calls++; return { status: 0, stdout: '11.19.0\n' }; } }), /requires pnpm 11.25.0/);
  assert.equal(calls, 1);
});

test('portable installer retains host policy and records a Windows installation', async t => {
  const { runInstaller } = await installer;
  const root = mkdtempSync(join(tmpdir(), 'joff-install-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'node_modules', '.bin'), { recursive: true });
  writeFileSync(join(root, 'node_modules', '.bin', 'vinext.cmd'), 'fixture');
  writeFileSync(join(root, 'pnpm-lock.yaml'), 'unchanged fixture lock');
  const env = { SITES_PNPM_BIN: 'pinned-pnpm.cjs', npm_execpath: 'other.js',
    HOME: 'caller-home', pnpm_config_ignore_scripts: 'true', pnpm_config_fetch_retries: '4' };
  const calls = [];
  const result = runInstaller({ profile: 'portable', root, env, platform: 'win32',
    run: (executable, args, options) => {
      calls.push({ executable, args, options });
      return { status: 0, stdout: '11.25.0\n' };
    } });
  assert.equal(result, 0);
  assert.deepEqual(calls[1].args, ['pinned-pnpm.cjs', 'install', '--frozen-lockfile', '--prod=false', '--prefer-offline']);
  assert.equal(calls[1].executable, process.execPath);
  assert.equal(calls[1].options.env, env);
  assert.equal(readFileSync(join(root, 'pnpm-lock.yaml'), 'utf8'), 'unchanged fixture lock');
  const marker = JSON.parse(readFileSync(join(root, 'node_modules', '.sites-install.json'), 'utf8'));
  assert.equal(marker.package_manager, 'pnpm@11.25.0');
  assert.match(marker.lockfile_sha256, /^[a-f0-9]{64}$/);
  assert.match(marker.platform, /^win32-/);
});

test('install failures propagate and managed Linux retains the established helper', async () => {
  const { runInstaller } = await installer;
  let calls = 0;
  assert.equal(runInstaller({ profile: 'portable', env: { npm_execpath: 'pnpm.cjs' },
    run: () => ++calls === 1 ? { status: 0, stdout: '11.25.0' } : { status: 42 } }), 42);
  const root = join(tmpdir(), 'fictional-joff-managed');
  assert.equal(runInstaller({ profile: 'managed-linux', root, env: {},
    run: (executable, args) => {
      assert.equal(executable, 'bash');
      assert.deepEqual(args, [join(root, 'scripts/install-pnpm.sh')]);
      return { status: 23 };
    } }), 23);
});

test('a successful process without Vinext cannot create a success marker', async t => {
  const { runInstaller } = await installer;
  const root = mkdtempSync(join(tmpdir(), 'joff-install-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.throws(() => runInstaller({ profile: 'portable', root, platform: 'win32',
    env: { npm_execpath: 'pnpm.cjs' }, run: () => ({ status: 0, stdout: '11.25.0' }) }), /ENOENT/);
  assert.throws(() => readFileSync(join(root, 'node_modules', '.sites-install.json')), /ENOENT/);
});
