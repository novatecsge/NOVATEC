# SGE-CECyT9 Web + Mobile conectado

Este ZIP contiene el ecosistema completo para pruebas locales:

```txt
SGE/
  backend/   API Express + PostgreSQL + Socket.IO
  frontend/  Web React/Vite existente
  mobile/    App móvil Expo/React Native integrada al mismo backend
```

## Estado

La app móvil **no crea otra base de datos ni otro backend**. Consume las mismas APIs del backend y se conecta al mismo Socket.IO que la web.

## 1. Configurar IP local

En PowerShell ejecuta:

```powershell
ipconfig
```

Busca tu IPv4, por ejemplo:

```txt
192.168.1.25
```

Esa IP se usa para que el celular encuentre el backend. En celular físico **no uses localhost**.

## 2. Backend

Edita `backend/.env`:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://TU_IP_LOCAL:5173
```

Ejemplo real:

```env
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://192.168.1.25:5173
```

Instala y corre:

```bash
cd backend
npm install
npm run dev
```

Prueba en navegador:

```txt
http://localhost:3000/api/v1/health
```

Debe responder `API operativa`.

## 3. Web

Para probar desde la misma PC, `frontend/.env` puede quedar así:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
```

Corre la web:

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

Abre:

```txt
http://localhost:5173
```

## 4. Mobile

Crea `mobile/.env` usando tu IP LAN:

```env
EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:3000/api/v1
EXPO_PUBLIC_SOCKET_URL=http://TU_IP_LOCAL:3000
```

Ejemplo:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.25:3000/api/v1
EXPO_PUBLIC_SOCKET_URL=http://192.168.1.25:3000
```

Corre:

```bash
cd mobile
npm install
npx expo start
```

Escanea el QR con Expo Go o abre en emulador.

## 5. Cómo comprobar que web y móvil están conectados

1. Inicia sesión en la web.
2. Inicia sesión en la app con el mismo usuario.
3. Crea o modifica un vehículo/reserva/incidente/notificación desde una plataforma.
4. Verifica que la otra plataforma consulta los mismos datos.
5. Para mapa/accesos, prueba eventos de entrada/salida; ambos clientes deben actualizarse usando Socket.IO.

## Cambios aplicados al backend para móvil

Se ajustó CORS y Socket.IO para permitir:

- Web local `localhost:5173`
- Web en IP LAN
- Clientes nativos/Expo sin header `origin`

Archivo modificado:

- `backend/src/config/env.js`
- `backend/src/app.js`
- `backend/src/server.js`

## Importante

Este ZIP está listo para **pruebas de integración web + móvil**. Si algún endpoint devuelve un payload distinto al esperado por la app, se corrige el servicio móvil correspondiente sin crear APIs duplicadas.
