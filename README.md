# Villas Julie — Panel administrativo

Frontend React del sistema de reservas Villas Julie. Consume exclusivamente la API autenticada del backend oficial y no contiene conexiones a Baileys, Redis ni datos simulados.

## Requisitos

- Node.js 20, 22 o 24.
- pnpm 10 o superior mediante Corepack.
- Backend Villas Julie disponible.

## Desarrollo local

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

`VITE_API_URL` puede quedar en `http://localhost:4000`. Vite también configura proxy local para las rutas del backend.

## Validación y compilación

```bash
pnpm test
VITE_API_URL=https://api.example.com pnpm build
pnpm run security:audit
```

La compilación de producción falla deliberadamente si falta `VITE_API_URL`.

## Cloudflare Pages

- Framework preset: `Vite`.
- Build command: `pnpm build`.
- Build output directory: `dist`.
- Production branch: `master`.
- Variable: `VITE_API_URL=https://DOMINIO-DEL-BACKEND`.

El archivo `public/_redirects` permite que React Router funcione al recargar rutas internas. Cloudflare proporciona HTTPS y un subdominio `*.pages.dev` sin comprar dominio.

Después de publicar el frontend, agregue su URL exacta a `CORS_ORIGIN` en el backend.

## Seguridad

- No versione `.env` ni secretos.
- El panel guarda el JWT administrativo en `localStorage`; use siempre HTTPS.
- No existe inicio de sesión automático ni credenciales predeterminadas.
- Si la API rechaza el JWT, la sesión local se elimina y se solicita iniciar sesión nuevamente.
