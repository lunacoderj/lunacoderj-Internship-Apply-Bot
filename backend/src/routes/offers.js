// src/routes/offers.js
import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { createLogger } from '../lib/logger.js';
import { applicationQueue } from '../queues/applicationQueue.js';

const router = Router();
const logger = createLogger('offers');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ── GET /offers ─────────────────────────────────────────────────
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('offers')
    .select('*', { count: 'exact' })
    .eq('user_id', req.userId)
    .order('received_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) throw error;

  res.json({
    offers: data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}));

// ── POST /offers/:id/apply ──────────────────────────────────────
router.post('/:id/apply', asyncHandler(async (req, res) => {
  const { data: offer, error } = await supabase
    .from('offers')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.userId)
    .single();

  if (error || !offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  // Check if application already exists
  const { data: existingApp } = await supabase
    .from('applications')
    .select('id, status')
    .eq('offer_id', offer.id)
    .maybeSingle();

  if (existingApp && existingApp.status === 'processing') {
    return res.status(409).json({ error: 'Application already in progress' });
  }

  // Create or Update application
  const { data: app, error: appErr } = await supabase
    .from('applications')
    .upsert({
      user_id: req.userId,
      offer_id: offer.id,
      job_url: offer.apply_url,
      status: 'pending',
    }, { onConflict: 'user_id,offer_id' })
    .select()
    .single();

  if (appErr) throw appErr;

  // Enqueue job
  await applicationQueue.add('apply', {
    applicationId: app.id,
    jobUrl: offer.apply_url,
    userId: req.userId,
  });

  // Update offer status
  await supabase
    .from('offers')
    .update({ status: 'queued' })
    .eq('id', offer.id);

  logger.info(`Manual application triggered for offer ${offer.id} by user ${req.userId}`);
  res.json({ ok: true, applicationId: app.id });
}));

export default router;
