# 06 · Operación, despliegue y migración

Fecha: 23-09-2026. Separar siempre la **demo de UI** del **servidor personal operativo**. Solo la primera está implementada en esta entrega. Instrucciones de UI y Vercel: [14](14-ui-despliegue.md).

## 1. Entornos

| Entorno | Datos | Conexiones | Publicación |
|---|---|---|---|
| Demo pública | Fixtures + memoria efímera del navegador | Ninguna | HTML estático / Vercel preparado |
| Desarrollo backend | Fixtures aislados | Instancias de prueba | Solo acceso local/autenticado |
| Piloto privado | Muestra autorizada tras controles | Servicios acotados | HTTPS + autenticación |
| Producción personal | Datos canónicos | Políticas y auditoría completas | Servidor privado y acceso remoto controlado |

No reutilizar secretos, perfiles de navegador o backups entre demo y producción. No poner credenciales del hogar en las variables del frontend de Vercel. Una UI pública de revisión no se transforma en portal personal solo por añadir una API.

## 2. Dimensionamiento

El servidor no ejecutará modelos locales por defecto. CPU/RAM/disco dependen del corpus, versiones, Nextcloud, búsquedas, OCR, navegador y concurrencia. Los rangos antiguos de 2–4 vCPU/4–8 GB para un piloto y 16–32 GB con workers son únicamente hipótesis, no requisitos medidos ni recomendación de compra.

Antes de contratar/migrar: medir memoria base, picos por navegador, tiempo de extracción, disco por versiones y rendimiento con dos tareas simultáneas. Registrar p50/p95 y carga máxima. Definir cuotas por worker y evitar que una tarea consuma toda la memoria del servidor. Backups externos aparte del espacio operativo. No contratar servicios como efecto secundario de esta especificación.

## 3. Orden del despliegue privado

1. Elegir host, dominio/red, acceso administrativo, origen de UI/API y política de backup.
2. Verificar versiones/licencias y fijar imágenes por digest en `infra/versions.md`; registrar resultados de compatibilidad.
3. Crear usuarios/volúmenes/redes separados. Sin DB, VNC, motor de políticas o daemon Docker expuestos públicamente.
4. Instalar almacenamiento de prueba y ensayar una restauración antes de cargar datos personales.
5. Implementar identidad, autorización y API de Lisa; probar acceso directo sin pasar por la UI.
6. Integrar Nextcloud mediante API y comprobar IDs, versiones, rename/move/conflictos/restore.
7. Separar runtimes privado y sandbox, identidad de workers y salida de red; ejecutar pruebas negativas.
8. Conectar proveedor/modelo con presupuesto y contrato de retención revisados. Contexto personal enviado solo bajo scopes explícitos.
9. Integrar calendario/tareas y después broker de credenciales/acciones. Probar primero cuentas y documentos ficticios.
10. Autorizar piloto con muestra mínima, validar inventario y copia recuperable; ampliar solo tras aceptación.

No instalar un bot Telegram como requisito para la UI: ahora es un canal opcional. No se entrega un Compose de producción completo ni un host operativo.

## 4. Compose de laboratorio

`infra/compose.dev.yml` es un punto de partida de laboratorio para bases, Nextcloud, Redis y un motor de políticas. No contiene runtimes privado/Sandbox ni Lisa API reales. Las imágenes deben suministrarse explícitamente tras verificarlas; no hay defaults `latest`/`stable` ni contraseñas funcionales de ejemplo.

```bash
# Completar un archivo privado fuera del repo con referencias revisadas y secretos de laboratorio.
docker compose --env-file /ruta/privada/lisa-lab.env -f infra/compose.dev.yml config
# Solo tras revisar la configuración:
docker compose --env-file /ruta/privada/lisa-lab.env -f infra/compose.dev.yml up -d
```

Los puertos de laboratorio se enlazan a loopback. OpenFGA de laboratorio usa memoria, por lo que sus políticas NO son persistentes; producción requiere datastore y migraciones probados. `depends_on` no reemplaza readiness: comprobar salud/reintentar conexión de forma acotada. Cron de Nextcloud, TLS, autenticación externa, tuning, límites y restauración quedan para la instalación validada.

## 5. Red y acceso remoto

Publicar solo el reverse proxy autenticado. Acceso por red privada/VPN o entrada HTTPS protegida según el host; no se obliga a una marca concreta. Separar UI/API, servicios de datos, workers y broker. El Sandbox solo alcanza su relay y destinos aprobados, no los servicios internos.

Tener dos redes Docker no demuestra ausencia de rutas: probar desde dentro del worker DNS, metadatos, IP del host, IPv6, redirecciones y sockets. No activar acceso externo a un servicio para solucionar una integración sin revisar permisos.

## 6. Copias y recuperación

Objetivos propuestos a validar: RPO 24 h y RTO 4 h para corpus, no SLA. Propuesta inicial de retención: 7 copias diarias, 4 semanales y 6 mensuales, cifradas y con copia fuera del host. El propietario debe aprobar destino, coste y excepciones de borrado.

Copiar de forma consistente DB/config/volúmenes de Nextcloud y DB Lisa, relaciones, políticas y manifest de versión. Índices reconstruibles. Clave de recuperación separada; no exportar bóvedas sin cifrar.

Restauración: detener escritores -> restaurar componentes coherentes -> comprobar UUID/hashes/versiones -> reconstruir índice -> probar ACL/citas -> comprobar acciones pendientes -> reabrir servicio. No repetir una operación externa de resultado incierto. Ensayar en host limpio antes de migrar y periódicamente después.

## 7. Cambios y rollback

Releases de UI por commit; contracts versionados y compatibles con el backend soportado. Cambios de DB con migraciones revisadas y plan de recuperación. Guardar versión anterior de artefactos. El rollback de código no debe sobrescribir datos posteriores con un backup sin autorización.

Developer propone cambios sobre copia del repo y fixtures. Tests/preview/diff antes de aplicar. El permiso para modificar la UI no incluye permiso de cambiar ACL, credenciales, infraestructura o esquema de producción.

## 8. Observabilidad y costes

Medir salud, colas, latencia, memoria por worker, fallos de proveedores, presupuesto por run/día/mes, conflictos y backups. Logs sin transcript, contraseñas, cookies ni capturas por defecto. Alertas contienen IDs y metadatos mínimos.

Presupuestos para host, copia, modelos, OCR/audio y licencias separados. Cuotas de contexto/llamadas/tiempo detienen nuevas ejecuciones; precios se verifican cuando se contraten. No deducir consumo de API de una suscripción de chat ni prometer ahorro sin evaluación.

## 9. Migración reversible

Inventariar sin modificar, copiar una muestra, calcular hashes, asignar UUID, revisar taxonomía/mappings y probar referencias desde móvil. Conservar fuente original hasta disponer de copia restaurable e inventario comparado. No migrar a la vez proveedor, editor e identidad sin un punto de recuperación. Drive/otros proveedores pueden recibir exportaciones, no sincronización destructiva multi-maestro por defecto.
