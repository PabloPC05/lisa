# 01 · Especificación funcional v0.3

Actualización: 23-09-2026. Sustituye el planteamiento inicial centrado en Telegram/Markdown como única interfaz. Conserva los requisitos de portabilidad, identidad estable, contexto selectivo y recuperación. Las decisiones del propietario y el estado implementado no se deben confundir.

## 1. Producto

Lisa es la plataforma que unifica los datos del propietario, su conocimiento revisado, conversaciones, tareas, calendarios y agentes. El servidor personal es el centro de los datos; la UI, Nextcloud y los runtimes tienen responsabilidades separadas. Los modelos se consumen mediante API: no se exige GPU ni inferencia local.

La experiencia principal es una web propia, adaptable a móvil. No será un iframe de OpenBot ni la interfaz estándar de Nextcloud. Los clientes oficiales de Nextcloud pueden seguir coexistiendo como acceso alternativo. Telegram y otras interfaces pasan a ser adaptadores opcionales, no requisito de la primera versión web.

## 2. Entradas de conversación

### Con conocimiento

Botón permanente «Con conocimiento». Abre una sesión nueva sin archivar. Puede consultar conocimiento personal autorizado, pero esto no implica permiso universal de escritura, uso de cuentas ni acciones externas. El contexto se recupera bajo demanda; no se envía todo el corpus al modelo.

### Sandbox

Segundo botón permanente «Nuevo chat Sandbox». En el producto terminado se ejecutará en un entorno separado sin montajes, tokens, memoria, sesiones ni conectividad hacia servicios personales. Acceso público a internet y navegador efímero serán capacidades explícitas. No se comparte el perfil de navegador privado.

En la UI actual solo se simula el modo: no hay agente, proceso aislado ni navegador operativo.

### Agentes especializados

Entre cuatro y cinco accesos por área, configurables por el servidor. Semilla visual actual: Vivienda, Universidad, Finanzas, Personal y Familia. El área de clasificación y la identidad ejecutora son conceptos distintos. La UI muestra el ámbito efectivo, capacidades y estado de conexiones; no puede concederse privilegios a sí misma.

## 3. Guardado, categoría y continuidad

Toda conversación nueva comienza sin guardar. Cerrar, cambiar de vista o enviar mensajes no debe equivaler a un consentimiento para archivarla. La persistencia temporal necesaria para ejecutar un agente debe tener una retención explícita; véase 03.

| Acción humana | Resultado exigido | Lo que NO sucede |
|---|---|---|
| Guardar | Archiva transcript bajo su categoría actual | No extrae memoria ni cambia permisos |
| Guardar en… | Archiva y asigna categoría de organización | Un Sandbox no deja de ser Sandbox |
| Continuar con… | Crea otra sesión para General o un agente | No eleva privilegios del runtime original |
| Proponer conocimiento | Crea un borrador revisable con procedencia | No indexa automáticamente todo el chat |
| Aprobar conocimiento | Publica únicamente lo revisado y autorizado | No convierte instrucciones importadas en política |
| Descartar | Elimina el estado dentro de la política de retención | No promete borrar copias de terceros instantáneamente |

«Guardar como General» se implementa como archivado en categoría General. Es diferente de «Continuar con General». Ambos botones deben dejar esta diferencia clara.

La promoción copia solo mensajes/adjuntos seleccionados y autorizados. Cookies, credenciales, entorno, herramientas ejecutables y mensajes de sistema no se transfieren. Los textos se marcan como material importado no confiable y se conserva su procedencia. El destino se vuelve a autorizar y obtiene una nueva identidad de sesión.

**Clasificación no es desclasificación:** un chat general que utilizó fuentes de varias áreas conserva esas etiquetas aunque se archive en Vivienda. El agente de Vivienda no puede leer automáticamente información de Finanzas por ese cambio. Las transferencias entre ámbitos requieren filtrado o decisión humana explícita sobre un contenido concreto.

## 4. Datos y herramientas visibles

Archivos: listado, búsqueda por nombre/etiquetas, previsualización, identidad estable, versiones y enlaces a notas. Más adelante, carga, renombrado, movimiento, borrado recuperable y resolución de conflictos mediante API.

Conocimiento: notas revisadas, fuentes, citas de versión y relaciones. Historial de chat y corpus consultable no son el mismo almacén. Documentos nuevos y resultados de OCR/IA no son hechos aprobados por defecto.

Calendario: vista mensual y agenda, creación/modificación con calendario destino visible, zonas horarias IANA, recurrencias/excepciones en fases posteriores. CalDAV primero; otros proveedores detrás del mismo servicio.

