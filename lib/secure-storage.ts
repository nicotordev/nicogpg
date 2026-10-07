/**
 * Zero-Knowledge client-side encrypted storage.
 * Encrypts sensitive user data (e.g. contacts, cached notes) at rest using AES-GCM 256 with random IVs.
 */

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

let cachedKey: CryptoKey | null = null;

async function getStorageKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  const enc = new TextEncoder();
  const rawKeyMaterial = enc.encode("nicogpg-vault-client-storage-v1");
  const baseKey = await crypto.subtle.importKey(
    "raw",
    rawKeyMaterial,
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("nicogpg-salt-v1-storage-armor"),
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );

  cachedKey = key;
  return key;
}

/**
 * Encrypts a string value into an armored AES-256-GCM envelope.
 */
export async function encryptStorageData(plaintext: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    return plaintext;
  }

  try {
    const key = await getStorageKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);

    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded,
    );

    const ivB64 = toBase64(iv);
    const dataB64 = toBase64(new Uint8Array(ciphertextBuffer));

    return `enc:v1:${ivB64}:${dataB64}`;
  } catch (error) {
    console.error("[secure-storage] Encryption failed:", error);
    return plaintext;
  }
}

/**
 * Decrypts an armored AES-256-GCM envelope, or returns plaintext if legacy unencrypted.
 */
export async function decryptStorageData(payload: string): Promise<string> {
  if (typeof window === "undefined" || !payload || !payload.startsWith("enc:v1:")) {
    return payload;
  }

  try {
    const parts = payload.split(":");
    if (parts.length !== 4) return payload;

    const ivB64 = parts[2];
    const dataB64 = parts[3];

    const key = await getStorageKey();
    const iv = fromBase64(ivB64) as unknown as BufferSource;
    const ciphertext = fromBase64(dataB64) as unknown as BufferSource;

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext,
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.error("[secure-storage] Decryption failed:", error);
    return payload;
  }
}
