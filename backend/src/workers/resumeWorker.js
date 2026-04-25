// src/workers/resumeWorker.js
import { PDFParse } from 'pdf-parse';
import axios from 'axios';
import { supabase } from '../lib/supabase.js';
import { createLogger } from '../lib/logger.js';
import { AIService } from '../services/aiService.js';
import { decryptKey } from '../lib/crypto.js';

const logger = createLogger('resume-worker');

export const processResumeParsing = async (job) => {
  const { userId, resumeUrl } = job.data;
  logger.info(`Processing resume for user ${userId}`);

  try {
    // 1. Download resume
    const response = await axios.get(resumeUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    // 2. Parse PDF
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const resumeText = result.text;

    // 3. Get user's API key (Prefer OpenRouter)
    const { data: keys, error: keyErr } = await supabase
      .from('api_keys')
      .select('encrypted_value, key_name')
      .eq('user_id', userId)
      .in('key_name', ['openrouter', 'gemini']);

    let apiKey, provider;
    const openrouterKey = keys?.find(k => k.key_name === 'openrouter');
    const geminiKey = keys?.find(k => k.key_name === 'gemini');

    if (openrouterKey) {
      apiKey = decryptKey(openrouterKey.encrypted_value);
      provider = 'openrouter';
    } else if (process.env.OPENROUTER_API_KEY) {
      apiKey = process.env.OPENROUTER_API_KEY;
      provider = 'openrouter';
    } else if (geminiKey) {
      apiKey = decryptKey(geminiKey.encrypted_value);
      provider = 'gemini';
    } else {
      apiKey = process.env.GEMINI_API_KEY;
      provider = 'gemini';
    }

    if (!apiKey) {
      throw new Error('No API key found for parsing');
    }

    // 4. Use AI to parse
    const ai = new AIService(apiKey, provider);
    const parsedData = await ai.parseResume(resumeText);

    // 5. Save to education_details
    const { error: upsertErr } = await supabase
      .from('education_details')
      .upsert({
        user_id: userId,
        ...parsedData,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertErr) throw upsertErr;

    // 6. Update onboarding status
    await supabase
      .from('profiles')
      .update({ onboarding_status: 'education_parsed' })
      .eq('id', userId);

    logger.info(`Successfully parsed resume for user ${userId}`);
  } catch (error) {
    logger.error(`Failed to process resume for user ${userId}: ${error.message}`);
    throw error;
  }
};
