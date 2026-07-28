import { By, until } from 'selenium-webdriver';
import SeleniumUtils from '../utilities/SeleniumUtils.js';
import Logger from '../utilities/Logger.js';
import Config from '../config/env.config.js';

export class BasePage {
  constructor(driver) {
    this.driver = driver;
    this.utils = new SeleniumUtils(driver);
    this.baseUrl = Config.baseUrl;
  }

  async navigateTo(relativeUrl = '') {
    const targetUrl = `${this.baseUrl}${relativeUrl.startsWith('/') ? relativeUrl : '/' + relativeUrl}`;
    Logger.info(`Navigating to URL: ${targetUrl}`);
    await this.driver.get(targetUrl);
    await this.waitForPageLoaded();
  }

  async getPageTitle() {
    return await this.driver.getTitle();
  }

  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }

  async refreshPage() {
    Logger.info('Refreshing current page');
    await this.driver.navigate().refresh();
    await this.waitForPageLoaded();
  }

  async goBack() {
    Logger.info('Navigating back in browser history');
    await this.driver.navigate().back();
  }

  async goForward() {
    Logger.info('Navigating forward in browser history');
    await this.driver.navigate().forward();
  }

  async waitForPageLoaded(timeout = Config.pageLoadTimeoutMs || 30000) {
    await this.driver.wait(async () => {
      const readyState = await this.driver.executeScript('return document.readyState;');
      return readyState === 'complete';
    }, timeout, 'Page load did not complete in time');
  }

  async isElementVisible(locator, timeout = 3000) {
    return await this.utils.isElementDisplayed(locator, timeout);
  }

  async getToastOrAlertMessage() {
    const locators = [
      By.css('.toast, .alert, .notification, [role="alert"]'),
      By.xpath('//*[contains(@class, "error") or contains(@class, "success") or contains(@class, "alert")]')
    ];

    for (const loc of locators) {
      if (await this.utils.isElementPresent(loc, 2000)) {
        return await this.utils.getText(loc);
      }
    }
    return null;
  }
}

export default BasePage;
