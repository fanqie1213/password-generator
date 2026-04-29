import test from 'node:test';
import assert from 'node:assert/strict';

import { generatePassword, getStrengthLabel } from '../password-generator.mjs';

const originalCryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');

function withMockCrypto(getRandomValues, callback) {
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: { getRandomValues },
  });

  try {
    callback();
  } finally {
    if (originalCryptoDescriptor) {
      Object.defineProperty(globalThis, 'crypto', originalCryptoDescriptor);
    } else {
      delete globalThis.crypto;
    }
  }
}

function withoutCrypto(callback) {
  const activeDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: undefined,
  });

  try {
    callback();
  } finally {
    if (activeDescriptor) {
      Object.defineProperty(globalThis, 'crypto', activeDescriptor);
    }
  }
}

test('在默认启用的小写字母配置下生成指定长度的密码', () => {
  const password = generatePassword({
    length: 16,
    includeLowercase: true,
    includeUppercase: false,
    includeNumbers: false,
    includeSymbols: false,
    excludeAmbiguous: false,
  });

  assert.equal(password.length, 16);
});

test('只启用数字时仅生成数字字符', () => {
  const password = generatePassword({
    length: 24,
    includeLowercase: false,
    includeUppercase: false,
    includeNumbers: true,
    includeSymbols: false,
    excludeAmbiguous: false,
  });

  assert.match(password, /^[0-9]+$/);
});

test('启用多种字符类型时，每种类型至少出现一次', () => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const password = generatePassword({
      length: 12,
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeAmbiguous: false,
    });

    assert.match(password, /[a-z]/);
    assert.match(password, /[A-Z]/);
    assert.match(password, /[0-9]/);
    assert.match(password, /[!@#$%^&*()\-_=+\[\]{};:,.?/]/);
  }
});

test('启用排除易混淆字符后不会生成 0 O 1 l I', () => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const password = generatePassword({
      length: 32,
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: false,
      excludeAmbiguous: true,
    });

    assert.doesNotMatch(password, /[0O1lI]/);
  }
});

test('未选择任何字符类型时抛出中文错误', () => {
  assert.throws(
    () => generatePassword({
      length: 12,
      includeLowercase: false,
      includeUppercase: false,
      includeNumbers: false,
      includeSymbols: false,
      excludeAmbiguous: false,
    }),
    /请至少选择一种字符类型/
  );
});

test('不支持安全随机数时拒绝生成密码', () => {
  withoutCrypto(() => {
    assert.throws(
      () => generatePassword({
        length: 12,
        includeLowercase: true,
        includeUppercase: false,
        includeNumbers: false,
        includeSymbols: false,
        excludeAmbiguous: false,
      }),
      /当前环境不支持安全随机数，无法生成密码/
    );
  });
});

test('随机索引会丢弃有取模偏差的随机值后重新取样', () => {
  const values = [4294967295, ...Array.from({ length: 32 }, () => 0)];
  let calls = 0;

  withMockCrypto((array) => {
    array[0] = values[calls] ?? 0;
    calls += 1;
    return array;
  }, () => {
    const password = generatePassword({
      length: 8,
      includeLowercase: true,
      includeUppercase: false,
      includeNumbers: false,
      includeSymbols: false,
      excludeAmbiguous: false,
    });

    assert.equal(password, 'aaaaaaaa');
    assert.ok(calls > 8);
  });
});

test('长度短且字符类型单一时强度为弱', () => {
  const label = getStrengthLabel({
    length: 8,
    includeLowercase: true,
    includeUppercase: false,
    includeNumbers: false,
    includeSymbols: false,
  });

  assert.equal(label, '弱');
});

test('长度长且字符类型丰富时强度为强', () => {
  const label = getStrengthLabel({
    length: 20,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });

  assert.equal(label, '强');
});

test('16 位常见混合字符池按熵值评估为中', () => {
  const label = getStrengthLabel({
    length: 16,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSymbols: false,
    excludeAmbiguous: false,
  });

  assert.equal(label, '中');
});
