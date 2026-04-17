import { generatePassword, getStrengthLabel } from './password-generator.mjs';

const elements = {
  output: document.querySelector('#password-output'),
  copyButton: document.querySelector('#copy-button'),
  generateButton: document.querySelector('#generate-button'),
  statusMessage: document.querySelector('#status-message'),
  strengthLabel: document.querySelector('#strength-label'),
  lengthRange: document.querySelector('#length-range'),
  lengthNumber: document.querySelector('#length-number'),
  includeLowercase: document.querySelector('#include-lowercase'),
  includeUppercase: document.querySelector('#include-uppercase'),
  includeNumbers: document.querySelector('#include-numbers'),
  includeSymbols: document.querySelector('#include-symbols'),
  excludeAmbiguous: document.querySelector('#exclude-ambiguous'),
  plaintextInput: document.querySelector('#plaintext-input'),
  encryptButton: document.querySelector('#encrypt-button'),
  ciphertextOutput: document.querySelector('#ciphertext-output'),
  copyCipherButton: document.querySelector('#copy-cipher-button'),
  decryptInput: document.querySelector('#decrypt-input'),
  decryptButton: document.querySelector('#decrypt-button'),
  decryptOutput: document.querySelector('#decrypt-output'),
  copyDecryptButton: document.querySelector('#copy-decrypt-button'),
  rsaKeyStatus: document.querySelector('#rsa-key-status'),
};

const textEncoder = new TextEncoder();
let rsaKeyPairPromise = null;

function clampLengthInput(value) {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return 16;
  }

  return Math.min(64, Math.max(8, parsed));
}

function syncLengthControls(nextLength) {
  elements.lengthRange.value = String(nextLength);
  elements.lengthNumber.value = String(nextLength);
}

function readOptions() {
  const length = clampLengthInput(elements.lengthNumber.value || elements.lengthRange.value);
  syncLengthControls(length);

  return {
    length,
    includeLowercase: elements.includeLowercase.checked,
    includeUppercase: elements.includeUppercase.checked,
    includeNumbers: elements.includeNumbers.checked,
    includeSymbols: elements.includeSymbols.checked,
    excludeAmbiguous: elements.excludeAmbiguous.checked,
  };
}

function setStatus(message, tone = 'neutral') {
  elements.statusMessage.textContent = message;
  elements.statusMessage.dataset.tone = tone;
}

function setStrength(label) {
  const toneByLabel = {
    弱: 'weak',
    中: 'medium',
    强: 'strong',
  };

  elements.strengthLabel.textContent = `强度：${label}`;
  elements.strengthLabel.className = `strength strength-${toneByLabel[label] ?? 'neutral'}`;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

async function getRsaKeyPair() {
  if (!rsaKeyPairPromise) {
    rsaKeyPairPromise = globalThis.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt'],
    );
  }

  return rsaKeyPairPromise;
}

async function encryptPlaintext(plaintext) {
  const keyPair = await getRsaKeyPair();
  const ciphertext = await globalThis.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    keyPair.publicKey,
    textEncoder.encode(plaintext),
  );

  return arrayBufferToBase64(ciphertext);
}

function base64ToArrayBuffer(base64) {
  const normalized = base64.replace(/\s+/g, '');
  const binary = globalThis.atob(normalized);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

async function decryptCiphertext(ciphertext) {
  const keyPair = await getRsaKeyPair();
  const plaintextBuffer = await globalThis.crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    keyPair.privateKey,
    base64ToArrayBuffer(ciphertext),
  );

  return new TextDecoder().decode(plaintextBuffer);
}

function refreshPassword(message = '已生成新密码') {
  const options = readOptions();

  try {
    const password = generatePassword(options);
    const strength = getStrengthLabel(options);

    elements.output.value = password;
    elements.copyButton.disabled = false;
    setStrength(strength);
    setStatus(message, 'success');
  } catch (error) {
    elements.output.value = '';
    elements.copyButton.disabled = true;
    elements.strengthLabel.textContent = '强度：未生成';
    elements.strengthLabel.className = 'strength strength-neutral';
    setStatus(error.message, 'error');
  }
}

async function copyPassword() {
  if (!elements.output.value) {
    setStatus('当前没有可复制的密码', 'error');
    return;
  }

  if (!navigator.clipboard?.writeText) {
    elements.output.focus();
    elements.output.select();
    setStatus('当前浏览器不支持自动复制，请手动复制当前密码', 'error');
    return;
  }

  try {
    await navigator.clipboard.writeText(elements.output.value);
    setStatus('密码已复制到剪贴板', 'success');
  } catch {
    elements.output.focus();
    elements.output.select();
    setStatus('复制失败，请手动复制当前密码', 'error');
  }
}

async function refreshCiphertext(message = '已生成 RSA 密文') {
  const plaintext = elements.plaintextInput.value.trim();

  if (!plaintext) {
    elements.ciphertextOutput.value = '';
    setStatus('请输入要加密的明文', 'error');
    return;
  }

  if (!globalThis.crypto?.subtle) {
    elements.ciphertextOutput.value = '';
    setStatus('当前浏览器不支持 Web Crypto，无法执行 RSA 加密', 'error');
    return;
  }

  elements.encryptButton.disabled = true;
  elements.rsaKeyStatus.textContent = '正在准备 RSA 密钥...';

  try {
    const ciphertext = await encryptPlaintext(plaintext);
    elements.ciphertextOutput.value = ciphertext;
    elements.copyCipherButton.disabled = false;
    elements.rsaKeyStatus.textContent = 'RSA 密钥已就绪（本次会话有效）';
    setStatus(message, 'success');
  } catch (error) {
    elements.ciphertextOutput.value = '';
    elements.copyCipherButton.disabled = true;
    setStatus(error.message || 'RSA 加密失败', 'error');
    elements.rsaKeyStatus.textContent = 'RSA 密钥未就绪';
  } finally {
    elements.encryptButton.disabled = false;
  }
}

