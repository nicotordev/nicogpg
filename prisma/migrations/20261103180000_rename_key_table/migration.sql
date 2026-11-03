ALTER TABLE "gpg_key" RENAME TO "pgp_key";

ALTER TABLE "pgp_key" RENAME CONSTRAINT "gpg_key_pkey" TO "pgp_key_pkey";
ALTER TABLE "pgp_key" RENAME CONSTRAINT "gpg_key_userId_fkey" TO "pgp_key_userId_fkey";

ALTER INDEX "gpg_key_userId_fingerprint_key" RENAME TO "pgp_key_userId_fingerprint_key";
ALTER INDEX "gpg_key_userId_idx" RENAME TO "pgp_key_userId_idx";
ALTER INDEX "gpg_key_keyId_idx" RENAME TO "pgp_key_keyId_idx";
