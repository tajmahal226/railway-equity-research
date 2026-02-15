import { chromium } from '@playwright/test';

async function verifyPlaywrightEnvironment() {
  try {
    const browser = await chromium.launch({ headless: true });
    await browser.close();
    console.log('[Playwright] Browser launch check passed.');
  } catch (error) {
    console.error('[Playwright] Browser launch check failed.');
    console.error('[Playwright] Run: pnpm exec playwright install chromium');
    console.error('[Playwright] If Linux deps are missing, run: sudo pnpm exec playwright install-deps chromium');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

void verifyPlaywrightEnvironment();
