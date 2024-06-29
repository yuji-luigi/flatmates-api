import { randomBytes } from 'crypto';

export function generateSecureRandomString(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += characters[bytes[i] % characters.length];
  }
  return result;
}
