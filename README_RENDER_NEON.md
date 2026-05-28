# Despliegue correcto de NOVATEC SGE en Render + Neon

## 1. Preparar Neon

En Neon copia la cadena **Pooled connection string** del proyecto. Debe verse parecido a:

```txt
postgresql://usuario:password@ep-xxxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

Neon requiere conexión SSL; por eso el backend ya fue ajustado para usar `DATABASE_URL` y `DB_SSL=true`.

## 2. Aplicar el esquema en Neon

Desde tu PC, dentro de `backend`, crea temporalmente un `.env` con tu `DATABASE_URL` de Neon y ejecuta:

```bash
npm install
npm run migrate
```

Esto ejecuta `backend/database/schema.sql` en Neon.

## 3. Subir cambios a GitHub

Desde la raíz del proyecto:

```bash
git add .
git commit -m "Configurar despliegue Render con Neon"
git push origin main
```

No subas archivos `.env`. El proyecto ya incluye `.gitignore` para evitarlo.

## 4. Crear backend en Render

Opción recomendada: usar el archivo `render.yaml` desde **New > Blueprint**.

Si lo haces manual:

- Tipo: Web Service
- Root Directory: `backend`
- Runtime: Node
- Build Command: `npm ci`
- Start Command: `npm start`
- Health Check Path: `/api/health`

Variables obligatorias del backend:

```txt
NODE_ENV=production
DATABASE_URL=tu_url_pooled_de_neon_con_sslmode_require
DB_SSL=true
FRONTEND_URL=https://tu-frontend.onrender.com
ALLOWED_ORIGINS=https://tu-frontend.onrender.com,http://localhost:5173,http://127.0.0.1:5173
JWT_ACCESS_SECRET=valor_largo_y_seguro
JWT_REFRESH_SECRET=valor_largo_y_seguro_diferente
JWT_QR_SECRET=valor_largo_y_seguro_diferente
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_QR_EXPIRES_IN=30d
BCRYPT_ROUNDS=12
```

## 5. Crear frontend en Render

- Tipo: Static Site
- Root Directory: `frontend`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Rewrite: `/*` hacia `/index.html`

Variables del frontend:

```txt
VITE_API_URL=https://tu-backend.onrender.com/api/v1
VITE_SOCKET_URL=https://tu-backend.onrender.com
```

Después de crear el frontend, regresa al backend y actualiza:

```txt
FRONTEND_URL=https://tu-frontend.onrender.com
ALLOWED_ORIGINS=https://tu-frontend.onrender.com,http://localhost:5173,http://127.0.0.1:5173
```

Luego presiona **Manual Deploy > Clear build cache & deploy** en ambos servicios.

## 6. Prueba rápida

Abre:

```txt
https://tu-backend.onrender.com/api/health
```

Debe responder algo como:

```json
{
  "ok": true,
  "service": "SGE-CECyT9 API",
  "environment": "production"
}
```

## 7. Cambios realizados para hosting

- Backend compatible con `DATABASE_URL` de Neon.
- SSL habilitado para PostgreSQL en producción.
- Soporte conservado para desarrollo local con `DB_HOST`, `DB_USER`, etc.
- Endpoint `/api/health` para verificar Render.
- Servidor escuchando en `0.0.0.0` y `process.env.PORT`.
- Script `npm run migrate` para aplicar `schema.sql` en Neon.
- `render.yaml` para desplegar backend y frontend desde monorepo.
- `.gitignore` para no subir `.env`, `node_modules` ni builds.
