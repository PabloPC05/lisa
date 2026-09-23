# Decisiones vigentes

Estado de decisiones funcionales y técnicas de Lisa.

## Producto

- Nombre del sistema: **Lisa**.
- Lisa será el centro personal de datos, no únicamente un bot.
- Habrá una UI propia y reemplazable.
- La UI de Nextcloud no será la experiencia principal.
- Deben existir dos botones separados:
  - **Nuevo chat · Con conocimiento**;
  - **Nuevo chat · Sandbox**.
- Además habrá 4–5 agentes especializados configurables.
- Un chat Sandbox podrá descartarse, guardarse como General o continuarse en una categoría/agente.
- La promoción desde Sandbox crea una nueva sesión privada; no eleva privilegios al sandbox.
- Guardar historial y guardar conocimiento son decisiones separadas.

## Datos

- Nextcloud será inicialmente la capa de archivos/sincronización y CalDAV.
- PostgreSQL guardará IDs estables, relaciones, conversaciones, políticas y metadatos.
- Los paths no serán identificadores permanentes.
- Los datos personales viven fuera del repositorio y fuera del código.

## Agentes

- OpenClaw es el runtime candidato inicial.
- Lisa tendrá un adapter; OpenClaw no se convierte en la fuente de verdad.
- Los agentes especializados solo consultan su ámbito.
- El chat General puede consultar conocimiento global autorizado.
- El Sandbox vive en un runtime/contenedor separado.

## Seguridad

- Los prompts no cuentan como frontera de seguridad.
- Las decisiones de autorización se aplican en Lisa API.
- Se diseñará una capa compatible con OpenFGA.
- La política es fail-closed.
- 1Password será la fuente inicial de credenciales.
- Los agentes podrán **usar** credenciales autorizadas, no leer valores secretos.
- Acciones sensibles usan approvals/human takeover.
- Los logs nunca contienen secretos.

## UI

- Web/PWA primero; móvil nativo puede llegar después.
- Archivos, calendario y tareas se presentan con componentes propios.
- Nextcloud queda accesible como interfaz de administración/emergencia.
- Debe existir una futura vista Developer con agente de código, terminal, git diff, preview y Apply/Discard.
- El agente de desarrollo no obtiene por defecto acceso a datos personales.

## Pendientes deliberados

- Motor final de tareas: CalDAV/Nextcloud Tasks vs Vikunja.
- Motor de búsqueda/RAG.
- Motor exacto de autorización (OpenFGA es preferido inicialmente).
- Broker exacto para secret injection.
- Framework frontend.
- Autenticación de Lisa.
