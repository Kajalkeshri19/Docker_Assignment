const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  use: {
    baseURL: process.env.API_URL || 'http://api:3000',
  },
});
