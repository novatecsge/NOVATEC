# Despliegue SGE-CECyT9 en Render como una sola aplicación

Esta versión está preparada para desplegar **frontend React + backend Express en un solo Web Service**.
La base de datos PostgreSQL se mantiene en Render dentro del mismo proyecto.

## Estructura de despliegue

- `frontend/` se compila con Vite hacia `frontend/dist`.
- `backend/` sirve la API en `/api/v1`.
- `backend/` también sirve el frontend compilado desde `frontend/dist`.
- Socket.IO funciona sobre la misma URL pública.
- El frontend usa rutas relativas:
  - API: `/api/v1`
  - Socket: misma URL del sitio

## Comandos para Render

Build command:

```bash
npm run build
```

Start command:

```bash
npm start
```

Health check:

```text
/api/v1/health
```

## Variables de entorno necesarias en Render

Si usas el archivo `render.yaml`, Render puede crear varias automáticamente.

Variables requeridas:

```env
NODE_ENV=production
PORT=10000

DB_HOST=...
DB_PORT=5432
DB_NAME=...
DB_USER=...
DB_PASSWORD=...

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_QR_SECRET=...

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_QR_EXPIRES_IN=30d

BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

`FRONTEND_URL` puede quedar vacío si todo se sirve en el mismo dominio.
Si deseas restringir CORS explícitamente, pon la URL pública de Render:

```env
FRONTEND_URL=https://tu-servicio.onrender.com
```

## Base de datos

1. Crea la base PostgreSQL en Render.
2. Conecta el Web Service a esa base mediante variables de entorno.
3. Ejecuta el archivo:

```text
backend/database/schema.sql
```

Puedes ejecutarlo desde pgAdmin conectándote a la base de Render o desde consola con `psql`.

## Desarrollo local

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Localmente conserva:

```env
frontend/.env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
```

En producción se usa:

```env
frontend/.env.production
VITE_API_URL=/api/v1
VITE_SOCKET_URL=
```

## Validación

Antes de subir:

```bash
npm run build
npm start
```

Luego abre:

```text
http://localhost:3000
```

La app debe cargar desde Express y la API debe responder en:

```text
http://localhost:3000/api/v1/health
```
