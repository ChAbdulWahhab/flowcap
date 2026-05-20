function parseWindow(windowInput) {
  if (typeof windowInput === 'number') {
    if (isNaN(windowInput) || windowInput < 0) {
      throw new Error(`flowcap: invalid window "${windowInput}". Use e.g. '30s', '15m', '2h', '1d'`);
    }
    return windowInput;
  }

  if (typeof windowInput !== 'string') {
    throw new Error(`flowcap: invalid window "${windowInput}". Use e.g. '30s', '15m', '2h', '1d'`);
  }

  const match = windowInput.trim().match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) {
    throw new Error(`flowcap: invalid window "${windowInput}". Use e.g. '30s', '15m', '2h', '1d'`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'ms': return value;
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`flowcap: invalid window "${windowInput}". Use e.g. '30s', '15m', '2h', '1d'`);
  }
}

module.exports = parseWindow;
