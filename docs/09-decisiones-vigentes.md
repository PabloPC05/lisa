# 09 · Decisiones vigentes y evolución

Actualizado: 23-09-2026. Una instrucción posterior explícita del propietario prevalece. Mantener separados requisito confirmado, opción técnica propuesta y funcionalidad implementada.

## Registro de cambios

| Etapa | Decisión | Sustituye / conserva |
|---|---|---|
| Prototipo inicial | Markdown, referencias estables, contexto selectivo y acceso móvil | Se conservan portabilidad, identidad y permisos |
| Arquitectura personal | Lisa como centro de datos; Nextcloud vía API; 1Password; UI propia | Sustituye la idea de OpenBot como frontend principal o Nextcloud como UI obligatoria |
| Conversaciones | Dos botones separados, con conocimiento y Sandbox; guardado explícito | Sustituye un único botón que abría siempre Sandbox |
| Continuidad | Archivar/categorizar no cambia permisos; continuar crea nueva sesión | Conserva original sin elevar privilegios |
| Instrucción actual | Modificar main, comenzar UI, contratos y publicación de revisión | Sustituye dejar todo únicamente en PR en borrador |
| Entrega v0.3 | PR fusionado, UI demo y contratos en main | No significa que exista backend o despliegue personal |
| Diseño v0.4 | Home como dashboard fijo de widgets ligeros, modo claro y sidebar colapsable | Sustituye landing y descarta gestor de ventanas |\n| Proyectos | Cada proyecto conserva su historial; conversaciones fijables y archivables | Proyecto organiza, pero no concede permisos ni convierte chats en memoria |

## Confirmado por el propietario

- Nombre Lisa y servidor personal como centro de sus datos.
- Interfaz propia modificable sin reescribir almacenamiento.
- Nextcloud detrás de APIs; mantener acceso alternativo administrativo.
- Integración futura con 1Password y acceso por permisos, no credenciales libres al agente.
- Dos chats nuevos: conocimiento personal y Sandbox sin acceso personal.
- Entre cuatro y cinco agentes especializados, más los dos chats generales.
- Guardar los chats voluntariamente; Sandbox se puede archivar/clasificar o continuar en otra área.
- Calendario, tareas, archivos, conocimiento, gestiones y Computer Use con intervención humana.
- Futuro Developer Mode para proponer modificaciones a Lisa.
- Actualizar main y crear una UI auditable con contratos preparados para backend.

## Decisiones de implementación de esta entrega

- Cinco áreas ficticias en la demo: Vivienda, Universidad, Finanzas, Personal y Familia. Serán configurables mediante bootstrap, no una taxonomía definitiva cerrada.
- UI v0.4 con ECMAScript/CSS y build sin dependencias. La home es un dashboard fijo, no una landing ni un gestor de ventanas. Es una elección de prototipo, no obligación de mantener ese framework para siempre.
- Dirección visual vigente: blanco/negro/rojo; superficies translúcidas redondeadas tipo glass; superficies opacas con geometría recta; widgets con poca densidad; sidebar colapsable.
- DemoClient efímero; HttpClient preparado para mismo origen `/api/v1`.
- Backend seam deniega funciones privadas con 501 hasta implementar autenticación y servicios. No se interpretan «endpoints abiertos» como acceso público a datos.
- Contrato OpenAPI 3.1 inicial con 30 operaciones y pruebas locales.\n- Los chats de proyecto se guardan automáticamente dentro de ese proyecto; fuera de proyecto el guardado continúa siendo explícito.\n- `pinned` y `archived` son metadatos de navegación, no controles de acceso ni memoria.
- Guardar ≠ memoria; propuestas separadas y revisión explícita.
- Categoría ≠ confidencialidad; preservar labels de las fuentes al mover/promover contenido.
- Demo con datos ficticios; nada de cuentas, archivos personales, modelos, terminal o escritorio operativo.
- Main contiene código y bundle de revisión; publicación Vercel intentada pero no completada por las capacidades del conector.

## Arquitectura técnica preferida

Nextcloud para archivos/sync y CalDAV; PostgreSQL para metadatos/identidad/conversaciones; OpenClaw candidato inicial detrás de adapter; AuthorizationService externo al prompt; broker 1Password; UI y código separados de datos.

Nextcloud Tasks/CalDAV será la primera alternativa a probar para tareas. Vikunja queda como opción si ofrece una mejora comprobada. OpenFGA es candidato, no requisito obligatorio del primer backend. Empezar con ACL simples bien probadas no viola la arquitectura.

## Pendientes deliberados

Framework/backend final; proveedor de autenticación; host/VM/red privada; versiones exactas/digests de integraciones; mecanismo concreto de inyección de secretos; permisos por cuenta; modelo y presupuesto; retención real de sesiones y backups; límites de acciones autónomas; elección final de tareas; publicación Vercel operativa y revisión de diseño del propietario.

## Salvaguardas

No dar permisos por haber guardado un chat. No confundir dos contenedores con aislamiento físico. No prometer ocultamiento infalible de contraseñas en un navegador controlado por un agente. Las capacidades nativas de OpenClaw deben validarse en la versión/host elegidos. Las decisiones originales demasiado generales quedan concretadas por 01/02/03/11/15.

La UI de Nextcloud puede seguir disponible; no se elimina ni se modifica su core. OpenBot/OpenMausBot/AG-UI son opciones de adapters futuros, no dependencias añadidas al producto actual.
