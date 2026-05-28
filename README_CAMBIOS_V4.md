# Cambios SGE Web + Mobile Fixed v4

Correcciones aplicadas sobre la app móvil:

1. Sesión al abrir la app
- La app ya no restaura sesiones anteriores desde SecureStore.
- Al abrir Expo siempre se limpia la sesión local y se muestra Login.
- Esto evita que entre con usuarios residuales/inexistentes.

2. Escáner QR de guardia
- El resultado ya no imprime JSON completo.
- Ahora muestra solamente: ENTRADA REGISTRADA, SALIDA REGISTRADA o ACCESO PROCESADO.
- También muestra datos útiles si vienen del backend: placa, cajón y usuario.

3. Navegación desde cámara
- Se agregaron botones visibles dentro de la cámara para ir a Mapa y Avisos.
- Se agregó botón para pausar/reanudar el escaneo.
- Tras escanear, se pausa la cámara para que el guardia pueda leer el resultado y moverse.

4. Colores por rol
- Admin usa azul.
- Guardia usa naranja.
- Usuario usa verde.
- Se aplicó en tabs/header para diferenciar los roles.

Ejecutar:

cd SGE/mobile
npm install --legacy-peer-deps
npx expo start -c

Verifica .env:

EXPO_PUBLIC_API_URL=http://TU_IP:3000/api/v1
EXPO_PUBLIC_SOCKET_URL=http://TU_IP:3000
