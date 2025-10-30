/**
 * Flaky Test Reporter for Playwright
 * 
 * Custom reporter that flags tests passing on retry as potentially flaky.
 * Logs flaky tests for review and potential quarantine.
 * 
 * Usage:
 * Add to playwright.config.ts:
 * ```typescript
 * reporter: [
 *   ['html'],
 *   ['./tests/config/flaky-test-reporter.ts'],
 * ]
 * ```
 */

import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

interface FlakyTestRecord {
  testId: string;
  title: string;
  file: string;
  line: number;
  retryCount: number;
  timestamp: string;
  error?: string;
}

class FlakyTestReporter implements Reporter {
  private flakyTests: FlakyTestRecord[] = [];
  private outputDir: string;

  constructor(options?: { outputDir?: string }) {
    this.outputDir = options?.outputDir || 'test-results';
  }

  onBegin(config: FullConfig, suite: Suite) {
    console.log(`\n🧪 Starting test run with ${suite.allTests().length} tests\n`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    // Test passed on retry - FLAG AS POTENTIALLY FLAKY
    if (result.status === 'passed' && result.retry > 0) {
      const flakyTest: FlakyTestRecord = {
        testId: test.id,
        title: test.title,
        file: test.location.file,
        line: test.location.line,
        retryCount: result.retry,
        timestamp: new Date().toISOString(),
        error: result.errors[0]?.message,
      };

      this.flakyTests.push(flakyTest);

      console.warn(`⚠️  FLAKY TEST DETECTED:`);
      console.warn(`   Test: ${test.title}`);
      console.warn(`   File: ${test.location.file}:${test.location.line}`);
      console.warn(`   Passed on retry: ${result.retry}`);
      console.warn('');
    }

    // Test failed after all retries
    if (result.status === 'failed' || result.status === 'timedOut') {
      console.error(`❌ Test failed: ${test.title}`);
    }
  }

  async onEnd(result: FullResult) {
    console.log(`\n📊 Test Results: ${result.status}`);

    if (this.flakyTests.length > 0) {
      console.warn(`\n⚠️  FLAKY TESTS SUMMARY: ${this.flakyTests.length} flaky test(s) detected\n`);

      // Write flaky tests to file
      await this.writeFlakyTestsReport();

      // Print summary
      this.flakyTests.forEach((test) => {
        console.warn(`  • ${test.title}`);
        console.warn(`    ${test.file}:${test.line}`);
        console.warn(`    Passed on retry ${test.retryCount}\n`);
      });

      console.warn(`\n📝 Flaky test report saved to: ${this.outputDir}/flaky-tests.json`);
      console.warn('   Consider moving these tests to quarantine: tests/quarantine/\n');
    } else {
      console.log('✅ No flaky tests detected\n');
    }
  }

  private async writeFlakyTestsReport(): Promise<void> {
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const reportPath = path.join(this.outputDir, 'flaky-tests.json');

    // Load existing flaky tests
    let existingTests: FlakyTestRecord[] = [];
    if (fs.existsSync(reportPath)) {
      try {
        const content = fs.readFileSync(reportPath, 'utf-8');
        existingTests = JSON.parse(content);
      } catch (error) {
        console.error('Failed to load existing flaky tests report:', error);
      }
    }

    // Merge with new flaky tests
    const allTests = [...existingTests, ...this.flakyTests];

    // Write updated report
    fs.writeFileSync(
      reportPath,
      JSON.stringify(allTests, null, 2),
      'utf-8'
    );

    // Also write human-readable markdown report
    await this.writeMarkdownReport(allTests);
  }

  private async writeMarkdownReport(tests: FlakyTestRecord[]): Promise<void> {
    const reportPath = path.join(this.outputDir, 'flaky-tests.md');

    let markdown = '# Flaky Tests Report\n\n';
    markdown += `Generated: ${new Date().toISOString()}\n\n`;
    markdown += `Total flaky tests: ${tests.length}\n\n`;

    // Group by file
    const groupedByFile = tests.reduce((acc, test) => {
      if (!acc[test.file]) {
        acc[test.file] = [];
      }
      acc[test.file].push(test);
      return acc;
    }, {} as Record<string, FlakyTestRecord[]>);

    for (const [file, fileTests] of Object.entries(groupedByFile)) {
      markdown += `## ${file}\n\n`;

      for (const test of fileTests) {
        markdown += `### ${test.title}\n\n`;
        markdown += `- **Line**: ${test.line}\n`;
        markdown += `- **Retry Count**: ${test.retryCount}\n`;
        markdown += `- **Timestamp**: ${test.timestamp}\n`;
        if (test.error) {
          markdown += `- **Error**: \`${test.error.substring(0, 100)}...\`\n`;
        }
        markdown += '\n';
      }
    }

    markdown += '\n## Recommended Actions\n\n';
    markdown += '1. Review each flaky test for race conditions or timing issues\n';
    markdown += '2. Add explicit waits or improve test stability\n';
    markdown += '3. Move persistent flaky tests to `tests/quarantine/`\n';
    markdown += '4. Update selectors to use more stable identifiers\n';

    fs.writeFileSync(reportPath, markdown, 'utf-8');
  }
}

export default FlakyTestReporter;

