# CONTINUAR · Lisa v0.3

Actualizado: 23-09-2026. **Trabajar desde `main`**. El PR #1 de arquitectura ya se fusionó; no continuar en una rama antigua sin comparar cambios.

## Estado real

Implementado: especificación de plataforma personal, UI de revisión, DemoClient en memoria, HttpClient preparado, OpenAPI 3.1 con 28 operaciones, stub HTTP sin efectos, build autocontenido, CI y 21 tests JavaScript. Se conserva el prototipo Python/SQLite y CI pasa en 3.11/3.12.

No implementado: backend personal persistente, autenticación/ACL de servidor, Nextcloud/CalDAV reales, modelos, OpenClaw, Sandbox de ejecución, broker 1Password, browser/desktop remoto, terminal ni autoedición operativa. No se han migrado datos ni configurado credenciales.

No se completó Vercel: herramienta de despliegue anunciada no disponible y el importador restringe el dominio del bundle. No hay URL Lisa verificada. Hay configuración y bundle para importar el repo existente; ver docs/14-ui-despliegue.md. No confundir este bloqueo con ausencia de UI: la UI está en main y se puede abrir localmente.

## Commits y evidencia

- Arquitectura fusionada: `b51cda0a9eb54c8649f17951593c840e79af0343`.
- UI/contrato/tests: `8910288e46c74ab5a0d8081b31b7ad76ca0253b5`.
- Bundle generado inicial: `2d12b3ea3a13b44495950a3f2fad8779cb2a3e50`.
- CI UI: https://github.com/PabloPC05/lisa/actions/runs/35904343785 (éxito).
- CI Python: https://github.com/PabloPC05/lisa/actions/runs/35904344021 (éxito en ambas versiones).

La revisión posterior de documentación amplía la arquitectura y corrige límites de confianza. Consultar el HEAD actual antes de escribir.

## Ejecutar

```bash
npm run dev
npm run check
python -m unittest discover -s tests -v
```

Node 22+; la demo no tiene dependencias npm. `dist/index.html` es autocontenido, `preview/` es copia generada por CI. No editar preview manualmente. Los archivos de demo usan datos ficticios y memoria volátil.

## Funcionalidad revisable

Dos botones de nuevo chat; cinco agentes; mensajes simulados; guardar, categorizar y promover; propuestas de conocimiento revisables; archivos filtrables; tareas; calendario; permisos; integraciones pendientes; actividad; simulaciones Desktop/Developer; tema claro/oscuro y vista móvil.

Guardar en esta demo NO sobrevive a recarga. Guardar un chat no añade memoria. Guardar en un área no cambia identidad ni permisos. Continuar con otro agente crea nueva conversación y conserva texto importado no confiable.

## Próximas tareas

1. L06/L07: importar el repo en Vercel cuando exista vía autorizada operativa y auditar la UI con el propietario.
2. L08: concretar respuestas DTO/validadores del contrato; quitar dependencias de las vistas de utilidades específicas DemoClient.
3. L09/L10: backend con identidad, CSRF, permisos y schema/migraciones. Las identidades no vienen de headers que el cliente se inventa.
4. L11/L12: persistencia explícita, retención, promoción idempotente y etiquetas de confidencialidad.
5. L13/L14: Nextcloud de prueba, UUID/mapping, ETag, conflictos y restauración.
6. L15–L18: runtime privado + Sandbox separados, modelo limitado y recuperación autorizada de conocimiento.
7. Después: calendario/tareas, broker 1Password/acciones, worker gráfico/takeover y Developer aislado.

## Decisiones que no se deben perder

Nextcloud mediante APIs, no su UI como producto ni acceso directo al datadir. 1Password detrás de broker confiable, nunca token/CLI/secretos para agentes. Dos chats independientes y cinco áreas configurables. Clasificación no equivale a permiso; preservar etiquetas al transferir contenido. General no puede actuar sin límites. Código y datos separados. Modelos por API implican salida de contexto seleccionado del servidor.

## Validación antes de datos reales

Autorizar por recurso antes de recuperar contexto. Probar acceso cruzado directo y por búsquedas/contadores. Probar identidad falsa, SSRF, fuga desde navegador, promoción de datos de varias áreas, approvals expirados, reintentos duplicados, pérdida de proveedor y restauración. Fijar versiones/digests, presupuesto y retención. No extrapolar seguridad de producción a partir de tests de la demo.

## Archivos de referencia

README; docs/01,02,03,06,07,09,11,13,14,15; contracts/openapi.mjs; apps/web/client.mjs; api/v1/[...path].js; tests/web/domain.test.mjs.

Documentar siempre qué se ha ejecutado y qué sigue propuesto. Nunca afirmar que Vercel está desplegado sin URL/estado verificados, ni que un proveedor está conectado por mostrar su tarjeta.
