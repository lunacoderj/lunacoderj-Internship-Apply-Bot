// src/services/automationService.js
import { chromium } from 'playwright';
import { createLogger } from '../lib/logger.js';

const logger = createLogger('automation-service');

export class AutomationService {
  constructor(aiService) {
    this.ai = aiService;
  }

  async apply(url, userData) {
    logger.info(`Starting automation for ${url}`);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      
      // Step 1: Detect if it's a known platform (LinkedIn, Indeed, etc.)
      // For now, we use a generic "AI-driven" approach for any form
      
      let step = 0;
      const maxSteps = 10; // Prevent infinite loops
      let success = false;

      while (step < maxSteps) {
        step++;
        logger.info(`Step ${step}: Analyzing page state...`);

        // Get meaningful content for AI
        const pageState = await page.evaluate(() => {
          const inputs = Array.from(document.querySelectorAll('input, select, textarea')).map(el => ({
            id: el.id,
            name: el.name,
            placeholder: el.placeholder,
            type: el.type,
            label: el.labels?.[0]?.innerText || '',
            value: el.value
          }));
          const buttons = Array.from(document.querySelectorAll('button')).map(el => ({
            text: el.innerText,
            type: el.type
          }));
          return { inputs, buttons, text: document.body.innerText.substring(0, 5000) };
        });

        // Check if we already applied
        if (pageState.text.toLowerCase().includes('thank you') || 
            pageState.text.toLowerCase().includes('application submitted')) {
          logger.info('Success: Application submitted detected');
          success = true;
          break;
        }

        // Ask AI what to do
        const decision = await this.ai.extractFormFields(JSON.stringify(pageState), userData);
        
        if (decision.action === 'fill') {
          for (const [selector, value] of Object.entries(decision.fields)) {
            try {
              await page.fill(selector, String(value));
            } catch (e) {
              logger.warn(`Failed to fill ${selector}: ${e.message}`);
            }
          }
          // After filling, look for the next/submit button AI suggested
          if (decision.submitSelector) {
            await page.click(decision.submitSelector);
            await page.waitForTimeout(2000);
          }
        } else if (decision.action === 'click' && decision.selector) {
          await page.click(decision.selector);
          await page.waitForTimeout(2000);
        } else {
          logger.warn('AI could not decide on an action');
          break;
        }
      }

      return { success, steps: step };
    } catch (error) {
      logger.error(`Automation error: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      await browser.close();
    }
  }
}
