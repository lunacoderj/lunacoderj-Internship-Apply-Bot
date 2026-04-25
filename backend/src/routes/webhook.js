// src/routes/webhook.js
import { Router } from 'express';
import express from 'express';
import crypto from 'crypto';
import { supabase } from '../lib/supabase.js';
import { createLogger } from '../lib/logger.js';
import { extractUrls, detectPlatform } from '../services/urlParser.js';
import { applicationQueue } from '../queues/applicationQueue.js';

const router = Router();
const logger = createLogger('webhook');

// ── Signature verification ──────────────────────────────────────
const verifyResendSignature = (payload, signature, secret) => {
  if (!secret || secret.startsWith('whsec_placeholder')) {
    logger.warn('Webhook secret not configured — skipping verification');
    return true; // Allow in dev
  }

  try {
    // Resend uses HMAC-SHA256 for webhook signatures
    // The secret from Resend starts with "whsec_", strip that prefix
    const signingKey = secret.replace('whsec_', '');
    const expectedSig = crypto
      .createHmac('sha256', signingKey)
      .update(payload)
      .digest('base64');

    // Resend sends the signature in the svix-signature header
    // Format: v1,<base64_signature>
    const signatures = signature.split(' ');
    return signatures.some((sig) => {
      const sigValue = sig.replace('v1,', '');
      return crypto.timingSafeEqual(
        Buffer.from(expectedSig),
        Buffer.from(sigValue)
      );
    });
  } catch (err) {
    logger.error(`Signature verification failed: ${err.message}`);
    return false;
  }
};

// ── POST /webhook/email ─────────────────────────────────────────
router.post('/email', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const rawBody = req.body.toString('utf8');
    const signature = req.headers['svix-signature'] || req.headers['webhook-signature'] || '';
    const secret = process.env.RESEND_WEBHOOK_SECRET;

    // Verify signature in production
    if (process.env.NODE_ENV === 'production' && secret && !secret.includes('placeholder')) {
      if (!verifyResendSignature(rawBody, signature, secret)) {
        logger.warn('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const event = JSON.parse(rawBody);
    logger.info(`Webhook received: type=${event.type}`);

    // Only process email.received events
    if (event.type !== 'email.received') {
      return res.json({ ok: true, skipped: true, reason: `Event type ${event.type} not handled` });
    }

    const emailData = event.data;
    const botUserId = process.env.BOT_USER_ID;

    if (!botUserId) {
      logger.error('BOT_USER_ID not set — cannot process webhook');
      return res.status(500).json({ error: 'Server misconfigured' });
    }

    // ── Idempotency: deduplicate by resend email ID ──────────────
    const resendEmailId = emailData.id || null;
    if (resendEmailId) {
      const { data: existing } = await supabase
        .from('email_logs')
        .select('id')
        .eq('resend_email_id', resendEmailId)
        .maybeSingle();

      if (existing) {
        logger.info(`Duplicate webhook — email ${resendEmailId} already processed`);
        return res.json({ ok: true, skipped: true, reason: 'duplicate' });
      }
    }

    // Extract body text (prefer text, fallback to html)
    const bodyText = emailData.text || emailData.html || '';
    const subject = emailData.subject || '(no subject)';
    const fromAddress = emailData.from || 'unknown';

    // ── AI Extraction ───────────────────────────────────────────
    const geminiKey = process.env.GEMINI_API_KEY;
    let extractedOffers = [];
    
    if (geminiKey) {
      const ai = new AIService(geminiKey, 'gemini');
      try {
        const aiResult = await ai.extractOfferFromEmail(bodyText + ' ' + subject);
        if (aiResult && aiResult.apply_url) {
          extractedOffers = [aiResult];
        }
      } catch (err) {
        logger.warn(`AI extraction failed: ${err.message}`);
      }
    }

    // Fallback to regex if AI failed or didn't find anything
    if (extractedOffers.length === 0) {
      const jobUrls = extractUrls(bodyText + ' ' + subject);
      extractedOffers = jobUrls.map(url => ({
        title: 'Unknown Position',
        company: 'Unknown Company',
        apply_url: url,
        platform: detectPlatform(url)
      }));
    }

    logger.info(`Extracted ${extractedOffers.length} offer(s) from email "${subject}"`);

    // Insert email log
    const { data: emailLog, error: logError } = await supabase
      .from('email_logs')
      .insert({
        user_id: botUserId,
        from_address: fromAddress,
        subject,
        raw_body: bodyText.substring(0, 5000),
        resend_email_id: emailData.id || null,
      })
      .select()
      .single();

    if (logError) logger.error(`Failed to insert email log: ${logError.message}`);

    // Create offers and applications
    let queued = 0;
    for (const offerData of extractedOffers) {
      // 1. Create/Get Offer
      const { data: offer, error: offerErr } = await supabase
        .from('offers')
        .upsert({
          user_id: botUserId,
          email_log_id: emailLog?.id || null,
          title: offerData.title,
          company: offerData.company,
          apply_url: offerData.apply_url,
          status: 'new'
        }, { onConflict: 'user_id,apply_url' })
        .select()
        .single();

      if (offerErr) {
        logger.warn(`Failed to upsert offer: ${offerErr.message}`);
        continue;
      }

      // 2. Create Application
      const { data: app, error: appError } = await supabase
        .from('applications')
        .upsert({
          user_id: botUserId,
          offer_id: offer.id,
          job_url: offer.apply_url,
          platform: offerData.platform || detectPlatform(offer.apply_url),
          status: 'pending',
        }, { onConflict: 'user_id,offer_id' })
        .select()
        .single();

      if (appError) {
        logger.warn(`Failed to upsert application: ${appError.message}`);
        continue;
      }

      // 3. Enqueue
      if (app.status === 'pending') {
        await applicationQueue.add('apply', {
          applicationId: app.id,
          jobUrl: offer.apply_url,
          userId: botUserId,
        });
        
        await supabase.from('offers').update({ status: 'queued' }).eq('id', offer.id);
        queued++;
      }
    }

    logger.info(`Webhook processed: queued=${queued}, total_offers=${extractedOffers.length}`);
    res.json({ ok: true, queued, total: extractedOffers.length });

  } catch (err) {
    logger.error(`Webhook error: ${err.message}`);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
