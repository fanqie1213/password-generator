const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?/';
const AMBIGUOUS = /[0O1lI]/g;

function randomIndex(max) {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0] % max;
  }

  return Math.floor(Math.random() * max);
}

function sanitizePool(pool, excludeAmbiguous) {
  return excludeAmbiguous ? pool.replace(AMBIGUOUS, '') : pool;
}

function clampLength(length) {
  const numericLength = Number.isFinite(Number(length)) ? Number(length) : 16;
  return Math.min(64, Math.max(8, Math.trunc(numericLength)));
}

function buildPools(options) {
  const pools = [];

  if (options.includeLowercase) {
    pools.push(sanitizePool(LOWERCASE, options.excludeAmbiguous));
  }

  if (options.includeUppercase) {
    pools.push(sanitizePool(UPPERCASE, options.excludeAmbiguous));
  }

  if (options.includeNumbers) {
    pools.push(sanitizePool(NUMBERS, options.excludeAmbiguous));
  }

  if (options.includeSymbols) {
    pools.push(sanitizePool(SYMBOLS, options.excludeAmbiguous));
  }

  const validPools = pools.filter((pool) => pool.length > 0);

  if (validPools.length === 0) {
    throw new Error('请至少选择一种字符类型');
  }

  return validPools;
}

function pickChar(pool) {
  return pool[randomIndex(pool.length)];
}

function shuffle(chars) {
  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]];
  }

  return chars;
}

export function generatePassword(options) {
  const pools = buildPools(options);
  const targetLength = Math.max(clampLength(options.length), pools.length);
  const allCharacters = pools.join('');
  const passwordChars = pools.map((pool) => pickChar(pool));

  for (let index = passwordChars.length; index < targetLength; index += 1) {
    passwordChars.push(pickChar(allCharacters));
  }

  return shuffle(passwordChars).join('');
}

export function getStrengthLabel(options) {
  const length = clampLength(options.length);
  const selectedTypes = [
    options.includeLowercase,
    options.includeUppercase,
    options.includeNumbers,
    options.includeSymbols,
  ].filter(Boolean).length;

  if (length >= 16 && selectedTypes >= 3) {
    return '强';
  }

  if (length >= 12 && selectedTypes >= 2) {
    return '中';
  }

  return '弱';
}
