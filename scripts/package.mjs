import * as Fs from 'node:fs';

const pkg = process.cwd();
if (Fs.existsSync(`${pkg}/publish`) && Fs.statSync(`${pkg}/publish`).isDirectory()) {
  Fs.rmSync(`${pkg}/publish`, { recursive: true, force: true });
}

Fs.mkdirSync(`${pkg}/publish`);
Fs.cpSync(`${pkg}/dist`, `${pkg}/publish/dist`, { recursive: true });
Fs.cpSync(`${pkg}/src`, `${pkg}/publish/src`, { recursive: true });

if (Fs.existsSync(`${pkg}/README.md`)) {
  Fs.cpSync(`${pkg}/README.md`, `${pkg}/publish/README.md`);
}

if (Fs.existsSync(`${pkg}/LICENSE`)) {
  Fs.cpSync(`${pkg}/LICENSE`, `${pkg}/publish/LICENSE`);
}

// TODO: Generate this a bit smarter.
const pkgJson = JSON.parse(Fs.readFileSync(`${pkg}/package.json`, 'utf-8'));
const publishPkgJson = {
  name: pkgJson.name,
  version: pkgJson.version,
  description: pkgJson.description,
  repository: pkgJson.repository,
  type: pkgJson.type,
  url: pkgJson.url,
  directory: pkgJson.directory,
  license: pkgJson.license,
  main: pkgJson.main,
  module: pkgJson.module,
  types: pkgJson.types,
  sideEffects: pkgJson.sideEffects,
  exports: pkgJson.exports,
  peerDependencies: pkgJson.peerDependencies,
  dependencies: pkgJson.dependencies,
  publishConfig: {
    provenance: true,
  },
};

Fs.writeFileSync(`${pkg}/publish/package.json`, JSON.stringify(publishPkgJson, undefined, 2));
