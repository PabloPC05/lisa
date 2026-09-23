# 07 · Backlog ejecutable

B00 y B19 completos. El resto sigue pendiente de sus criterios de aceptación; las bases locales no completan integraciones externas. Las estimaciones son tallas relativas (S pequeña, M media, L grande), no fechas comprometidas. Cada fila se puede trasladar a una issue al publicar GitHub.

| ID | Prioridad / tamaño | Dependencias | Entrega y criterio de cierre |
|---|---|---|---|
| B00 | P0 / S | — | Especificación + prototipo local probado. Hecho |
| B01 | P0 / M | B00 | Fijar OpenClaw; dos temas/dos agentes; sesiones/skills distintas y reinicio probados |
| B02 | P0 / M | B00 | ADR de fuente canónica/editor; ensayo móvil, rename, move, versionado y restore; cerrar D01/D07 |
| B03 | P0 / M | B02 | Registro UUID/versiones SQL, migraciones, exportación y prueba de continuidad de identidad |
| B04 | P0 / L | B03 | Ingesta/move/rename/versionado transaccional recuperable; fallos inyectados sin pérdida |
| B05 | P0 / M | B03 | Resolver autenticado; UUID inaccesible opaco; versión histórica y enlace móvil probados |
| B06 | P0 / M | B01,B03 | Herramientas por área, ACL/sandbox; traversal, symlink y fuga entre áreas rechazados |
| B07 | P0 / M | B04,B06 | Memoria Markdown con revisión esperada; conflicto agente/editor sin sobrescritura |
| B08 | P0 / M | B06,B07 | Búsqueda textual autorizada + fuentes; benchmark de 20 preguntas y trazas de contexto |
| B09 | P0 / M | B01,B05,B08 | Bot real con allowlist, idempotencia, adjuntos y respuesta al tema; recorrido iOS/Android |
| B10 | P0 / M | B03,B04 | Backup/restauración en host limpio; verificar hashes y enlaces, medir RPO/RTO |
| B11 | P0 / M | B02,B06,B10 | Compose/instalación fijada, healthchecks, secretos y rollback; documentación validada |
| B12 | P0 / M | B09,B10,B11 | Piloto autorizado con pocos documentos, inventario comparado y métricas de coste |
| B13 | P1 / M | B12 | OCR/audio aislados; confianza y errores visibles, originales preservados |
| B14 | P1 / M | B12 | Expedientes paralelos y consultas entre áreas con autorización acotada |
| B15 | P1 / M | B12 | Exportación/copia Drive opcional, sin dos maestros ni borrado propagado accidental |
| B16 | P1 / L | B06,B12 | Cola durable y acciones con propuesta/hash/caducidad; reintento sin duplicar efectos |
| B17 | P2 / L | B16 | Browser workers y broker de credenciales; primero gestiones de prueba sin efectos |
| B18 | P2 / M | B08,B12 | Evaluar embeddings; adoptarlos solo si mejora recuperación con coste justificable |

| B19 | P0 / M | B00 | Hecho: sesiones SQLite por expediente, reinicio, deduplicación, conflictos y reintentos concurrentes; registro de decisiones |
| B20 | P1 / M | B01 | Evaluar UI modificable con toma de control gráfica y consola; separar editor de código y ejecución personal; elección pendiente |

## Hitos

- H0: especificación y base portable (esta entrega).
- H1: evidencia de compatibilidad y decisión de datos (B01–B02).
- H2: corpus con identidad/permisos/copias (B03–B08, B10).
- H3: primer flujo móvil completo y despliegue (B09–B12).
- H4: automatización gradual (B13–B18).

## Pruebas imprescindibles antes de datos reales

Enlace antes/después de rename/move; versión histórica; copia con nuevo ID; borrado/restauración; hash idéntico sin fusión accidental; interrupción entre escritura y commit; escritura simultánea; evento Telegram duplicado; usuario/chat/tema desconocido; traversal y symlink; nota maliciosa que pide leer otra área; pérdida de API; cuota agotada; restauración limpia. El prototipo solo prueba una parte: consultar tests, no marcar todas como cumplidas.

## Decisiones que requieren datos del propietario al desplegar

Host y almacenamiento disponible; editor preferido tras ensayo; proveedor/modelo y presupuesto; IDs privados del canal; acceso remoto; destino/clave de backup; política de retención y acciones permitidas. No bloquean la especificación; sí las instalaciones reales que dependan de ellas.
