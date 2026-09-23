# 15 · Contrato de backend, modelos y flujos

Estado: diseño de integración y seam HTTP, no backend operativo. Contrato canónico: `contracts/openapi.mjs`; `npm run build` emite `dist/openapi.json` y CI actualiza `preview/openapi.json`. OpenAPI 3.1, base `/api/v1`, 28 operaciones. Los contratos de 05 son servicios conceptuales; no rutas nativas de OpenClaw o Nextcloud.

## 1. Capas y contrato de transporte

```text
Vista -> request(method, path, body) -> {resultado de dominio}
                                    |
                         DemoClient | HttpClient
                                    |
                         backend normaliza proveedor
```

DemoClient devuelve objetos de dominio directamente y se ejecuta solo en el navegador. HttpClient extrae `data` de la respuesta HTTP. El servidor real debe devolver `{data, meta?}`; los errores usan `{error:{code,message,retryable?,requestId?}}`. No simular un éxito si falla una integración. La UI debe poder distinguir sin conectar, sin permiso, vacío, cargando, error y listo.

HttpClient ya incluye mismo origen, timeout de 15 segundos, credenciales de sesión del navegador e identificador de operación para mutaciones. No reintenta automáticamente. Antes de producción se necesitan sesión real, CSRF y política de reintento/recuperación. Los tipos de salida de OpenAPI son todavía generales: el siguiente hito debe concretar DTOs y generar validadores; esto no se presenta como API estable de producción.

## 2. Rutas agrupadas

| Grupo | Operaciones de diseño |
|---|---|
| Estado | GET health, GET bootstrap |
| Conversaciones | GET/POST chats, GET/DELETE chat, POST messages/save/promotions/knowledge-proposals |
| Conocimiento | GET knowledge, POST knowledge/{id}/approve |
| Archivos | GET files, GET files/{id} |
| Tareas | GET/POST tasks, PATCH tasks/{id} |
| Calendario | GET/POST events |
| Actividad | GET audit |
| Acciones | POST actions, GET actions/{id}, POST actions/{id}/approval |
| Ordenadores | GET computers, POST computers/{id}/control |
| Desarrollo | POST developer/changes, GET developer/changes/{id} |
| Runs | GET runs/{id}/events, stream SSE |

Los endpoints de escritura documental, edición de eventos, exportación y borrado completo se especificarán al implementar sus adapters, no se inventan como capacidades presentes. Añadir rutas versionadas y pruebas antes de conectarlas a UI.

Solo health responde actualmente con éxito en el servidor incluido. Todas las funciones privadas devuelven 501. La demo no llama a esos endpoints salvo la comprobación voluntaria en Ajustes.

## 3. Identidad, scopes y capacidades

`bootstrap` debe devolver versión de contrato, usuario autenticado, agente efectivo por sesión, listado de áreas visible, capacidades activas y estados de integración. Ningún secreto. No se permite que el cliente elija un scope arbitrario y el backend lo acepte sin autorización.

Para humanos, cookie de sesión autenticada y CSRF. Para workers, credencial de servicio limitada a actor/run/capabilities/expiración. No compartir cookies humanas con agentes. La tabla de agentes contiene políticas del servidor; guardar un chat no añade agentes ni permisos.

Separar `category`, `execution_mode`, `agent_id`, `information_labels`, `saved_at` y `source_conversation_id`. Ver 03 para la herencia de información sensible. `created_by` y `effective_principal` se derivan en servidor.

## 4. Máquina de estados de conversación

```text
new (unsaved) -> active -> saved
      |            |         |
      +------------+---------+-> discard requested -> purge according to policy

save(category): no change to execution identity
promote(target): creates a different conversation, original unchanged
knowledge proposal: separate object, not a conversation status
```

Guardar exige revisión esperada y una intención humana autenticada. Cambiar la categoría solo organiza. La operación debe ser idempotente: misma clave y mismo cuerpo devuelven el resultado previo; misma clave con contenido distinto produce conflicto. Si el cliente pierde la respuesta, no debe crear una segunda sesión al reintentar la misma promoción.

La promoción se implementa como: autorizar exportación -> fijar revisión de origen -> validar etiquetas/adjuntos -> crear nuevo objeto/sesión -> copiar datos inertes con procedencia -> responder nuevo ID. Si falla, el origen permanece intacto. La decisión de guardar el destino sigue siendo explícita.

La demo implementa una parte de esta lógica de forma local. No implementa eliminación de proveedores, persistencia durable ni políticas de red.

## 5. Runs, streams y cancelación

