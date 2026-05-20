class Store {
  constructor() {
    this.hits = new Map();
  }

  _getValidTimestamps(key, windowMs, now) {
    const timestamps = this.hits.get(key);
    if (!timestamps) return [];
    
    const cutoff = now - windowMs;
    // Filter out timestamps older than or equal to cutoff
    const valid = timestamps.filter(ts => ts > cutoff);
    return valid;
  }

  count(key, windowMs) {
    const now = Date.now();
    const valid = this._getValidTimestamps(key, windowMs, now);
    return valid.length;
  }

  add(key, windowMs) {
    const now = Date.now();
    const valid = this._getValidTimestamps(key, windowMs, now);
    valid.push(now);
    this.hits.set(key, valid);
  }

  resetTime(key, windowMs) {
    const now = Date.now();
    const valid = this._getValidTimestamps(key, windowMs, now);
    if (valid.length === 0) {
      return now + windowMs; // Default expiry if empty
    }
    // The oldest entry expires when it hits windowMs age
    return valid[0] + windowMs;
  }

  clear(key) {
    if (key === undefined) {
      this.hits.clear();
    } else {
      this.hits.delete(key);
    }
  }
}

const defaultStore = new Store();

module.exports = defaultStore;
module.exports.Store = Store;
