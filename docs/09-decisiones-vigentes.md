# 09 · Decisiones vigentes y evolución

Actualizado: 26-09-2026. Una instrucción posterior explícita del propietario prevalece. Mantener separados requisito confirmado, opción técnica propuesta y funcionalidad implementada.

## Registro de cambios

| Etapa | Decisión | Sustituye / conserva |
|---|---|---|
| Prototipo inicial | Markdown, referencias estables, contexto selectivo y acceso móvil | Conserva portabilidad, identidad y permisos |
| Arquitectura personal | Lisa como centro de datos; Nextcloud vía API; 1Password; UI propia | Sustituye OpenBot como frontend principal o Nextcloud como UI obligatoria |
| Conversaciones | Dos botones separados, con conocimiento y Sandbox; guardado explícito | Sustituye un botón que abría siempre Sandbox |
| Continuidad | Archivar/categorizar no cambia permisos; continuar crea otra sesión | Conserva original sin elevar privilegios |
| Desarrollo | Modificar main, comenzar UI, contratos y publicación de revisión | Sustituye dejar todo únicamente en PR en borrador |
| Entrega v0.3 | PR fusionado, UI demo y contratos en main | No significa backend personal operativo |
| Diseño v0.4 | Dashboard fijo de widgets ligeros, modo claro y sidebar colapsable | Descarta landing comercial y gestor de ventanas |
| Proyectos | Historial por proyecto; conversaciones fijables y archivables | Proyecto organiza, no concede permisos ni convierte chats en memoria |
| Identidades visuales | Mezclar estilos según funcionalidad; Windows 98 solo en Archivos | No convertir todo Lisa en Windows 98 ni modificar visualmente Nextcloud |
| Inicio Cielo | Paisaje/cielo inspirado en Zainab Kabira 2026, sincronizado con la hora y conservando transparencias | Sustituye el fondo rojo/blanco del Inicio v0.4; conserva accesos operativos, widgets ligeros y sidebar |
| Finanzas v0.6 | Aplicación de cartera para introducir posiciones, calcular valor/P&L, ver distribución y seguir evolución mediante valoraciones | Añade control financiero sin conectar todavía cuentas reales; fuente manual primero y adaptadores de bróker después |
| Publicación comprobada | UI Sky desplegada en el proyecto Vercel lisa y URL verificada | Supera bloqueo de intentos previos; sigue siendo demo sin datos personales |
| Memoria / segundo cerebro | Lisa Memory Engine como núcleo futuro: Markdown + PostgreSQL, Current Truth + Timeline + Sources, búsqueda híbrida y MCP interno | Consolida la memoria en Lisa; Mem0/Graphiti quedan como opciones evaluables y GBrain/OpenHuman como referencias |
| Chat web y cuentas | Preguntas desde la web propia de Lisa; investigar gateway CLIProxyAPI y cambio automático entre cuentas personales conservando contexto | Descarta Pi/CLI como requisito del chat; conserva memoria propia, guardado explícito y permisos. Gateway propuesto, no conectado ni autorizado por esta decisión |

## Confirmado por el propietario

- Nombre Lisa y servidor personal como centro de datos, con UI propia modificable sin reescribir almacenamiento.
- Nextcloud detrás de APIs; mantener acceso administrativo alternativo.
- Integración futura con 1Password mediante permisos y broker; no credenciales libres al agente.
- Dos chats: conocimiento personal y Sandbox sin acceso personal; cinco áreas especializadas configurables.
- Guardado voluntario fuera de proyecto; historial retenido por proyecto con fijadas y archivado.
- Calendario, tareas, archivos, conocimiento, gestiones y Computer Use con intervención humana.
- Futuro Developer Mode para proponer modificaciones a Lisa.
- Trabajar en main y publicar una UI auditable con contratos preparados para backend.
- Estilos específicos por aplicación. Solo Archivos tendrá estética del Explorador de Windows 98.
- Inicio basado en https://www.awwwards.com/sites/zainab-kabira-portfolio-2026 : cielo/paisaje, hora del momento, transparencias y sensación de nube. No volver a un gestor de ventanas.
- Finanzas como aplicación propia: poder introducir posiciones y revisar su evolución. Mantener la capa de datos desacoplada para conectar después fuentes como Renta 4 u otros proveedores sin rehacer la interfaz.
- El segundo cerebro será infraestructura central de Lisa: Markdown portable y editable, PostgreSQL para estado estructurado, Current Truth + Timeline + procedencia, búsqueda híbrida y acceso común a agentes mediante Lisa API/MCP interno. PGLite puede evaluarse en local; el servidor futuro mantiene PostgreSQL como objetivo.
- El chat de Lisa debe servir para preguntas y conversación general desde navegador de ordenador/iPhone, sin Pi, terminal ni agente de programación obligatorios. Investigar y documentar el uso de varias suscripciones de Claude a través de un gateway, con cambio por agotamiento y continuidad del contexto; no implementarlo todavía.

## Implementación actual

