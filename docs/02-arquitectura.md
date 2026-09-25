# 02 · Arquitectura objetivo y límites

Fecha: 23-09-2026. La UI v0.3 implementa solo la capa de presentación y una simulación local. El resto de este documento especifica lo que debe construirse.

## 1. Componentes y propiedad

| Componente | Responsabilidad | No debe hacer |
|---|---|---|
| Lisa UI | Navegación, chat, vistas, consentimiento y revisión | Guardar secretos, decidir ACL, acceder directamente a DB |
| Lisa API / BFF | Identidad, contratos, validación, autorización y composición | Confiar en un agentId enviado como prueba de identidad |
| AuthorizationService | Decidir principal/acción/recurso/contexto | Delegar decisiones a prompts |
| Personal Data Hub | Fuentes, registro estable, relaciones e historial autorizado | Depender de un runtime como único almacén |
| Lisa Memory Engine | Current Truth, Timeline, procedencia, ingesta y recuperación compartida | Convertir cada chat en memoria ni mantener una verdad distinta por modelo |
| Nextcloud adapter | Archivos/versions/CalDAV vía interfaces soportadas | Modificar el datadir interno de Nextcloud como si fuese una carpeta común |
| AgentRuntime adapter | Runs, cancelación, mensajes/eventos y capabilities | Incluir reglas personales únicamente en el proveedor |
| Sandbox controller | Entorno efímero, mounts/red/quotas y destrucción | Compartir perfil, tokens o sockets privados |
| Action broker | Acción limitada y aprobada, secretos e idempotencia | Ofrecer un endpoint genérico de lectura de contraseñas |
| Worker gráfico | Navegador/desktop de tarea y control exclusivo | Usar el escritorio personal principal sin consentimiento |
| Developer worker | Repo, pruebas, preview y propuestas | Montar datos/cuentas privadas o desplegar sin revisión |

## 2. Topología objetivo

```text
Cliente humano autenticado
        |
 Reverse proxy HTTPS
        |
 Lisa UI + Lisa API -------- AuthorizationService + auditoría
        |                         |
        |                  decisiones verificadas
        |
        +-- Data adapters ---- Nextcloud / PostgreSQL / índice autorizado
        +-- Private runtime -- General / cinco áreas
        +-- Action broker ---- 1Password + servicios autorizados
        +-- Sandbox relay ---- cola de mensajes/exportación controlada
                                    |
                             Sandbox worker separado
```

El runtime Sandbox no recibe acceso de red general a Lisa API ni a los almacenes privados. Un relay de alcance mínimo entrega únicamente mensajes de su tarea y admite resultados/exportaciones. No reutilizar la credencial del humano para comunicar un worker. El llamante del relay tiene identidad distinta y permisos de sesión acotados.

Separar contenedores y usuarios reduce exposición, pero un contenedor comparte kernel y no equivale a separación física. Para ejecutar software no confiable o privilegios fuertes, la base propuesta es una VM/host separado. En VPS sin virtualización anidada se debe elegir otro worker/host o reducir capacidades; no prometer garantías que el host no proporciona.

## 3. Interfaz estable

UI -> contrato `/api/v1` -> servicios de dominio -> adapters. Las vistas no importan SDKs de Nextcloud, 1Password ni OpenClaw. La demo usa `DemoClient`; el futuro transporte usa `HttpClient` del mismo origen. Aislar la normalización de errores, paginación, cancelación y streams del framework visual.

El backend puede ser Python o TypeScript; no se fija por existir un prototipo Python. La elección debe conservar OpenAPI, pruebas de comportamiento y exportabilidad. El frontend v0.3 usa módulos ECMAScript y CSS sin paquetes externos para que el primer diseño sea reproducible. Migrarlo a React/Vite u otro framework no cambia por sí mismo los contratos ni las políticas.

## 4. Persistencia y fuentes canónicas

Nextcloud será autoridad para bytes/versiones de documentos y objetos DAV. PostgreSQL será autoridad para IDs Lisa, correspondencias con proveedores, historial guardado, etiquetas de información, relaciones, permisos y acciones. Un índice de búsqueda es derivado y regenerable. Las notas duraderas se exportan como Markdown con metadatos; sincronizar mediante un único propietario de escritura y revisiones.

