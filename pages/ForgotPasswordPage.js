import { By } from 'selenium-webdriver';
import BasePage from './BasePage.js';

export class ForgotPasswordPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.path = '/forgot-password';

    // Locators
    this.emailInput = By.css('input[type="email"], input[name="email"], input[placeholder*="Email"], input#email');
    this.submitButton = By.css('button[type="submit"], button.btn-primary');
    this.successMessage = By.css('.success-message, .alert-success, p.text-green-500');
    this.errorMessage = By.css('.error-message, .alert-danger, p.text-red-500');
    this.backToLoginLink = By.css('a[href*="login"], a:contains("Login"), a:contains("Back")');
  }

  async open() {
    await this.navigateTo(this.path);
  }

  async requestPasswordReset(email) {
    if (email) {
      await this.utils.safeType(this.emailInput, email);
    }
    await this.utils.safeClick(this.submitButton);
  }

  async getSuccessMessageText() {
    if (await this.utils.isElementPresent(this.successMessage, 3000)) {
      return await this.utils.getText(this.successMessage);
    }
    return null;
  }
}

export default ForgotPasswordPage;
