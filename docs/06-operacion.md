# 06 · Despliegue, operación y migración

## Dimensionamiento inicial (hipótesis, no benchmark)

Servidor Linux propio o VPS. Sin inferencia local, no hace falta GPU. Piloto de documentos y chat: punto de partida 2–4 vCPU, 4–8 GB RAM, SSD dimensionado al corpus. Con OCR y dos navegadores concurrentes, empezar evaluando 4–8 vCPU y 16 GB; 32 GB aporta margen. Estos rangos no garantizan rendimiento: medir páginas reales y concurrencia antes de contratar. CPU compartida, límites del proveedor, discos y picos de Chromium importan.

Disco: originales + versiones + staging + índices + margen operativo de 30%; backups externos aparte. No fijar proveedor por conversaciones sobre precios sin verificar oferta y condiciones al contratar. En ordenador doméstico medir consumo, cortes, red y recuperación; en VPS comprobar CPU, transferencia y snapshots.

## Orden de instalación objetivo

1. Elegir host y versiones verificadas; registrar componentes, licencias e imágenes con digest en `infra/versions.md`.
2. Crear usuarios/volúmenes y acceso administrativo; actualizaciones y reloj UTC.
3. Configurar copia cifrada y restaurar fixtures en un directorio limpio.
4. Desplegar registro documental en red privada con almacenamiento de pruebas.
5. Desplegar editor y acceso autenticado; HTTPS para móvil. No publicar paneles sin autenticación.
6. Añadir OpenClaw con dos agentes y dos áreas; validar aislamiento y coste.
7. Configurar bot privado con allowlist; probar móvil y reinicios.
8. Autorizar piloto de documentos reales; migrar por copia y verificar.
9. Añadir workers OCR/audio y más áreas; navegador solo tras completar controles de acciones.

No se entrega Compose de producción: aún faltan decisiones de producto, imágenes y compatibilidad. B11 debe producir Compose validado, puertos/volúmenes documentados, healthchecks y procedimiento de rollback. No usar `latest` como versión de despliegue.

## Red y secretos

Solo punto de acceso autenticado necesario hacia internet; bases y workers internos. Acceso remoto privado o proxy HTTPS autenticado según disponibilidad, sin exigir Tailscale. Tokens de modelos, bot y backups fuera del repo. Separar credenciales de desarrollo y producción. Evitar que logs/capturas expongan información enviada a terceros. Documentar qué texto se manda a proveedor LLM, OCR o transcripción; elegir proveedores y política de retención antes de usar material personal.

## Copias y continuidad

Objetivos iniciales propuestos: RPO 24 horas y RTO 4 horas para corpus personal, a validar con volumen. Copia diaria cifrada, retención sugerida 7 diarias/4 semanales/6 mensuales, copia fuera del host. Clave de recuperación en ubicación independiente y accesible al propietario. Ensayo de restauración mensual y antes de migraciones relevantes.

Restaurar: detener escritores → reconstruir volúmenes → restaurar registro y objetos del mismo snapshot → verificar hashes/UUID → reconstruir índice → probar ACL/enlaces → reiniciar gateway/cola. No reenviar automáticamente acciones externas pendientes cuyo resultado sea incierto.

## Monitorización

Disponibilidad de canales, salud de disco y backups, cola/errores, latencia, RAM de workers, coste y tokens por tarea, cambios de permisos, documentos huérfanos y conflictos. Alertas sin contenido sensible. Logs técnicos de retención corta configurable; auditoría de cambios documental conservada según política elegida. Añadir exportación/borrado por área, incluida información derivada e índices.

## Migración reversible

Inventariar fuentes y duplicados sin modificar. Clasificar muestra. Copiar a staging y calcular hashes. Asignar UUID y registrar correspondencias. Importar notas y referencias, verificar enlaces desde móvil. Comparar inventario de origen/destino. Hacer backup restaurable. Solo después decidir retirada de la fuente antigua. Nunca cambiar a la vez proveedor, editor e identidad sin un punto de recuperación.

## Presupuesto

Separar host, disco, copia, dominio, API de modelos, OCR/audio y posibles licencias. Fijar cuota diaria y mensual, alertas al 50/80/100% y comportamiento al agotarse. Registrar tarifas con fecha; no calcular API a partir de suscripciones de chat. Los presupuestos monetarios están pendientes de decisión del usuario.
