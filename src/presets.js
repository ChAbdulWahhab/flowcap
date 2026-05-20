module.exports = {
  login:  { limit: 5,    window: '15m' },   // brute-force protection
  api:    { limit: 100,  window: '1m'  },   // standard API
  strict: { limit: 20,   window: '1m'  },   // sensitive endpoints
  loose:  { limit: 500,  window: '1m'  },   // high-traffic public routes
};
