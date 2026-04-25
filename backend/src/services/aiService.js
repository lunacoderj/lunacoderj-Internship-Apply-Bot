import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { createLogger } from '../lib/logger.js';

const logger = createLogger('ai-service');

export class AIService {
  constructor(apiKey, provider = 'gemini') {
    this.apiKey = apiKey;
    this.provider = provider;
  }

  async _generateContent(prompt) {
    if (this.provider === 'gemini') {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } else if (this.provider === 'openrouter') {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'google/gemini-2.0-flash-001', // High performance & low cost
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Internship Bot',
          },
        }
      );
      return response.data.choices[0].message.content;
    } else {
      throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  async parseResume(text) {
    const prompt = `
      You are an expert resume parser. Extract details from the resume text into the following JSON format:
      {
        "institution": "Latest University",
        "degree": "Degree",
        "field": "Major",
        "start_date": "Year or Date",
        "end_date": "Year or Date",
        "gpa": "GPA as string",
        "summary": "Brief professional summary",
        "skills": ["Skill 1", "Skill 2"],
        "experience_summary": "One paragraph summary of work experience"
      }

      Resume Text:
      ${text}
    `;

    try {
      const responseText = await this._generateContent(prompt);
      const jsonText = responseText.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonText);
    } catch (error) {
      logger.error(`Resume parsing failed: ${error.message}`);
      throw error;
    }
  }

  async extractFormFields(pageState, userData) {
    const prompt = `
      You are an autonomous bot applying for internships.
      Given the current page state (inputs, buttons, visible text) and the user's resume data,
      decide the next action to take.

      User Data: ${JSON.stringify(userData)}
      Page State: ${pageState}

      Return a JSON decision:
      {
        "action": "fill" | "click" | "wait" | "done",
        "fields": { "css_selector": "value_to_fill" },
        "submitSelector": "css_selector_for_next_or_submit_button",
        "selector": "css_selector_if_just_clicking",
        "reasoning": "Brief explanation"
      }
    `;

    try {
      const responseText = await this._generateContent(prompt);
      const jsonText = responseText.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonText);
    } catch (error) {
      logger.error(`Decision engine failed: ${error.message}`);
      return { action: 'wait', reasoning: 'AI failed to respond' };
    }
  }
}

