# 18 · Chat web, contexto propio y cuentas de modelos

Investigado: **26-09-2026**. Estado: **requisito de experiencia confirmado y arquitectura propuesta; integración no implementada ni probada con cuentas reales**. Complementa [17 · Memoria](17-memoria-segundo-cerebro.md), [09 · Decisiones](09-decisiones-vigentes.md) y [07 · Backlog](07-backlog.md).

## 1. Qué se quiere construir

El propietario quiere utilizar **el chat web de Lisa para preguntas y conversación general**, desde ordenador e iPhone. No quiere que utilizar Lisa obligue a abrir una terminal, adoptar Pi ni trabajar dentro de un agente de programación.

Se investigará este recorrido: **chat propio de Lisa → backend privado → CLIProxyAPI → varias cuentas personales de Claude**, manteniendo una cuenta mientras esté disponible y pasando a otra cuando se agote su uso. El cambio no debe exigir copiar el historial ni crear un chat vacío.

Separar tres estados:

- **Confirmado:** interfaz web propia, contexto independiente de la cuenta y evaluación del cambio automático entre suscripciones.
- **Candidato técnico:** CLIProxyAPI como gateway sustituible. Pi, OpenCode, OpenClaw, LibreChat y Open WebUI no son requisitos para este chat.
- **Pendiente:** autorización del proveedor, versión desplegable, compatibilidad real, facturación efectiva, seguridad y pruebas extremo a extremo. La documentación no activa cuentas ni acredita que el uso esté permitido.

El desarrollo del segundo cerebro no debe quedar bloqueado por la viabilidad de este gateway: memoria, chat y proveedor se mantienen separados.

## 2. Investigación y evidencia

Se consultaron las fuentes primarias del apartado 12. Además de las páginas del proyecto, se inspeccionó `config.example.yaml` en el commit **`9bdde54b59d1af70ae0534a0ef61b2c3361a1257`**, fechado el 24-09-2026. Es una referencia reproducible de investigación, **no una versión aprobada para producción**. [S1][S2]

| Cuestión | Hallazgo documentado | Qué no demuestra |
|---|---|---|
| Suscripciones | CLIProxyAPI anuncia acceso a Claude Code por OAuth y varias cuentas; ofrece interfaces compatibles con clientes de modelos. [S1] | No convierte las suscripciones en API comercial incluida ni acredita permiso de Anthropic. |
| Afinidad | La configuración contempla `routing.session-affinity`, TTL y cambio de credencial cuando la vinculada deja de estar disponible. Una vinculación existente prevalece sobre la recuperación de una cuenta de mayor prioridad. [S2] | No garantiza caché compartida ni persistencia de la vinculación tras reinicios. |
| Selección | Hay estrategias `round-robin`, `weighted-round-robin` y `fill-first` en la referencia inspeccionada. [S2] | Balancear cada turno no equivale a conservar la cuenta hasta agotarla. |
| Reintentos | En ese commit, `request-retry` describe rondas adicionales y contempla 429; `max-retry-credentials` limita credenciales por ronda. La página básica consultada muestra una descripción anterior distinta. [S2][S3] | No copiar el ejemplo web como contrato definitivo. `request-retry: 0` no significa necesariamente un único intento total. |
| Inicio del streaming | La documentación presenta `streaming.bootstrap-retries` para reintentos antes de enviar el primer byte. [S3] | No garantiza reemplazar una respuesta parcialmente entregada. |
| Alta de cuentas | Hay un flujo `--claude-login` y una API de administración que inicia OAuth y guarda los tokens. [S4][S5] | No es un botón de inicio de sesión oficial para cualquier aplicación propia ni debe exponerse sin controles. |
| Transformación de instrucciones | La referencia contiene modos de ocultación de identidad y sustitución de instrucciones para Claude, con ajustes globales y por credencial. [S2] | No puede asumirse que el prompt de Lisa llegue intacto ni que desactivar una opción haga autorizada la integración. |