- ECMAScript/CSS y build sin dependencias npm; no es una obligación de framework a largo plazo.
- Cinco áreas ficticias de demo: Vivienda, Universidad, Finanzas, Personal y Familia; serán configurables por bootstrap.
- Inicio Cielo implementado en `sky.mjs`, `sky.css` y la plantilla `home-dashboard`. Estado visual exclusivo `body.sky-home-active`, eliminado al navegar a otras aplicaciones. Conserva el shell translúcido con tintes de cielo, serif editorial en la bienvenida y accesos a las vistas existentes.
- Fecha/saludo/paleta derivados del reloj local; interpolación horaria, presets, pausa de animación y reduced-motion. Sin geolocalización, meteorología ni efemérides. El sol/luna son ilustrativos. Ver 16.
- Las demás vistas mantienen sus diseños actuales blanco/negro/rojo, lector Markdown y compositor. **Archivos Win98 es requisito futuro, no implementación terminada.**
- Finanzas v0.6 añade posiciones manuales, conversión manual a EUR, valor invertido/actual, P&L, distribución por tipo de activo, histórico de valoraciones y edición/eliminación. En la demo los datos siguen en memoria y no hay cotizaciones, FX ni cuentas de inversión conectadas.
- DemoClient efímero; HttpClient preparado para mismo origen `/api/v1`. Stub privado deniega funciones con 501 hasta implementar autenticación/servicios.
- OpenAPI 3.1 inicial con 31 operaciones. Conocimiento durable en Markdown canónico; HTML derivado. Ediciones crean revisión y requieren control optimista.
- Chats de proyecto guardados automáticamente dentro del proyecto; fuera, guardado explícito. `pinned` y `archived` son navegación, no controles de acceso ni memoria.
- Guardar no equivale a memoria: propuestas separadas y revisión explícita. Categoría no equivale a confidencialidad: preservar labels de fuentes al mover/promover.
- Solo datos ficticios. No cuentas, archivos personales, modelos, terminal o escritorio remoto operativos.
- Investigación de chat web/multicuenta en docs/18 y track C00–C06: solo documentación; sin gateway, credenciales, inferencia ni pruebas reales de cuota.
- Vercel publicado por integración Git: https://lisa-ten-gray.vercel.app . Verificación de deployment READY y build-info Sky en CONTINUAR y 16. No interpretar esto como despliegue seguro del backend.

## Arquitectura técnica preferida

Nextcloud para archivos/sync y CalDAV; PostgreSQL para metadatos/identidad/conversaciones **y memoria estructurada**; Markdown como representación portable del conocimiento; Lisa Memory Engine con Current Truth + Timeline + Sources; búsqueda híbrida texto/metadata y vectores solo tras evaluación; MCP/API internos para compartir memoria entre agentes; OpenClaw candidato detrás de adapter; AuthorizationService externo al prompt; broker 1Password; UI/código separados de datos.

GBrain y OpenHuman se usan como referencias de diseño, no como autoridades externas. Mem0 no será el corazón de la primera versión y Graphiti se evaluará solo si un grafo temporal aporta valor demostrado. Detalle: [17 · Memoria personal y segundo cerebro](17-memoria-segundo-cerebro.md).

Para preguntas: UI propia → backend autorizado → contexto de Lisa → adapter de modelos. **CLIProxyAPI es un gateway opcional y sustituible**, no el Memory Engine. La ruta de suscripciones queda experimental/desactivada hasta verificar admisibilidad, costes y seguridad. Ningún fallback de pago o cambio de modelo será silencioso. Diseño, fuentes versionadas y pruebas pendientes: [18 · Chat web y multicuenta](18-chat-web-multicuenta.md).

Cambiar solo la cuenta de inferencia, sin alterar agente/modo/permisos, mantiene la conversación. Cambiar de agente o promover contenido conserva el flujo anterior de nueva sesión y original intacto. No confundir afinidad de credencial con autorización ni con memoria durable.

Nextcloud Tasks/CalDAV es primera alternativa a probar para tareas. Vikunja queda como opción si ofrece mejora comprobada. OpenFGA es candidato, no requisito obligatorio: empezar con ACL simples bien probadas no viola la arquitectura.

## Pendientes deliberados

Revisión visual del propietario; skin local Win98 para Archivos; mayor riqueza del paisaje solo tras esa revisión. Astronomía/estaciones/clima no implementados ni necesarios para esta primera entrega.

Framework/backend final; autenticación; host/VM/red privada; versiones/digests; inyección de secretos; permisos por cuenta; modelo/presupuesto; retención/backups; límites de acciones autónomas; elección definitiva de tareas; implementación y evaluación real del Lisa Memory Engine; viabilidad y pruebas del gateway multicuenta. La publicación de la UI en Vercel ya no es pendiente.

## Salvaguardas

No dar permisos por guardar un chat. No confundir contenedores con aislamiento físico. No prometer ocultamiento infalible de contraseñas en un navegador controlado por agentes. Validar capacidades de OpenClaw en la versión/host elegidos. Decisiones originales generales concretadas en 01/02/03/11/15.

La UI de Nextcloud puede seguir disponible: no eliminar ni modificar su core. OpenBot/OpenMausBot/AG-UI son opciones de adapters futuros, no dependencias añadidas.

No considerar autorizada una integración de suscripción porque un proxy funcione o el cambio sea manual. No exponer OAuth ni Management API en la demo pública. Si se descarta el gateway, conservar chat/memoria y sustituir el adapter sin habilitar gastos automáticamente; ver las fuentes y puertas de aceptación de 18.
