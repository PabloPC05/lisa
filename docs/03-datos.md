# 03 · Datos, identidad y sincronización

## Separación física propuesta

En el servidor, fuera del checkout: `/srv/lisa/knowledge/` para notas; `documents/` para originales/versiones; `registry/` para identidad y auditoría; `runtime/` para sesiones y colas; `staging/` para ingesta; `secrets/` con permisos restringidos. Las copias deben estar también fuera del equipo.

Taxonomía inicial: Universidad (Intercambios, Matricula, Apuntes, Tramites); Finanzas (IRPF, DGT, Bancos, Inversiones, Impuestos, Prestamos_Hipotecas, Facturas_Recibos, PensionOrfandad, Otros); Vivienda por inmueble (Comunidad, Suministros, Contratos, Seguros, Impuestos); Familia por familiar/expediente; Personal (Identificacion, Viajes, Compras); Otros (NEEDS_REVIEW, ARCHIVO). Coding conserva su workspace de desarrollo separado. Usar nombres reales solo en la instalación privada. IBI pertenece al inmueble; referencias cruzadas desde el expediente fiscal anual evitan duplicar el original.

## Modelo lógico

| Entidad | Campos mínimos |
|---|---|
| Document | UUID, título, área, tipo MIME, estado, fecha creación, versión actual |
| Version | UUID documento, número, hash SHA-256, tamaño, objeto/path, fecha, origen |
| Location | UUID, backend, identificador del proveedor o path relativo, última comprobación |
| Note | UUID, área, path, revisión, referencias a documentos/notas |
| Reference | UUID destino, versión opcional, página/sección, tipo de relación |
| Task | UUID, área, estado, vencimiento opcional, fuentes, acción propuesta |
| Event | UUID, actor, operación, objetivo, versión base, resultado, timestamp UTC |
| Approval | UUID, actor autorizante, hash de acción, caducidad, estado |

El hash detecta integridad/contenido; **no es la identidad del documento**. Dos contratos iguales pueden ser dos documentos distintos; una nueva versión del mismo contrato cambia el hash sin cambiar el UUID. No deduplicar automáticamente decisiones semánticas por igualdad binaria.

Enlace humano objetivo: `https://cerebro.example/d/<uuid>`. Con `?v=3` cita una versión concreta; sin versión abre la vigente. El dominio es ficticio. El endpoint exige autenticación y ACL en cada petición: conocer el UUID no otorga permiso. No devolver URLs públicas permanentes del almacenamiento.

En notas, usar enlaces Markdown normales a ese resolver. Para referencias entre notas, también asignar UUID y resolver o mantener aliases gestionados; los wikilinks basados en nombre no cubren todas las reorganizaciones externas.

## Mutaciones

- **Renombrar/mover:** transacción lógica conserva UUID, actualiza ubicación e historial. Un cambio de área recalcula acceso y requiere permiso en origen y destino; no hereda acceso por conservar URL.
- **Editar/sustituir contenido:** versión nueva e inmutable; actualizar puntero vigente tras validar escritura.
- **Copiar:** UUID nuevo con `derived_from`, salvo operación explícita de réplica del mismo objeto.
- **Borrar:** tombstone y papelera con retención configurable; resolver devuelve estado eliminado sin reciclar IDs.
- **Restaurar:** conservar UUID y registrar evento. Restauración de backup mantiene registro y objetos coherentes.
- **Movimiento externo no observado:** marcar ubicación faltante, intentar reconciliar por metadatos/hash solo como pista y pedir revisión en ambiguos. No prometer resolver automáticamente un archivo movido y modificado fuera del sistema.

No basar identidad solo en inodos, xattrs, symlinks o nombre. Pueden ayudar a reconciliar, pero no sobreviven a todas las copias, backups o plataformas.

## Escritura segura y conflictos

Escribir primero un temporal dentro del filesystem destino, calcular hash, hacer flush y publicar atómicamente. Registro de intención antes de mutar; completar evento después. Filesystem y SQL no comparten transacción: un reconciliador debe recuperar estados incompletos tras caída. Una restricción única impide dos ubicaciones activas contradictorias.

Notas: revisión esperada obligatoria; si cambió, devolver conflicto con ambas propuestas. El editor web y el agente necesitan una política de coordinación: integrar revisión con editor o aplicar cambios mediante una cola de propuestas revisables. No permitir que el agente sobrescriba un fichero mientras el editor sincroniza. Markdown versionado y copia del conflicto, sin resolver silenciosamente por «última escritura gana».

## Ingesta

Recibir → staging privado → validar tamaño/tipo → hash → identificar evento y posible duplicado → extraer/OCR en worker restringido → proponer área → persistir original/registro → generar nota con fuentes → indexar → confirmar resultado. Ante duda, NEEDS_REVIEW; adjuntos y texto extraído son datos no confiables, nunca instrucciones para otorgar acceso.

Idempotencia por canal/cuenta/update ID/adjunto. Límite inicial propuesto de 25 MiB por archivo, configurable; rechazo explícito, sin truncado silencioso. Guardar idioma y confianza OCR. Tablas/cifras requieren referencia al original.

## Copias y sincronización

MVP sin sincronización multi-maestro. Editor web escribe en servidor; clientes de consulta leen. Drive opcional recibe exportación/copia versionada. Nunca ejecutar una sincronización destructiva sobre originales como paso inicial.

Un backup debe incluir notas, originales, versiones, registro de identidad, configuración y secretos cifrados por separado. El índice se reconstruye. Crear snapshot consistente con escritura pausada o procedimiento de backup SQL apropiado. Ensayar restauración y comprobar hashes, enlaces y acceso antes de borrar/migrar fuentes.
