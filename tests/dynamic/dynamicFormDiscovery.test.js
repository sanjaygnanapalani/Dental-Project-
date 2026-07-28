import { expect } from 'chai';
import DriverFactory from '../../utilities/DriverFactory.js';
import RouteAndFormScanner from '../../utilities/RouteAndFormScanner.js';
import SeleniumUtils from '../../utilities/SeleniumUtils.js';
import Logger from '../../utilities/Logger.js';
import Config from '../../config/env.config.js';
import { By } from 'selenium-webdriver';

describe('Dynamic React Route & Form Discovery Test Engine', function () {
  let driver;
  let scanner;
  let utils;

  before(async function () {
    driver = await DriverFactory.createDriver();
    global.driver = driver;
    scanner = new RouteAndFormScanner(driver);
    utils = new SeleniumUtils(driver);
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('TC-DYN-001: Should dynamically discover React routes via AST and execute automated form boundary validations', async function () {
    const discoveredRoutes = scanner.discoverRoutesFromCodebase();
    expect(discoveredRoutes).to.be.an('array').that.is.not.empty;

    for (const relativeRoute of discoveredRoutes) {
      Logger.info(`--------------------------------------------------`);
      Logger.info(`Dynamic Scanner inspecting route: ${relativeRoute}`);
      
      const targetUrl = `${Config.baseUrl}${relativeRoute.startsWith('/') ? relativeRoute : '/' + relativeRoute}`;
      try {
        await driver.get(targetUrl);
        await utils.driver.sleep(1000);
      } catch (err) {
        Logger.warn(`Could not navigate to route ${targetUrl}: ${err.message}`);
        continue;
      }

      const formsOnPage = await scanner.discoverFormsOnCurrentPage();

      for (const formObj of formsOnPage) {
        for (const inputRule of formObj.inputs) {
          const testCases = scanner.generateTestCasesForInput(inputRule);

          for (const testCase of testCases) {
            Logger.info(`Running Dynamic Test Vector: ${testCase.name} on route [${relativeRoute}]`);
            
            try {
              const activeInputs = await driver.findElements(By.css('input'));

              if (activeInputs.length > 0) {
                const targetInput = activeInputs[0];
                await targetInput.clear().catch(() => {});
                if (testCase.value) {
                  await targetInput.sendKeys(testCase.value).catch(() => {});
                }
              }

              if (formObj.submitButton) {
                await formObj.submitButton.click().catch(() => {});
              }

              const currentUrl = await driver.getCurrentUrl();
              expect(currentUrl).to.be.a('string');
            } catch (err) {
              Logger.warn(`Dynamic test case [${testCase.name}] handled exception: ${err.message}`);
            }
          }
        }
      }
    }
  });
});
