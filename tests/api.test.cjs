const { test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const { readFileSync, readdirSync } = require('node:fs');
const { join } = require('node:path');
const { SQLiteD1 } = require('./sqlite-d1.cjs');

// Only platform identity and DB binding are injected. Actual routes, guards,
// schemas, export and repository SQL run unchanged against real SQLite. These
// are fictional identities, not evidence of two live ChatGPT sessions.
const transport = { user: null, env: { DB: null } };
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'cloudflare:workers') return { env: transport.env };
  if (request === '../app/chatgpt-auth') return { getChatGPTUser: async () => transport.user ? { userId: transport.user } : null };
  return originalLoad.call(this, request, parent, isMain);
};
const build = process.env.JOFF_TEST_BUILD_DIRECTORY;
const preparation = require(join(build, 'routes', 'preparation.js'));
const exportsRoute = require(join(build, 'routes', 'export.js'));
const account = require(join(build, 'routes', 'account.js'));
const { supportedPreparation } = require('./fixtures.cjs');
const origin = 'https://fictional-joff.example';
function request(path = '/api/preparation?year=2026', { method = 'GET', body, headers = {} } = {}) {
  return new Request(origin + path, { method, headers: { ...(method !== 'GET' ? { origin, 'content-type': 'application/json' } : {}), ...headers }, ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}) });
}
function saveInput() {
  const p = supportedPreparation();
  return { id: p.id, year: p.year, revision: p.revision, rulesVersion: p.rulesVersion, answers: p.answers, checklist: {} };
}
function privateResponse(response) {
  assert.match(response.headers.get('cache-control'), /private.*no-store/);
  assert.match(response.headers.get('vary'), /Cookie/);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
}

test('actual API guard and owner query paths deny missing identity and cross-owner data', async t => {
  const db = new SQLiteD1(); t.after(() => db.close());
  for (const name of readdirSync(join(__dirname, '..', 'drizzle')).filter(n => n.endsWith('.sql')).sort()) db.exec(readFileSync(join(__dirname, '..', 'drizzle', name), 'utf8'));
  transport.env.DB = db; transport.user = null;
  for (const response of await Promise.all([
    preparation.GET(request()), preparation.PUT(request(undefined, { method: 'PUT', body: saveInput() })),
    exportsRoute.GET(request('/api/export?year=2026')), account.GET(),
    account.DELETE(request('/api/account', { method: 'DELETE', body: { confirmation: 'DELETE MY PREPARATIONS' } })),
  ])) { assert.equal(response.status, 401); privateResponse(response); }

  transport.user = 'fictional-alice';
  const createdResponse = await preparation.PUT(request(undefined, { method: 'PUT', body: saveInput() }));
  assert.equal(createdResponse.status, 200); privateResponse(createdResponse);
  const created = (await createdResponse.json()).preparation;
  assert.equal(created.revision, 1);
  const savedInput = { ...saveInput(), id: created.id, revision: 1 };
  const aliceExport = await exportsRoute.GET(request('/api/export?year=2026'));
  assert.equal(aliceExport.status, 200); privateResponse(aliceExport);
  assert.equal((await aliceExport.json()).estimate.liability, 135632);

  transport.user = 'fictional-bob';
  assert.equal((await (await preparation.GET(request())).json()).preparation, null);
  assert.deepEqual((await (await account.GET()).json()).preparations, []);
  assert.equal((await exportsRoute.GET(request('/api/export?year=2026'))).status, 404);
  assert.equal((await preparation.PUT(request(undefined, { method: 'PUT', body: savedInput }))).status, 409);
  assert.equal((await (await account.DELETE(request('/api/account', { method: 'DELETE', body: { confirmation: 'DELETE MY PREPARATIONS' } }))).json()).deleted, 0);

  transport.user = 'fictional-alice';
  assert.equal((await (await preparation.GET(request())).json()).preparation.id, created.id);
  assert.equal((await preparation.GET(request('/api/preparation?year=2028'))).status, 400);
  for (const headers of [{ origin: 'https://other.example' }, { origin: '' }, { 'content-type': 'text/plain' }]) assert.equal((await preparation.PUT(request(undefined, { method: 'PUT', body: savedInput, headers }))).status, 403);
  for (const body of [{ ...savedInput, ownerId: 'fictional-bob' }, { ...savedInput, result: { liability: 0 } }, { ...savedInput, answers: { ...savedInput.answers, salary: '-1' } }, '{invalid json']) assert.equal((await preparation.PUT(request(undefined, { method: 'PUT', body }))).status, 400);
  assert.equal((await preparation.PUT(request(undefined, { method: 'PUT', body: 'x'.repeat(20001) }))).status, 413);
  assert.equal((await (await preparation.GET(request())).json()).preparation.revision, 1);

  const unsupported = structuredClone(savedInput); unsupported.answers.scope.business = 'yes';
  assert.equal((await preparation.PUT(request(undefined, { method: 'PUT', body: unsupported }))).status, 200);
  const blockedExport = await exportsRoute.GET(request('/api/export?year=2026'));
  const pack = await blockedExport.json();
  assert.equal(pack.estimate, null); assert.ok(pack.blockers.length);
  assert.equal((await (await account.GET()).json()).preparations[0].pack.estimate, null);
  const textExport = await exportsRoute.GET(request('/api/export?year=2026&format=text'));
  assert.match(textExport.headers.get('content-disposition'), /joff-tax-2026-preparation.txt/);
  assert.match(await textExport.text(), /Overall estimate unavailable/);
  for (const body of [{ confirmation: 'DELETE' }, { confirmation: 'DELETE MY PREPARATIONS', ownerId: 'fictional-bob' }]) assert.equal((await account.DELETE(request('/api/account', { method: 'DELETE', body }))).status, 400);
  assert.equal((await (await account.DELETE(request('/api/account', { method: 'DELETE', body: { confirmation: 'DELETE MY PREPARATIONS' } }))).json()).deleted, 1);
  assert.equal((await exportsRoute.GET(request('/api/export?year=2026'))).status, 404);
});
