const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';

export function generatePassword(options) {
  let output = '';

  for (let index = 0; index < options.length; index += 1) {
    output += LOWERCASE[index % LOWERCASE.length];
  }

  return output;
}
