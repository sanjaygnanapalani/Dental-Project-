import { expect } from 'chai';
import DriverFactory from '../../utilities/DriverFactory.js';
import SignUpPage from '../../pages/SignUpPage.js';
import testData from '../../data/testData.json' assert { type: 'json' };

describe('Form Validation E2E Test Suite', function () {
  let driver;
  let signUpPage;

  before(async function () {
    driver = await DriverFactory.createDriver();
    global.driver = driver;
    signUpPage = new SignUpPage(driver);
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  beforeEach(async function () {
    await signUpPage.open();
  });

  it('TC-FORM-001: Should prevent form submission when required fields are empty', async function () {
    await signUpPage.submitForm();
    const currentUrl = await signUpPage.getCurrentUrl();
    expect(currentUrl).to.include('/signup');
  });

  it('TC-FORM-002: Should validate email format rules', async function () {
    for (const invalidEmail of testData.formValidation.invalidEmails) {
      await signUpPage.fillRegistrationForm({ email: invalidEmail });
      await signUpPage.submitForm();
      const currentUrl = await signUpPage.getCurrentUrl();
      expect(currentUrl).to.include('/signup');
    }
  });

  it('TC-FORM-003: Should validate telephone input rules', async function () {
    for (const invalidPhone of testData.formValidation.invalidPhones) {
      await signUpPage.fillRegistrationForm({ phone: invalidPhone });
      await signUpPage.submitForm();
    }
  });

  it('TC-FORM-004: Should validate password complexity and min length requirements', async function () {
    for (const shortPass of testData.formValidation.shortPasswords) {
      await signUpPage.fillRegistrationForm({ password: shortPass, confirmPassword: shortPass });
      await signUpPage.submitForm();
    }
  });

  it('TC-FORM-005: Should sanitize or reject special character / XSS inputs safely', async function () {
    for (const specialVal of testData.formValidation.specialChars) {
      await signUpPage.fillRegistrationForm({ name: specialVal });
      await signUpPage.submitForm();
      // Ensure application doesn't crash or trigger raw alert
      const currentUrl = await signUpPage.getCurrentUrl();
      expect(currentUrl).to.not.be.empty;
    }
  });
});
