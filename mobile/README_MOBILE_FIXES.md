# SGE Mobile - Correcciones de estabilidad

Esta versión corrige los errores de render tipo:

- `vehicles.map is not a function`
- `items.map is not a function`
- errores en pestañas por respuestas del backend con forma `{ success, data }`, `{ vehicles }`, `{ notifications }`, etc.

## Cambios principales

1. Normalización centralizada de respuestas en `src/services/api.ts`:
   - `unwrap()` extrae `data` del envelope del backend.
   - `toArray()` convierte respuestas variables en arreglos seguros.
   - `toObject()` evita renderizar datos inválidos.

2. Servicios móviles actualizados:
   - vehicles
   - notifications
   - reservations
   - incidents
   - users
   - parking

3. Pantallas protegidas contra `.map()` sobre objetos:
   - Vehículos
   - Notificaciones
   - Reservas usuario/admin
   - Usuarios admin
   - Incidentes admin
   - Mapa
   - QR

4. Mapa móvil actualizado con las coordenadas SVG reales del mapa web:
   - `src/config/parkingLayout.ts`
   - `src/screens/shared/ParkingMapScreen.tsx`

## Ejecutar

Dentro de `SGE/mobile`:

```powershell
npm install --legacy-peer-deps
npx expo start -c
```

Verifica que `.env` tenga la IP real de tu PC:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.24:3000/api/v1
EXPO_PUBLIC_SOCKET_URL=http://192.168.0.24:3000
```

Si tu IP cambia, actualiza `.env` y reinicia Expo con `-c`.
