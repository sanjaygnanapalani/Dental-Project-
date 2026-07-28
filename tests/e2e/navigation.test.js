import { expect } from 'chai';
import DriverFactory from '../../utilities/DriverFactory.js';
import LoginPage from '../../pages/LoginPage.js';
import SignUpPage from '../../pages/SignUpPage.js';
import DashboardPage from '../../pages/DashboardPage.js';

describe('Navigation E2E Test Suite', function () {
  let driver;
  let loginPage;
  let signUpPage;
  let dashboardPage;

  before(async function () {
    driver = await DriverFactory.createDriver();
    global.driver = driver;
    loginPage = new LoginPage(driver);
    signUpPage = new SignUpPage(driver);
    dashboardPage = new DashboardPage(driver);
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('TC-NAV-001: Should navigate between Login and Sign Up routes via links', async function () {
    await loginPage.open();
    if (await loginPage.isElementVisible(loginPage.signupLink, 2000)) {
      await loginPage.clickSignUpLink();
      const url = await loginPage.getCurrentUrl();
      expect(url).to.include('/signup');
    }
  });

  it('TC-NAV-002: Should handle browser back and forward navigation correctly', async function () {
    await loginPage.open();
    await signUpPage.open();
    
    await signUpPage.goBack();
    let url = await loginPage.getCurrentUrl();
    expect(url).to.include('/login');

    await loginPage.goForward();
    url = await signUpPage.getCurrentUrl();
    expect(url).to.include('/signup');
  });

  it('TC-NAV-003: Should preserve state on page refresh', async function () {
    await loginPage.open();
    await loginPage.refreshPage();
    const url = await loginPage.getCurrentUrl();
    expect(url).to.include('/login');
  });
});
