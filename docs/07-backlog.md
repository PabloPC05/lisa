# 07 · Backlog ejecutable v0.3

Fecha: 23-09-2026. Hitos por dependencias, no estimaciones temporales. No marcar una integración como hecha por existir su tarjeta en la UI.

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

## Pendiente: revisión y primer backend

| ID | Prioridad | Depende | Entrega / criterio de cierre |
|---|---|---|---|
| L06 | P0 | L05 | Vercel: proyecto conectado a este repo, URL real verificada y despliegue READY; conector actual no lo ha permitido |
| L07 | P0 | L01 | Auditoría de UI del propietario: dos flujos, móvil/teclado, estados y cambios de diseño registrados |
| L08 | P0 | L03 | Concretar DTOs y validadores: frontend y backend pasan mismos casos, errores versionados |
| L09 | P0 | L08 | Identidad/sesión/CSRF/ACL: solicitudes directas y agente falso rechazados antes de leer datos |
| L10 | P0 | L09 | Esquema PostgreSQL + migraciones: conversaciones, mensajes, labels, scopes, fuentes, jobs, idempotencia y auditoría |
| L11 | P0 | L10 | Chats persistentes: nuevos sin archivar, save con revisión, discard/purge; reinicio y concurrencia probados |
| L12 | P0 | L11 | Promoción segura: nuevo ID, original intacto, etiquetas y adjuntos revisados, una sola creación por operación |
| L13 | P0 | L09,L10 | Nextcloud adapter: listar/resolver/subir/move/rename/versionado en instancia ficticia; conflictos y recuperación |
| L14 | P0 | L13 | Registro documental: UUID independiente del proveedor, exportación y restore preservan identidad |
| L15 | P0 | L09,L11 | Private runtime adapter: versión OpenClaw verificada, scopes por agente, fuentes selectivas, cuota y cancelación |
| L16 | P0 | L09 | Sandbox real: usuario/runtime/red/volumen separados, pruebas desde dentro sin acceso a host/datos/secretos |
| L17 | P0 | L12,L15,L16 | Conversaciones reales: continuidad sin trasladar credenciales; provider retention y costes visibles |
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

## Siguiente tarea de ingeniería

L08 y L09: convertir el contrato en DTOs/validadores y añadir un backend de prueba con identidad y denegación por defecto. Mantener DemoClient utilizable para revisar diseño. No empezar conectando una bóveda o corpus real a endpoints sin autenticación.

## Puertas de aceptación

1. UI: el usuario comprende qué es temporal, guardado, memoria y modo de ejecución; sin botones de conexión ficticiamente activos.
2. Seguridad: pruebas negativas de áreas, IDs, querys, search, promoción, tokens, SSRF y herramientas.
3. Integración: cada proveedor pasa fixtures/versiones y manejo de timeout/conflicto/cancelación.
4. Recuperación: restablecer identidad, permisos y datos sin repetir efectos externos.
5. Piloto: presupuesto/retención/aprobaciones decididos y muestra expresamente autorizada.

L06 no está completado: el fallo del conector Vercel se registra en 14. El repo y el artefacto local sí están disponibles para no bloquear la revisión.
