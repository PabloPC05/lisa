# 14 · UI v0.3, publicación y auditoría

Fecha: 23-09-2026. **Demo de producto con lógica local**, no un backend privado ni un agente operativo.

## Estructura implementada

```text
apps/web/
  index.html         entrada accesible en español
  styles.css         diseño adaptable y tema claro/oscuro
  domain.mjs         reglas puras y datos ficticios
  client.mjs         DemoClient + HttpClient
  app.mjs            vistas e interacción
contracts/
  openapi.mjs        contrato de diseño OpenAPI 3.1
api/
  v1/[...path].js    health + 501 sin efectos privados
tools/
  serve.mjs          servidor local ligado a loopback
  build.mjs          bundle autocontenido de módulos conocidos
tests/web/
  domain.test.mjs    21 pruebas
vercel.json          build y cabeceras de publicación
preview/             bundle/JSON generados por CI, no editar a mano
```

El prototipo `lisa/` y sus tests Python se conservan sin convertirlos todavía en servicio web.

## Ejecutar y compilar

Node.js 22+, sin instalar bibliotecas para esta UI:

```bash
npm run dev
# http://127.0.0.1:3000
npm test
npm run build
npm run check
```

`dist/index.html` incluye estilos/JavaScript; no necesita CDN, fuentes externas ni imágenes. Puede abrirse como archivo. Comprobar API solo tiene sentido con un servidor. `dist/openapi.json` contiene el contrato de 28 operaciones; `build-info.json` incluye el hash del script.

El bundler solo combina tres módulos conocidos, no reemplaza a Vite/esbuild. Si se añaden imports o dependencias, adaptar build/tests o migrar a un bundler con versiones revisadas y lockfile.

## Recorrido funcional

Inicio ofrece dos tarjetas y dos botones de navegación. «Con conocimiento» abre sesión general sin guardar; «Nuevo chat Sandbox» abre sesión sin contexto personal. Los cinco agentes abren conversaciones de área.

Enviar produce texto explícitamente simulado. Guardar añade al historial de la demo. Guardar en cambia categoría, no modo. Continuar con crea otro ID y conserva el original; el destino comienza sin archivar. Proponer conocimiento exige un chat guardado y crea una nota pendiente; Aprobar es otra acción.

Archivos tiene fixtures, filtros y vista de texto. Calendario cambia de mes y añade eventos de ejemplo. Tareas permite crear/completar. Cuentas muestra conexiones pendientes. Ordenadores simula estados sin escritorio. Developer muestra propuestas sin terminal/Git/deploy. Ajustes permite reset, tema, comprobación de endpoint y descarga de checklist.

**Todo vive en memoria.** Recargar elimina incluso chats marcados como guardados. No es la persistencia final del producto. La aplicación no ejecuta LLM, Nextcloud, calendario real, secretos, terminal o navegador remoto.

## Conectar un backend

Las vistas acceden mediante `request(method,path,body)`. DemoClient tiene fixtures; HttpClient envía al mismo origen `/api/v1`, interpreta envelopes, aplica timeout y no reintenta automáticamente.

No basta con cambiar una instancia de cliente. Antes se necesitan autenticación, DTOs, bootstrap de capacidades, estados de carga/error, persistencia, idempotencia, callbacks de runs y scopes. Extraer `reset/log` de las vistas al cambiar al transporte real: son conveniencias de la demo, no endpoints operativos. Sustituir los catálogos estáticos de áreas por bootstrap.

El stub devuelve 501 para impedir falsos éxitos; health devuelve 200 con backendConnected=false. No hay endpoints abiertos con datos privados. Véanse 11 y 15 antes de conectarlos.

## Vercel: estado y configuración

El usuario autorizó publicar. Se intentaron las vías disponibles del conector:

- `deploy_to_vercel` devolvió `Tool deploy_to_vercel not found`.
- El importador de diseños rechazó el bundle de GitHub por limitar el origen a `claudeusercontent.com`.

**No hay URL Lisa de Vercel verificada en esta entrega.** No se modificó ningún proyecto existente. Un archivo raw o un enlace de importación no es una aplicación desplegada.

Importar el repositorio existente **PabloPC05/lisa**, rama **main**, como proyecto nuevo:

| Ajuste | Valor |
|---|---|
| Root Directory | raíz del repo, no apps/web |
| Framework | Other / sin framework |
| Build | npm run build |
| Install | vercel.json ya define una operación vacía; sin dependencias |
| Output Directory | dist |
| Secretos | ninguno para la demo |
| Dominio | el asignado al proyecto, sin comprar dominio |

La raíz es necesaria por tools/, contracts/, api/ y vercel.json. No publicar la infraestructura Compose ni subir datos personales. Fuente: [configuración de Vercel](https://vercel.com/docs/project-configuration/vercel-json).

Tras la importación verificar READY, abrir `/`, probar navegación, `/api/v1/health` y `/api/v1/bootstrap` (501 esperado). Registrar URL y commit en CONTINUAR solo después. No conectar el servidor privado con CORS abierto para hacer funcionar una preview.

## CI y artefactos

`UI checks and review bundle` ejecuta pruebas/build, sube artefacto y, solo tras push a main, copia el bundle a preview/. El job añade únicamente tres archivos generados, sin force push. Si hay conflicto con otro commit debe fallar para reconciliar, no sobrescribir trabajo ajeno. preview/** no activa un bucle del mismo workflow.

CI del commit de código `8910288e46c74ab5a0d8081b31b7ad76ca0253b5`:

- [UI tests y bundle](https://github.com/PabloPC05/lisa/actions/runs/35904343785): check y review-bundle exitosos.
- [Python](https://github.com/PabloPC05/lisa/actions/runs/35904344021): tests exitosos en 3.11 y 3.12.

## Revisión realizada y límites

21 pruebas automáticas de dominio, estado, guardado/promoción, conocimiento, tareas, escape de salida, cliente HTTP, stub y consistencia OpenAPI. No son pruebas de una red o backend personal.

En navegador, usando el bundle: Sandbox -> mensaje -> guardar -> clasificar en Vivienda -> continuar en Universidad, con dos mensajes importados y original conservado. Navegación de vistas, tarea con marcado tratado como texto y vista de 390 px sin overflow de página. No equivale a auditoría completa de accesibilidad ni a un ensayo en iPhone físico.

## Checklist de revisión del propietario

- Distinguir los dos chats desde escritorio/móvil sin ir a Ajustes.
- Comprender contexto, historial, memoria y modo de ejecución.
- Guardar Sandbox en Vivienda sin cambiar su modo.
- Continuar en Universidad: nueva conversación sin guardar.
- Proponer conocimiento y aprobarlo separadamente.
- Probar búsqueda, categorías y preview de archivos.
- Crear/completar tarea; cambiar mes y crear evento ficticio.
- Comprobar que ninguna conexión se presenta activa ni solicita contraseñas.
- Revisar takeover y Developer simulados, sin comandos reales.
- Probar tema oscuro, teclado, menú móvil, diálogos y textos largos.
- Recargar y confirmar que el estado demo desaparece.

Registrar los cambios de diseño antes de conectar datos. La UI sigue siendo reemplazable; ajustar su apariencia no exige rehacer el almacenamiento.
