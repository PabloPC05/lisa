# Seguridad y permisos

## Objetivo

Un agente solo puede realizar una acción si la infraestructura lo permite. Nunca se confía en instrucciones del sistema como mecanismo de seguridad.

## Principales identidades

```text
user:owner

agent:general
agent:vivienda
agent:universidad
agent:finanzas
agent:personal

agent:sandbox
agent:developer

service:lisa-api
service:nextcloud
service:openclaw-private
service:openclaw-sandbox
```

## Regla general

Toda operación privilegiada pasa por:

```text
principal
   ↓
Lisa API
   ↓
authorization.check()
   ↓
allow / deny / require-approval
   ↓
adapter
```

## Modelo de capability

Capacidades iniciales:

- `knowledge.read:<scope>`
- `knowledge.write:<scope>`
- `file.read:<scope>`
- `file.write:<scope>`
- `calendar.read`
- `calendar.write`
- `tasks.read`
- `tasks.write`
- `credential.use:<ref>`
- `computer.use`
- `browser.use`
- `external.send`
- `code.modify`

No existe una capability normal de `credential.reveal` para agentes.

## Agente Sandbox

El Sandbox no debe depender solo de ACLs.

Debe ejecutarse con:
- otro contenedor/Gateway;
- otra identidad;
- red restringida;
- sin mounts privados;
- sin socket Docker;
- sin socket del runtime privado;
- sin variables de entorno privadas;
- sin tokens de Nextcloud;
- sin 1Password service account;
- sin acceso a PostgreSQL privado;
- almacenamiento efímero.

Aunque un modelo sufra prompt injection, no debe existir una ruta técnica hacia los datos personales.

## Agente General

Puede buscar dentro del conocimiento personal general, pero las acciones siguen requiriendo capabilities.

"Acceso a conocimiento general" no implica:
- poder revelar secretos;
- realizar pagos;
- modificar cualquier archivo;
- actuar en cualquier servicio.

## Agentes especializados

Cada agente tiene scopes explícitos.

Ejemplo:

```yaml
agent: vivienda
knowledge: [vivienda]
files: [vivienda]
calendar: [read, create]
tasks: [read, create, update]
credentials:
  use:
    - endesa
    - seguro-hogar
computer: true
```

## Credenciales

1Password se considera fuente de secretos, no API de memoria.

Flujo preferido:

```text
agent
  ↓ "usar cuenta endesa"
Lisa Action Gateway
  ↓ authorization
credential broker
  ↓ obtiene/inyecta secreto
target service
```

El secreto no vuelve al modelo.

Donde una integración requiera OAuth, Lisa almacena identificadores/referencias y usa un broker/adapter seguro. Nunca se escriben tokens en prompts o logs.

## Human approval

Tres niveles:

### Auto
Lectura, búsquedas, creación de tareas de bajo riesgo.

### Confirm
Enviar formularios, borrar datos, enviar mensajes importantes, reservar/comprar.

### Human takeover
2FA, Cl@ve, firma, CAPTCHA, banca, autorizaciones irreversibles.

## Auditoría

Registrar:
- actor;
- acción;
- recurso;
- resultado;
- policy decision;
- approval mode;
- correlation ID;
- hora.

No registrar:
- password;
- token;
- cookie;
- contenido secreto;
- claves privadas.

## Seguridad del Developer Mode

El agente que modifica Lisa:
- trabaja en branch separado;
- ejecuta tests;
- levanta preview;
- muestra diff;
- requiere Apply/Merge;
- no monta datos personales por defecto;
- no puede cambiar políticas de producción sin aprobación.

## Backups

Requisitos:
- cifrados;
- copias fuera del host;
- restauración probada;
- Nextcloud + PostgreSQL coordinados;
- secretos respaldados según las capacidades de 1Password, no exportados sin cifrar.
