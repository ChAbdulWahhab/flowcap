function setHeaders(res, { limit, remaining, resetTimeMs, legacyHeaders = true }) {
  const resetSeconds = Math.ceil(resetTimeMs / 1000);
  
  // Set IETF draft-8 standard header
  res.setHeader('RateLimit', `limit=${limit}, remaining=${remaining}, reset=${resetSeconds}`);
  
  if (legacyHeaders) {
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);
  }
}

function setRetryAfter(res, resetTimeMs) {
  const retryAfterSeconds = Math.max(0, Math.ceil((resetTimeMs - Date.now()) / 1000));
  res.setHeader('Retry-After', retryAfterSeconds);
}

module.exports = {
  setHeaders,
  setRetryAfter
};
