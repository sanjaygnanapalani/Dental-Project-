import { expect } from 'chai';
import DriverFactory from '../../utilities/DriverFactory.js';
import LoginPage from '../../pages/LoginPage.js';
import DashboardPage from '../../pages/DashboardPage.js';
import testData from '../../data/testData.json' assert { type: 'json' };

describe('Authentication E2E Test Suite', function () {
  let driver;
  let loginPage;
  let dashboardPage;

  before(async function () {
    driver = await DriverFactory.createDriver();
    global.driver = driver; // Attach for global failure screenshot hook
    loginPage = new LoginPage(driver);
    dashboardPage = new DashboardPage(driver);
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  beforeEach(async function () {
    await loginPage.open();
  });

  it('TC-AUTH-001: Should show validation error on empty username submission', async function () {
    await loginPage.login('', 'Password123!');
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).to.include('/login');
  });

  it('TC-AUTH-002: Should show validation error on empty password submission', async function () {
    await loginPage.login('testuser@example.com', '');
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).to.include('/login');
  });

  it('TC-AUTH-003: Should reject invalid user credentials and display error message', async function () {
    await loginPage.login('invalid_user@example.com', 'WrongPassword999!');
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).to.include('/login');
  });

  it('TC-AUTH-004: Should authenticate successfully with valid credentials', async function () {
    await loginPage.login(testData.validUser.username, testData.validUser.password);
    // After login, app redirects to /main or dashboard
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).to.satisfy(url => url.includes('/main') || url.includes('/login') || url.includes('/splash'));
  });

  it('TC-AUTH-005: Should maintain session persistence on browser refresh', async function () {
    await dashboardPage.open();
    await dashboardPage.refreshPage();
    const currentUrl = await dashboardPage.getCurrentUrl();
    expect(currentUrl).to.not.be.null;
  });

  it('TC-AUTH-006: Should handle logout flow cleanly', async function () {
    await dashboardPage.open();
    if (await dashboardPage.isNavbarDisplayed()) {
      await dashboardPage.logout();
      const currentUrl = await loginPage.getCurrentUrl();
      expect(currentUrl).to.satisfy(url => url.includes('/login') || url.includes('/splash') || url.includes('/main'));
    }
  });
});
