-- Short key IDs (last 8 hex chars) are not globally unique.
-- The same fingerprint may be stored once per user.
DROP INDEX IF EXISTS "gpg_key_keyId_key";
DROP INDEX IF EXISTS "gpg_key_fingerprint_key";

CREATE UNIQUE INDEX "gpg_key_userId_fingerprint_key" ON "gpg_key"("userId", "fingerprint");
CREATE INDEX "gpg_key_keyId_idx" ON "gpg_key"("keyId");
