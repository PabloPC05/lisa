# CONTINUAR · Lisa · Inicio Cielo + Finanzas

Actualizado: 25-09-2026 (hora de Madrid). **Trabajar desde `main`**. Leer primero docs/09-decisiones-vigentes.md y docs/16-inicio-cielo.md. No continuar desde una rama antigua sin comparar cambios.

## Estado real

Implementado: especificación de plataforma personal; UI de revisión con DemoClient en memoria; dos entradas a chat (conocimiento y Sandbox), cinco agentes, sidebar colapsable, adjuntos/cola/cancelar/reintentar, historial por proyecto y fijadas, biblioteca Markdown con lectura/edición/revisiones; HttpClient preparado; OpenAPI 3.1 y stub HTTP sin efectos; CI y bundle autocontenido. Se conserva el prototipo Python/SQLite anterior.

La portada mantiene el paisaje de cielo con transparencias, nubes y luz vinculada al reloj del dispositivo. Incluye selector de hora/presets, pausa de movimiento, reduced-motion y navegación a las aplicaciones existentes. Chat, Conocimiento, Archivos y las demás vistas mantienen su diseño anterior. **El estilo Windows 98 de Archivos está solicitado, pero todavía NO implementado.** No hay gestor de ventanas.

Se añade Finanzas v0.6 como aplicación funcional de la demo: alta/edición/borrado de posiciones, coste y valor actual convertidos a EUR, P&L, distribución por tipo, gráfico de evolución por periodos y valoraciones manuales. Los ejemplos son ficticios y los cambios desaparecen al recargar. No hay cotizaciones, FX, Renta 4, MyInvestor ni otro bróker conectado; la interfaz queda preparada para sustituir la fuente manual por adaptadores posteriores.

No implementado: backend personal persistente, autenticación/ACL de servidor, Nextcloud/CalDAV reales, modelos, OpenClaw, Sandbox de ejecución, broker 1Password, browser/desktop remoto, terminal ni autoedición operativa. No se han migrado datos ni configurado credenciales. El cielo no usa localización, meteorología ni efemérides: es una representación ilustrada de la hora local.

## Vercel: publicación verificada

**URL: https://lisa-ten-gray.vercel.app**

Proyecto `lisa`, conectado a `PabloPC05/lisa`. El cambio de código en main activa el despliegue Git. La antigua anotación de bloqueo de Vercel queda superada: la UI sí está publicada y comprobada. Esto cierra L06 en su alcance de publicación de revisión, no el despliegue de un backend personal seguro.

- Código funcional de Inicio Cielo: `267a2d79a11b157fabaa21a8ab88010d14cc547e`.
- Bundle generado por CI: `ea96f927fb7002230dbb8eba5b0dd6b0fe019862`.
- Deployment comprobado READY: `dpl_MTpnuDCpAW7AUjWSX2SkrBwgGcG6`.
- `/build-info.json`: HTTP 200, `version: 0.5.0-sky`, `home: sky-local-clock`.
- CI UI exitoso: https://github.com/PabloPC05/lisa/actions/runs/35926467862 .
- CI Python exitoso: https://github.com/PabloPC05/lisa/actions/runs/35926467838 .

Los documentos antiguos que indiquen «Vercel pendiente» describen intentos previos, no el estado actual. Conservar sus límites de seguridad aunque la UI ya tenga URL.

## Ejecutar

```bash
npm run dev
npm run check
node --test tests/web/sky.test.mjs
python -m unittest discover -s tests -v
```

Node 22+; sin dependencias npm nuevas. `dist/index.html` es autocontenido. `preview/` es copia generada por CI: no editar manualmente. `tools/build.mjs` concatena domain, client, sky y app e incorpora styles.css y sky.css.

## Validación de la última entrega

Cinco pruebas nuevas del cielo pasan: validación de horas, medianoche, continuidad de paletas, recorrido de los 1.440 minutos y formato HH:mm. CI UI/build y Python exitosos. Pruebas Chromium sobre el bundle de CI: presets/hora real, Escape, Files, lector Markdown y compositor existentes, sidebar, reduced-motion y menú móvil; sin errores JavaScript ni overflow horizontal a 1440 y 393 px. El hash del script coincide con el publicado en Vercel. No es una auditoría completa de accesibilidad ni una prueba en Safari real.

## Funcionalidad y límites que preservar

Guardar en esta demo NO sobrevive a una recarga. Los chats creados dentro de proyecto se marcan como guardados y se ordenan en Fijadas/Recientes; producción deberá persistirlos. Guardar chat no añade memoria; archivar/categorizar no eleva permisos. Continuar con otro agente crea nueva conversación y conserva el texto importado como no confiable. Los cambios Markdown requieren revisión/control optimista.

`body.sky-home-active` solo se activa en Inicio. No generalizar sus estilos a todo Lisa. El módulo Archivos tendrá identidad retro local sin convertir el shell en Windows 98. Las animaciones decorativas se pausan al ocultar la pestaña y respetan las preferencias de accesibilidad.

## Próximas tareas

1. Revisar visualmente Finanzas y decidir el modelo persistente: posiciones, movimientos, precios/FX y snapshots; no introducir datos reales en el backend hasta L09/L10.
2. Diseñar el adapter de fuentes de cartera (manual primero; Renta 4 u otros proveedores después) sin acoplar la UI al proveedor.
3. L07: revisión visual del Inicio Cielo con el propietario; detalles de implementación y fuentes en 16.
4. Skin Windows 98 exclusiva para Archivos, conservando capacidades modernas y backend desacoplado. No está incluida en el código actual.
3. L08/L09: DTOs/validadores e identidad/CSRF/permisos con denegación por defecto; quitar acoplamientos de vistas a DemoClient.
4. L10–L14: PostgreSQL, persistencia/retención, promoción idempotente, Nextcloud de prueba y mapping UUID/ETag/restauración.
5. L15–L18: runtime privado y Sandbox separados, modelo limitado, recuperación autorizada y evaluada de conocimiento.
6. Después: calendario/tareas, broker 1Password y acciones, worker gráfico/takeover y Developer aislado.

## Decisiones de seguridad y arquitectura

Nextcloud mediante APIs, no acceso al datadir. 1Password detrás de broker confiable: no token/CLI/secretos para agentes. Dos chats independientes y cinco áreas configurables. Clasificación no equivale a permisos; preservar etiquetas al transferir contenido. Código y datos separados. Modelos por API implican salida del contexto seleccionado del servidor.

Antes de datos reales, probar autorización por recurso antes de recuperar contexto, acceso cruzado/búsquedas/contadores, identidad falsa, SSRF, fuga desde navegador, promociones de varias áreas, aprobaciones expiradas, duplicados, pérdida de proveedor y restauración. Fijar versiones, presupuesto y retención. No extrapolar seguridad de producción de los tests de una demo.

## Referencias

README; docs/01,02,03,06,07,09,11,13,14,15,16; contracts/openapi.mjs; apps/web/client.mjs; apps/web/sky.mjs; apps/web/sky.css; api/v1/[...path].js; tests/web/.

Documentar siempre qué se ejecutó y qué sigue propuesto. La publicación Vercel no significa que Nextcloud, una IA o las acciones autónomas estén conectados.
