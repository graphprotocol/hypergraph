import * as Fs from 'node:fs';
import * as Glob from 'glob';

const dirs = ['.', ...Glob.sync('packages/*/')];
for (const pkg of dirs) {
  const files = ['.tsbuildinfo', 'build', 'dist'];

  for (const file of files) {
    Fs.rmSync(`${pkg}/${file}`, { recursive: true, force: true }, () => {});
  }
}
