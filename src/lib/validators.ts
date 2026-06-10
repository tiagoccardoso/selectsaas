export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function cleanText(value: unknown, maxLength = 5000) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, maxLength);
}

export function requireText(value: unknown, label: string, minLength = 1, maxLength = 5000) {
  const text = cleanText(value, maxLength);

  if (text.length < minLength) {
    throw Object.assign(new Error(`${label} é obrigatório.`), { status: 400 });
  }

  return text;
}

export function pickEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T) {
  const candidate = String(value ?? "").trim() as T;
  return allowed.includes(candidate) ? candidate : fallback;
}
