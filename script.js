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
};

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

refreshPassword('已根据默认设置生成密码');