async function refreshDecryptedText(message = '已完成 RSA 解密') {
  const ciphertext = elements.decryptInput.value.trim();

  if (!ciphertext) {
    elements.decryptOutput.value = '';
    setStatus('请输入要解密的 Base64 密文', 'error');
    return;
  }

  if (!globalThis.crypto?.subtle) {
    elements.decryptOutput.value = '';
    setStatus('当前浏览器不支持 Web Crypto，无法执行 RSA 解密', 'error');
    return;
  }

  elements.decryptButton.disabled = true;
  elements.rsaKeyStatus.textContent = '正在准备 RSA 密钥...';

  try {
    const plaintext = await decryptCiphertext(ciphertext);
    elements.decryptOutput.value = plaintext;
    elements.copyDecryptButton.disabled = false;
    elements.rsaKeyStatus.textContent = 'RSA 密钥已就绪（本次会话有效）';
    setStatus(message, 'success');
  } catch (error) {
    elements.decryptOutput.value = '';
    elements.copyDecryptButton.disabled = true;
    setStatus(error.message || 'RSA 解密失败，请确认密文是否正确', 'error');
    elements.rsaKeyStatus.textContent = 'RSA 密钥未就绪';
  } finally {
    elements.decryptButton.disabled = false;
  }
}

async function copyCiphertext() {
  if (!elements.ciphertextOutput.value) {
    setStatus('当前没有可复制的密文', 'error');
    return;
  }

  if (!navigator.clipboard?.writeText) {
    elements.ciphertextOutput.focus();
    elements.ciphertextOutput.select();
    setStatus('当前浏览器不支持自动复制，请手动复制当前密文', 'error');
    return;
  }

  try {
    await navigator.clipboard.writeText(elements.ciphertextOutput.value);
    setStatus('密文已复制到剪贴板', 'success');
  } catch {
    elements.ciphertextOutput.focus();
    elements.ciphertextOutput.select();
    setStatus('复制失败，请手动复制当前密文', 'error');
  }
}

async function copyDecryptedText() {
  if (!elements.decryptOutput.value) {
    setStatus('当前没有可复制的解密明文', 'error');
    return;
  }

  if (!navigator.clipboard?.writeText) {
    elements.decryptOutput.focus();
    elements.decryptOutput.select();
    setStatus('当前浏览器不支持自动复制，请手动复制当前解密明文', 'error');
    return;
  }

  try {
    await navigator.clipboard.writeText(elements.decryptOutput.value);
    setStatus('解密明文已复制到剪贴板', 'success');
  } catch {
    elements.decryptOutput.focus();
    elements.decryptOutput.select();
    setStatus('复制失败，请手动复制当前解密明文', 'error');
  }
}

elements.generateButton.addEventListener('click', () => {
  refreshPassword('已根据当前设置生成密码');
});

elements.copyButton.addEventListener('click', () => {
  void copyPassword();
});

elements.lengthRange.addEventListener('input', () => {
  syncLengthControls(clampLengthInput(elements.lengthRange.value));
  refreshPassword('长度已更新，已生成新密码');
});

elements.lengthNumber.addEventListener('input', () => {
  syncLengthControls(clampLengthInput(elements.lengthNumber.value));
  refreshPassword('长度已更新，已生成新密码');
});

[
  elements.includeLowercase,
  elements.includeUppercase,
  elements.includeNumbers,
  elements.includeSymbols,
  elements.excludeAmbiguous,
].forEach((input) => {
  input.addEventListener('change', () => {
    refreshPassword('选项已更新，已生成新密码');
  });
});

elements.encryptButton.addEventListener('click', () => {
  void refreshCiphertext();
});

elements.copyCipherButton.addEventListener('click', () => {
  void copyCiphertext();
});

elements.decryptButton.addEventListener('click', () => {
  void refreshDecryptedText();
});

elements.copyDecryptButton.addEventListener('click', () => {
  void copyDecryptedText();
});

elements.plaintextInput.addEventListener('input', () => {
  elements.ciphertextOutput.value = '';
  elements.copyCipherButton.disabled = true;
  setStatus('明文已更新，点击“RSA 加密”生成密文', 'neutral');
});

elements.decryptInput.addEventListener('input', () => {
  elements.decryptOutput.value = '';
  elements.copyDecryptButton.disabled = true;
  setStatus('密文已更新，点击“RSA 解密”还原明文', 'neutral');
});

elements.plaintextInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    void refreshCiphertext('已根据当前明文生成 RSA 密文');
  }
});

elements.decryptInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    void refreshDecryptedText('已根据当前密文还原 RSA 明文');
  }
});

refreshPassword('已根据默认设置生成密码');
elements.copyButton.disabled = false;
elements.copyCipherButton.disabled = true;
elements.copyDecryptButton.disabled = true;
elements.rsaKeyStatus.textContent = 'RSA 密钥准备中...';
void getRsaKeyPair()
  .then(() => {
    elements.rsaKeyStatus.textContent = 'RSA 密钥已就绪（本次会话有效）';
  })
  .catch(() => {
    elements.rsaKeyStatus.textContent = 'RSA 密钥准备失败';
    setStatus('RSA 密钥生成失败，请检查浏览器是否支持 Web Crypto', 'error');
  });
