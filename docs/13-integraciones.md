# 13 · Integraciones: contrato, verificación y alternativas

Todas las integraciones personales están **pendientes**. Una tarjeta de UI no equivale a conexión ni compatibilidad demostrada. Referencias consultadas a 23-09-2026; registrar versión/digest real antes de instalar.

## Nextcloud · seleccionado como infraestructura

Adapter de servidor para archivos mediante WebDAV/OCS, calendario mediante CalDAV y tareas DAV si se valida esa opción. La UI oficial queda como acceso alternativo; Lisa consume APIs con sus componentes visuales.

Correspondencia: UUID Lisa + instancia + objeto de proveedor. `oc:fileid` no es global entre instancias. Las rutas son ubicaciones, no identidad. No escribir directamente en su datadir. Manejar ETag, conflictos, borrados, papelera, versiones y restauraciones.

Prueba de aceptación: instanciar con fixtures, listar/subir/renombrar/mover/sustituir/restaurar, verificar enlace anterior y ACL, simular pérdida de respuesta y reconciliar. Clientes externos no deben causar sobrescritura silenciosa. Fuente: [WebDAV oficial](https://docs.nextcloud.com/server/stable/developer_manual/client_apis/WebDAV/basic.html), [APIs cliente](https://docs.nextcloud.com/server/stable/developer_manual/client_apis/index.html), [calendarios](https://docs.nextcloud.com/server/stable/developer_manual/digging_deeper/groupware/calendar_provider.html).

## 1Password · gestor preferido

Solo el broker autorizado puede resolver secretos. El frontend/agente conoce capacidades, nunca el token de servicio ni acceso general al CLI. Separar vaults y permisos conforme al plan/configuración disponible. Validar acceso y revocación con elementos ficticios.

`op run`/inyección de entorno no oculta valores al proceso al que se entregan: no envolver al agente con el entorno secreto. Las sesiones autenticadas de navegador siguen siendo sensibles aunque el modelo no vea el password. Preferir acciones API/OAuth estrechas y tratar al broker como componente de confianza.

Prueba: agente autorizado logra una acción acotada, otro recibe denegación; logs/frontend/transcript no incluyen el secreto; revocación entra en efecto; destino no autorizado y redirects se rechazan. Fuentes: [Service Accounts](https://developer.1password.com/docs/service-accounts/) y [secretos en scripts](https://developer.1password.com/docs/cli/secrets-scripts).

## OpenClaw · runtime candidato

Lisa implementará un adapter de sesiones/runs/eventos/cancelación/herramientas, con despliegues privados y Sandbox separados. No se copia toda la memoria personal a una carpeta de runtime como fuente única.

Validar versión, licencia, protocolo real, autorización de workers, visibilidad entre sesiones, control de herramientas y retención. Los contratos de Lisa no son rutas nativas de OpenClaw. Computer Use/streaming/takeover son capacidades deseadas que requieren un ensayo en el host real: no se dan por resueltas por documentación genérica o conversaciones anteriores.

Prueba: agente de un área no recupera otra; un Sandbox no alcanza servicios personales; stop cancela ejecución; reintento/reconexión conserva la conversación correcta; las capacidades ausentes se anuncian como no disponibles. Fuentes: [seguridad](https://docs.openclaw.ai/gateway/security), [sandboxing](https://docs.openclaw.ai/gateway/sandboxing).

## Autorización · servicio propio con motor intercambiable

MVP con ACL explícitas y tests de objetos/acciones; OpenFGA es opción si las relaciones lo justifican. Interfaz `check(principal, action, resource, context)`. El caller no puede autodeclarar identidad. Persistir versiones de política y auditar decisiones; fail closed si falla el motor.

No desplegar un servicio adicional por añadir su nombre a la arquitectura: primero validar el modelo. Fuente de diseño del candidato: [documentación OpenFGA](https://openfga.dev/docs).

## Calendario y tareas

CalDAV primero: eventos simples, timezone IANA, UID, revisión y colecciones autorizadas. Comprobar recurrencias y excepciones antes de habilitar edición avanzada. Tareas via VTODO/Nextcloud Tasks se evalúan con las necesidades reales. Vikunja es alternativa detrás de TaskService; no se presupone ninguna función reciente sin comprobar versión/API.

Google Calendar, Gmail u otros SaaS pueden añadirse después con OAuth y scopes mínimos. No se ha conectado ninguna cuenta de correo/calendario por construir estas vistas.

## Modelos y recuperación

Sin proveedor predeterminado conectado. Server-side credentials y presupuesto por run; documentar qué contenido sale del servidor. Datos locales no equivalen a inferencia local cuando se usa API. Empezar con búsqueda textual/estructurada autorizada y medir antes de añadir embeddings/RAG complejo.

Fuentes conservan documento/revisión/fragmento. Evaluación con preguntas conocidas, errores visibles y métricas de coste/latencia, sin porcentaje de ahorro prometido.

## Browser/computer y Developer

Adapter de worker gráfico separado con sesiones efímeras y lease exclusivo. No puerto VNC público. Autenticación y estados actuales antes de devolver control al modelo. Dar acceso a una sesión autenticada es un privilegio aunque no se revele el secreto.

Developer usa repo/fixtures y tooling de código como adapter futuro. Ni OpenBot ni OpenMausBot se incluyen ahora como sistema principal. Reutilizar componentes exige validar licencia, versión, mantenimiento y contrato; no hay un puente AG-UI/ACP implementado en esta entrega.

## Vercel · destino de revisión solicitado

`vercel.json` y HTML autocontenido están preparados para demo ficticia. No se han desplegado servicios personales. El conector disponible no permitió crear la publicación: la acción de despliegue devolvió herramienta no encontrada y el importador limitó el origen a un dominio distinto de GitHub.

La importación manual del repo existente y verificación quedan descritas en 14. No interpretar una URL de importación, un archivo raw o un bundle como despliegue READY. Fuente de configuración: [documentación Vercel](https://vercel.com/docs/project-configuration/vercel-json).
