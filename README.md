# Lisa

**Tu espacio personal de datos, conocimiento y agentes.** Lisa se diseña para vivir sobre tu propio servidor, con una interfaz reemplazable y sin entregar la propiedad de tus datos a un runtime de IA.

**Estado: arquitectura integrada en `main` + UI interactiva + contratos de API + plan de Lisa Memory Engine/segundo cerebro documentado + prototipo Python anterior. No hay backend personal conectado, Memory Engine operativo ni datos reales migrados.**

## Probar la interfaz

Con Node.js 22 o superior, sin instalar dependencias:

```bash
npm run dev
# http://127.0.0.1:3000

npm run check
# 21 pruebas JavaScript + compilación
```

La compilación genera `dist/index.html`, un HTML autocontenido que se puede abrir como archivo o publicar, y `dist/openapi.json`. GitHub Actions publica una copia revisable en [`preview/index.html`](preview/index.html) y el contrato en [`preview/openapi.json`](preview/openapi.json). Descargar el HTML para abrirlo: la vista de código de GitHub no ejecuta una aplicación.

**La demo no es un asistente operativo.** No llama a modelos, Nextcloud, calendarios reales, 1Password ni escritorios. Los textos introducidos se mantienen solo en memoria del navegador. Incluso los chats marcados como guardados desaparecen al recargar. No introducir información personal.

## Lo que ya se puede revisar

- Dos entradas independientes: **Con conocimiento** y **Nuevo chat Sandbox**.
- Cinco agentes de ejemplo: Vivienda, Universidad, Finanzas, Personal y Familia.
- Envío de mensajes con respuesta explícitamente simulada; guardado voluntario, categorización y descarte.
- Continuación en otro agente mediante una conversación nueva; original intacto y texto importado no confiable.
- Propuestas de conocimiento separadas del historial y aprobación explícita.
- Archivos ficticios con filtro, búsqueda y vista previa; tareas creables/completables; calendario mensual con eventos ficticios.
- Matriz de permisos propuesta, integraciones no conectadas y registro de actividad de la demo.
- Simulación visual de toma/devolución de control y de propuestas de cambios de código, sin ejecución.
- Diseño adaptable a móvil, navegación por teclado, diálogos, tema claro/oscuro y checklist de revisión.

## Arquitectura objetivo

```text
Lisa UI / futuro cliente móvil
              |
         Lisa API v1
 identidad + autorización + auditoría
       /              |                \
Datos personales   Agentes privados   Runtime Sandbox separado
Nextcloud          OpenClaw adapter   Sin mounts/credenciales privadas
PostgreSQL         General + áreas   Salida de red restringida
       |
Acciones autorizadas -> broker de credenciales -> 1Password / servicio
```

El diagrama es objetivo, no el despliegue actual. `apps/web` no contiene esa infraestructura.

Nextcloud aporta APIs y sincronización; Lisa aporta su UI y contratos. PostgreSQL conserva metadatos y relaciones. Las credenciales pertenecen al broker, no a los modelos. Cambiar de UI o runtime no debe exigir migrar el corpus canónico.

### Segundo cerebro y memoria futura

Lisa tendrá una **memoria personal propia y compartida por todos los agentes**, desplegada en el futuro servidor privado. El diseño aprobado combina:

- **Markdown portable** como conocimiento legible y editable;
- **PostgreSQL** como estado estructurado de hechos, eventos, relaciones, revisiones y procedencia;
- patrón **Current Truth + Timeline + Sources** para distinguir lo vigente del histórico;
- **búsqueda híbrida** por texto, metadata y, tras evaluación, embeddings/pgvector;
- un **Memory Ingestor** que proponga recuerdos desde fuentes autorizadas;
- **Lisa Memory API + MCP interno** para que distintos runtimes consulten la misma memoria bajo ACL.

PGLite queda como candidato local/de desarrollo. GBrain y OpenHuman son referencias de diseño; Mem0 y Graphiti no se adoptan como almacenes paralelos por defecto y solo se evaluarán si aportan una ventaja demostrable.

