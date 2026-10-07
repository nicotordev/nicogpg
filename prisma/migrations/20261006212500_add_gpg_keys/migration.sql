-- CreateTable
CREATE TABLE "gpg_key" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "keyType" TEXT NOT NULL DEFAULT 'Ed25519',
    "avatarColor" TEXT NOT NULL DEFAULT 'red',
    "publicKey" TEXT,
    "encryptedPrivateKey" TEXT,
    "kdfSalt" TEXT,
    "kdfParams" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gpg_key_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gpg_key_keyId_key" ON "gpg_key"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "gpg_key_fingerprint_key" ON "gpg_key"("fingerprint");

-- CreateIndex
CREATE INDEX "gpg_key_userId_idx" ON "gpg_key"("userId");

-- AddForeignKey
ALTER TABLE "gpg_key" ADD CONSTRAINT "gpg_key_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
