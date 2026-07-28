import { By } from 'selenium-webdriver';
import BasePage from './BasePage.js';

export class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.path = '/main';

    // Locators using W3C compliant CSS and XPath selectors
    this.navbar = By.css('nav, header, .navbar, div[style*="glass"]');
    this.sidebar = By.css('aside, .sidebar, .drawer');
    this.navbarLinks = By.css('nav a, header a, a[href*="/"]');
    this.sidebarLinks = By.css('aside a, .sidebar a');
    this.userMenu = By.css('.user-menu, .profile-dropdown, button[aria-label*="user"], .avatar');
    this.logoutButton = By.xpath('//button[contains(text(), "Logout")] | //a[contains(text(), "Logout")] | //button[contains(text(), "Log Out")]');
    
    // UI Component Locators
    this.searchInput = By.css('input[type="search"], input[placeholder*="Search"]');
    this.dataTable = By.css('table, .data-table');
    this.tableRows = By.css('table tbody tr, .data-table-row');
    this.paginationNext = By.css('button[aria-label="Next"], .pagination-next');
    this.paginationPrev = By.css('button[aria-label="Previous"], .pagination-prev');
    this.modalContainer = By.css('.modal, [role="dialog"], .dialog-content');
    this.modalCloseButton = By.css('.modal-close, button[aria-label="Close"], button.close');
    this.loaderSpinner = By.css('.spinner, .loader, [role="progressbar"]');
    this.tooltip = By.css('.tooltip, [role="tooltip"]');
  }

  async open() {
    await this.navigateTo(this.path);
  }

  async isNavbarDisplayed() {
    return await this.utils.isElementDisplayed(this.navbar, 3000);
  }

  async isSidebarDisplayed() {
    return await this.utils.isElementDisplayed(this.sidebar, 3000);
  }

  async logout() {
    if (await this.utils.isElementPresent(this.userMenu, 2000)) {
      await this.utils.safeClick(this.userMenu);
    }
    if (await this.utils.isElementPresent(this.logoutButton, 2000)) {
      await this.utils.safeClick(this.logoutButton);
    }
  }

  async searchTable(query) {
    if (await this.utils.isElementPresent(this.searchInput, 2000)) {
      await this.utils.safeType(this.searchInput, query);
    }
  }

  async getTableRowCount() {
    if (await this.utils.isElementPresent(this.dataTable, 3000)) {
      const rows = await this.driver.findElements(this.tableRows);
      return rows.length;
    }
    return 0;
  }

  async isLoaderDisplayed() {
    return await this.utils.isElementDisplayed(this.loaderSpinner, 1500);
  }

  async isModalOpen() {
    return await this.utils.isElementDisplayed(this.modalContainer, 2000);
  }

  async closeModal() {
    if (await this.isModalOpen()) {
      await this.utils.safeClick(this.modalCloseButton);
    }
  }
}

export default DashboardPage;
