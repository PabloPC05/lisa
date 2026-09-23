# 04 · Agentes, contexto y móvil

## Agentes objetivo

| Agente | Lectura/escritura ordinaria | Skills que se evaluarían |
|---|---|---|
| vivienda | Vivienda | expedientes, documentos, suministros |
| finanzas | Finanzas | extracción de recibos, conciliación, tablas |
| universidad | Universidad | apuntes, referencias, ejercicios |
| familia | Familia | organización de expedientes |
| personal | Personal | notas, tareas, compras |
| coding | Workspace de código | desarrollo y pruebas |
| coordinador | Índice mínimo sin contenido sensible | selección explícita de área y delegación autorizada |

El coordinador no recibe acceso global por defecto. Una consulta entre áreas debe declarar ámbito y transferir solo los fragmentos necesarios. Compartir un segundo cerebro significa compartir organización e identidad, no entregar todo el corpus a todos los agentes.

## Capas distintas

- Agente: rol, permisos, herramientas, skills y memoria de área.
- Sesión: historial de una conversación/expediente.
- Memoria persistente: notas curadas, hechos, decisiones y fuentes.
- Contexto de una llamada: subconjunto concreto enviado al proveedor del modelo.

Tener 10 GB de documentos disponibles no consume 10 GB de tokens. Sí consumen los textos que se cargan: instrucciones, catálogos de herramientas/skills, historial y resultados recuperados. Verificar trazas reales; no prometer coste cero por tener sesiones separadas. Las compacciones y resúmenes también tienen coste y pueden perder detalles.

## Ensamblado del contexto

1. Comprobar usuario, chat, tema y permisos antes de invocar un modelo.
2. Identificar agente y sesión mediante configuración explícita.
3. Cargar instrucciones breves y memoria índice del área.
4. Buscar dentro de ACL; seleccionar fragmentos con documento/versión/página.
5. Incorporar solo las skills necesarias y un historial reciente limitado.
6. Reservar espacio para herramientas y salida; si no cabe, reducir recuperación o dividir la tarea.
7. Registrar tokens de entrada/salida/cache, modelo, duración y coste cuando el proveedor lo devuelva; señalar estimaciones.

Presupuesto inicial de diseño por llamada: hasta 2.000 tokens de instrucciones, 2.000 de memoria, 4.000 de historial y 8.000 de evidencia. Es un objetivo configurable, no un límite implementado ni universal. Ajustarlo al modelo real y medir el overhead del runtime. Los límites monetarios quedan pendientes de proveedor/precios y preferencia del usuario.

## Telegram

Propuesta: un bot, un grupo privado con Topics y un tema por área. Usuario permitido y chat permitido se validan juntos. Topic desconocido se rechaza, no se manda a un agente con acceso global. Configurar manualmente IDs reales fuera de Git.

OpenClaw documenta temas/sesiones y agentes por tema. La sintaxis depende de versión: validar la configuración con la versión fijada en B01. `config/example.json` solo especifica nuestro contrato y no debe copiarse a `openclaw.json`.

Un tema por área no resuelve por sí solo múltiples expedientes simultáneos. Añadir después creación/selección explícita de expediente o subtema, con clave que incluya agente, cuenta, chat, tema y expediente. El routing inicial conserva su clave de demostración. El nuevo almacén `lisa.sessions` incluye expediente UUID y persistencia; ver [contrato local](10-sesiones-locales.md). No equivale a aislamiento nativo OpenClaw.

Prueba de B01: dos temas, dos agentes, instrucciones identificables, skills distintas, dos mensajes por tema, reinicio y un mensaje posterior. Comprobar respuestas, historiales, permisos y trazas. DMs deshabilitados en la primera configuración salvo diseño explícito. Usar polling inicialmente para evitar webhook público; no operar simultáneamente dos consumidores del mismo bot.

Alternativas si la experiencia de temas no resulta cómoda: Control UI móvil autenticada o bots separados. No hacen falta varios bots por requisito arquitectónico.

## Permisos efectivos

Montajes por área, usuario de servicio limitado, herramientas con ACL y sandbox de ejecución. Nada de Docker socket, directorio raíz del host o shell general para agentes documentales. Coding no monta documentos personales. Browser workers con perfiles separados y acceso a descargas staging, no a todo el corpus.

Una ruta permitida debe normalizarse y resistir `..`, rutas absolutas y symlinks fuera del área. En producción usar apertura confinada que evite TOCTOU; el prototipo comprueba paths en reposo y no soluciona carreras adversarias. Filtrar antes de buscar/rankear; no solo antes de mostrar el resultado.
