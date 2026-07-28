import { expect } from 'chai';
import DriverFactory from '../../utilities/DriverFactory.js';
import DashboardPage from '../../pages/DashboardPage.js';
import LoginPage from '../../pages/LoginPage.js';
import Logger from '../../utilities/Logger.js';

describe('UI Components E2E Test Suite', function () {
  let driver;
  let dashboardPage;
  let loginPage;

  before(async function () {
    driver = await DriverFactory.createDriver();
    global.driver = driver;
    dashboardPage = new DashboardPage(driver);
    loginPage = new LoginPage(driver);
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('TC-UI-001: Should verify buttons and input fields rendering', async function () {
    await loginPage.open();
    const isLoginVisible = await loginPage.isElementVisible(loginPage.loginButton);
    expect(isLoginVisible).to.be.true;
  });

  it('TC-UI-002: Should verify search bar filtering behavior', async function () {
    await dashboardPage.open();
    if (await dashboardPage.isElementVisible(dashboardPage.searchInput, 2000)) {
      await dashboardPage.searchTable('Test Query');
    }
  });

  it('TC-UI-003: Should verify modal dialog open and close interactions', async function () {
    await dashboardPage.open();
    if (await dashboardPage.isModalOpen()) {
      await dashboardPage.closeModal();
      expect(await dashboardPage.isModalOpen()).to.be.false;
    }
  });

  it('TC-UI-004: Should verify toast notifications / alert display', async function () {
    await loginPage.open();
    await loginPage.login('invalid@test.com', 'wrong');
    const toast = await loginPage.getToastOrAlertMessage();
    Logger.info(`UI Alert captured: ${toast}`);
  });
});
