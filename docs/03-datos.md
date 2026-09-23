# 03 · Datos, identidad, sincronización y retención

Especificación objetivo, 23-09-2026. La demo v0.3 no contiene estos almacenes; usa fixtures en memoria.

## 1. Fuentes canónicas

| Datos | Autoridad prevista | Copias/derivados |
|---|---|---|
| Bytes de documentos y versiones | Nextcloud mediante interfaces soportadas | Caché y extracción reconstruibles |
| Calendarios y tareas DAV | Backend CalDAV elegido | Proyección de lectura en Lisa |
| Identidad de objetos, ubicaciones y relaciones | PostgreSQL Lisa | Exportación de metadatos versionada |
| Chats guardados y conocimiento aprobado | Almacén Lisa | Exportación legible de chats/Markdown |
| Índice de búsqueda | Ninguna: es derivado | Reconstruido de fuentes autorizadas |
| Secretos | 1Password o almacén delegado aprobado | Nunca una tabla de contraseñas en Lisa |
| Sesiones de navegador/runtime | Almacén operativo aislado | No pertenecen al corpus ni al repo |

La selección de Nextcloud reemplaza la propuesta de tratar su directorio interno como archivos editables libremente. Los agentes escribirán mediante Lisa API y el adapter. Un cliente de sincronización puede coexistir, pero sus conflictos y cambios se reconcilian; no se promete transacción SQL + DAV atómica.

## 2. Organización inicial

Universidad: Intercambios, Matrícula, Apuntes y Trámites. Vivienda: por inmueble, con Comunidad, Suministros, Contratos, Seguros e Impuestos. Finanzas: bancos, impuestos, inversiones, préstamos, facturas y otros. Familia: por familiar/expediente. Personal: Identificación, Viajes y Compras. Bandeja de revisión y archivo para lo que no se pueda clasificar.

Los nombres de personas, inmuebles y cuentas reales solo se configuran en privado. Ejemplo de relación: un impuesto de un inmueble se conserva con su documento original y se enlaza al expediente fiscal; no se duplica para construir otra vista. Developer conserva código y fixtures separados de estas áreas.

## 3. Identidad estable

```text
Lisa UUID
  -> provider_instance_id
  -> provider_object_id
  -> ubicación actual / revisión
```

