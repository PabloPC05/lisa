# 11 · Seguridad, límites de confianza y credenciales

Especificación objetivo. La UI v0.3 no autentica usuarios ni ejecuta agentes; las comprobaciones del navegador solo validan la demo. No considerarlas barreras de seguridad.

## 1. Amenazas que deben cubrirse

Contenido malicioso en webs/documentos/correos, instrucciones inyectadas en transcript importado, fuga entre áreas, robo de tokens/cookies, acceso directo a objetos por ID, acciones repetidas tras timeout, SSRF hacia servicios privados, código generado que intente modificar permisos o extraer datos, dependencias comprometidas y acceso físico/administrativo al host.

El diseño reduce exposición, pero no garantiza que un agente con amplios permisos no pueda abusar de ellos. Ningún prompt, proxy o contenedor elimina todos los riesgos.

## 2. Identidad y autorización

El servidor obtiene al humano de su sesión autenticada y a los workers de credenciales de servicio limitadas y verificadas. Nunca confía en `Agent-ID`, `scope`, un rol o un booleano enviados por el navegador como fuente de autoridad.

Comprobar principal + acción + recurso + contexto en cada operación y en cada paso privilegiado de un job. Denegación por defecto. Identidad, read, write, use-credential, run-computer y approve son permisos separados. La caída del motor de políticas debe denegar, no omitir comprobaciones.

Empezar con ACL internas explícitas es válido; `AuthorizationService` debe permitir OpenFGA u otro motor sin cambiar la UI. El frontend solo muestra la decisión efectiva que devuelve el servidor. Ocultar un botón no sustituye a una ACL.

El acceso a listados, búsqueda, títulos, conteos, embeddings, citas, versiones, previews y adjuntos también se filtra. No recuperar datos no autorizados para filtrarlos después de enviarlos al modelo.

## 3. Sandbox real

Un runtime/gateway separado debe tener usuario y credenciales distintos, volúmenes efímeros, cuotas CPU/RAM/disco/procesos y reglas de red verificadas. No montar el corpus, bases, backup, directorio home privado, perfil del navegador, sockets de agentes ni Docker. No usar `privileged`, host networking o acceso root al host.

La salida se limita a servicios permitidos mediante un relay/proxy. Bloquear acceso a la red privada y endpoints de metadatos, también a través de redirecciones/DNS rebinding. Los resultados solo vuelven al controlador mediante el canal de tarea autorizado.

Los contenedores comparten kernel. Para amenazas de código arbitrario, una VM/host independiente proporciona una frontera más fuerte; elegirla según el host. «Físicamente separado» en documentos iniciales debe leerse como objetivo de separación real de privilegios, no como propiedad automática de dos contenedores.

