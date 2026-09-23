# 16 · Inicio Cielo

Entrega: 24-09-2026 (hora de Madrid). Código funcional: `267a2d79a11b157fabaa21a8ab88010d14cc547e`.

## Requisito confirmado

Inicio se inspira en el paisaje/cielo del portfolio de Zainab Kabira 2026 y conserva las transparencias del diseño de Lisa. No es una landing comercial ni un gestor de ventanas: mantiene accesos funcionales, chat y widgets ligeros. Cada aplicación puede tener una identidad propia. El estilo Windows 98 queda reservado al módulo Archivos; esa adaptación NO forma parte de esta entrega. Chat, Conocimiento y las demás vistas conservan su diseño y lógica anteriores.

## Qué funciona

- Cielo degradado con interpolación continua de paletas, nubes en capas, montañas lejanas, grano SVG, pájaros, sol decorativo, luna y estrellas nocturnas.
- Fecha, saludo y luz según el reloj local del dispositivo. No se solicita geolocalización ni se envían consultas meteorológicas.
- Reloj superior derecho con selector de minutos, cuatro presets y botón «Usar la hora real». La vista manual se identifica expresamente como vista previa.
- Navegación real a las vistas demo existentes de archivos, conocimiento, agentes, calendario, tareas e historial. Dos entradas separadas a chat general y Sandbox.
- Sidebar y superficies glass coloreadas por el cielo solo durante Inicio.
- Pausa de movimiento, respeto por `prefers-reduced-motion`, pausa en pestaña oculta y diseño responsive.

Los datos siguen siendo ficticios y efímeros. No se han conectado IA, Nextcloud, cuentas o servicios personales. Los accesos a aplicaciones no equivalen a integraciones operativas.

## Arquitectura

`apps/web/sky.mjs` contiene las funciones puras `skyHour`, `skyMix`, `skyEnvironment` y `skyClock`, más un controlador DOM. Un observador sobre el montaje existente activa `body.sky-home-active` únicamente cuando existe `#sky-home`. El controlador no modifica `app.mjs` ni necesita conocer sus variables internas.

`apps/web/sky.css` encapsula los estilos del paisaje y los overrides del shell bajo el estado de Inicio. Salir de Inicio elimina ese estado y devuelve los estilos previos a cada aplicación. No se importa globalmente una biblioteca retro.

`apps/web/index.html` conserva el contrato `#home-dashboard` consumido por la aplicación y sus atributos de navegación. Incluye las ilustraciones SVG originales y los controles semánticos.

`tools/build.mjs` incorpora ambos CSS y concatena los módulos existentes más `sky.mjs`. El resultado es autocontenido: sin dependencias npm nuevas, fuentes externas, imágenes remotas, vídeo o WebGL. `build-info.json` identifica esta revisión como `0.5.0-sky` y `home: sky-local-clock`.

El reloj se actualiza cada diez segundos solo mientras Inicio está visible. El parallax usa `requestAnimationFrame` limitado a eventos del ratón; no hay un bucle de render continuo JavaScript. Las nubes se animan con transformaciones CSS. El único almacenamiento añadido es la preferencia de movimiento; su lectura/escritura maneja la indisponibilidad de localStorage.

## Límites deliberados

El movimiento del sol y la luna es ilustrativo; no es un cálculo astronómico. Amanecer y atardecer se aproximan mediante una curva horaria, no mediante latitud, estación y efemérides. El selector lo indica explícitamente. No se implementan clima real, estaciones, luna físicamente correcta, sonidos ni edificios como módulos interactivos.

La navegación y los widgets siguen empleando DemoClient. No persistir documentos ni introducir datos personales en esta publicación de revisión. El título de versión en la barra preexistente aún dice Preview 0.4; la versión del bundle nuevo se consulta en build-info.json.

## Validación ejecutada

1. Cinco pruebas nuevas en `tests/web/sky.test.mjs`: horas inválidas y wraparound; continuidad de colores al cambiar tramo y cruzar medianoche; fases; validez de los 1.440 minutos; formato del reloj.
2. Chromium sobre el HTML autocontenido generado por GitHub Actions: cambio de presets, restauración de hora real, Escape, navegación a Archivos, lector Markdown existente, compositor de chat existente, sidebar colapsable, preferencia de movimiento reducido y menú móvil. Sin errores JavaScript en esas pruebas.
3. Capturas a 1440 × 980 y 393 × 852; sin desbordamiento horizontal. No se ha realizado una auditoría completa de accesibilidad ni una matriz de navegadores Safari/Firefox.
4. CI del commit funcional: UI checks and review bundle y prototype completados con éxito. Run UI: https://github.com/PabloPC05/lisa/actions/runs/35926467862 ; run Python: https://github.com/PabloPC05/lisa/actions/runs/35926467838 .
5. Vercel: despliegue `dpl_MTpnuDCpAW7AUjWSX2SkrBwgGcG6` en estado READY, commit de bundle `ea96f927fb7002230dbb8eba5b0dd6b0fe019862`. URL de producción https://lisa-ten-gray.vercel.app ; `/build-info.json` responde HTTP 200 con la versión Sky. El hash del script publicado coincide con el del artefacto CI descargado para las pruebas.

## Fuentes de la investigación

- Referencia visual indicada: https://www.awwwards.com/sites/zainab-kabira-portfolio-2026 ; portfolio https://zainabkabira.com/ . Se reutiliza la dirección artística de cielo, nubes, serif y transparencia, no sus assets ni código.
- MDN, backdrop-filter: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter . Superficies semitransparentes para que el fondo filtrado sea visible, con fallback opaco cuando no esté soportado.
- MDN, prefers-reduced-motion: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion . Preferencia del sistema por encima de la animación decorativa.
- SunCalc: https://github.com/mourner/suncalc . Revisado como opción de efemérides futuras, NO instalado ni utilizado. Añadirlo solo tras elegir ciudad aproximada o ubicación voluntaria y probar la API de la versión fijada.

## Continuación

Revisar esta dirección visual con el propietario. Refinar composición/nubes antes de añadir un motor 3D. Para Archivos, implementar una skin local independiente sin afectar este Inicio ni importar CSS retro al shell. Mantener los trabajos de backend, permisos y persistencia separados del rediseño.
