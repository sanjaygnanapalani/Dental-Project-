import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import { By } from 'selenium-webdriver';
import Logger from './Logger.js';
import SeleniumUtils from './SeleniumUtils.js';

const traverse = traverseModule.default || traverseModule;

export class RouteAndFormScanner {
  constructor(driver, appSourceDir = path.resolve(process.cwd(), 'src')) {
    this.driver = driver;
    this.appSourceDir = appSourceDir;
    this.seleniumUtils = new SeleniumUtils(driver);
  }

  /**
   * Statically inspects React JSX router components (App.jsx) via Babel AST
   */
  discoverRoutesFromCodebase() {
    const routes = [];
    const mainAppPath = path.join(this.appSourceDir, 'App.jsx');

    if (!fs.existsSync(mainAppPath)) {
      Logger.warn(`App.jsx not found at ${mainAppPath}, returning default fallback routes.`);
      return ['/login', '/signup', '/forgot-password', '/main'];
    }

    try {
      const code = fs.readFileSync(mainAppPath, 'utf8');
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['jsx']
      });

      traverse(ast, {
        JSXElement(nodePath) {
          const name = nodePath.node.openingElement.name.name;
          if (name === 'Route') {
            const attributes = nodePath.node.openingElement.attributes;
            let routePath = null;

            attributes.forEach(attr => {
              if (attr.name && attr.name.name === 'path' && attr.value) {
                if (attr.value.type === 'StringLiteral') {
                  routePath = attr.value.value;
                }
              }
            });

            if (routePath && routePath !== '*' && !routePath.includes(':')) {
              routes.push(routePath);
            }
          }
        }
      });

      Logger.info(`AST Route Scanner discovered React routes: ${JSON.stringify(routes)}`);
      return routes.length > 0 ? Array.from(new Set(routes)) : ['/login', '/signup', '/forgot-password', '/main'];
    } catch (err) {
      Logger.error(`Error parsing React routes AST: ${err.message}`);
      return ['/login', '/signup', '/forgot-password', '/main'];
    }
  }

  /**
   * Dynamically inspects the current DOM route for forms, inputs, and validation attributes
   */
  async discoverFormsOnCurrentPage() {
    Logger.info('Scanning current page DOM for forms and validation rules...');
    
    const formInfoList = [];
    const forms = await this.driver.findElements(By.css('form, div[role="form"], .form-container, body'));

    for (let f = 0; f < Math.min(forms.length, 3); f++) {
      const formEl = forms[f];
      const inputs = await formEl.findElements(By.css('input, select, textarea'));
      const buttons = await formEl.findElements(By.css('button, input[type="submit"]'));

      const inputRules = [];

      for (const input of inputs) {
        const type = (await input.getAttribute('type')) || 'text';
        const name = (await input.getAttribute('name')) || (await input.getAttribute('id')) || (await input.getAttribute('placeholder')) || 'input_field';
        const isRequired = (await input.getAttribute('required')) !== null || (await input.getAttribute('aria-required')) === 'true';
        const minLength = await input.getAttribute('minlength');
        const maxLength = await input.getAttribute('maxlength');
        const pattern = await input.getAttribute('pattern');
        const placeholder = await input.getAttribute('placeholder');

        if (type !== 'hidden' && type !== 'submit' && type !== 'button') {
          inputRules.push({
            element: input,
            name,
            type,
            isRequired,
            minLength: minLength ? parseInt(minLength, 10) : null,
            maxLength: maxLength ? parseInt(maxLength, 10) : null,
            pattern,
            placeholder
          });
        }
      }

      if (inputRules.length > 0) {
        formInfoList.push({
          formIndex: f,
          submitButton: buttons.length > 0 ? buttons[0] : null,
          inputs: inputRules
        });
      }
    }

    Logger.info(`DOM Inspector discovered ${formInfoList.length} forms with total ${formInfoList.reduce((acc, f) => acc + f.inputs.length, 0)} inputs.`);
    return formInfoList;
  }

  /**
   * Generates dynamic test matrix vectors for discovered input fields
   */
  generateTestCasesForInput(inputRule) {
    const cases = [];

    if (inputRule.isRequired) {
      cases.push({
        name: `Required Field Check [${inputRule.name}]`,
        value: '',
        expectedValid: false,
        reason: 'Empty value submitted on required field'
      });
    }

    if (inputRule.type === 'email') {
      cases.push(
        { name: `Invalid Email Format [${inputRule.name}]`, value: 'plainaddress', expectedValid: false, reason: 'Missing @ symbol' },
        { name: `Invalid Email Format [${inputRule.name}]`, value: 'user@domain', expectedValid: false, reason: 'Missing top-level domain' },
        { name: `Valid Email Format [${inputRule.name}]`, value: 'qa_automation@example.com', expectedValid: true, reason: 'Valid email format' }
      );
    }

    if (inputRule.type === 'password') {
      cases.push(
        { name: `Password Min Length Check [${inputRule.name}]`, value: '123', expectedValid: false, reason: 'Password under min length' },
        { name: `Valid Password Complexity [${inputRule.name}]`, value: 'P@ssword123!', expectedValid: true, reason: 'Valid strong password' }
      );
    }

    if (inputRule.type === 'tel') {
      cases.push(
        { name: `Invalid Phone Alphabetic [${inputRule.name}]`, value: 'abcdefghij', expectedValid: false, reason: 'Non-numeric characters in telephone' },
        { name: `Valid Phone Format [${inputRule.name}]`, value: '9876543210', expectedValid: true, reason: 'Valid 10-digit telephone' }
      );
    }

    // Special characters & boundary checks
    cases.push({
      name: `Special Character & XSS Prevention [${inputRule.name}]`,
      value: `<script>alert('xss')</script>`,
      expectedValid: false,
      reason: 'HTML / Script injection attempt'
    });

    return cases;
  }
}

export default RouteAndFormScanner;
