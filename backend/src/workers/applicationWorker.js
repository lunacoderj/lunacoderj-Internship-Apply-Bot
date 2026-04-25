// src/workers/applicationWorker.js
import { supabase } from '../lib/supabase.js';
import { createLogger } from '../lib/logger.js';
import { AIService } from '../services/aiService.js';
import { AutomationService } from '../services/automationService.js';
import { decryptKey } from '../lib/crypto.js';

const logger = createLogger('application-worker');

export const processApplicationApply = async (job) => {
  const { applicationId, jobUrl, userId } = job.data;
  logger.info(`Processing application ${applicationId} for user ${userId}`);

  try {
    // 1. Update status to processing
    await supabase
      .from('applications')
      .update({ status: 'processing' })
      .eq('id', applicationId);

    // 2. Fetch User Data (Profile + Education + Keys)
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    const { data: education } = await supabase.from('education_details').select('*').eq('user_id', userId).single();
    const { data: keys } = await supabase.from('api_keys').select('*').eq('user_id', userId);

    const userData = { ...profile, education };
    
    // 3. Setup AI Service (Prefer OpenRouter for more reliable form filling)
    const openrouterKey = keys.find(k => k.key_name === 'openrouter');
    const geminiKey = keys.find(k => k.key_name === 'gemini');
    
    let apiKey, provider;
    
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

    if (!apiKey) throw new Error('No API key available for automation');

    const ai = new AIService(apiKey, provider);
    const automation = new AutomationService(ai);

    // 4. Run Automation
    const result = await automation.apply(jobUrl, userData);

    // 5. Update Application record
    if (result.success) {
      await supabase
        .from('applications')
        .update({ 
          status: 'success', 
          applypilot_output: result,
          applied_at: new Date().toISOString()
        })
        .eq('id', applicationId);
      
      // Update offer status
      const { data: app } = await supabase.from('applications').select('offer_id').eq('id', applicationId).single();
      if (app?.offer_id) {
        await supabase.from('offers').update({ status: 'applied' }).eq('id', app.offer_id);
      }
    } else {
      throw new Error(result.error || 'Unknown automation failure');
    }

    logger.info(`Successfully applied for job ${jobUrl} (App ID: ${applicationId})`);
  } catch (error) {
    logger.error(`Application failed for ${applicationId}: ${error.message}`);
    
    await supabase
      .from('applications')
      .update({ 
        status: 'failed', 
        error_message: error.message 
      })
      .eq('id', applicationId);

    throw error;
  }
};