OpenClaw documenta que su sandbox reduce exposición y que los gateways tienen límites de confianza; validar la configuración concreta, no asumir que sesiones o workspaces bastan. Referencias: [seguridad](https://docs.openclaw.ai/gateway/security), [sandboxing](https://docs.openclaw.ai/gateway/sandboxing).

## 4. Guardado y promoción

Guardar un chat no vuelve confiable al agente. Mover la categoría no elimina etiquetas de información. Promover crea un nuevo ID; no añade permisos al worker original. Solo el controlador humano autenticado inicia la exportación/importación.

No transferir cookies, tokens, memoria oculta, mensajes de sistema, scripts de herramientas o llamadas previas como instrucciones ejecutables. Los mensajes importados permanecen como datos no confiables. Los adjuntos seleccionados se validan y el destinatario debe estar autorizado a recibir sus etiquetas. El resumen de un modelo no es una desclasificación fiable por sí mismo.

## 5. Integración 1Password

1Password es el gestor preferido. Crear bóvedas/cuentas de servicio con el mínimo acceso necesario según las capacidades y plan de la cuenta; comprobar disponibilidad antes de implementar. Fuente: [Service Accounts](https://developer.1password.com/docs/service-accounts/) y [secretos con CLI](https://developer.1password.com/docs/cli/secrets-scripts).

El proceso del broker puede resolver secretos y por eso forma parte de la base de confianza. El agente y el frontend NO reciben el token del broker, acceso al CLI autenticado ni el entorno donde se inyectan secretos. `op run` inyecta valores en un proceso: ejecutarlo alrededor del propio agente no garantiza que este no pueda leerlos.

Contratos permitidos: usar una cuenta para una acción estrecha, en un destino autorizado y con duración acotada. Contrato prohibido para agentes: leer/exportar la bóveda o devolver valores de contraseñas. Las referencias no deben revelar información sensible innecesaria.

Preferir API/OAuth de alcance mínimo a automatizar un login con contraseña. Una capacidad como descargar una factura debe limitar destino, método, recurso y resultado, no ser un proxy HTTP arbitrario con un token poderoso.

## 6. Límites de la inyección en navegador

Ocultar la contraseña del prompt no vuelve inocua la sesión autenticada. Un agente con DOM, red o control amplio puede leer campos, robar cookies o actuar con la cuenta ya abierta. Por eso no se promete «puede usarla pero nunca robarla» como garantía universal.

Separar el paso de autenticación, limitar orígenes/salida, redacción de capturas/logs, permisos de lectura DOM, duración de cookies y acciones permitidas. Mantener 2FA/firma/Cl@ve y operaciones sensibles bajo intervención humana. En bancos y pagos, priorizar lectura/autorización manual y no automatizar efectos irreversibles en el MVP.

## 7. Aprobación de acciones

El broker genera propuesta normalizada con actor, recurso, destino, parámetros, presupuesto/importe cuando exista, revisión, hash y caducidad. La aprobación humana se vincula a esa propuesta y se consume una sola vez. Cambiar el contenido invalida la aprobación.

Un modelo no puede aprobar su propia propuesta. Una confirmación genérica en chat no debe autorizar acciones nuevas no presentadas. Las acciones de lectura de bajo riesgo pueden ser automáticas dentro del scope; envío, borrado, compra y otros efectos necesitan la política correspondiente.

Cancelación no es rollback: si el proveedor ya ejecutó la acción, registrar y comunicar lo ocurrido. Ante timeout incierto, reconciliar antes de repetir.

## 8. Web y sesiones

En producción: HTTPS, cookies Secure/HttpOnly/SameSite, CSRF, comprobación Origin, límites de tamaño/tasa, validación de esquema y separación humano/servicio. No guardar tokens en localStorage ni en URLs. Configurar CSP con hashes/nonces y allowlists; los headers de la demo no equivalen a un endurecimiento completo.

No confiar en que CORS proteja una API privada. Autorización debe aplicarse incluso a llamadas directas. Renderizar contenido no confiable como texto o Markdown saneado; previews activas en origen/iframe restringido. Escapar HTML no protege contra todos los riesgos del backend.

Los endpoints de la demo devuelven 501 y no tienen efectos. No sustituirlos por acceso real antes de implementar esta sección.

## 9. Computer Use y Developer

Control de escritorio: lease exclusivo con revisión/expiración; pausar y cancelar entradas del agente antes de ceder. No permitir dos escritores. Stop tiene prioridad. Al desconectarse el humano, pausar por defecto hasta resolver propiedad y estado. No exponer VNC/terminal sin autenticación.

Developer: checkout de código/fixtures, ninguna credencial personal, red acotada y sin Docker socket. Rama nueva, tests, diff, preview, aprobación y artefacto verificable. Cambios de políticas/migraciones se tratan como alto riesgo. Aplicar una UI no concede permiso para modificar datos.

## 10. Auditoría, retención y pruebas negativas

Auditar actor, acción, recurso, decisión, hash, correlación y resultado. No guardar valores secretos, cookies, headers Authorization, transcripciones ni capturas por defecto. Revisar el dato mínimo de errores y métricas.

Pruebas previas a producción: ID ajeno; búsqueda/contador lateral; cambio de categoría para leer otra área; identidad falsa; prompt injection; DOM con secretos; SSRF/redirect; descarga de adjunto malicioso; clave de idempotencia repetida; aprobación expirada/modificada; takeover concurrente; caída de política; revocación durante job; restauración de backup y replay de acciones. Ninguna de estas pruebas se considera resuelta solo por los 21 tests de la demo.