**Conclusión de investigación:** existe un mecanismo documentado que encaja técnicamente con la intención. No se ha ejecutado el proxy, autenticado ninguna cuenta, medido su cuota ni validado el conjunto Lisa + proxy + dos suscripciones. El soporte anunciado de imágenes o herramientas tampoco sustituye pruebas del recorrido concreto. [S1]

## 3. Límite contractual y económico

Anthropic orienta el uso incluido en suscripciones a sus aplicaciones nativas y recomienda autenticación API para herramientas externas. Prohíbe herramientas que falseen su identidad o enruten tráfico de terceros contra límites de suscripción; puede permitir determinadas herramientas y descontar su uso de créditos adicionales. **No consta autorización específica de esta integración.** [S6]

Por tanto, esta ruta queda como **experimental, desactivada por defecto y condicionada a verificar su admisibilidad**. Una aceptación del propietario no sustituye el permiso del proveedor. No implementar técnicas para ocultar Lisa, eludir un rechazo de autorización o seguir rotando ante una restricción de la integración.

No prometer precio fijo, cuota doble exacta, ausencia de bloqueo ni consumo gratuito. Una interfaz con formato de API no prueba cómo se factura la petición. La alternativa de API comercial tendrá configuración y presupuesto separados, **nunca un fallback de pago silencioso**.

## 4. Arquitectura propuesta para el servidor privado

```text
Navegador de ordenador / iPhone
             |
        Chat web Lisa
             |
     Lisa API autenticada
   autorización / retención
             |
  Conversation Service + Context Builder
       |                     |
 historial según política   Lisa Memory API
       |                 Markdown + PostgreSQL
       +----------+----------+
                  |
        ModelGateway adapter
                  |
      CLIProxyAPI privado, opcional
        selección / autenticación
             |             |
     cuenta Claude A   cuenta Claude B

Ruta alternativa explícita del adapter: API autorizada
con presupuesto propio; nunca activada automáticamente.
```

`ModelGateway`, `Context Builder` y los nombres de estado siguientes son **contratos propuestos de Lisa**, no APIs ya implementadas ni clases exigidas por CLIProxyAPI. El contrato HTTP público de Lisa se conserva detrás de su backend; no se expone directamente el gateway al navegador.

Responsabilidades:

- **Lisa:** identidad, permisos, historial, fuentes, memoria, construcción del contexto, estado visible del turno y decisiones de retención.
- **Adapter:** validar capacidades del modelo, transformar mensajes, propagar cancelación, normalizar errores y aislar el formato del proveedor.
- **Gateway:** acceso a credenciales y selección/reintentos internos. No es el almacén canónico de conversaciones ni el Memory Engine.

No sustituir la arquitectura de [17](17-memoria-segundo-cerebro.md) por una base de memoria del proxy. Tampoco adoptar un runtime de programación para contestar preguntas: el primer flujo será de texto y lectura autorizada, sin shell ni Computer Use.

## 5. Continuidad sin confundir historial y memoria

La API de mensajes de Claude documenta conversaciones sin estado implícito: el cliente aporta los turnos anteriores. Esto respalda el diseño de reconstruir el contexto; no certifica por sí solo el comportamiento de una ruta OAuth no oficial. [S7]

Flujo propuesto por turno:

1. Autorizar conversación, modo y fuentes; crear un identificador idempotente del turno.
2. Resolver el contexto permitido: instrucciones de Lisa, resumen revisable, mensajes recientes y documentos/recuerdos pertinentes con sus revisiones y procedencia.
3. Enviar ese contexto con un identificador de afinidad opaco y estable. Validar en la versión elegida cómo llega al selector; no confiar solo en un hash de mensajes que cambia al resumir.
4. Si falla la cuenta antes de entregar contenido, el gateway puede intentar otra elegible con el mismo modelo y contexto, dentro de un presupuesto global de reintentos.
5. Mantener un único turno visible aunque existan varios intentos internos. Si entretanto cambia una autorización, cancelar el contexto anterior y reautorizar antes de reenviarlo.
6. Guardar la respuesta según la política del chat. La extracción de memoria sigue siendo un proceso separado y sujeto a revisión.

