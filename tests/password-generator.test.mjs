import test from 'node:test';
import assert from 'node:assert/strict';

import { generatePassword } from '../password-generator.mjs';

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
