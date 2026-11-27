/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: './test/ui',
  use: {
    baseURL: process.env.UI_BASE_URL || 'http://localhost:3000',
    headless: true,
  },
};