**Invariantes que preservar:**

- Cambiar únicamente la cuenta, manteniendo agente, modo y permisos, **no cambia `conversation_id`** ni eleva privilegios.
- Cambiar de agente o promover contenido sigue el flujo existente de nueva conversación y conservación del original. La continuidad multicuenta no elimina esa frontera.
- Fuera de proyecto se respeta el guardado explícito; dentro se aplica la retención del proyecto. No persistir todos los chats indefinidamente como efecto secundario del gateway.
- Sandbox no recupera memoria personal. Sus identificadores de afinidad y políticas no se mezclan con los chats privados.
- Historial guardado, contexto enviado, memoria durable y caché del proveedor son cosas distintas. No hay garantía de trasladar KV cache, razonamiento interno, archivos remotos o estado de herramientas entre cuentas.
- El cambio no aumenta la ventana del modelo. La compactación se versiona y no borra silenciosamente el historial retenido; exportación, borrado y revocación siguen la política de Lisa.
- Los adjuntos se conservan por referencias propias y revisiones autorizadas, no por identificadores remotos que podrían depender de una cuenta.

## 6. Política de selección y fallos

Objetivo de experiencia: **A mientras esté disponible → B si A alcanza una cuota reconocida → espera informada si ninguna está disponible**. No repartir mensajes innecesariamente ni cambiar de modelo por sorpresa.

Orientación para la futura prueba, no archivo de despliegue listo para copiar:

| Control | Intención de Lisa |
|---|---|
| `routing.strategy` | Evaluar `fill-first` para la primera selección; no asumir un orden permanente por nombre de archivo. |
| `routing.session-affinity` | Activarla y probar el identificador transportado, su alcance y el comportamiento al expirar. |
| `routing.session-affinity-ttl` | Elegirlo tras pruebas; no confundir TTL del enlace con retención del historial. |
| `request-retry` / `max-retry-credentials` | Acotar el total junto a los reintentos de Lisa; evitar multiplicación de rondas en dos capas. |
| `quota-exceeded.switch-preview-model` | Desactivar cambios automáticos a otro modelo. El nombre `switch-project` no demuestra por sí solo failover Claude: probarlo. |
| Opciones de créditos y rutas alternativas | No habilitar proveedores ajenos al conjunto previsto ni cargos adicionales automáticos. |
| Ocultación / reescritura de instrucciones | Auditar el resultado efectivo; no aprobar un flujo que suplante otro cliente o sustituya instrucciones de Lisa. |

Los nombres anteriores proceden de [S2][S3]; sus valores finales requieren comprobar el binario fijado. No inferir que las opciones de créditos de Antigravity controlan los créditos facturados por Anthropic.

Taxonomía propuesta del adapter:

- `QUOTA_EXHAUSTED`: enfriar la cuenta y considerar otra elegible; respetar `Retry-After` o reset fiable cuando existan.
- `AUTH_REQUIRED` / `ACCESS_DENIED`: pausar la credencial o integración y pedir revisión. No tratarlos indiscriminadamente como cuota.
- `MODEL_UNAVAILABLE`: detener o solicitar selección explícita; conservar modelo y capacidades cuando sea posible.
- `UPSTREAM_TRANSIENT`: reintento limitado con espera; no marcar toda incidencia como agotamiento de suscripción.
- `NO_ACCOUNT_AVAILABLE`: conservar el turno pendiente y mostrar espera; sin bucle infinito ni compra de créditos.

La prueba debe distinguir cuotas por modelo, límites de cuenta, sobrecarga y expiración OAuth. No inventar porcentajes de uso o próximas horas de reset si el proveedor no los devuelve de forma fiable. Si el gateway no revela qué credencial sirvió una petición, mostrar «cuenta no observable», no una cuenta supuesta.

## 7. Streaming, cancelación y duplicados

Un HTTP 200 no implica que el turno haya terminado correctamente: Anthropic documenta errores dentro del flujo SSE. [S8]

Reglas propuestas:

