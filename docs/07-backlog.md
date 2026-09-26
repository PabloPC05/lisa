# 07 · Backlog ejecutable v0.3

Actualizado: 26-09-2026. Hitos por dependencias, no estimaciones temporales. No marcar una integración como hecha por existir su tarjeta en la UI.

## Estado heredado y transición

Se conservan B00 (especificación/prototipo inicial) y B19 (sesiones locales SQLite) como completados en su alcance anterior. El resto de la planificación B01–B20 se reorganiza aquí: Telegram deja de ser interfaz obligatoria; la selección de datos pasa a Nextcloud vía API; el nuevo trabajo se identifica como Lxx. El historial Git conserva el backlog anterior.

## Entregas completadas

| ID | Entrega | Evidencia y límite |
|---|---|---|
| L00 | Integrar arquitectura en main | PR #1 fusionado; no despliegue personal |
| L01 | UI de revisión v0.3 | apps/web; dos chats, 5 áreas y vistas funcionales con fixtures |
| L02 | Lógica de demo y seam HTTP | DemoClient/HttpClient; servidor privado 501, no backend |
| L03 | Contrato inicial | OpenAPI 3.1, 28 operaciones; DTOs de salida a concretar |
| L04 | Pruebas/build | 21 tests Node + build, CI exitoso; Python previo pasa 3.11/3.12 |
| L05 | Bundle autocontenido revisable | preview/index.html y contrato generados por CI |
| L06 | Publicación Vercel de revisión | Proyecto `lisa` conectado al repo y deployment READY verificado; sigue sin backend personal |

## Pendiente: revisión y primer backend

| ID | Prioridad | Depende | Entrega / criterio de cierre |
|---|---|---|---|
| L07 | P0 | L01 | Auditoría de UI del propietario: dos flujos, móvil/teclado, estados y cambios de diseño registrados |
| L08 | P0 | L03 | Concretar DTOs y validadores: frontend y backend pasan mismos casos, errores versionados |
| L09 | P0 | L08 | Identidad/sesión/CSRF/ACL: solicitudes directas y agente falso rechazados antes de leer datos |
| L10 | P0 | L09 | Esquema PostgreSQL + migraciones: conversaciones, mensajes, labels, scopes, fuentes, jobs, idempotencia y auditoría |
| L11 | P0 | L10 | Chats persistentes: nuevos sin archivar, save con revisión, discard/purge; reinicio y concurrencia probados |
| L12 | P0 | L11 | Promoción segura: nuevo ID, original intacto, etiquetas y adjuntos revisados, una sola creación por operación |
| L13 | P0 | L09,L10 | Nextcloud adapter: listar/resolver/subir/move/rename/versionado en instancia ficticia; conflictos y recuperación |
| L14 | P0 | L13 | Registro documental: UUID independiente del proveedor, exportación y restore preservan identidad |
| L15 | P0 | L09,L11 | Private runtime adapter para tareas: verificar OpenClaw si se adopta, scopes por agente, fuentes selectivas, cuota y cancelación; no es requisito para chat de preguntas sin herramientas |
| L16 | P0 | L09 | Sandbox real: usuario/runtime/red/volumen separados, pruebas desde dentro sin acceso a host/datos/secretos |
| L17 | P0 | L12,L15,L16 | Conversaciones reales y modos de ejecución: continuidad sin trasladar credenciales; provider retention y costes visibles. El chat de solo preguntas puede avanzar por C01–C04 sin runtime de programación |
| L18 | P0 | L14,L15 | Conocimiento/RAG: propuesta/revisión/revocación, citas y filtros antes del modelo; evaluación de 20 consultas |
| L19 | P0 | L10,L14 | Copias: restaurar fixtures en host limpio, comprobar hashes/UUID/permisos y medir RPO/RTO |
| L20 | P0 | L09,L13 | Infra privada reproducible: versiones/digests, healthchecks, HTTPS, límites, secretos y rollback revisados |

## Pendiente: gestiones y extensiones

| ID | Prioridad | Depende | Entrega / criterio de cierre |
|---|---|---|---|
| L21 | P1 | L09,L10 | CalDAV: CRUD simple, UID/mapping, zonas horarias, conflictos y citas autorizadas |
| L22 | P1 | L21 | Tareas: probar CalDAV/Nextcloud Tasks; justificar Vikunja solo si hace falta |
| L23 | P1 | L09,L10 | Action broker: propuesta/hash/aprobación/caducidad, idempotencia y estado incierto |
| L24 | P1 | L23 | 1Password: cuenta/vault mínimo, broker aislado, secretos no presentes en modelo/log/frontend |
| L25 | P1 | L16,L23 | Browser/computer: worker efímero, identidad por tarea, origin allowlist y límites de sesión |
| L26 | P1 | L25 | Takeover: control exclusivo, cancelación de inputs, desconexión segura y captura actualizada |
| L27 | P1 | L17,L19,L20 | Piloto personal: permiso explícito, muestra pequeña, backup probado e inventario reversible |
| L28 | P2 | L20,L23 | Developer ejecutable: code-only, tests/diff/preview, aprobación de commit y rollback, sin datos personales |
| L29 | P2 | L18 | OCR/audio y embeddings solo tras benchmark de calidad/coste y aislamiento |
| L30 | P2 | L17 | Canales adicionales, app/PWA offline parcial, import/export y notificaciones privadas |

