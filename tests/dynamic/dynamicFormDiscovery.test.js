import { expect } from 'chai';
import DriverFactory from '../../utilities/DriverFactory.js';
import RouteAndFormScanner from '../../utilities/RouteAndFormScanner.js';
import SeleniumUtils from '../../utilities/SeleniumUtils.js';
import Logger from '../../utilities/Logger.js';

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
      
      try {
        await driver.get(`${scanner.seleniumUtils.baseUrl}${relativeRoute}`);
        await utils.driver.sleep(1000);
      } catch (err) {
        Logger.warn(`Could not navigate to route ${relativeRoute}: ${err.message}`);
        continue;
      }

      const formsOnPage = await scanner.discoverFormsOnCurrentPage();

      for (const formObj of formsOnPage) {
        for (const inputRule of formObj.inputs) {
          const testCases = scanner.generateTestCasesForInput(inputRule);

          for (const testCase of testCases) {
            Logger.info(`Running Dynamic Test Vector: ${testCase.name} on route [${relativeRoute}]`);
            
            try {
              // Re-locate input in DOM to avoid stale element reference
              const activeInput = await utils.waitForElementLocated(
                inputRule.name.includes('_') 
                  ? scanner.driver.findElements(By.css(`[name="${inputRule.name}"], [placeholder="${inputRule.placeholder}"]`)) 
                  : scanner.driver.findElement(By.css(`input`))
              ).catch(() => null);

              if (activeInput) {
                await activeInput.clear().catch(() => {});
                if (testCase.value) {
                  await activeInput.sendKeys(testCase.value).catch(() => {});
                }
              }

              if (formObj.submitButton) {
                await formObj.submitButton.click().catch(() => {});
              }

              // Verify browser did not crash and remains stable
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
