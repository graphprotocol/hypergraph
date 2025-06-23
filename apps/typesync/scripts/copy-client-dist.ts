import { cp, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

(async () => {
  try {
    const src = resolve(process.cwd(), 'client', 'dist');
    const dest = resolve(process.cwd(), 'dist', 'client', 'dist');

    await mkdir(dest, { recursive: true });
    // Node >=16.7 has cp with recursive
    await cp(src, dest, { recursive: true });

    console.info('[Build] Copied client/dist to dist/client/dist');
  } catch (err) {
    console.error('[Build] Failed to copy client/dist', err);
    process.exitCode = 1;
  }
})();
