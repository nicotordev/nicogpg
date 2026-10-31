# nicogpg

Next.js with Prisma 7.10.0, PostgreSQL, and Better Auth 1.7.7.

## Development

1. Copy `.env.example` to `.env` and configure `DATABASE_URL` for your PostgreSQL instance.
2. Generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32` and set `BETTER_AUTH_URL` (local: `http://localhost:3000`).
3. Install dependencies and apply the initial migration:

```bash
bun install
bun run db:deploy
bun dev
```

`bun install` generates Prisma Client. The generated client and secrets are not committed.
The initial migration creates the users, sessions, accounts, and verifications tables.

## Authentication

- `auth.ts`: Server instance configured with email/password, OTP, magic links, and cookies for Server Actions.
- `lib/auth-client.ts`: React client (`authClient.signUp.email`, `authClient.signIn.email`, `authClient.signIn.passkey`, `authClient.signOut`, `authClient.useSession`).
- `app/api/auth/[...all]/route.ts`: Better Auth GET and POST endpoints.
- `lib/prisma.ts`: Reused Prisma client instance across hot reloads using the PostgreSQL adapter.

The client runs on the same domain as the app. No OAuth providers are configured.
The `/auth/sign-up` and `/auth/sign-in` routes offer registration and login with email, OTP, magic link, passkey, or password (passwords require at least 8 characters).

## Database

CLI configuration is located in `prisma7.config.ts`, created by Prisma 7.10.

```bash
bun run db:generate                 # Regenerate client
bun run db:migrate --name change    # Create/apply migrations in development
bun run db:deploy                  # Apply existing migrations
bun run db:studio                  # Explore data
```

Before building or starting, ensure your environment variables are configured. In production/deployment,
apply migrations with `bun run db:deploy` and use your public URL in `BETTER_AUTH_URL`.

Prisma CLI, Client, and adapter-pg are pinned to 7.10.0: during initialization, `prisma@latest`
pointed to 8.0.0-rc.20 while Client and adapter-pg remained on stable 7.10.0.

References: [Prisma adapter](https://better-auth.com/docs/adapters/prisma) and
[Next.js integration](https://better-auth.com/docs/integrations/next).

## Passkeys

At `/auth/sign-in`, you can log in with a previously registered passkey.
To register your first passkey, sign in with your email and password and visit
`/auth/passkeys`. The server requires an active session to register credentials.

Apply migrations with `bun run db:deploy` before using this feature.
Set `BETTER_AUTH_URL` to the actual application origin: Better Auth derives
the RP ID from its hostname. In production use HTTPS; in local development
`http://localhost:3000` is permitted. Passkeys are bound to the domain where they are registered.

Integration: [Official Passkey plugin](https://better-auth.com/docs/plugins/passkey).
