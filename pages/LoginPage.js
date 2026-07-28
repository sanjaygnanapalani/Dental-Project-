import { By } from 'selenium-webdriver';
import BasePage from './BasePage.js';

export class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.path = '/login';

    // Locators
    this.usernameInput = By.css('input[type="email"], input[name="email"], input[name="username"], input[placeholder*="Email"], input[placeholder*="Username"], input#username, input#email');
    this.passwordInput = By.css('input[type="password"], input[name="password"], input[placeholder*="Password"], input#password');
    this.loginButton = By.css('button[type="submit"], input[type="submit"], button.btn-primary, button:contains("Login"), button');
    this.errorMessage = By.css('.error-message, .alert-danger, .error, [role="alert"], p.text-red-500');
    this.signupLink = By.css('a[href*="signup"], a:contains("Sign up"), a:contains("Register")');
    this.forgotPasswordLink = By.css('a[href*="forgot"], a:contains("Forgot Password")');
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
    if (username !== undefined && username !== null) {
      await this.enterUsername(username);
    }
    if (password !== undefined && password !== null) {
      await this.enterPassword(password);
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
