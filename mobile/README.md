# SGE-CECyT9 Mobile v5

Aplicación móvil Expo + React Native integrada al backend existente de SGE-CECyT9.

## Estado de esta versión

Esta v5 está preparada como base funcional de integración real:

- Usa las rutas reales encontradas en `backend/src/routes/index.js`.
- Respeta los DTO reales del backend: `fullName`, `consentAccepted`, `vehicleType`, `requestedStartAt`, `requestedEndAt`, `qrToken`, `gate`, etc.
- Mantiene un solo ecosistema: misma API, misma base de datos, mismo JWT, mismos roles y mismos eventos Socket.IO.
- Usa `expo-secure-store` para access/refresh tokens.
- Implementa refresh token en interceptor Axios.
- Implementa Socket.IO autenticado con reconexión.
- Incluye estructura por roles: `ADMIN`, `GUARD`, `USER`.

## Instalación

Desde la raíz del proyecto:

```bash
cd mobile
npm install
npm run start
```

## Configuración local

El backend expone la API en:

```txt
/api/v1
```

Para emulador Android normalmente usa:

```txt
http://10.0.2.2:3000/api/v1
http://10.0.2.2:3000
```

Para celular físico usa la IP LAN de tu computadora, por ejemplo:

```txt
http://192.168.1.70:3000/api/v1
http://192.168.1.70:3000
```

Puedes ajustar `mobile/src/config/env.ts` o `app.json`.

## Rutas backend reutilizadas

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `GET /auth/me`
- `PATCH /auth/password`
- `GET /users/profile`
- `PUT /users/profile`
- `GET /users`
- `PATCH /users/:id/status`
- `GET /vehicles`
- `POST /vehicles`
- `PUT /vehicles/:id`
- `DELETE /vehicles/:id`
- `GET /qr/vehicle/:vehicleId`
- `POST /qr/vehicle/:vehicleId/generate`
- `PATCH /qr/:qrId/revoke`
- `POST /access/scan`
- `POST /reservations`
- `GET /reservations/my`
- `GET /reservations/pending`
- `PATCH /reservations/:id/approve`
- `PATCH /reservations/:id/reject`
- `PATCH /reservations/:id/cancel`
- `GET /parking`
- `GET /parking/map`
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`
- `DELETE /notifications/:id`
- `POST /incidents`
- `GET /incidents`
- `PATCH /incidents/:id/status`
- `GET /dashboard/summary`
- `GET /reports/summary`
- `GET /reports/monthly`

## Eventos Socket.IO usados

- `space:update`
- `reservation:new`
- `access:entry`
- `access:exit`
- `notification:new`
- `incident:new`
- `dashboard:update`

## Pruebas mínimas recomendadas

1. Ejecutar backend y verificar `GET /api/v1/health`.
2. Iniciar app móvil.
3. Iniciar sesión con un usuario real del sistema.
4. Validar que `/auth/me` cargue el usuario.
5. Probar que el rol redirija a su navegación correspondiente.
6. Probar vehículos: listar, registrar, editar y eliminar.
7. Generar QR para un vehículo.
8. Entrar como guardia y escanear QR.
9. Verificar que el mapa se actualice por Socket.IO en web y móvil.
10. Verificar reservas, incidentes y notificaciones.

## Ajustes backend incluidos en carpeta `backend_mobile_patches`

No son un backend nuevo. Son recomendaciones puntuales para producción móvil.
