import { until, By } from 'selenium-webdriver';
import Config from '../config/env.config.js';
import Logger from './Logger.js';

export class SeleniumUtils {
  constructor(driver) {
    this.driver = driver;
    this.defaultTimeout = Config.explicitWaitMs || 15000;
  }

  async waitForElementLocated(locator, timeout = this.defaultTimeout) {
    Logger.debug(`Waiting for element located by: ${locator.toString()}`);
    return await this.driver.wait(until.elementLocated(locator), timeout, `Element not located: ${locator}`);
  }

  async waitForElementVisible(locator, timeout = this.defaultTimeout) {
    const element = await this.waitForElementLocated(locator, timeout);
    Logger.debug(`Waiting for element visible by: ${locator.toString()}`);
    await this.driver.wait(until.elementIsVisible(element), timeout, `Element not visible: ${locator}`);
    return element;
  }

  async waitForElementClickable(locator, timeout = this.defaultTimeout) {
    const element = await this.waitForElementVisible(locator, timeout);
    Logger.debug(`Waiting for element clickable by: ${locator.toString()}`);
    await this.driver.wait(until.elementIsEnabled(element), timeout, `Element not enabled: ${locator}`);
    return element;
  }

  async safeClick(locator, timeout = this.defaultTimeout) {
    try {
      const element = await this.waitForElementClickable(locator, timeout);
      await this.scrollToElement(element);
      await element.click();
      Logger.debug(`Clicked element: ${locator}`);
    } catch (error) {
      Logger.warn(`Standard click failed on ${locator}, attempting JavaScript click`);
      const element = await this.waitForElementLocated(locator, timeout);
      await this.executeScript('arguments[0].click();', element);
    }
  }

  async safeType(locator, text, clearFirst = true, timeout = this.defaultTimeout) {
    const element = await this.waitForElementVisible(locator, timeout);
    await this.scrollToElement(element);
    if (clearFirst) {
      await element.clear();
    }
    await element.sendKeys(text);
    Logger.debug(`Typed into element ${locator}: "${text}"`);
  }

  async getText(locator, timeout = this.defaultTimeout) {
    const element = await this.waitForElementVisible(locator, timeout);
    return (await element.getText()).trim();
  }

  async getAttribute(locator, attributeName, timeout = this.defaultTimeout) {
    const element = await this.waitForElementLocated(locator, timeout);
    return await element.getAttribute(attributeName);
  }

  async isElementPresent(locator, timeout = 3000) {
    try {
      await this.driver.wait(until.elementLocated(locator), timeout);
      return true;
    } catch {
      return false;
    }
  }

  async isElementDisplayed(locator, timeout = 3000) {
    try {
      const element = await this.waitForElementLocated(locator, timeout);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  async scrollToElement(elementOrLocator) {
    let element = elementOrLocator;
    if (typeof elementOrLocator === 'object' && elementOrLocator.using) {
      element = await this.waitForElementLocated(elementOrLocator);
    }
    await this.driver.executeScript('arguments[0].scrollIntoView({behavior: "smooth", block: "center"});', element);
    await this.driver.sleep(200);
  }

  async executeScript(script, ...args) {
    return await this.driver.executeScript(script, ...args);
  }

  async switchToWindowHandle(index = 1) {
    const handles = await this.driver.getAllWindowHandles();
    if (handles.length > index) {
      await this.driver.switchTo().window(handles[index]);
      Logger.info(`Switched to window handle index: ${index}`);
    } else {
      throw new Error(`Window index ${index} out of bounds (${handles.length} total)`);
    }
  }

  async handleAlert(accept = true, promptText = null) {
    try {
      await this.driver.wait(until.alertIsPresent(), 5000);
      const alert = await this.driver.switchTo().alert();
      const text = await alert.getText();
      Logger.info(`Alert detected with text: "${text}"`);
      if (promptText) {
        await alert.sendKeys(promptText);
      }
      if (accept) {
        await alert.accept();
      } else {
        await alert.dismiss();
      }
      return text;
    } catch (err) {
      Logger.warn(`No alert present to handle: ${err.message}`);
      return null;
    }
  }

  async retryAction(actionFn, maxRetries = Config.retryCount || 2, delayMs = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await actionFn();
      } catch (error) {
        lastError = error;
        Logger.warn(`Action failed on attempt ${attempt}/${maxRetries + 1}: ${error.message}`);
        if (attempt <= maxRetries) {
          await this.driver.sleep(delayMs);
        }
      }
    }
    throw lastError;
  }

  async takeScreenshot() {
    return await this.driver.takeScreenshot();
  }
}

export default SeleniumUtils;
