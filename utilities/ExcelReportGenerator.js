import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import Config from '../config/env.config.js';
import Logger from './Logger.js';

export class ExcelReportGenerator {
  static async generateReport(testResults = [], executionLogs = [], failureRecords = [], suiteMetrics = {}) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Enterprise E2E Selenium Automation Framework';
    workbook.created = new Date();

    const headerFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1F4E79' }
    };
    const headerFont = { color: { argb: 'FFFFFF' }, bold: true, size: 11 };
    const borderStyle = {
      top: { style: 'thin', color: { argb: 'D9D9D9' } },
      left: { style: 'thin', color: { argb: 'D9D9D9' } },
      bottom: { style: 'thin', color: { argb: 'D9D9D9' } },
      right: { style: 'thin', color: { argb: 'D9D9D9' } }
    };

    // -------------------------------------------------------------
    // SHEET 1: SUMMARY
    // -------------------------------------------------------------
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 28 },
      { header: 'Value', key: 'value', width: 35 }
    ];

    const total = suiteMetrics.total || testResults.length;
    const passed = suiteMetrics.passed || testResults.filter(t => t.status === 'PASSED').length;
    const failed = suiteMetrics.failed || testResults.filter(t => t.status === 'FAILED').length;
    const skipped = suiteMetrics.skipped || testResults.filter(t => t.status === 'SKIPPED').length;
    const passPercentage = total > 0 ? ((passed / total) * 100).toFixed(2) + '%' : '0%';
    const duration = suiteMetrics.duration || '0s';

    const summaryRows = [
      { metric: 'Execution Date', value: new Date().toLocaleString() },
      { metric: 'Environment', value: Config.environment.toUpperCase() },
      { metric: 'Browser', value: Config.browser.toUpperCase() },
      { metric: 'Execution Mode', value: Config.headless ? 'Headless' : 'Headed' },
      { metric: 'Total Tests', value: total },
      { metric: 'Passed Tests', value: passed },
      { metric: 'Failed Tests', value: failed },
      { metric: 'Skipped Tests', value: skipped },
      { metric: 'Pass Percentage', value: passPercentage },
      { metric: 'Total Duration', value: duration }
    ];

    summarySheet.addRows(summaryRows);
    summarySheet.getRow(1).eachCell(cell => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    summarySheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell(cell => {
          cell.border = borderStyle;
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        });
      }
    });

    // -------------------------------------------------------------
    // SHEET 2: TEST CASES
    // -------------------------------------------------------------
    const testCasesSheet = workbook.addWorksheet('Test Cases');
    testCasesSheet.columns = [
      { header: 'Test ID', key: 'id', width: 12 },
      { header: 'Module', key: 'module', width: 20 },
      { header: 'Scenario Name', key: 'name', width: 45 },
      { header: 'Browser', key: 'browser', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Start Time', key: 'startTime', width: 22 },
      { header: 'End Time', key: 'endTime', width: 22 },
      { header: 'Duration (ms)', key: 'duration', width: 18 }
    ];

    testResults.forEach((test, idx) => {
      testCasesSheet.addRow({
        id: `TC-${String(idx + 1).padStart(3, '0')}`,
        module: test.module || 'E2E',
        name: test.name || 'Test Scenario',
        browser: test.browser || Config.browser,
        status: test.status || 'PASSED',
        startTime: test.startTime || 'N/A',
        endTime: test.endTime || 'N/A',
        duration: test.duration || 0
      });
    });

    testCasesSheet.getRow(1).eachCell(cell => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    testCasesSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const statusCell = row.getCell('status');
        row.eachCell(cell => { cell.border = borderStyle; });
        if (statusCell.value === 'PASSED') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6EFCE' } };
          statusCell.font = { color: { argb: '006100' }, bold: true };
        } else if (statusCell.value === 'FAILED') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC7CE' } };
          statusCell.font = { color: { argb: '9C0006' }, bold: true };
        } else {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEB9C' } };
          statusCell.font = { color: { argb: '9C6500' }, bold: true };
        }
      }
    });

    // -------------------------------------------------------------
    // SHEET 3: FAILED TESTS
    // -------------------------------------------------------------
    const failedSheet = workbook.addWorksheet('Failed Tests');
    failedSheet.columns = [
      { header: 'Test Name', key: 'testName', width: 35 },
      { header: 'Failure Reason', key: 'failureReason', width: 50 },
      { header: 'Screenshot Path', key: 'screenshotPath', width: 45 },
      { header: 'Browser', key: 'browser', width: 15 },
      { header: 'URL', key: 'url', width: 40 }
    ];

    failureRecords.forEach(fail => {
      failedSheet.addRow({
        testName: fail.testName,
        failureReason: fail.failureReason,
        screenshotPath: fail.screenshotPath,
        browser: Config.browser,
        url: fail.currentUrl
      });
    });

    failedSheet.getRow(1).eachCell(cell => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    failedSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell(cell => { cell.border = borderStyle; });
      }
    });

    // -------------------------------------------------------------
    // SHEET 4: EXECUTION LOGS
    // -------------------------------------------------------------
    const logsSheet = workbook.addWorksheet('Execution Logs');
    logsSheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 22 },
      { header: 'Test Name', key: 'testName', width: 35 },
      { header: 'Step Description', key: 'step', width: 50 },
      { header: 'Result', key: 'result', width: 15 },
      { header: 'Remarks', key: 'remarks', width: 30 }
    ];

    executionLogs.forEach(log => {
      logsSheet.addRow({
        timestamp: log.timestamp || new Date().toISOString(),
        testName: log.testName || 'Global',
        step: log.step || 'Step',
        result: log.result || 'INFO',
        remarks: log.remarks || ''
      });
    });

    logsSheet.getRow(1).eachCell(cell => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    logsSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell(cell => { cell.border = borderStyle; });
      }
    });

    // Write file to disk
    const excelDir = path.resolve(process.cwd(), 'excel');
    if (!fs.existsSync(excelDir)) {
      fs.mkdirSync(excelDir, { recursive: true });
    }

    const reportFilePath = path.join(excelDir, 'E2E_Report.xlsx');
    await workbook.xlsx.writeFile(reportFilePath);
    Logger.info(`Excel report successfully generated at: ${reportFilePath}`);
    return reportFilePath;
  }
}

export default ExcelReportGenerator;
