/**
 * Auth utilities using Web Crypto API (works in both Edge and Node 18+).
 */

export const SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24h

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function generateSessionToken(secret: string): Promise<string> {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS });
  const key = await getHmacKey(secret);
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  const sigHex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  // url-safe base64 of payload
  const b64 = btoa(payload).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return `${b64}.${sigHex}`;
}

export async function verifySessionToken(
  token: string,
  secret: string
): Promise<boolean> {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return false;
    const b64 = token.slice(0, dot);
    const sigHex = token.slice(dot + 1);

    // decode url-safe base64
    const payloadStr = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadStr);
    if (!payload.exp || payload.exp < Date.now()) return false;

    const key = await getHmacKey(secret);
    const sigBytes = new Uint8Array(
      (sigHex.match(/.{2}/g) ?? []).map((b) => parseInt(b, 16))
    );
    return await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(payloadStr)
    );
  } catch {
    return false;
  }
}

/** Timing-safe password comparison via SHA-256 hashing. */
export async function comparePasswords(
  input: string,
  expected: string
): Promise<boolean> {
  const enc = new TextEncoder();
  const [h1, h2] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(input)),
    crypto.subtle.digest("SHA-256", enc.encode(expected)),
  ]);
  const a = new Uint8Array(h1);
  const b = new Uint8Array(h2);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