Tareas: captura, categoría/proyecto, estado y fechas; contrato independiente del proveedor. Nextcloud Tasks/CalDAV es la primera opción a ensayar; Vikunja queda disponible como alternativa si las pruebas lo justifican.

Cuentas: únicamente metadatos de conexiones, agentes autorizados y últimas acciones. Nunca una pantalla que revele al modelo las contraseñas. La concesión la hace el propietario, no guardar una conversación.

Ordenadores: sesión de tarea, vista remota autorizada, detener, solicitar control y devolver control. La entrada humana y la del agente deben ser mutuamente excluyentes. Hasta validar un proveedor concreto, es requisito, no una funcionalidad garantizada de OpenClaw.

Developer: solicitud de cambio, rama de código, pruebas, diff, preview y decisión humana. No una terminal con acceso al servidor personal desde una web pública.

## 5. Requisitos y aceptación

| ID | Requisito | Prueba para aceptar el backend |
|---|---|---|
| R01 | Corpus portable | Exportar Markdown/documentos/metadatos sin depender de un runtime |
| R02 | Identidad estable | Mover/renombrar, abrir enlace anterior y conservar identidad |
| R03 | Versiones/procedencia | Citar archivo, revisión y fragmento; edición no borra evidencia |
| R04 | Ámbitos reales | Rechazar lectura directa, búsqueda y conteos de otra área |
| R05 | Sesiones separadas | Dos expedientes no mezclan contexto ni herramientas |
| R06 | Contexto selectivo | Traza enumera solo fuentes/skills autorizadas necesarias |
| R07 | Uso móvil | Chat, guardar, archivos y aprobación utilizables con teclado/táctil |
| R08 | Ingesta idempotente | Reentrega y fallo intermedio no duplican ni pierden original |
| R09 | Concurrencia | Revisión obsoleta produce conflicto, no sobrescritura silenciosa |
| R10 | Secretos | Ningún valor en prompt, transcript, frontend o logs |
| R11 | Recuperación | Reinicio reanuda jobs; restauración preserva IDs y permisos |
| R12 | Presupuesto | Límites de gasto/contexto/concurrencia frenan nuevas ejecuciones |
| R13 | Aprobaciones | Hash, destinatario, importe/parámetros y expiración quedan vinculados |
| R14 | Identidad | Denegar antes de consultar fuentes o llamar modelos si no autenticado |
| R15 | Dos nuevos chats | Ambos visibles y sin archivado implícito |
| R16 | Categorización segura | Guardar en otra categoría no amplía lectura ni cambia runtime |
| R17 | Promoción segura | Nuevo ID, original intacto, importación no confiable, sin secretos |
| R18 | Memoria explícita | Guardar chat no lo indexa; propuesta y aprobación separadas |
| R19 | UI reemplazable | Mismas operaciones a través de contrato, sin SDKs de proveedores en vistas |
| R20 | Takeover | Input exclusivo, stop prioritario, reconexión y captura actualizada |
| R21 | Desarrollo aislado | Agente de código solo accede a repo/fixtures; deploy exige aprobación |
| R22 | Exportar/borrar | Purgar índices y cachés derivados; informar retención de copias |

## 6. Alcance de esta entrega

Implementados en demo local: navegación completa, dos entradas, cinco agentes de muestra, ciclo de conversaciones, clasificación y promoción, notas revisables, tareas, calendario ficticio, archivos ficticios, integraciones pendientes, simulación gráfica y diseño Developer. Hay 21 tests de dominio/contrato y build sin dependencias.

NO implementados: autenticación, backend personal persistente, permisos de servidor, Nextcloud real, CalDAV real, 1Password/broker, OpenClaw, LLM, aislamiento de ejecución, escritorio remoto, terminal o despliegue del servidor personal. La demo pública no se usará como almacén real.

## 7. MVP operativo y límites

Primero: identidad/ACL, persistencia explícita, dos modos de chat con separación real, Nextcloud de prueba y citas autorizadas. Después calendario/tareas reales y modelos limitados. Por último credenciales, browser workers, takeover y Developer ejecutable.

Pagos, firmas, banca y envío de documentación sensible quedan fuera de la ejecución autónoma. OCR/audio, embeddings y múltiples canales son ampliaciones, no requisitos para validar los dos flujos de chat.

Una revisión de UI no valida la seguridad del sistema. Antes del piloto se ejecutarán las pruebas negativas y de restauración de 07/11/15 con datos ficticios.
