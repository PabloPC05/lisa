# Lisa

**Lisa** es una plataforma personal self-hosted: un centro de datos, conocimiento, agentes y automatización que vive en tu propio servidor.

Lisa **no depende de una UI, un modelo ni un framework de agentes concreto**. Los datos son la fuente de verdad; Nextcloud, OpenClaw, la UI web, el móvil o futuros agentes son clientes reemplazables.

## Objetivo

Lisa debe proporcionar:

- un **centro personal de datos** con archivos, calendario, tareas, conocimiento y metadatos;
- una **UI propia** que consuma APIs y pueda cambiarse sin modificar la capa de datos;
- dos tipos de chat general:
  - **Nuevo chat · Con conocimiento**: puede consultar el conocimiento personal general;
  - **Nuevo chat · Sandbox**: aislado físicamente, sin acceso a datos personales;
- 4–5 **agentes especializados** con permisos por dominio (Vivienda, Universidad, Finanzas, Personal, etc.);
- capacidad de **guardar/promover** una conversación sandbox a General o a una categoría especializada;
- Computer Use con **human takeover**;
- calendario, tareas y archivos integrados;
- uso de credenciales mediante **capacidades**, sin exponer secretos al modelo;
- auditoría de acciones;
- una futura vista **Developer** capaz de proponer cambios a Lisa mediante Git + preview + aprobación.

## Arquitectura resumida

```text
                    Lisa UI
                      │
                 Lisa API
                      │
             Authorization layer
                      │
      ┌───────────────┼─────────────────┐
      │               │                 │
 Personal Data    Private agents   Sandbox gateway
      │               │                 │
 Nextcloud        OpenClaw          isolated runtime
 PostgreSQL       specialized       no personal mounts
 Search/RAG       general agent     no credentials
      │
      ├─ Files / WebDAV
      ├─ Calendar / CalDAV
      ├─ Tasks
      ├─ Knowledge
      └─ stable object IDs

Secrets / actions:
1Password → credential broker → allowed service/action
```

## Decisiones principales

- **Nextcloud se usa headless**: almacenamiento/sync/API; Lisa no depende de su frontend.
- **1Password no se entrega al modelo**: los agentes reciben capacidades limitadas y referencias a secretos.
- Los permisos se aplican **fuera del prompt**.
- El Sandbox se ejecuta en un **runtime/Gateway separado**.
- Guardar un chat no significa automáticamente convertir todo su texto en conocimiento.
- Promover un chat Sandbox crea una **nueva sesión privada** con una copia explícita del contexto; nunca eleva permisos al sandbox original.
- La UI es reemplazable y el código vive separado de los datos personales.

## Documentación

1. [Especificación](docs/01-especificacion.md)
2. [Arquitectura](docs/02-arquitectura.md)
3. [Modelo de datos](docs/03-datos.md)
4. [Agentes y chats](docs/04-agentes.md)
5. [Contratos](docs/05-contratos.md)
6. [Operación](docs/06-operacion.md)
7. [Backlog](docs/07-backlog.md)
8. [Fuentes](docs/08-fuentes.md)
9. [Decisiones vigentes](docs/09-decisiones-vigentes.md)
10. [Sesiones locales](docs/10-sesiones-locales.md)
11. [Seguridad y permisos](docs/11-seguridad-permisos.md)
12. [UI y experiencia](docs/12-ui.md)
13. [Integraciones](docs/13-integraciones.md)

## Estado

Existe un prototipo Python local previo. Esta rama añade la arquitectura v1 de Lisa sin eliminarlo.

El siguiente hito es implementar **Lisa API + autorización + almacenamiento de conversaciones**, después integrar Nextcloud y el runtime privado/sandbox.

> Nunca subir a GitHub documentos personales, credenciales, tokens, cookies, bases de datos reales ni volcados del servidor.
