# NOVATEC SGE · Iteración v9 Estabilidad Dark Premium

## Objetivo
Nueva corrección enfocada en estabilidad visual, responsive real y calidad premium del dark mode, sin modificar lógica de negocio, servicios, rutas, backend ni flujos funcionales.

## Archivo principal modificado
- `frontend/src/styles/index.css`

## Correcciones aplicadas

### 1. Sidebar/navbar colapsado
- Reestructura visual del layout base para evitar compresión y superposición.
- Corrección de ancho mínimo/máximo del sidebar colapsado.
- El estado colapsado ahora centra iconos, oculta textos sin dejar espacios defectuosos y evita que el botón de colapso choque con el logo.
- Se eliminó el comportamiento visual roto del card de estado al colapsar.
- Transiciones suavizadas en ancho, opacidad y estados activos.

### 2. Responsive premium
- Se corrigió el layout de escritorio, tablet y móvil con reglas específicas.
- En tablet el sidebar se convierte en navegación superior estable con grupos organizados.
- En móvil la navegación se convierte en una experiencia tipo app con scroll horizontal, botones táctiles amplios y dark mode consistente.
- Se optimizaron cards, tablas, reportes, gráficas, mapa, dropdowns y chatbot para pantallas pequeñas.

### 3. Dark mode y contraste
- Refuerzo global de contraste para textos principales, secundarios, labels, placeholders, badges, tablas, formularios y paneles.
- Mejora de legibilidad en tarjetas, inputs, selects, botones, dropdowns, notificaciones, tooltips y reportes.
- Estados hover/focus más visibles y coherentes con colores por rol.

### 4. Dropdowns, overlays y z-index
- Se reforzó el comportamiento visual de paneles flotantes.
- Notificaciones y perfil ahora tienen límites de altura, scroll interno y comportamiento estable en móvil como panel inferior.
- Se redujo el riesgo de overlays fuera de pantalla.

### 5. Mapa, tablas y gráficas
- Contenedores con overflow táctil y scroll horizontal/vertical estable.
- Tablas con ancho mínimo para evitar deformaciones.
- Mapa protegido contra recortes, con scroll usable en móvil.
- Gráficas protegidas contra desbordamiento visual.

## Validación ejecutada
- `npm ci`
- `npm run build`

Resultado: build de producción exitoso con Vite.

## Nota técnica
No se modificó lógica, backend, servicios, stores, rutas ni estructura funcional. Esta iteración se concentró en CSS/layout para estabilidad visual y experiencia responsive.