Los archivos no necesitan un agente para existir. Una migración de proveedor conserva los UUID de Lisa y cambia sus mappings. No significa que cambiar cualquier servicio sea gratis: cada adapter y migración requiere pruebas de compatibilidad y recuperación.

## 5. Memoria y acceso

La memoria personal futura se implementará como un **Lisa Memory Engine** compartido por todos los agentes. El diseño objetivo combina: Markdown portable para conocimiento visible; PostgreSQL para estado, revisiones, hechos, eventos, relaciones y procedencia; búsqueda híbrida por texto/metadata y, tras evaluación, vectores; y una interfaz Lisa API/MCP interna. En desarrollo local puede evaluarse PGLite, manteniendo PostgreSQL como objetivo del servidor.

El patrón de conocimiento será **Current Truth + Timeline + Sources**: mantener arriba la verdad vigente, conservar debajo cómo cambió y poder explicar de qué fuente sale cada afirmación. La ingesta automática generará candidatos de memoria y aplicará la política de aprobación antes de promoverlos a conocimiento confiable. Véase [17 · Memoria personal y segundo cerebro](17-memoria-segundo-cerebro.md).

Agente General: puede recuperar áreas autorizadas, con capacidades de acción separadas. Especializados: recuperación limitada a áreas concedidas. Sandbox: ninguna fuente personal. Developer: código y fixtures por defecto. El contexto debe registrar fuentes y heredar etiquetas de confidencialidad. **Autorización precede a la búsqueda y también a MCP**; no filtrar solo después de enviar fragmentos al modelo.

Guardar un chat no vuelve fiable a su agente ni concede credenciales. El registro del agente, el archivado de una sesión y la promoción de información a memoria durable son estados independientes. Los agentes no leen directamente PostgreSQL ni directorios de conocimiento: usan servicios de dominio que aplican scopes, auditoría y procedencia.

## 6. Acciones y trabajos

Petición -> autorización -> propuesta normalizada -> confirmación si necesaria -> ejecución idempotente -> resultado auditado. Los trabajos prolongados viven fuera de una petición HTTP. Cola durable, cancelación y reanudación forman parte del backend futuro. No ejecutar navegadores de larga duración dentro de la función de demostración de Vercel.

La decisión humana se vincula al contenido concreto, recurso, destino, caducidad y revisión. Modificar cualquiera invalida la aprobación. Tras una recuperación no se repite un pago/envío porque haya vencido una petición HTTP.

## 7. Publicación de UI frente a sistema personal

Vercel se utiliza para revisar una demo con datos ficticios. No alberga en esta entrega DB privadas, Nextcloud, runtimes, 1Password ni terminales. Una futura UI remota autenticada requeriría diseñar BFF/túnel/red y cookies; no exponer el servidor de casa con CORS abierto.

La opción inicial del producto real es servir UI y API desde el mismo origen privado autenticado. El bundle público de revisión no lleva rutas, cuentas, nombres ni datos del propietario.

## 8. Separación física de directorios propuesta

```text
/opt/lisa/releases/<commit>     código inmutable desplegado
/srv/lisa/nextcloud             volúmenes administrados por Nextcloud
/srv/lisa/postgres              metadatos, memoria estructurada e índices aprobados
/srv/lisa/runtime/private       sesiones privadas
/srv/lisa/runtime/sandbox       disco efímero separado; sin montajes privados
/srv/lisa/quarantine            ingesta no confiable
/srv/lisa/backups               copias cifradas locales + destino externo
```

Son rutas de diseño, no directorios creados. Desarrollo se hace sobre una copia del repositorio sin esos volúmenes. El daemon Docker y sus sockets no se entregan a agentes.

## 9. Compatibilidad externa

OpenClaw es candidato inicial, no dependencia obligatoria de UI. Debe fijarse versión y probar sesiones, identidad, eventos, tools y computer-use en el host elegido. Las afirmaciones previas sobre botones Desktop/Take control no constituyen una prueba de integración. Nextcloud y 1Password también requieren una prueba real antes de marcar una conexión como activa. Véase 13.
