import { execFileSync, spawn } from 'node:child_process';

const node = process.execPath;

execFileSync(node, ['/app/packages/db/dist/migrate.js'], {
  stdio: 'inherit',
});

const backend = spawn(node, ['/app/apps/backend/dist/main.js'], {
  stdio: 'inherit',
});

backend.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 1);
  }
});