- **Antes de contenido:** permitir failover acotado si el fallo es elegible. Probar también los eventos de inicio y keepalive, no solo el primer token visible.
- **Después de contenido parcial:** marcar el intento como interrumpido y conservar el borrador. Ofrecer continuar o regenerar; no concatenar silenciosamente una segunda respuesta como si perteneciese al mismo intento.
- **Desconexión del móvil:** reconectar al turno existente con secuencia de eventos; una reconexión no debe crear otra generación.
- **Cancelar:** propagar la cancelación y bloquear nuevos intentos. No prometer devolución del consumo ya realizado.
- **Herramientas futuras:** la misma llamada no debe repetirse por el cambio de cuenta. Reutilizar el broker de acciones/idempotencia de Lisa y tratar los resultados inciertos explícitamente.

Modelo de seguimiento propuesto: `conversation_id`, `turn_id`, `generation_id`, `attempt_id`, `context_revision`, modelo solicitado/resuelto, estado, causa normalizada y tiempos. Añadir un alias opaco de cuenta solo si es observable. Nada de tokens OAuth o prompts completos en telemetría. Los nombres no amplían todavía OpenAPI ni el esquema de producción.

## 8. Seguridad y operación

La demo pública de Vercel no recibe credenciales ni memoria. La futura instalación operativa requiere un backend privado autenticado y un servicio persistente para el gateway.

Controles propuestos antes de conectar cuentas:

- Solo Lisa backend accede a inferencia; HTTPS para el usuario y autenticación separada entre servicios. Probar un 401/403 efectivo sin credenciales.
- No exponer el puerto de inferencia o `/v0/management` al público. La configuración de ejemplo escucha en todas las interfaces si `host` está vacío; no desplegarla sin revisar. `allow-remote: false` limita administración, **no protege por sí solo inferencia**. [S2]
- En contenedor, distinguir loopback interno de loopback del host: limitar publicación de puertos y red de servicios sin romper la conectividad autorizada.
- OAuth, refresh tokens y claves del gateway permanecen en almacenamiento privado, con permisos mínimos, rotación y backups cifrados. No van a Git, Nextcloud Brain, localStorage, variables de frontend ni contexto del modelo.
- Alta y revocación de cuentas mediante un flujo administrativo separado. El login inicial puede necesitar un navegador y callback; esto no obliga a usar una terminal para cada pregunta. La API administrativa existe, pero su exposición requiere diseño específico. [S4][S5]
- Fijar release/commit y digest, revisar licencias/dependencias y validar actualización/rollback. No activar plugins o paneles descargados automáticamente sin revisión.
- Comprobar logs de acceso, errores y proxies inversos; desactivar debug no basta para asegurar ausencia de conversaciones en logs.
- Autorizar destinos y bloquear SSRF. El frontend no decide `base_url`, cabeceras arbitrarias ni credenciales.
- El gateway solo recibe el contexto seleccionado, no mounts de todo el corpus ni acceso al broker 1Password de otras aplicaciones. Aun alojado localmente, envía el contexto al proveedor remoto.

## 9. Plan de desarrollo y criterios de aceptación

Identificadores **C00–C06**, integrados en [07](07-backlog.md):

| ID | Trabajo | Criterio de cierre |
|---|---|---|
| C00 | Viabilidad/versionado | Revisar permiso y facturación aplicables; fijar versión y contrato; registrar go/no-go. No cerrar por leer un README. |
| C01 | ModelGateway desacoplado | Adapter de prueba con capacidades, cancelación, errores y presupuesto; sin credenciales reales. |
| C02 | Contexto y retención | Un mismo chat continúa entre dos identidades simuladas con ACL, fuentes y política de guardado intactas. |
| C03 | Failover simulado | Afinidad, cuotas, reset, cuentas no disponibles y modelo fijo; reintentos globalmente acotados. |
| C04 | Streaming/idempotencia | Interrupción, reconexión móvil, cancelación y acción incierta sin respuestas ni efectos duplicados. |
| C05 | Piloto privado condicionado | Solo tras C00 y seguridad: dos cuentas expresamente autorizadas, fixtures no personales, evidencias de consumo y revocación. |
| C06 | Integración con memoria | Recall autorizado de Current Truth/Timeline/Sources; cambiar cuenta no duplica recuerdos ni altera permisos. |

