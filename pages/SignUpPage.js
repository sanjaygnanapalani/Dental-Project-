import { By } from 'selenium-webdriver';
import BasePage from './BasePage.js';

export class SignUpPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.path = '/signup';

    // Locators using W3C compliant CSS and XPath selectors
    this.firstNameInput = By.xpath('(//input[@type="text"])[1]');
    this.lastNameInput = By.xpath('(//input[@type="text"])[2]');
    this.emailInput = By.css('input[type="email"]');
    this.phoneInput = By.css('input[type="tel"]');
    this.institutionInput = By.xpath('(//input[@type="text"])[3]');
    this.passwordInput = By.xpath('(//input[@type="password"])[1]');
    this.confirmPasswordInput = By.xpath('(//input[@type="password"])[2]');
    this.termsCheckbox = By.css('input[type="checkbox"]');
    this.submitButton = By.css('button[type="submit"]');
    this.errorMessage = By.xpath('//span[contains(@style, "error-red")] | //div[contains(@style, "error-red")] | //*[contains(@class, "error")]');
    this.loginLink = By.css('a[href*="login"]');
  }

  async open() {
    await this.navigateTo(this.path);
  }

  async fillRegistrationForm(data = {}) {
    if (data.firstName || data.name) await this.utils.safeType(this.firstNameInput, data.firstName || data.name);
    if (data.lastName) await this.utils.safeType(this.lastNameInput, data.lastName);
    if (data.email) await this.utils.safeType(this.emailInput, data.email);
    if (data.phone) await this.utils.safeType(this.phoneInput, data.phone);
    if (data.password) await this.utils.safeType(this.passwordInput, data.password);
    if (data.confirmPassword) await this.utils.safeType(this.confirmPasswordInput, data.confirmPassword);
    if (data.acceptTerms) {
      const isChecked = await this.utils.getAttribute(this.termsCheckbox, 'checked');
      if (!isChecked) await this.utils.safeClick(this.termsCheckbox);
    }
  }

  async submitForm() {
    await this.utils.safeClick(this.submitButton);
  }

  async getErrorMessageText() {
    if (await this.utils.isElementPresent(this.errorMessage, 3000)) {
      return await this.utils.getText(this.errorMessage);
    }
    return null;
  }
}

export default SignUpPage;
