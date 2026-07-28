import { By } from 'selenium-webdriver';
import BasePage from './BasePage.js';

export class SignUpPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.path = '/signup';

    // Locators
    this.nameInput = By.css('input[name="name"], input[placeholder*="Name"], input#name');
    this.emailInput = By.css('input[type="email"], input[name="email"], input[placeholder*="Email"], input#email');
    this.phoneInput = By.css('input[type="tel"], input[name="phone"], input[placeholder*="Phone"], input#phone');
    this.passwordInput = By.css('input[name="password"], input[placeholder="Password"], input#password');
    this.confirmPasswordInput = By.css('input[name="confirmPassword"], input[placeholder*="Confirm"], input#confirmPassword');
    this.termsCheckbox = By.css('input[type="checkbox"], input#terms');
    this.submitButton = By.css('button[type="submit"], button.btn-primary');
    this.errorMessage = By.css('.error-message, .alert-danger, [role="alert"], p.text-red-500');
    this.loginLink = By.css('a[href*="login"], a:contains("Login")');
  }

  async open() {
    await this.navigateTo(this.path);
  }

  async fillRegistrationForm(data = {}) {
    if (data.name) await this.utils.safeType(this.nameInput, data.name);
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