El UUID de Lisa es el identificador canónico. En Nextcloud, `oc:fileid` es único dentro de una instancia; no asumir que ese número identifica el archivo en otra instalación. Mantener la instancia y el identificador del proveedor en el mapping. Fuente: [operaciones WebDAV oficiales](https://docs.nextcloud.com/server/stable/developer_manual/client_apis/WebDAV/basic.html).

El hash sirve para integridad y detectar contenido, no para identidad semántica. Dos documentos con bytes idénticos pueden ser documentos distintos. Editar cambia el hash, no el UUID. Una copia recibe otro UUID con `derived_from`, salvo réplica explícita del mismo objeto.

Enlace de diseño: `/d/<uuid>`; una cita histórica añade `?v=<revision>`. El resolver autentica y autoriza cada vez, incluidas versiones anteriores. Conocer un ID no concede acceso. No publicar enlaces permanentes a buckets privados.

## 4. Modelo mínimo

| Entidad | Campos importantes / invariantes |
|---|---|
| Document | UUID, título, MIME, categoría, information_labels, revisión actual, estado |
| DocumentVersion | documento, revisión, SHA-256, bytes, mapping de proveedor, fecha, autor/origen |
| ProviderMapping | instancia, objeto proveedor, UUID Lisa, etag, ubicación, estado de reconciliación |
| KnowledgeItem | UUID, título, Markdown, revisión, estado proposed/approved/revoked, etiquetas |
| SourceReference | UUID fuente, revisión, página/sección/fragmento y relación |
| Conversation | UUID, modo de creación inmutable, identidad ejecutora, categoría, etiquetas, saved_at, revision, source_id |
| Message | UUID, conversación, orden, rol, texto/adjuntos, origen, etiqueta de confianza |
| Task / CalendarEvent | UUID Lisa, mapping de proveedor, ámbito, revisión, zona horaria cuando corresponda |
| Action / Approval | identidad, recurso, parámetros normalizados, hash, estado, caducidad, aprobación |
| AuditEvent | actor, acción, recurso, decisión, correlación y fecha; sin secretos/transcript |

Imponer claves únicas para mappings activos y orden de mensajes; referencias con FK y borrado controlado. No son migraciones ejecutadas: la siguiente fase debe implementarlas y probarlas.

## 5. Mutaciones documentales

- Renombrar/mover: conservar UUID; registrar intención, ejecutar DAV, verificar resultado y actualizar mapping. Un cambio de ámbito requiere permiso de origen y destino y no rebaja etiquetas de información automáticamente.
- Sustituir bytes: generar una revisión verificable y aplicar control de concurrencia con ETag/revisión esperada. Si cambió la fuente, devolver conflicto, no última escritura gana.
- Borrar: tombstone, papelera y retención; no reciclar IDs ni permitir que una URL antigua resuelva otro documento.
- Restaurar: misma identidad si se recupera el objeto conocido; registrar procedencia. Probar conservación de mapping al restaurar un backup completo.
- Movimiento no observado: marcar ubicación faltante, reconciliar con metadatos. Si hubo copia/move/edición simultánea ambigua, pedir revisión; un hash es una pista, no una autorización para fusionar.

Para el adapter de archivos locales del prototipo puede utilizarse temporal + flush + publicación atómica. **No aplicar ese procedimiento directamente al datadir de Nextcloud**. Para DAV, usar el protocolo y un registro de intención/reconciliación. SQL y proveedor externo tienen recuperación coordinada, no una transacción distribuida inventada.

## 6. Ingesta y revisión

Recibir -> cuarentena -> validar límites/MIME -> hash -> idempotencia -> extracción en worker restringido -> propuesta de clasificación -> persistir original/mapping -> proponer notas -> indexar solo material permitido.

Límite inicial de 25 MiB propuesto, configurable. Rechazo visible en vez de truncado. No ejecutar macros, scripts o instrucciones de archivos. Extraer texto primero; OCR solo si hace falta y conservando idioma/confianza. Cifras y tablas deben citar el original.

Deduplicar eventos de entrada por canal/cuenta/evento/adjunto, no solo por nombre de archivo. Reintentar una ingesta debe recuperar el resultado anterior o continuar desde una etapa conocida.

## 7. Clasificación, permisos y flujo de información

`category` organiza la UI. `information_labels` conservan los ámbitos de los datos usados. `agent_id` identifica al ejecutor. **Ninguno sustituye a los otros.**

Una conversación general que consulta Vivienda y Finanzas hereda ambas etiquetas. Guardarla en Vivienda no permite que cualquier agente de Vivienda lea el contenido financiero. La promoción entre áreas exige que el destinatario tenga acceso a todas las etiquetas, o una exportación redactada/declasificada revisada por el propietario. No confiar solo en que un resumen generado por IA eliminó datos sensibles.

Un archivo adjunto de Sandbox se importa como dato no confiable y atraviesa cuarentena. El sandbox no lee el archivo privado resultante ni recibe credenciales del proceso importador.

## 8. Historial, conocimiento y borrado

Conversación nueva: `saved_at = null`. Guardar es una transacción explícita; si falla no se muestra como guardada. No generar resúmenes persistentes/indexables de chats descartados como efecto secundario.

Conocimiento: propuesta con fuente -> revisión humana -> aprobación -> índice autorizado. Editar exige revisión esperada. Revocar una fuente debe invalidar o marcar sus derivaciones y retirar los fragmentos correspondientes del índice.

«Sin guardar» no equivale a ausencia de retención técnica. Antes de producción son obligatorias políticas para: sesiones del runtime, proveedor LLM, cola, adjuntos, navegador, capturas, logs, backups y auditoría. La UI debe mostrar las excepciones reales. No incluir texto personal en analítica, trazas de error o logs por defecto.

La demo actual destruye todo al recargar, incluido lo marcado como guardado. El backend real deberá conservar lo archivado; la demo no es una implementación de esa persistencia.

## 9. Exportación y recuperación

Exportar originales, versiones que deban conservarse, Markdown, conversaciones seleccionadas y mapping UUID/proveedor en un formato legible. Un backup debe incluir DB Lisa, DB/config/volúmenes Nextcloud del mismo punto consistente, permisos y configuración. Los índices se reconstruyen.

Secretos se recuperan con el procedimiento del gestor, no con un dump sin cifrar. Probar restauración en host limpio, hashes, enlaces, versiones, ausencia de fugas y acciones pendientes. No repetir automáticamente efectos externos cuyo resultado sea desconocido.