Un backend con modelo deberá devolver o enlazar un `run_id`; la operación de mensajes de demo es síncrona y no se debe confundir con un runtime. Versionar la transición del contrato si se cambia a respuesta 202/job.

Estados propuestos: queued -> running -> awaiting_approval / awaiting_human -> running -> completed / failed / cancelled. Mantener timestamps, actor, budget y último evento. La cancelación se comprueba antes de cada acción externa.

SSE propuesto: `message.delta`, `run.status`, `action.approval_required`, `computer.handoff_required`, `run.completed`, `run.failed`. Eventos con ID monótono, versión de esquema, timestamp, conversación/run y payload autorizado. Reconectar con cursor; no duplicar mensajes ni ejecutar de nuevo acciones por reproducir eventos. No volcar secretos, tool env ni razonamiento privado al stream.

Una desconexión de la UI no otorga permiso para continuar una acción irreversible. Separar tareas expresamente autorizadas en segundo plano de chats que requieren intervención.

## 6. Autorización y acciones

Propuesta de acción contiene capability, recurso, parámetros normalizados, hash, revisión, caducidad y riesgo. Autorización puede producir deny, allow o require_approval. El motor de autorización no ejecuta; el broker verifica nuevamente antes de ejecutar.

Estados de acción: proposed -> denied / pending_approval -> approved -> executing -> succeeded / failed / uncertain / cancelled. `uncertain` exige reconciliación con el servicio antes de otro intento. Guardar receipt/id externo cuando lo haya. No existe exactamente-una-vez universal para todos los servicios; diseñar idempotencia y recuperación por adapter.

Aprobaciones usan decisión humana y hash exacto. Un cambio de destino, importe, adjunto o contenido invalida la aprobación. No usar «sí» a un chat anterior como permiso indefinido.

## 7. Archivos y sincronización

Adapter DAV descubre metadata autorizada, conserva UUID Lisa y mapping de instancia, usa revisión/ETag y controla conflictos. Una consulta SQL no debe saltarse restricciones del almacenamiento. Construir una prueba de contrato con Nextcloud de prueba antes de conectar documentos reales.

WebDAV y PostgreSQL no comparten transacción. Registrar intención + estado de proveedor + resultado; reconciliar operaciones interrumpidas. Volver a comprobar ACL antes de devolver preview/cita, incluso si una URL/cache anterior existe. Exportar versiones con su procedencia.

Para tareas/eventos usar UUID Lisa y mapping de calendario/UID/revisión. Fechas con IANA timezone; distinguir todo-el-día de instantes UTC. Preservar recurrencia/excepciones al editar. Inicialmente probar solo eventos simples; informar que edición avanzada no está soportada antes de degradar silenciosamente.

## 8. Control gráfico

`computer_session` enlaza host/runtime/run, capabilities, estado de conexión y propietario actual. Control mediante lease, revision y expiración. Solicitud humana -> detener/cancelar inputs del agente -> confirmar cesión -> permitir teclado/ratón humano. Devolución -> confirmar ausencia de input humano -> renovar estado/captura -> permitir agente.

Si un proveedor no ofrece esas garantías, el adapter debe denegar takeover o degradar a pausa + intervención externa explícita, no simular exclusión en la UI. La simulación v0.3 muestra el diseño sin conectarse a ningún host.

## 9. Developer y despliegue

La API recibe una propuesta de cambio, no una cadena shell ejecutable. El worker de código devuelve branch/base commit, diff, pruebas, permisos afectados y artefacto de preview. Aplicar se vincula a un commit probado y aprobación humana, no al nombre mutable de una rama.

Secretos de despliegue se mantienen en un broker/CI autorizado distinto del agente. No heredar cuentas de datos personales. Migraciones de DB necesitan plan y backup aparte. El rollback de UI no implica rollback de datos; diseñar compatibilidad de contratos entre versiones.

## 10. Errores, límites y tests del contrato

401 sin sesión; 403 permiso denegado; 404 objeto ausente/inaccesible según política; 409 revisión/idempotencia; 422 payload inválido; 429 cuota; 501 integración no implementada; 503 proveedor no disponible. Los errores no deben filtrar paths, claves, headers ni contenido de otras áreas.

Definir límites de mensajes/adjuntos/paginación y validar en backend, aunque el navegador ya limite el formulario. No aceptar URLs arbitrarias para proxy, login, preview o callback.

Pruebas de conformidad pendientes: request/response DTO, auth/CSRF, objetos de otra identidad, concurrencia, idempotencia durable, cuotas, rollback parcial, interop DAV, revocación de permisos, promoción entre etiquetas y streams reconectados. Los 21 tests actuales son base local; no cubren una instalación real.
