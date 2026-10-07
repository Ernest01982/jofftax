const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const { join } = require('node:path');
const { SQLiteD1 } = require('./sqlite-d1.cjs');
const { emptyPreparation } = require(join(process.env.JOFF_TEST_BUILD_DIRECTORY, 'model.js'));
const { preparationPack } = require(join(process.env.JOFF_TEST_BUILD_DIRECTORY, 'export.js'));
const { loadPreparation, savePreparation, listPreparations, deletePreparations, ConflictError } = require(join(process.env.JOFF_TEST_BUILD_DIRECTORY, 'repository.js'));

function database(t) {
  const db = new SQLiteD1();
  t.after(() => db.close());
  // Exercise the committed migration rather than recreating a lookalike schema.
  const directory = join(__dirname, '..', 'drizzle');
  const migrations = readdirSync(directory).filter(n => n.endsWith('.sql')).sort();
  assert.ok(migrations.length, 'At least one migration is required');
  for (const migration of migrations) db.exec(readFileSync(join(directory, migration), 'utf8'));
  return db;
}
function input(year = 2026) {
  const p = emptyPreparation(year);
  return { id: p.id, year, revision: p.revision, rulesVersion: p.rulesVersion, answers: p.answers, checklist: p.checklist };
}

test('actual SQLite persistence isolates every owner/year query path and export source', async t => {
  const db = database(t);
  const alice = await savePreparation(db, 'fictional-alice', input());
  const nextYear = await savePreparation(db, 'fictional-alice', input(2027));
  const bob = await savePreparation(db, 'fictional-bob', { ...input(), checklist: { employment: 'ready' } });
  assert.equal(alice.revision, 1);
  assert.equal(alice.year, 2026);
  assert.ok(alice.createdAt && alice.updatedAt);
  assert.notEqual(alice.id, bob.id);
  assert.equal((await loadPreparation(db, 'fictional-alice', 2026)).id, alice.id);
  assert.deepEqual((await listPreparations(db, 'fictional-alice')).map(p => p.id), [alice.id, nextYear.id]);
  assert.deepEqual((await listPreparations(db, 'fictional-bob')).map(p => p.id), [bob.id]);
  assert.equal(await loadPreparation(db, 'fictional-mallory', 2026), null);
  assert.deepEqual(await listPreparations(db, 'fictional-mallory'), []);
  await assert.rejects(savePreparation(db, 'fictional-mallory', { ...input(), id: alice.id, revision: alice.revision }), ConflictError);
  assert.equal(await deletePreparations(db, 'fictional-mallory'), 0);
  const exportSource = await loadPreparation(db, 'fictional-bob', 2026);
  const pack = preparationPack(exportSource, '2026-10-07T00:00:00.000Z');
  assert.equal(pack.assessmentYear, 2026);
  assert.equal(exportSource.id, bob.id);
  assert.equal(exportSource.checklist.employment, 'ready');
  assert.equal((await loadPreparation(db, 'fictional-alice', 2026)).checklist.employment, undefined);
  assert.equal(await deletePreparations(db, 'fictional-bob'), 1);
  assert.equal(await loadPreparation(db, 'fictional-bob', 2026), null);
  assert.equal((await listPreparations(db, 'fictional-alice')).length, 2);
});

test('missing identity is denied for read, list, save, and delete', async t => {
  const db = database(t);
  for (const operation of [
    () => loadPreparation(db, '', 2026), () => listPreparations(db, ''),
    () => savePreparation(db, '', input()), () => deletePreparations(db, ''),
  ]) await assert.rejects(operation, /Identity required/);
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS count FROM preparations').get().count, 0);
});

test('actual SQLite insert/update predicates admit exactly one competing revision', async t => {
  const db = database(t);
  const creates = await Promise.allSettled([
    savePreparation(db, 'fictional-owner', input()),
    savePreparation(db, 'fictional-owner', input()),
  ]);
  assert.equal(creates.filter(r => r.status === 'fulfilled').length, 1);
  assert.ok(creates.find(r => r.status === 'rejected').reason instanceof ConflictError);
  const first = await loadPreparation(db, 'fictional-owner', 2026);
  const changes = await Promise.allSettled([
    savePreparation(db, 'fictional-owner', { ...input(), id: first.id, revision: first.revision, checklist: { employment: 'ready' } }),
    savePreparation(db, 'fictional-owner', { ...input(), id: first.id, revision: first.revision, checklist: { employment: 'notApplicable' } }),
  ]);
  assert.equal(changes.filter(r => r.status === 'fulfilled').length, 1);
  assert.ok(changes.find(r => r.status === 'rejected').reason instanceof ConflictError);
  const winner = changes.find(r => r.status === 'fulfilled').value;
  const stored = await loadPreparation(db, 'fictional-owner', 2026);
  assert.equal(stored.revision, 2);
  assert.deepEqual(stored.checklist, winner.checklist);
  await assert.rejects(savePreparation(db, 'fictional-owner', { ...input(), id: first.id, revision: 1 }), ConflictError);
  assert.equal((await loadPreparation(db, 'fictional-owner', 2026)).revision, 2);
});

test('crafted ownership, result, rules, and invalid stored schema cannot change a record', async t => {
  const db = database(t);
  const saved = await savePreparation(db, 'fictional-owner', input());
  for (const extra of [{ owner_id: 'fictional-victim' }, { ownerId: 'fictional-victim' }, { result: { liability: 0 } }, { id: 'fictional-other-record' }]) {
    await assert.rejects(savePreparation(db, 'fictional-owner', { ...input(), id: saved.id, revision: saved.revision, ...extra }));
  }
  await assert.rejects(savePreparation(db, 'fictional-owner', { ...input(), id: saved.id, revision: saved.revision, rulesVersion: 'forged-rules' }), ConflictError);
  assert.equal((await loadPreparation(db, 'fictional-owner', 2026)).revision, 1);
  db.sqlite.prepare('UPDATE preparations SET schema_version = 999 WHERE owner_id = ?').run('fictional-owner');
  await assert.rejects(loadPreparation(db, 'fictional-owner', 2026), /schema/i);
});

test('a stale tab cannot update a deleted and recreated owner/year record', async t => {
  const db = database(t);
  const old = await savePreparation(db, 'fictional-owner', input());
  await deletePreparations(db, 'fictional-owner');
  const replacement = await savePreparation(db, 'fictional-owner', input());
  assert.equal(old.revision, replacement.revision);
  assert.notEqual(old.id, replacement.id);
  await assert.rejects(savePreparation(db, 'fictional-owner', {
    ...input(), id: old.id, revision: old.revision, checklist: { employment: 'ready' },
  }), ConflictError);
  assert.deepEqual((await loadPreparation(db, 'fictional-owner', 2026)).checklist, {});
});
