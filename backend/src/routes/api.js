// src/routes/api.js
// Aggregates all protected sub-routers under /api
import { Router } from 'express';
import applicationsRouter from './applications.js';
import resumeRouter from './resume.js';
import keysRouter from './keys.js';
import offersRouter from './offers.js';
import emailLogsRouter from './emailLogs.js';

const router = Router();

router.use('/applications', applicationsRouter);
router.use('/resume', resumeRouter);
router.use('/keys', keysRouter);
router.use('/offers', offersRouter);
router.use('/email-logs', emailLogsRouter);

export default router;

