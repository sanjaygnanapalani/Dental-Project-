import DriverFactory from '../../utilities/DriverFactory.js';
import Logger from '../../utilities/Logger.js';
import FailureHandler from '../../utilities/FailureHandler.js';
import ExcelReportGenerator from '../../utilities/ExcelReportGenerator.js';
import Config from '../../config/env.config.js';

export const testResults = [];
export const executionLogs = [];
export const failureRecords = [];

let startTimeMap = new Map();

export const mochaHooks = {
  async beforeAll() {
    Logger.info('========================================================================');
    Logger.info(`Starting Enterprise E2E Test Suite Execution (Env: ${Config.environment}, Browser: ${Config.browser})`);
    Logger.info('========================================================================');
    executionLogs.push({
      timestamp: new Date().toISOString(),
      testName: 'Suite Setup',
      step: 'Initialize E2E Test Execution Suite',
      result: 'PASSED',
      remarks: `Environment: ${Config.environment}, Headless: ${Config.headless}`
    });
  },

  async beforeEach() {
    const testTitle = this.currentTest ? this.currentTest.fullTitle() : 'Unknown Test';
    startTimeMap.set(testTitle, Date.now());
    Logger.info(`--> Executing Test: [${testTitle}]`);
    executionLogs.push({
      timestamp: new Date().toISOString(),
      testName: testTitle,
      step: 'Test Execution Started',
      result: 'INFO',
      remarks: 'Driver session ready'
    });
  },

  async afterEach() {
    const test = this.currentTest;
    const testTitle = test ? test.fullTitle() : 'Unknown Test';
    const startTime = startTimeMap.get(testTitle) || Date.now();
    const duration = Date.now() - startTime;
    const status = test.state === 'passed' ? 'PASSED' : (test.state === 'failed' ? 'FAILED' : 'SKIPPED');

    Logger.info(`<-- Test Completed: [${testTitle}] - Status: ${status} (${duration}ms)`);

    const resultRecord = {
      module: test.parent ? test.parent.title : 'General',
      name: test.title,
      browser: Config.browser,
      status: status,
      startTime: new Date(startTime).toLocaleTimeString(),
      endTime: new Date().toLocaleTimeString(),
      duration: duration
    };

    testResults.push(resultRecord);

    if (test.state === 'failed') {
      const driver = this.driver || (global.driver);
      const failDetail = await FailureHandler.handleFailure(driver, testTitle, test.err || new Error('Test Assertion Failed'));
      failureRecords.push(failDetail);

      executionLogs.push({
        timestamp: new Date().toISOString(),
        testName: testTitle,
        step: 'Test Execution Failed',
        result: 'FAILED',
        remarks: test.err ? test.err.message : 'Assertion error'
      });
    } else {
      executionLogs.push({
        timestamp: new Date().toISOString(),
        testName: testTitle,
        step: 'Test Execution Passed',
        result: 'PASSED',
        remarks: 'All assertions verified'
      });
    }
  },

  async afterAll() {
    Logger.info('========================================================================');
    Logger.info('Finished Enterprise E2E Test Suite Execution. Generating Excel Report...');
    Logger.info('========================================================================');

    try {
      await ExcelReportGenerator.generateReport(testResults, executionLogs, failureRecords);
    } catch (err) {
      Logger.error(`Failed to generate Excel report in afterAll hook: ${err.message}`);
    }
  }
};