Pruebas mínimas a ejecutar en esas fases, **todavía pendientes**:

1. A responde; en el siguiente turno A devuelve cuota y B recibe el contexto aprobado: misma conversación y un único mensaje final.
2. Cuenta recuperada no roba una sesión vinculada; TTL expirado y reinicio no destruyen el historial.
3. Ambas agotadas: espera visible, número finito de intentos y ningún fallback de pago/modelo.
4. 401, 403, 429, sobrecarga, timeout y cancelación: clasificación y comportamiento distintos.
5. Fallo SSE después de texto, evento inicial o keepalive: sin doble respuesta; reanudar desde iPhone no regenera.
6. Revocar permiso mientras se prepara un reintento: no reenviar contexto ya prohibido.
7. Sandbox, otra área y otro usuario: ninguna filtración mediante recall, afinidad, logs o contadores.
8. Prompt final conserva instrucciones, etiquetas de confianza y fuentes; adjuntos, respuestas estructuradas y tool pairs pasan pruebas por modelo/ruta.
9. Cerrar un chat temporal no lo conserva fuera de política; chats guardados sobreviven al reinicio; exportar/borrar sigue funcionando.
10. Revocar una cuenta, restaurar desde backup y actualizar el gateway: contexto intacto, secretos inaccesibles y downgrade/rollback verificable.

## 10. Decisiones que esta investigación NO toma

No compra otra suscripción, conecta cuentas, activa créditos, instala Pi, sustituye la UI, habilita herramientas de escritura ni publica un proxy. No fija modelos concretos o precios que puedan cambiar. No declara seguros los defaults del proyecto ni aprobada por Anthropic esta ruta.

La implementación puede descartar CLIProxyAPI y conservar el chat, la memoria y el contrato del adapter. Ese desacoplamiento es un requisito, no una alternativa que deba activar facturación automáticamente.

## 11. Estado de esta entrega documental

Se han contrastado documentación primaria, la configuración versionada del gateway y las decisiones actuales de Lisa. No se han ejecutado pruebas de inferencia ni de consumo; los casos anteriores son criterios futuros, no resultados. El código de la demo, los contratos de API, las dependencias y las credenciales permanecen sin modificar por esta investigación.

## 12. Fuentes primarias

Consultadas el 26-09-2026; volver a comprobar antes de desarrollar o desplegar. Las fuentes describen capacidades declaradas, no una certificación de compatibilidad.

- [S1] [CLIProxyAPI · repositorio y capacidades](https://github.com/router-for-me/CLIProxyAPI).
- [S2] [Configuración fijada al commit inspeccionado](https://github.com/router-for-me/CLIProxyAPI/blob/9bdde54b59d1af70ae0534a0ef61b2c3361a1257/config.example.yaml), especialmente autenticación/red, rondas de reintento, afinidad y opciones Claude. [Commit de referencia](https://github.com/router-for-me/CLIProxyAPI/commit/9bdde54b59d1af70ae0534a0ef61b2c3361a1257).
- [S3] [CLIProxyAPI · configuración básica](https://help.router-for.me/configuration/basic). Puede diferir del código versionado; comparar antes de copiar parámetros.
- [S4] [CLIProxyAPI · login Claude](https://help.router-for.me/cn/configuration/provider/claude-code).
- [S5] [CLIProxyAPI · Management API](https://help.router-for.me/management/api).
- [S6] [Anthropic · autenticación de suscripciones y herramientas externas](https://support.claude.com/en/articles/13189465-log-in-to-your-claude-account).
- [S7] [Anthropic · conversaciones con Messages API](https://platform.claude.com/docs/en/build-with-claude/working-with-messages).
- [S8] [Anthropic · streaming y eventos de error](https://platform.claude.com/docs/en/build-with-claude/streaming).
