const defaultStore = require('./store');
const parseWindow = require('./parse-window');
const presets = require('./presets');
const { setHeaders, setRetryAfter } = require('./headers');

function flowcap(options = {}) {
  const limit = options.limit ?? 100;
  const windowRaw = options.window ?? '1m';
  const windowMs = parseWindow(windowRaw);
  
  const keyBy = options.keyBy || ((req) => 
    req.ip || 
    (req.headers && req.headers['x-forwarded-for']) || 
    (req.socket && req.socket.remoteAddress) || 
    'global'
  );
  
  const skip = options.skip || null;
  const onLimit = options.onLimit || null;
  const legacyHeaders = options.legacyHeaders ?? true;
  const store = options.store || defaultStore;

  return function rateLimitMiddleware(req, res, next) {
    if (skip && skip(req)) {
      return next();
    }

    const key = keyBy(req);
    const count = store.count(key, windowMs);
    const remaining = Math.max(0, limit - count - 1);
    const resetTimeMs = store.resetTime(key, windowMs);

    setHeaders(res, { limit, remaining, resetTimeMs, legacyHeaders });

    if (count >= limit) {
      setRetryAfter(res, resetTimeMs);
      
      if (onLimit) {
        return onLimit(req, res, next);
      }
      
      const retryAfterSeconds = Math.max(0, Math.ceil((resetTimeMs - Date.now()) / 1000));
      const responsePayload = {
        error: "Too Many Requests",
        limit,
        window: windowRaw,
        retryAfter: retryAfterSeconds
      };

      if (typeof res.status === 'function') {
        res.status(429);
      } else {
        res.statusCode = 429;
      }

      if (typeof res.json === 'function') {
        res.json(responsePayload);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(responsePayload));
      }
      
      return;
    }

    store.add(key, windowMs);
    next();
  };
}

flowcap.login = (overrides) => flowcap({ ...presets.login, ...overrides });
flowcap.api = (overrides) => flowcap({ ...presets.api, ...overrides });
flowcap.strict = (overrides) => flowcap({ ...presets.strict, ...overrides });
flowcap.loose = (overrides) => flowcap({ ...presets.loose, ...overrides });
flowcap.Store = defaultStore.Store;

module.exports = flowcap;
