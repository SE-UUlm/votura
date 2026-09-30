import { spawn } from 'node:child_process';

const timestamp = () => new Date().toISOString();
const log = (message) => {
  process.stderr.write(`[e2e-runner] ${message} ${timestamp()}\n`);
};

const playwrightCommand = process.platform === 'win32' ? 'playwright.cmd' : 'playwright';

log('starting Playwright');
const playwright = spawn(playwrightCommand, ['test'], {
  stdio: 'inherit',
  shell: false,
});

const heartbeat = setInterval(() => {
  log(`Playwright is still running (PID ${playwright.pid ?? 'unknown'})`);
}, 30000);

const stopHeartbeat = () => {
  clearInterval(heartbeat);
};

playwright.once('error', (error) => {
  stopHeartbeat();
  log(`failed to start Playwright: ${error.message}`);
  process.exitCode = 1;
});

playwright.once('close', (code, signal) => {
  stopHeartbeat();
  log(`Playwright finished with code=${code ?? 'null'}, signal=${signal ?? 'none'}`);
  if (signal == null) {
    process.exitCode = code ?? 1;
  } else {
    process.exitCode = 1;
  }
});