## Track de memoria personal

Diseño confirmado; no está implementado. Este track desarrolla [17 · Memoria personal y segundo cerebro](17-memoria-segundo-cerebro.md) sin introducir otro almacén de verdad paralelo.

| ID | Prioridad | Depende | Entrega / criterio de cierre |
|---|---|---|---|
| M01 | P0 | L09,L10 | Modelo y contratos de memoria: MemoryFact/Event/Source/Relation, revisiones, labels, scopes y procedencia |
| M02 | P1 | M01,L14 | Markdown + Current Truth/Timeline: consolidación reversible, conflicto de revisión y exportación legible |
| M03 | P1 | M02,L11 | Memory Ingestor sobre fixtures: candidatos, contradicciones y fuentes; ninguna promoción silenciosa fuera de política |
| M04 | P1 | M02,L18 | Hybrid Search: keyword + metadata; benchmark antes de activar embeddings/pgvector |
| M05 | P1 | M04,L15 | Lisa Memory API + MCP interno: dos runtimes recuperan la misma verdad bajo ACL y auditoría |
| M06 | P2 | M05 | Evaluar Graphiti/Mem0 u otra capa solo contra casos y métricas reales; no desplegar por defecto |

## Track de chat web y cuentas de modelos

Investigación documentada en [18 · Chat web y multicuenta](18-chat-web-multicuenta.md). **Ningún Cxx está implementado o validado todavía.** El chat de preguntas no requiere Pi, terminal ni un runtime de programación. CLIProxyAPI es candidato opcional, no dependencia del Memory Engine.

| ID | Prioridad | Depende | Entrega / criterio de cierre |
|---|---|---|---|
| C00 | P0 | — | Viabilidad de la ruta de suscripciones: permiso/facturación aplicables, versión fijada y go/no-go; no basta con compatibilidad anunciada |
| C01 | P0 | L08,L09 | ModelGateway desacoplado sobre mocks: capacidades, errores normalizados, cancelación y presupuesto; no conectar cuentas |
| C02 | P0 | C01,L11 | Context Builder: continuidad entre identidades simuladas, mismas ACL/fuentes y retención; cambio de cuenta no cambia conversation_id, cambio de agente conserva el flujo de promoción |
| C03 | P0 | C02 | Failover simulado A→B: afinidad, cuotas/reset, límite global de intentos, ninguna cuenta disponible y modelo fijo; sin fallback de pago |
| C04 | P0 | C03 | Streaming y móvil: error después de contenido, reconexión, cancelación y deduplicación; futuras acciones dependen también de L23 |
| C05 | P1 | C00,C04,L19,L20 | Piloto privado condicionado de CLIProxyAPI con dos cuentas expresamente autorizadas y fixtures no personales; verificar consumo, seguridad, revocación y rollback |
| C06 | P1 | C04,M05 | Conectar chat a Lisa Memory API: recall autorizado y procedencia, sin duplicar recuerdos al cambiar cuenta; puede validarse con otro adapter autorizado, sin C05 |

C00 condiciona el piloto de suscripciones, **no bloquea construir el chat, su contexto ni la memoria**. Un no-go permite sustituir el gateway conservando esas capas, sin habilitar una API de pago automáticamente. Las pruebas detalladas están en 18; no confundirlas con resultados ya ejecutados.

## Siguiente tarea de ingeniería

L08 y L09: convertir el contrato en DTOs/validadores y añadir un backend de prueba con identidad y denegación por defecto. Mantener DemoClient utilizable para revisar diseño. No empezar conectando una bóveda o corpus real a endpoints sin autenticación. Después de L09/L10 puede arrancar M01; el Memory Engine no debe adelantarse a identidad, ACL y persistencia básica.

C00 puede investigarse sin credenciales; C01–C04 se incorporan después de sus dependencias como chat de preguntas con mocks. No instalar el proxy ni iniciar OAuth como efecto secundario de trabajar en documentación o memoria.

## Puertas de aceptación

1. UI: el usuario comprende qué es temporal, guardado, memoria y modo de ejecución; sin botones de conexión ficticiamente activos.
2. Seguridad: pruebas negativas de áreas, IDs, querys, search, promoción, tokens, SSRF y herramientas.
3. Integración: cada proveedor pasa fixtures/versiones y manejo de timeout/conflicto/cancelación.
4. Recuperación: restablecer identidad, permisos y datos sin repetir efectos externos.
5. Piloto: presupuesto/retención/aprobaciones decididos y muestra expresamente autorizada.

L06 está completado en su alcance de publicación de revisión. Esto no implica backend personal, memoria ni integraciones de producción.
