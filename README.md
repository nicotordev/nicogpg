# nicogpg

Next.js con Prisma 7.10.0, PostgreSQL y Better Auth 1.7.7.

## Desarrollo

1. Copia `.env.example` a `.env` y configura `DATABASE_URL` para tu PostgreSQL.
2. Genera `BETTER_AUTH_SECRET` con `openssl rand -base64 32` y configura `BETTER_AUTH_URL` (local: `http://localhost:3000`).
3. Instala las dependencias y aplica la migración inicial:

```bash
bun install
bun run db:deploy
bun dev
```

`bun install` genera Prisma Client. No se versionan el cliente generado ni los secretos.
La migración inicial crea las tablas de usuarios, sesiones, cuentas y verificaciones.

## Autenticación

- `auth.ts`: instancia del servidor con email/contraseña y cookies para Server Actions.
- `lib/auth-client.ts`: cliente React (`authClient.signUp.email`, `authClient.signIn.email`, `authClient.signOut`, `authClient.useSession`).
- `app/api/auth/[...all]/route.ts`: endpoints GET y POST de Better Auth.
- `lib/prisma.ts`: cliente Prisma reutilizado durante hot reload, con el adaptador PostgreSQL.

El cliente usa el mismo dominio de la aplicación. No hay proveedores OAuth configurados.

## Base de datos

La configuración del CLI está en `prisma7.config.ts`, creada por Prisma 7.10.

```bash
bun run db:generate                 # Regenerar el cliente
bun run db:migrate --name cambio    # Crear/aplicar migraciones en desarrollo
bun run db:deploy                  # Aplicar migraciones existentes
bun run db:studio                  # Explorar datos
```

Antes de compilar o arrancar, configura las variables de entorno. En despliegue,
aplica las migraciones con `bun run db:deploy` y usa la URL pública en `BETTER_AUTH_URL`.

Se mantiene Prisma CLI, Client y adapter-pg en 7.10.0: al inicializar, `prisma@latest`
apuntaba a 8.0.0-rc.20, mientras Client y adapter-pg seguían en la versión estable 7.10.0.

Referencias: [Prisma adapter](https://better-auth.com/docs/adapters/prisma) y
[integración Next.js](https://better-auth.com/docs/integrations/next).