La demo pública de Vercel no almacenará esta memoria. El detalle y las fases M01–M06 están en [17 · Memoria personal y segundo cerebro](docs/17-memoria-segundo-cerebro.md).

## API preparada, no abierta sin protección

`DemoClient` y `HttpClient` comparten `request(method, path, body)`. Las vistas usan actualmente **solo DemoClient**. El contrato OpenAPI 3.1 define **28 operaciones** sobre chats, conocimiento, archivos, calendario, tareas, acciones, control de escritorio y cambios de código.

El adaptador HTTP apunta al mismo origen, `/api/v1`. La función de servidor incluida devuelve `501 BACKEND_NOT_CONFIGURED` para las funciones privadas; solo `/api/v1/health` responde con `backendConnected: false`. No se ha implementado autenticación, almacenamiento personal, ejecución de agentes ni enforcement de políticas. Activar un backend exige completar esas piezas, no solo cambiar una URL.

## Publicación

El repositorio incluye `vercel.json`: raíz del repo, `npm run build`, salida `dist`, sin dependencias de instalación. Solo se debe publicar la demo ficticia hasta completar la seguridad del backend.

**No se ha confirmado un despliegue en Vercel en esta entrega.** El conector anunció una acción de despliegue que devolvió `Tool deploy_to_vercel not found`; su importador de diseños rechazó el HTML de GitHub porque solo admite otro dominio. El código y el bundle sí están en `main`. Véase [despliegue y revisión](docs/14-ui-despliegue.md) para importar este mismo repositorio en Vercel sin modificarlo.

## Documentación de continuidad

| Documento | Contenido |
|---|---|
| [CONTINUAR](CONTINUAR.md) | Estado verificable y siguiente tarea |
| [01 · Especificación](docs/01-especificacion.md) | Requisitos y aceptación |
| [02 · Arquitectura](docs/02-arquitectura.md) | Límites de componentes y despliegue |
| [03 · Datos](docs/03-datos.md) | IDs, fuentes canónicas, versiones y retención |
| [04 · Agentes](docs/04-agentes.md) | Modos de chat y ámbitos |
| [05 · Contratos](docs/05-contratos.md) | Servicios de dominio |
| [06 · Operación](docs/06-operacion.md) | Seguridad del despliegue, copias y recuperación |
| [07 · Backlog](docs/07-backlog.md) | Secuencia, dependencias y criterios de cierre |
| [08 · Fuentes](docs/08-fuentes.md) | Referencias técnicas |
| [09 · Decisiones](docs/09-decisiones-vigentes.md) | Confirmado, propuesto y sustituido |
| [10 · Prototipo Python](docs/10-sesiones-locales.md) | Sesiones SQLite locales anteriores |
| [11 · Seguridad](docs/11-seguridad-permisos.md) | Amenazas, permisos y secretos |
| [12 · Diseño inicial](docs/12-ui.md) | Boceto y experiencia objetivo |
| [13 · Integraciones](docs/13-integraciones.md) | Adapters y pruebas pendientes |
| [14 · UI / publicación](docs/14-ui-despliegue.md) | Implementación real, Vercel y auditoría |
| [15 · Backend](docs/15-api-y-flujos.md) | Modelos, transacciones, estados y contrato |
| [17 · Memoria](docs/17-memoria-segundo-cerebro.md) | Segundo cerebro, Current Truth/Timeline, búsqueda híbrida, PostgreSQL y MCP |

## Prototipo Python conservado

```bash
python -m unittest discover -s tests -v
python -m lisa route --config config/example.json --user 1001 --chat=-10001 --topic 10
```

Sigue siendo un prototipo local, no la API de Lisa ni un conector a OpenClaw. CI lo ha validado en Python 3.11 y 3.12 tras añadir la UI.

## Límites

Un botón Sandbox en una página no proporciona aislamiento de ejecución. Una etiqueta de categoría no concede permisos. No existe acceso a contraseñas desde el frontend. La UI y los tests de dominio no sustituyen pruebas de seguridad del servidor.

No subir a este repositorio público documentos, conversaciones, credenciales, cookies, dumps ni información personal real. No se ha elegido una licencia de distribución para Lisa; esa decisión sigue pendiente del propietario.
