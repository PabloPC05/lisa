# Contratos de integración

Lisa usa adapters. La UI nunca llama directamente a Nextcloud, 1Password u OpenClaw.

## Files

```text
FileService.list(parentId, principal)
FileService.get(fileId, principal)
FileService.upload(...)
FileService.move(fileId, destinationId)
FileService.rename(fileId, name)
FileService.delete(fileId)
FileService.search(query, scope)
```

Adapter inicial: Nextcloud WebDAV/OCS.

Todo objeto visible por Lisa debe tener un ID estable independiente de path.

## Calendar

```text
CalendarService.list(range, calendars)
CalendarService.create(event)
CalendarService.update(eventId, patch)
CalendarService.delete(eventId)
```

Adapter inicial: Nextcloud CalDAV. Google Calendar puede añadirse como adapter sin cambiar la UI.

## Tasks

```text
TaskService.list(filter)
TaskService.create(task)
TaskService.update(taskId, patch)
TaskService.complete(taskId)
```

Backend inicial por decidir entre Tasks/CalDAV y Vikunja. La API de Lisa oculta esa decisión.

## Knowledge

```text
KnowledgeService.search(query, principal, scope)
KnowledgeService.create(item, source)
KnowledgeService.link(a, relation, b)
KnowledgeService.revoke(itemId)
```

Nunca se permite búsqueda fuera del scope autorizado.

## Chats

```text
ChatService.create(mode, agentId?)
ChatService.send(chatId, message)
ChatService.save(chatId)
ChatService.extractKnowledge(chatId, selection?)
ChatService.promote(chatId, destinationAgent, selectedAttachments?)
ChatService.delete(chatId)
```

`mode`:
- `general`
- `sandbox`
- `agent`

`promote` copia contexto a una sesión nueva con permisos de destino.

## Authorization

```text
AuthorizationService.check(principal, action, resource, context) -> allow/deny
```

Fail closed.

## Credentials

```text
CredentialService.canUse(principal, credentialRef, purpose)
CredentialService.execute(principal, credentialRef, target, action)
```

No existe `CredentialService.revealPassword()` para agentes.

Adapter inicial: 1Password + broker de credenciales.

## Agent runtime

```text
AgentRuntime.start(agentId, conversationId)
AgentRuntime.send(sessionId, message)
AgentRuntime.cancel(sessionId)
AgentRuntime.events(sessionId)
AgentRuntime.startComputer(sessionId)
```

Adapter inicial: OpenClaw.

Debe haber dos configuraciones de runtime:
- private;
- sandbox aislado.

## Audit

Toda acción privilegiada produce:

```json
{
  "actor": "agent:vivienda",
  "action": "calendar.create",
  "resource": "calendar:personal",
  "decision": "allow",
  "approval": "automatic",
  "timestamp": "...",
  "correlation_id": "..."
}
```

Los logs no almacenan secretos.
