// src/routes/resume.js
import { Router } from 'express';
import multer from 'multer';
import { supabase } from '../lib/supabase.js';
import { createLogger } from '../lib/logger.js';
import { resumeQueue } from '../queues/resumeQueue.js';

const router = Router();
const logger = createLogger('resume');
const upload = multer({ storage: multer.memoryStorage() });

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ── GET /resume ─────────────────────────────────────────────────
// Get parsed education details
router.get('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('education_details')
    .select('*')
    .eq('user_id', req.userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  res.json(data || null);
}));

// ── POST /resume/upload ─────────────────────────────────────────
// Upload PDF and trigger parsing
router.post('/upload', upload.single('resume'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const file = req.file;
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${req.userId}/${Date.now()}.${fileExt}`;
  const filePath = `resumes/${fileName}`;

  // 1. Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('applypilot')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) {
    logger.error(`Storage upload failed: ${uploadError.message}`);
    throw uploadError;
  }

  // 2. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('applypilot')
    .getPublicUrl(filePath);

  // 3. Update profile
  await supabase
    .from('profiles')
    .update({ 
      resume_url: publicUrl,
      onboarding_status: 'resume_uploaded'
    })
    .eq('id', req.userId);

  // 4. Enqueue parsing job
  await resumeQueue.add('parse', {
    userId: req.userId,
    resumeUrl: publicUrl,
  });

  logger.info(`Resume uploaded and enqueued for user ${req.userId}`);
  res.json({ ok: true, message: 'Resume uploaded and processing started', url: publicUrl });
}));

// ── GET /status ─────────────────────────────────────────────────
// Get resume processing status
router.get('/status', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('onboarding_status, resume_url, job_preferences')
    .eq('id', req.userId)
    .single();

  if (error) throw error;
  res.json(data);
}));

// ── POST /preferences ───────────────────────────────────────────
// Update job preferences
router.post('/preferences', asyncHandler(async (req, res) => {
  const { roles, locations, min_salary } = req.body;

  const { data, error } = await supabase
    .from('profiles')
    .update({
      job_preferences: { roles, locations, min_salary },
      onboarding_status: 'preferences_set'
    })
    .eq('id', req.userId)
    .select()
    .single();

  if (error) throw error;
  res.json(data);
}));

export default router;

