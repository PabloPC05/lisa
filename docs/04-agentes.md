# Agentes y chats

## Tipos de entrada en Lisa

La barra lateral debe distinguir tres conceptos:

### 1. Nuevo chat · Con conocimiento

Chat general con acceso de lectura al conocimiento personal global permitido.

No se convierte automáticamente en memoria.

Acciones de cierre:
- Guardar conversación.
- Guardar y extraer conocimiento.
- Mover/clasificar conversación.
- Eliminar.

### 2. Nuevo chat · Sandbox

Chat físicamente aislado de información privada.

Permisos por defecto:

| Capability | Sandbox |
|---|---|
| conocimiento personal | no |
| archivos personales | no |
| calendario | no |
| tareas | no |
| credenciales | no |
| sesiones privadas | no |
| internet | configurable |
| navegador efímero | sí |
| Computer Use efímero | configurable |

Acciones:
- Descartar.
- Guardar como General.
- Continuar en un agente/categoría.

“Continuar en” crea otra sesión. Nunca modifica los permisos del proceso sandbox.

### 3. Agentes especializados

Primera propuesta:

- **General**: conocimiento personal general.
- **Vivienda**: corpus y acciones de vivienda.
- **Universidad**: corpus y acciones académicas.
- **Finanzas**: corpus financiero con políticas de acción restrictivas.
- **Personal**: documentos/gestiones personales no incluidos en áreas anteriores.

La lista debe ser configurable; no debe estar hardcodeada en frontend.

## Identidad y capabilities

Cada agente obtiene una identidad estable:

```text
agent:general
agent:vivienda
agent:universidad
agent:finanzas
agent:personal
agent:sandbox
```

Ejemplo de capabilities:

```yaml
vivienda:
  knowledge:
    read: [vivienda]
    write: [vivienda]
  files:
    read: [vivienda]
    write: [vivienda]
  calendar:
    read: true
    create: true
  tasks:
    read: true
    create: true
  credentials:
    use: [endesa, seguro_hogar]
    reveal: []
  computer:
    use: true
```

Los prompts no son controles de acceso. Lisa API valida cada capability.

## Contexto selectivo

Un agente no recibe todo el corpus en el prompt.

Proceso:

1. identidad del agente;
2. ámbito permitido;
3. búsqueda/retrieval dentro del ámbito;
4. selección de fragmentos;
5. generación.

Esto reduce exposición y consumo de tokens.

## Conversaciones y conocimiento

Entidades distintas:

```text
Conversation
Message
KnowledgeItem
Document
Task
CalendarEvent
```

Una conversación puede:
- quedar solo en historial;
- generar uno o más `KnowledgeItem`;
- enlazarse a documentos;
- moverse de categoría.

La extracción de conocimiento debe conservar:
- fuente;
- fecha;
- conversación de origen;
- nivel de confianza;
- posibilidad de revocación.

## Acciones y aprobación

Las acciones se clasifican por riesgo.

Ejemplo inicial:

- lectura: automática;
- creación de tarea: automática;
- creación de evento: automática o confirmación configurable;
- envío de formulario: confirmación;
- compra/pago: confirmación fuerte;
- banca/firma/Cl@ve/2FA: intervención humana.

## Computer Use

Cada sesión tiene:
- `computer_session_id`;
- propietario (agente/tarea);
- estado;
- URL/display;
- control: `agent | human | paused`.

La UI debe exponer:
- Abrir Desktop;
- Take control;
- Release;
- Stop.

## Runtime

OpenClaw es el runtime inicial preferido, pero Lisa se comunica mediante un adapter. No se deben codificar reglas de negocio directamente en OpenClaw.
