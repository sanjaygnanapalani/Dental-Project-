import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const defaultConfigPath = path.resolve(process.cwd(), 'config', 'config.json');
let baseConfig = {};

if (fs.existsSync(defaultConfigPath)) {
  baseConfig = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
}

const environments = {
  local: {
    baseUrl: process.env.LOCAL_URL || 'http://localhost:5173',
    apiUrl: 'http://localhost:5000/api'
  },
  dev: {
    baseUrl: process.env.DEV_URL || 'https://dev.example.com',
    apiUrl: 'https://dev-api.example.com'
  },
  staging: {
    baseUrl: process.env.STAGING_URL || 'https://staging.example.com',
    apiUrl: 'https://staging-api.example.com'
  },
  prod: {
    baseUrl: process.env.PROD_URL || 'https://example.com',
    apiUrl: 'https://api.example.com'
  }
};

const activeEnv = process.env.ENV || process.env.NODE_ENV || baseConfig.environment || 'local';
const envSpecifics = environments[activeEnv] || environments.local;

export const Config = {
  ...baseConfig,
  ...envSpecifics,
  browser: process.env.BROWSER || baseConfig.browser || 'chrome',
  headless: process.env.HEADLESS !== undefined 
    ? process.env.HEADLESS === 'true' 
    : (baseConfig.headless !== undefined ? baseConfig.headless : true),
  environment: activeEnv
};

export default Config;
