import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';

// Compile the actual pure application modules with the already installed TS
// compiler. The build gate separately checks types; this runner adds no packages.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const build = mkdtempSync(join(root, 'tests', '.verification-'));
try {
  for (const name of ['rules', 'model', 'calculation', 'export', 'repository', 'api', 'calculators', 'calculator-families', 'calculator-personal', 'calculator-specialists']) {
    const source = readFileSync(join(root, 'lib', `${name}.ts`), 'utf8');
    const output = ts.transpileModule(source, {
      fileName: `${name}.ts`,
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
      reportDiagnostics: true,
    });
    const errors = output.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error) || [];
    if (errors.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(errors, {
      getCurrentDirectory: () => root, getCanonicalFileName: n => n, getNewLine: () => '\n',
    }));
    writeFileSync(join(build, `${name}.js`), output.outputText);
  }
  const presentationSource = readFileSync(join(root, 'app', 'calculators', 'calculator-presentation.ts'), 'utf8');
  const presentation = ts.transpileModule(presentationSource, {
    fileName: 'calculator-presentation.ts', compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  });
  writeFileSync(join(build, 'calculator-presentation.js'), presentation.outputText.replaceAll('../../lib/rules', './rules'));
  mkdirSync(join(build, 'routes'));
  for (const name of ['preparation', 'export', 'account']) {
    const source = readFileSync(join(root, 'app', 'api', name, 'route.ts'), 'utf8');
    const output = ts.transpileModule(source, {
      fileName: 'route.ts', compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    });
    // Preserve route code; relocate relative paths to the temporary core modules.
    writeFileSync(join(build, 'routes', `${name}.js`), output.outputText.replaceAll('../../../lib/', '../'));
  }
  writeFileSync(join(build, 'package.json'), '{"type":"commonjs"}\n');
  const tests = readdirSync(join(root, 'tests')).filter(n => n.endsWith('.test.cjs')).map(n => join(root, 'tests', n));
  const result = spawnSync(process.execPath, ['--test', ...tests], {
    cwd: root, stdio: 'inherit', env: { ...process.env, JOFF_TEST_BUILD_DIRECTORY: build },
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(build, { recursive: true, force: true });
}
