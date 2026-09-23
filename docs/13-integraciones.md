# Integraciones

## Nextcloud

Rol: almacenamiento/sincronización y groupware.

Uso previsto:
- Files mediante WebDAV/OCS;
- Calendar mediante CalDAV;
- Contacts si se incorporan;
- versionado y sync gestionados por Nextcloud;
- UI oficial reservada para administración/emergencia.

Lisa debe tener adapters y nunca acoplar componentes visuales a Nextcloud.

## 1Password

Rol: fuente de credenciales y secretos.

Reglas:
- ningún secreto se almacena en PostgreSQL;
- ningún secreto se devuelve al modelo;
- los agentes reciben referencias/capabilities;
- el broker resuelve el secreto solo en el momento de ejecutar una acción;
- service accounts/vaults separados por necesidad.

Ejemplo:

```text
agent:vivienda
  -> credential.use:endesa
  -> Lisa Policy
  -> 1Password broker
  -> login/injection
```

## OpenClaw

Rol: runtime inicial de agentes y Computer Use.

Se requieren dos despliegues lógicos:
- `openclaw-private`;
- `openclaw-sandbox`.

Lisa implementará un adapter para:
- sesiones;
- mensajes/eventos;
- tools;
- computer sessions;
- takeover;
- cancelación;
- approvals.

No guardar conocimiento canónico únicamente en OpenClaw.

## OpenFGA

Rol inicial propuesto: autorización granular.

Lisa ocultará OpenFGA detrás de `AuthorizationService`.

Modelo mínimo:

```text
principal -> relation/action -> resource
```

Ejemplos:
- agent:vivienda can_read folder:vivienda;
- agent:universidad can_use credential:usc;
- agent:sandbox has no relation to personal resources.

## Tareas

Dos alternativas aceptadas:

### A. Nextcloud Tasks / CalDAV
Ventajas:
- menos servicios;
- sincronización DAV;
- suficiente para una v1.

### B. Vikunja
Ventajas:
- mejor modelo de proyectos/tareas;
- API específica;
- servicio desacoplado.

Decisión: Lisa define `TaskService`; el backend se decide durante implementación sin afectar a la UI.

## Búsqueda y RAG

Pendiente de seleccionar.

Requisitos:
- filtros obligatorios por principal/scope;
- referencias estables a documento/fragmento;
- borrado y reindexado;
- no mezclar índices Sandbox con privados;
- poder usar búsquedas estructuradas antes de embeddings.

## Google y otros SaaS

Lisa podrá incorporar adapters OAuth para:
- Google Calendar;
- Gmail;
- Google Drive;
- otros servicios.

La UI debe tratar todos como proveedores detrás de contratos comunes cuando sea posible.

## Credential broker

Puede evolucionar a una capa propia o apoyarse en herramientas específicas de secret injection.

Requisitos:
- el modelo no ve el secreto;
- allowlist de destino/acción;
- auditoría;
- expiración;
- revocación;
- aprobación cuando proceda.

## Reverse proxy y acceso remoto

La interfaz principal debe publicarse exclusivamente por HTTPS.

Preferencias:
- acceso autenticado;
- sin exponer PostgreSQL/Redis/OpenFGA directamente;
- endpoints administrativos solo en red privada/VPN cuando sea posible;
- Computer Use accesible mediante Lisa UI y no mediante puertos VNC públicos.

## Integraciones futuras

La arquitectura debe admitir:
- OpenMausBot harness como runtime adicional;
- AG-UI/CopilotKit como adapter si interesa;
- nuevas UIs;
- app móvil nativa;
- nuevos proveedores de modelos;
- otros gestores de secretos.

Ninguna integración futura debe exigir migrar el Personal Data Hub.
