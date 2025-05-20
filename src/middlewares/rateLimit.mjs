import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: {
    error: 'Trop de requêtes, veuillez réessayer après une heure.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export default limiter;
