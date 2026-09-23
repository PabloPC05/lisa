# Arquitectura de Lisa

## Principio rector

**Los datos personales pertenecen a Lisa, no a OpenClaw, Nextcloud, la UI ni al modelo.**

Lisa separa cinco capas:

```text
┌─────────────────────────────────────────────────────────────┐
│ 5. Interfaces                                               │
│ Web/PWA · móvil · CLI · futuras interfaces                  │
├─────────────────────────────────────────────────────────────┤
│ 4. Agentes                                                  │
│ General · especializados · Computer Use · automatizaciones  │
├─────────────────────────────────────────────────────────────┤
│ 3. Lisa API + Policy                                        │
│ identidad · permisos · acciones · auditoría · búsqueda      │
├─────────────────────────────────────────────────────────────┤
│ 2. Servicios de datos                                       │
│ Nextcloud · PostgreSQL · búsqueda/RAG · tareas/calendario   │
├─────────────────────────────────────────────────────────────┤
│ 1. Datos                                                    │
│ archivos · objetos estables · conocimiento · historial      │
└─────────────────────────────────────────────────────────────┘
```

La capa de datos debe seguir siendo utilizable aunque se eliminen todas las demás.

## Componentes

### Lisa UI

Frontend propio. Nunca accede directamente a bases de datos o secretos.

Responsabilidades:
- chats;
- agentes;
- explorador de archivos;
- calendario;
- tareas;
- búsqueda/conocimiento;
- Computer Use/takeover;
- configuración de cuentas y permisos;
- Developer Mode.

### Lisa API

Punto estable de integración.

Dominios iniciales:

```text
/api/chats
/api/agents
/api/knowledge
/api/files
/api/calendar
/api/tasks
/api/actions
/api/computers
/api/credentials
/api/audit
```

La UI y los agentes consumen la misma capa de dominio.

### Authorization

Cada petición se evalúa como:

```text
principal + action + resource + context
```

La implementación propuesta es compatible con OpenFGA, pero Lisa debe exponer una interfaz interna para poder sustituir el motor.

### Nextcloud

Se usa como infraestructura **headless** para:
- archivos;
- sincronización;
- WebDAV;
- calendario CalDAV;
- contactos si se desean;
- historial/versiones cuando proceda.

La UI oficial queda como panel administrativo/emergencia. Lisa presenta su propia UI.

### PostgreSQL

Guarda:
- IDs estables;
- relaciones;
- conversaciones;
- categorías;
- agentes;
- permisos;
- acciones;
- auditoría;
- enlaces entre objetos.

### Runtime privado de agentes

OpenClaw es el candidato inicial.

Incluye General y agentes especializados. No es la fuente de verdad de conocimiento.

### Runtime Sandbox

Gateway/proceso/contenedor separado.

No monta datos personales, sockets privados, secretos, tokens ni sesiones del runtime privado.

Puede tener modelo, internet según política, navegador/Computer Use efímero y almacenamiento temporal.

### Credenciales

Los agentes no reciben contraseñas en contexto.

```text
agent → action request → Lisa policy → credential broker → target service
```

1Password es la fuente inicial de credenciales. Lisa almacena referencias/capacidades, nunca valores secretos en la BD.

## Flujos clave

### Nuevo chat con conocimiento

1. Lisa crea una conversación `general`.
2. Puede consultar conocimiento general mediante Lisa API.
3. Guardar conversación es explícito/configurable.
4. Guardar conversación y extraer conocimiento son acciones separadas.

### Nuevo chat Sandbox

1. La UI crea conversación en runtime Sandbox.
2. No existe ruta hacia Personal Data Hub.
3. Al acabar se puede descartar, guardar como General o promover a una categoría/agente.
4. Promover crea una sesión nueva privada y copia solo transcript/adjuntos autorizados.

### Computer Use

```text
agent → computer session → 2FA/CAPTCHA/confirmación
                              ↓
                         human takeover
                              ↓
                         release control
                              ↓
                         agent continues
```

## Separación código/datos

```text
/opt/lisa/app      código desplegado
/srv/lisa/data     datos personales
/srv/lisa/backups  copias cifradas
```

El agente de desarrollo puede editar código en una rama Git, pero no recibe por defecto acceso a `/srv/lisa/data`.

## Evolución

OpenClaw, Nextcloud, OpenFGA o cualquier UI son reemplazables detrás de adapters. Los contratos de Lisa son la frontera estable.
