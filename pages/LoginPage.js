import { By } from 'selenium-webdriver';
import BasePage from './BasePage.js';

export class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.path = '/login';

    // Locators using W3C compliant CSS and XPath selectors
    this.usernameInput = By.css('input[type="email"], input[name="email"], input[placeholder*="email"]');
    this.passwordInput = By.css('input[type="password"], input[name="password"], input[placeholder*="••••"]');
    this.loginButton = By.css('button[type="submit"]');
    this.errorMessage = By.xpath('//span[contains(@style, "error")] | //div[contains(@style, "error")] | //*[contains(@class, "error")]');
    this.signupLink = By.css('a[href*="signup"]');
    this.forgotPasswordLink = By.css('a[href*="forgot"]');
  }

  async open() {
    await this.navigateTo(this.path);
  }

  async enterUsername(username) {
    await this.utils.safeType(this.usernameInput, username);
  }

  async enterPassword(password) {
    await this.utils.safeType(this.passwordInput, password);
  }

  async clickLogin() {
    await this.utils.safeClick(this.loginButton);
  }

  async login(username, password) {
    if (username !== undefined && username !== null && username !== '') {
      await this.enterUsername(username);
    } else {
      const emailEl = await this.utils.waitForElementVisible(this.usernameInput);
      await emailEl.clear();
    }

    if (password !== undefined && password !== null && password !== '') {
      await this.enterPassword(password);
    } else {
      const passEl = await this.utils.waitForElementVisible(this.passwordInput);
      await passEl.clear();
    }
    
    await this.clickLogin();
  }

  async getErrorMessageText() {
    if (await this.utils.isElementPresent(this.errorMessage, 3000)) {
      return await this.utils.getText(this.errorMessage);
    }
    return null;
  }

  async clickSignUpLink() {
    await this.utils.safeClick(this.signupLink);
  }

  async clickForgotPasswordLink() {
    await this.utils.safeClick(this.forgotPasswordLink);
  }
}

export default LoginPage;
