/**
 * Security & Data Protection Utilities for Fibrex Store
 * Enforces client-side security hardening, input sanitization,
 * tokenization, and anti-tampering guards.
 */

// Luhn Algorithm for validating credit card numbers
export function validateCardNumberLuhn(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\D/g, '');
  if (sanitized.length < 13 || sanitized.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// Validates Card Expiration (MM/YY)
export function validateCardExpiry(expiry: string): { valid: boolean; message?: string } {
  const parts = expiry.split('/');
  if (parts.length !== 2) return { valid: false, message: 'Expiry format must be MM/YY.' };
  const month = parseInt(parts[0].trim(), 10);
  const year = parseInt(parts[1].trim(), 10);

  if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
    return { valid: false, message: 'Invalid expiration month (01-12).' };
  }

  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { valid: false, message: 'The provided card has expired.' };
  }
  if (year > currentYear + 25) {
    return { valid: false, message: 'Invalid expiration year.' };
  }

  return { valid: true };
}

// Validates Card CVV (3-4 numeric digits, or strictly 4 for Amex)
export function validateCVV(cvv: string, isAmex?: boolean): boolean {
  const clean = cvv.trim();
  if (isAmex) {
    return /^\d{4}$/.test(clean);
  }
  return /^\d{3,4}$/.test(clean);
}

// Sanitize string to prevent basic injection / XSS
export function sanitizeInput(input: string, maxLength: number = 250): string {
  if (!input) return '';
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, '')
    .trim();
}

// In-Memory Rate Limiter for Authentication Attempts
interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
}

const loginRateLimits = new Map<string, RateLimitRecord>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds

export function checkLoginRateLimit(identifier: string): { allowed: boolean; remainingSecs: number } {
  const now = Date.now();
  const record = loginRateLimits.get(identifier);

  if (!record) {
    return { allowed: true, remainingSecs: 0 };
  }

  if (record.lockedUntil > now) {
    const remainingSecs = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remainingSecs };
  }

  if (record.lockedUntil <= now && record.lockedUntil > 0) {
    loginRateLimits.delete(identifier);
    return { allowed: true, remainingSecs: 0 };
  }

  return { allowed: true, remainingSecs: 0 };
}

export function recordFailedAttempt(identifier: string): { locked: boolean; remainingSecs: number; attemptsLeft: number } {
  const now = Date.now();
  const record = loginRateLimits.get(identifier) || { attempts: 0, lockedUntil: 0 };
  record.attempts += 1;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    loginRateLimits.set(identifier, record);
    return { locked: true, remainingSecs: Math.ceil(LOCKOUT_DURATION_MS / 1000), attemptsLeft: 0 };
  }

  loginRateLimits.set(identifier, record);
  return { locked: false, remainingSecs: 0, attemptsLeft: MAX_ATTEMPTS - record.attempts };
}

export function resetLoginAttempts(identifier: string): void {
  loginRateLimits.delete(identifier);
}

// Constant-time string comparison for passcodes to prevent timing attacks
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Session Integrity Check: prevents tampering with user object in localStorage
const SESSION_SECRET = 'FBX_SEC_INTEGRITY_2026';

export async function generateSessionChecksum(userId: string, role: string, email: string): Promise<string> {
  const payload = `${userId}:${role}:${email}:${SESSION_SECRET}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

export async function verifySessionIntegrity(
  userId: string,
  role: string,
  email: string,
  checksum: string
): Promise<boolean> {
  if (!checksum) return false;
  const expected = await generateSessionChecksum(userId, role, email);
  return timingSafeEqual(expected, checksum);
}
