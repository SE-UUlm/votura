import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

const writeLog = (message: string): void => {
  process.stderr.write(`[e2e] ${message} ${new Date().toISOString()}\n`);
};

const getTestId = (test: TestCase): string => test.titlePath().join(' > ');

class ProgressReporter implements Reporter {
  onBegin(config: FullConfig, suite: Suite): void {
    writeLog(`test run started: ${suite.allTests().length} tests, ${config.workers} worker(s)`);
  }

  onTestBegin(test: TestCase): void {
    writeLog(`test started: ${getTestId(test)}`);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    writeLog(
      `test finished: ${getTestId(test)}; status=${result.status}; duration=${result.duration}ms`,
    );
  }

  onEnd(result: FullResult): void {
    writeLog(`test run finished: status=${result.status}`);
  }

  async onExit(): Promise<void> {
    writeLog('playwright process exiting');
    await Promise.resolve();
  }
}

export default ProgressReporter;
