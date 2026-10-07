import * as openpgp from "openpgp";

export interface ClientGpgEnvelope {
  handle: string;
  keyId: string;
  fingerprint: string;
  publicKeyArmored: string;
  encryptedPrivateKeyArmored: string;
  salt: string;
  kdfParams: string;
}

export interface ParsedGpgKey {
  handle: string;
  keyId: string;
  fingerprint: string;
  keyType: string;
  isPrivateKey: boolean;
  publicKeyArmored: string;
  encryptedPrivateKeyArmored?: string;
  salt: string;
  kdfParams: string;
}

/**
 * Generate a random hex salt of specified byte length.
 */
function generateSalt(byteLength = 16): string {
  const array = new Uint8Array(byteLength);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < byteLength; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generates an OpenPGP KeyPair in the browser and encrypts the private key
 * using the user's GPG passphrase. The passphrase is NEVER transmitted to the server.
 */
export async function generateClientGpgEnvelope({
  handle,
  passphrase,
  keyType = "Ed25519",
}: {
  handle: string;
  passphrase: string;
  keyType?: string;
}): Promise<ClientGpgEnvelope> {
  const isEcc = keyType === "Ed25519" || keyType === "X25519" || keyType === "ECDSA P-384";

  const result = await openpgp.generateKey({
    type: isEcc ? "ecc" : "rsa",
    curve: isEcc ? (keyType === "ECDSA P-384" ? ("p384" as openpgp.EllipticCurveName) : ("ed25519" as openpgp.EllipticCurveName)) : undefined,
    rsaBits: isEcc ? undefined : keyType === "RSA 4096" ? 4096 : 2048,
    userIDs: [{ name: handle.trim() }],
    passphrase,
    format: "armored",
  });

  const encryptedPrivateKeyArmored = result.privateKey;
  const publicKeyArmored = result.publicKey;

  const parsedKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
  const fingerprint = parsedKey.getFingerprint().toUpperCase();
  const keyId = `0x${fingerprint.slice(-8)}`;
  const salt = generateSalt(16);
  const kdfParams = JSON.stringify({
    algorithm: "Argon2id/PBKDF2-SHA256",
    iterations: 100000,
    cipher: "AES-256-GCM / OpenPGP-S2K",
    saltLength: 16,
  });

  return {
    handle: handle.trim(),
    keyId,
    fingerprint,
    publicKeyArmored,
    encryptedPrivateKeyArmored,
    salt,
    kdfParams,
  };
}

/**
 * Parses an ASCII Armored OpenPGP public or private key string.
 */
export async function parseArmoredGpgKey(
  armoredKey: string,
): Promise<ParsedGpgKey> {
  let isPrivateKey = false;
  let key: openpgp.Key;
  let encryptedPrivateKeyArmored: string | undefined = undefined;

  const cleanText = armoredKey.trim();

  if (cleanText.includes("PRIVATE KEY BLOCK")) {
    isPrivateKey = true;
    const privKey = await openpgp.readPrivateKey({ armoredKey: cleanText });
    key = privKey;
    encryptedPrivateKeyArmored = cleanText;
  } else {
    key = await openpgp.readKey({ armoredKey: cleanText });
  }

  const fingerprint = key.getFingerprint().toUpperCase();
  const keyId = `0x${fingerprint.slice(-8)}`;
  const userIDs = key.getUserIDs();

  // Extract handle name from userID e.g. "Alice <alice@example.com>" -> "Alice"
  let handle = "Imported GPG Key";
  if (userIDs.length > 0 && userIDs[0]) {
    const match = userIDs[0].match(/^([^<]+)/);
    handle = match ? match[1].trim() : userIDs[0].trim();
  }
  if (!handle) handle = `Key ${keyId}`;

  // Determine key algorithm type
  const algorithmInfo = key.getAlgorithmInfo();
  let keyType = "Ed25519";
  if (algorithmInfo.algorithm) {
    const algoLower = algorithmInfo.algorithm.toLowerCase();
    if (algoLower.includes("rsa")) {
      keyType = algorithmInfo.bits ? `RSA ${algorithmInfo.bits}` : "RSA 4096";
    } else if (
      algoLower.includes("ecc") ||
      algoLower.includes("curve") ||
      algoLower.includes("ed25519")
    ) {
      keyType = "Ed25519";
    } else if (algoLower.includes("ecdsa") || algoLower.includes("p384")) {
      keyType = "ECDSA P-384";
    }
  }

  const publicKeyArmored = key.toPublic().armor();
  const salt = generateSalt(16);
  const kdfParams = JSON.stringify({
    algorithm: "Imported-OpenPGP-Armored",
    saltLength: 16,
  });

  return {
    handle,
    keyId,
    fingerprint,
    keyType,
    isPrivateKey,
    publicKeyArmored,
    encryptedPrivateKeyArmored,
    salt,
    kdfParams,
  };
}

/**
 * Decrypts an encrypted OpenPGP private key in client memory using the passphrase.
 */
export async function unlockPrivateKeyInMemory({
  encryptedPrivateKeyArmored,
  passphrase,
}: {
  encryptedPrivateKeyArmored: string;
  passphrase: string;
}): Promise<openpgp.PrivateKey> {
  const privateKey = await openpgp.readPrivateKey({
    armoredKey: encryptedPrivateKeyArmored,
  });
  return await openpgp.decryptKey({
    privateKey,
    passphrase,
  });
}

/**
 * Signs a plaintext message using the unlocked private key in memory.
 */
export async function signMessageInMemory({
  unlockedPrivateKey,
  messageText,
}: {
  unlockedPrivateKey: openpgp.PrivateKey;
  messageText: string;
}): Promise<string> {
  const message = await openpgp.createCleartextMessage({ text: messageText });
  return await openpgp.sign({
    message,
    signingKeys: unlockedPrivateKey,
  });
}

/**
 * Encrypts a message for a contact using only the contact's public key.
 */
export async function encryptMessageForRecipient({
  publicKeyArmored,
  messageText,
}: {
  publicKeyArmored: string;
  messageText: string;
}): Promise<string> {
  const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
  try {
    await publicKey.getEncryptionKey();
  } catch {
    throw new Error(
      "La clave pública no tiene una subclave habilitada para cifrado.",
    );
  }
  const message = await openpgp.createMessage({ text: messageText });

  return await openpgp.encrypt({
    message,
    encryptionKeys: publicKey,
    format: "armored",
  });
}
