# Production-Ready Enterprise E2E Selenium Automation Framework (Node.js + React)

A complete, production-ready, enterprise-grade End-to-End (E2E) Selenium WebDriver test automation framework for React applications built using Node.js, Mocha, Chai, ExcelJS, Winston Logger, Mochawesome, and GitHub Actions.

Includes a **Dynamic React Route & Form Discovery Engine** that automatically inspects React AST routers and live DOM inputs to generate boundary and validation test suites dynamically.

---

## Framework Architecture & Directory Structure

```
project-root/
├── .github/
│   └── workflows/
│       └── selenium-e2e.yml            # CI/CD pipeline definition
├── config/
│   ├── config.json                     # Default timeouts, browser & window settings
│   └── env.config.js                   # Environment switcher (local, dev, staging, prod)
├── data/
│   ├── testData.json                   # Static test datasets for E2E scenarios
│   └── formData.json                   # Boundary validation rules
├── logs/                               # Winston execution & error logs (automation.log)
├── excel/                              # ExcelJS output directory (E2E_Report.xlsx)
├── reports/
│   ├── mochawesome/                    # Mochawesome HTML & JSON reports
│   └── failures/                       # Screenshots, console logs, & failure details
├── screenshots/                        # Step screenshots
├── pages/
│   ├── BasePage.js                     # Core POM parent class with explicit wait wrappers
│   ├── LoginPage.js                    # Auth & Login Page Object
│   ├── SignUpPage.js                   # User Registration Page Object
│   ├── ForgotPasswordPage.js           # Password Reset Page Object
│   └── DashboardPage.js                # Main App Layout Page Object
├── utilities/
│   ├── ConfigManager.js                # Configuration & environment loader
│   ├── DriverFactory.js                # Cross-browser launcher (Chrome, Edge, Firefox)
│   ├── SeleniumUtils.js                # Wait, scroll, JS exec, alert & window utilities
│   ├── Logger.js                       # Winston logger utility
│   ├── FailureHandler.js               # Screenshot, console log & stack trace on failure
│   ├── ExcelReportGenerator.js         # 4-Sheet Excel report generator (Summary, Test Cases, Failures, Logs)
│   └── RouteAndFormScanner.js          # Dynamic React Route & Form Discovery Engine
├── tests/
│   ├── setup/
│   │   └── BaseTest.js                 # Global Mocha hooks (setup/teardown/reporting/failures)
│   ├── e2e/
│   │   ├── auth.test.js                # Authentication E2E scenarios
│   │   ├── formValidation.test.js      # Explicit Form Validation scenarios
│   │   ├── uiComponents.test.js        # UI components (tables, modals, loaders, toasts)
│   │   └── navigation.test.js          # Routing, back/forward, navbar/sidebar navigation
│   └── dynamic/
│       └── dynamicFormDiscovery.test.js# Dynamic tests generated from React route & form scanner
├── .mocharc.json                       # Mocha runner configuration
├── package.json                        # Node dependencies & npm test scripts
└── README.md                           # Enterprise documentation & execution instructions
```

---

## Technology Stack

- **Language**: JavaScript (ES6+ Node.js)
- **Automation Tool**: Selenium WebDriver (`selenium-webdriver`)
- **Test Runner**: Mocha
- **Assertion Library**: Chai
- **Reporting**: ExcelJS (`excel/E2E_Report.xlsx`) & Mochawesome (HTML/JSON)
- **Logging**: Winston Logger (`logs/automation.log`)
- **AST Router Parser**: `@babel/parser` & `@babel/traverse`
- **CI/CD Pipeline**: GitHub Actions (`.github/workflows/selenium-e2e.yml`)

---

## Features

### 1. Multi-Browser & Headless Support
Supports **Google Chrome**, **Microsoft Edge**, and **Mozilla Firefox** in both **Headed** and **Headless** execution modes.

### 2. Dynamic React Route & Form Discovery
- Parses React codebase (`src/App.jsx`) AST to discover declared routes automatically (`/login`, `/signup`, `/forgot-password`, `/main`).
- Inspects live DOM forms to extract input field rules (`required`, `type`, `minLength`, `maxLength`, `pattern`, `aria-*`).
- Generates dynamic boundary and validation test vectors without relying on hardcoded test paths.

### 3. Automated Failure Handling & Artifact Capture
On any test failure, the framework automatically captures and saves under `reports/failures/`:
- **Screenshot**: Captured at exact failure moment.
- **Browser Console Logs**: Warnings & runtime errors.
- **URL & Context**: Target route URL and timestamp.
- **Stack Trace & Details**: Saved in JSON metadata files.

### 4. ExcelJS 4-Sheet Professional Report
Generates `excel/E2E_Report.xlsx` automatically after execution:
- **Sheet 1: Summary** (Date, Env, Total Tests, Passed, Failed, Skipped, Pass %, Duration)
- **Sheet 2: Test Cases** (Test ID, Module, Scenario Name, Browser, Status, Timings)
- **Sheet 3: Failed Tests** (Test Name, Failure Reason, Screenshot Path, Browser, URL)
- **Sheet 4: Execution Logs** (Timestamp, Test Name, Step Description, Result, Remarks)

---

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Ensure Browsers & Drivers are Installed**:
   - Google Chrome, Mozilla Firefox, or Microsoft Edge.
   - Drivers are managed via `chromedriver`, `geckodriver`, and `edgedriver` npm packages included in `package.json`.

---

## Execution Instructions

### Run All E2E Tests (Default Chrome Headless)
```bash
npm test
```

### Run Cross-Browser Test Suites
- **Google Chrome**:
  ```bash
  npm run test:chrome
  ```
- **Mozilla Firefox**:
  ```bash
  npm run test:firefox
  ```
- **Microsoft Edge**:
  ```bash
  npm run test:edge
  ```

### Run Headless Execution Mode
```bash
npm run test:headless
```

### Run Dynamic React Route & Form Discovery Suite
```bash
npm run test:dynamic
```

### Run Complete Suite (Static + Dynamic)
```bash
npm run test:all
```

---

## Environment Switching

Environment configurations are managed via `config/env.config.js` and CLI environment variables:
```bash
# Run against Staging
ENV=staging npm test

# Run against Production
ENV=prod npm test
```

---

## CI/CD Integration (GitHub Actions)

The included `.github/workflows/selenium-e2e.yml` runs automatically on `push` and `pull_request`:
1. Sets up Node.js and installs dependencies.
2. Configures matrix execution across Chrome and Firefox.
3. Builds and launches the React application.
4. Executes the test suite in headless mode.
5. Uploads `E2E_Report.xlsx`, Mochawesome HTML reports, screenshots, and logs as downloadable CI artifacts.
