import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { accessSync, constants, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readExecutionProfile } from "./execution-profile.mjs";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const requiredVersion = "11.25.0";

export function runInstaller({
  profile = readExecutionProfile(), root = projectRoot,
  env = process.env, platform = process.platform, run = spawnSync,
} = {}) {
  if (profile === "managed-linux") {
    const result = run("bash", [path.join(root, "scripts/install-pnpm.sh")], {
      cwd: root, env, stdio: "inherit",
    });
    if (result.error) throw result.error;
    return result.status ?? 1;
  }

  // pnpm run supplies its JS entrypoint. An explicit pinned entrypoint also
  // supports hosts without a working global package-manager shim.
  const cli = env.SITES_PNPM_BIN || env.npm_execpath;
  if (!cli) throw new Error("Run install:ci with pnpm 11.25.0, or set SITES_PNPM_BIN to its JavaScript entrypoint.");
  const version = run(process.execPath, [cli, "--version"], {
    cwd: root, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
  });
  if (version.error) throw version.error;
  if (version.status !== 0 || version.stdout?.trim() !== requiredVersion) {
    throw new Error("This project requires pnpm 11.25.0; the lockfile and package manager will not be replaced.");
  }

  // Keep the caller's store, cache, proxy, retry and lifecycle-script policy.
  const result = run(process.execPath, [cli, "install", "--frozen-lockfile",
    "--prod=false", "--prefer-offline"], { cwd: root, env, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) return result.status ?? 1;
  accessSync(path.join(root, "node_modules", ".bin", platform === "win32" ? "vinext.cmd" : "vinext"),
    platform === "win32" ? constants.F_OK : constants.X_OK);
  writeFileSync(path.join(root, "node_modules", ".sites-install.json"), `${JSON.stringify({
    package_manager: `pnpm@${requiredVersion}`,
    lockfile_sha256: createHash("sha256").update(readFileSync(path.join(root, "pnpm-lock.yaml"))).digest("hex"),
    node: process.version,
    platform: `${platform}-${process.arch}`,
  }, null, 2)}\n`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = runInstaller();
}
