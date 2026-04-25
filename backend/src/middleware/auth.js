// src/middleware/auth.js
import { supabase } from '../lib/supabase.js';
import { createLogger } from '../lib/logger.js';

const logger = createLogger('auth');

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.slice(7);

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) throw error || new Error('User not found');

    req.user = data.user;
    req.userId = data.user.id;

    // Ensure profile exists (idempotent)
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', req.userId)
      .single();

    if (profileErr && profileErr.code === 'PGRST116') {
      logger.info(`Creating missing profile for user ${req.userId}`);
      const { error: insertErr } = await supabase.from('profiles').insert({
        id: req.userId,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
        onboarding_status: 'pending'
      });
      if (insertErr) {
        logger.error(`Failed to create profile: ${insertErr.message}`);
      }
    } else if (profileErr) {
      logger.error(`Error checking profile: ${profileErr.message}`);
    }

    next();
  } catch (err) {
    logger.warn(`Auth failed: ${err.message}`);
    res.status(401).json({ error: 'Unauthorized' });
  }
};
