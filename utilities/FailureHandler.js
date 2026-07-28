import fs from 'fs';
import path from 'path';
import Logger from './Logger.js';

export class FailureHandler {
  static async handleFailure(driver, testName, error) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeTestName = testName.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    const baseFailureDir = path.resolve(process.cwd(), 'reports', 'failures');
    const screenshotDir = path.join(baseFailureDir, 'screenshots');
    const logsDir = path.join(baseFailureDir, 'logs');

    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    let currentUrl = 'N/A';
    let screenshotPath = 'N/A';
    let consoleLogsPath = 'N/A';
    let browserLogs = [];

    if (driver) {
      try {
        currentUrl = await driver.getCurrentUrl();
      } catch (err) {
        Logger.warn(`Failed to retrieve current URL during failure handling: ${err.message}`);
      }

      try {
        const imageBuffer = await driver.takeScreenshot();
        screenshotPath = path.join(screenshotDir, `${safeTestName}_${timestamp}.png`);
        fs.writeFileSync(screenshotPath, imageBuffer, 'base64');
        Logger.info(`Failure screenshot saved to: ${screenshotPath}`);
      } catch (err) {
        Logger.error(`Failed to capture screenshot: ${err.message}`);
      }

      try {
        const logEntries = await driver.manage().logs().get('browser');
        browserLogs = logEntries.map(entry => `[${new Date(entry.timestamp).toISOString()}] [${entry.level.name}] ${entry.message}`);
        
        if (browserLogs.length > 0) {
          consoleLogsPath = path.join(logsDir, `${safeTestName}_${timestamp}_browser.log`);
          fs.writeFileSync(consoleLogsPath, browserLogs.join('\n'), 'utf8');
          Logger.info(`Captured ${browserLogs.length} browser console log entries to ${consoleLogsPath}`);
        }
      } catch (err) {
        Logger.warn(`Browser console log retrieval not supported or empty: ${err.message}`);
      }
    }

    const failureRecord = {
      testName,
      timestamp: new Date().toISOString(),
      currentUrl,
      failureReason: error.message || 'Unknown Error',
      stackTrace: error.stack || 'No Stack Trace',
      screenshotPath,
      consoleLogsPath,
      browserLogs
    };

    const recordPath = path.join(baseFailureDir, `${safeTestName}_${timestamp}_details.json`);
    fs.writeFileSync(recordPath, JSON.stringify(failureRecord, null, 2), 'utf8');

    Logger.error(`TEST FAILURE DETECTED: [${testName}]`);
    Logger.error(`URL: ${currentUrl}`);
    Logger.error(`Reason: ${failureRecord.failureReason}`);

    return failureRecord;
  }
}

export default FailureHandler;
