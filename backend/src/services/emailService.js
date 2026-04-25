import { simpleParser } from 'mailparser';
import { createLogger } from '../lib/logger.js';
import crypto from 'crypto';

const logger = createLogger('email-service');

export class EmailService {
  /**
   * Parses an incoming MIME email from Resend
   * @param {string} rawEmail 
   * @returns {Promise<object>} Parsed offer details
   */
  async parseIncomingEmail(rawEmail) {
    try {
      const parsed = await simpleParser(rawEmail);
      const body = parsed.text || parsed.html;

      // Extract offer details using regex or basic parsing
      // In a real scenario, this could also be sent to an LLM
      const offer = {
        title: this.extractField(body, /Position:|Title: (.*)/i),
        company: this.extractField(body, /Company: (.*)/i),
        location: this.extractField(body, /Location: (.*)/i) || 'Remote',
        applyUrl: this.extractField(body, /Apply Here: (.*)/i) || this.extractUrl(body),
        description: body.substring(0, 500) + '...',
      };

      if (!offer.applyUrl || !offer.company) {
        logger.warn('Failed to extract core fields from email');
        return null;
      }

      return offer;
    } catch (error) {
      logger.error(`Email parsing failed: ${error.message}`);
      throw error;
    }
  }

  extractField(text, regex) {
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  }

  extractUrl(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    return matches ? matches[0] : null;
  }

  /**
   * Generates a unique hash for an offer to prevent duplicates
   */
  generateOfferHash(offer, userId) {
    const data = `${userId}:${offer.applyUrl}:${offer.company}`;
    return crypto.createHash('md5').update(data).digest('hex');
  }
}
