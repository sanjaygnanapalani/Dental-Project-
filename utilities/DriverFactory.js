import { Builder, logging } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';
import edge from 'selenium-webdriver/edge.js';
import Config from '../config/env.config.js';
import Logger from './Logger.js';

export class DriverFactory {
  static async createDriver(browserName = Config.browser, isHeadless = Config.headless) {
    const targetBrowser = (browserName || 'chrome').toLowerCase();
    Logger.info(`Initializing WebDriver for browser: ${targetBrowser} (Headless: ${isHeadless})`);

    let builder = new Builder();
    let driver;

    const logPrefs = new logging.Preferences();
    logPrefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);

    switch (targetBrowser) {
      case 'chrome': {
        const chromeOptions = new chrome.Options();
        chromeOptions.setLoggingPrefs(logPrefs);
        chromeOptions.addArguments('--no-sandbox');
        chromeOptions.addArguments('--disable-dev-shm-usage');
        chromeOptions.addArguments('--disable-gpu');
        chromeOptions.addArguments(`--window-size=${Config.windowSize.width},${Config.windowSize.height}`);
        
        if (isHeadless) {
          chromeOptions.addArguments('--headless=new');
        }

        builder = builder.forBrowser('chrome').setChromeOptions(chromeOptions);
        break;
      }

      case 'firefox': {
        const firefoxOptions = new firefox.Options();
        firefoxOptions.addArguments(`--width=${Config.windowSize.width}`);
        firefoxOptions.addArguments(`--height=${Config.windowSize.height}`);

        if (isHeadless) {
          firefoxOptions.addArguments('-headless');
        }

        builder = builder.forBrowser('firefox').setFirefoxOptions(firefoxOptions);
        break;
      }

      case 'edge': {
        const edgeOptions = new edge.Options();
        edgeOptions.setLoggingPrefs(logPrefs);
        edgeOptions.addArguments('--no-sandbox');
        edgeOptions.addArguments('--disable-dev-shm-usage');
        edgeOptions.addArguments(`--window-size=${Config.windowSize.width},${Config.windowSize.height}`);

        if (isHeadless) {
          edgeOptions.addArguments('--headless=new');
        }

        builder = builder.forBrowser('MicrosoftEdge').setEdgeOptions(edgeOptions);
        break;
      }

      default:
        throw new Error(`Unsupported browser specified: ${targetBrowser}`);
    }

    driver = await builder.build();

    await driver.manage().setTimeouts({
      implicit: Config.implicitWaitMs || 5000,
      pageLoad: Config.pageLoadTimeoutMs || 30000,
      script: Config.scriptTimeoutMs || 15000
    });

    if (!isHeadless) {
      try {
        await driver.manage().window().maximize();
      } catch (err) {
        Logger.warn(`Could not maximize window: ${err.message}`);
      }
    }

    Logger.info(`WebDriver successfully initialized for ${targetBrowser}`);
    return driver;
  }
}

export default DriverFactory;
