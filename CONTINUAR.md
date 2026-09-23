# CONTINUAR

## Estado actual

Lisa ya no se define únicamente como servidor de memoria/agentes. La arquitectura vigente la convierte en una **plataforma personal self-hosted** con datos, conocimiento, agentes, calendario, tareas, credenciales y Computer Use.

La rama de arquitectura es:

```text
architecture/personal-os-v1
```

## Decisiones cerradas

- UI propia y reemplazable.
- Nextcloud como backend headless de archivos/sync y CalDAV.
- PostgreSQL para metadatos, IDs estables, chats, relaciones y auditoría.
- Dos botones independientes:
  - Nuevo chat · Con conocimiento;
  - Nuevo chat · Sandbox.
- El Sandbox se ejecuta separado y sin acceso técnico a información privada.
- Un chat sandbox se puede descartar, guardar como general o promover a un agente.
- Promover crea una sesión nueva privada; no eleva permisos del sandbox.
- 4–5 agentes especializados configurables.
- OpenClaw es el runtime inicial preferido, detrás de un adapter.
- Permisos fuera del prompt, con AuthorizationService compatible con OpenFGA.
- 1Password como fuente inicial de secretos.
- Los agentes usan capacidades/referencias a credenciales; no leen passwords.
- Nextcloud UI no es la UI de Lisa.
- Developer Mode futuro mediante branch + tests + preview + diff + Apply.

## Qué existe

- prototipo Python previo de sesiones/identidad;
- documentación v1;
- contratos de servicios;
- modelo de permisos;
- ejemplo de configuración de agentes;
- compose de desarrollo para PostgreSQL, Nextcloud, Redis y OpenFGA.

## Próximo hito recomendado

Construir **Lisa API v0.1**.

Orden:

1. Definir modelos PostgreSQL:
   - principal;
   - agent;
   - conversation;
   - message;
   - category/scope;
   - knowledge_item;
   - document_ref;
   - policy/audit.
2. Implementar `AuthorizationService`.
3. Implementar chats:
   - general;
   - sandbox metadata;
   - save;
   - promote.
4. Implementar `FileService` con adapter Nextcloud.
5. Implementar `CalendarService` CalDAV.
6. Crear adapter OpenClaw private.
7. Crear adapter OpenClaw sandbox.
8. Implementar credential broker/1Password.
9. Implementar UI mínima.
10. Añadir Computer Use/takeover.

## Reglas al continuar

- No poner datos personales reales en fixtures públicos.
- No guardar credenciales en `.env` del repositorio.
- No acoplar UI a Nextcloud.
- No permitir que el frontend llame directamente a 1Password.
- No usar prompts como ACL.
- No dar Docker socket al sandbox.
- Toda acción privilegiada debe ser auditable.

## Archivos clave

- `README.md`
- `docs/02-arquitectura.md`
- `docs/04-agentes.md`
- `docs/05-contratos.md`
- `docs/09-decisiones-vigentes.md`
- `docs/11-seguridad-permisos.md`
- `docs/12-ui.md`
- `docs/13-integraciones.md`
- `config/agents.example.yaml`
- `infra/compose.dev.yml`
