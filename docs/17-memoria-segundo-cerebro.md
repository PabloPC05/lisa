# 17 · Memoria personal y segundo cerebro

Actualizado: 26-09-2026. **Decisión de arquitectura futura; no está implementada en la demo actual.** Este documento define cómo debe convertirse el conocimiento de Lisa en una memoria personal compartida por sus agentes cuando exista el backend del servidor privado.

## 1. Objetivo

Lisa no debe limitarse a hacer RAG sobre documentos ni a guardar un historial de chats. El objetivo es disponer de un **Lisa Memory Engine** que mantenga una representación durable, portable y auditable de lo que Lisa sabe, diferenciando:

- **Current Truth**: la mejor representación vigente de un hecho, preferencia, decisión o estado.
- **Timeline**: cómo ha cambiado esa información con el tiempo, sin borrar la evidencia histórica.
- **Sources / provenance**: de qué conversación, documento, acción o integración procede cada afirmación.
- **Markdown canónico**: conocimiento legible y editable por el propietario, exportable fuera de Lisa.
- **Estado estructurado**: relaciones, revisiones, permisos, fuentes y eventos que el backend pueda consultar sin reinterpretar todos los Markdown en cada petición.
- **Índice derivado**: búsqueda por texto y similitud semántica, siempre reconstruible desde las fuentes autorizadas.

La memoria será infraestructura común de Lisa, no memoria privada de un proveedor concreto de modelos.

## 2. Arquitectura prevista

```text
Conversaciones / documentos / integraciones autorizadas
                         |
                         v
                  Memory Ingestor
            extrae candidatos + fuentes
                         |
              +----------+-----------+
              |                      |
              v                      v
       Markdown Brain          PostgreSQL
       conocimiento            estado estructurado
       legible/portable        revisiones/relaciones
              |                      |
              +----------+-----------+
                         |
                         v
                  Hybrid Search
             texto + vector + metadata
                         |
                         v
                 Lisa Memory API
                         |
                  MCP interno / API
                         |
          +--------------+--------------+
          |              |              |
       GPT/LLM         Claude        otros agentes
```

En desarrollo local podrá evaluarse **PGLite** para mantener semántica PostgreSQL sin un servicio externo. En el servidor personal, la autoridad prevista sigue siendo **PostgreSQL**. PGLite no se convierte por ello en requisito de producción.

## 3. Responsabilidad de cada capa

### 3.1 Markdown Brain

El Markdown representa el conocimiento durable que el propietario debe poder leer, editar y exportar sin Lisa. Se usará para páginas de personas, proyectos, decisiones, áreas y conocimiento consolidado.

Patrón recomendado:

```markdown
# Proyecto

## Estado actual
- Decisión vigente A.
- Preferencia vigente B.

## Timeline
- 2026-09-01: se consideró C.
- 2026-09-15: C se descartó y se adoptó A.
```

El cuerpo Markdown es canónico a nivel semántico; HTML, embeddings y resúmenes son derivados.

### 3.2 PostgreSQL / PGLite

La base estructurada conserva, como mínimo, IDs, revisiones, entidades, hechos, eventos, fuentes, permisos, etiquetas de información, relaciones y estado de indexación. No sustituye al Markdown visible: permite que Lisa opere sobre su memoria de forma precisa y transaccional.

### 3.3 Memory Ingestor

Procesa únicamente fuentes ya autorizadas. Su trabajo futuro será:

1. detectar candidatos a memoria;
2. clasificarlos como hecho, preferencia, decisión, entidad, evento, tarea u otro tipo;
3. enlazar siempre la fuente;
4. detectar si contradicen o actualizan conocimiento vigente;
5. proponer una actualización de Current Truth;
6. añadir el cambio a Timeline;
7. reindexar solo después de aplicar la política de aprobación correspondiente.

La política inicial sigue siendo conservadora: una extracción automática no debe convertirse silenciosamente en conocimiento confiable si el flujo exige revisión. Más adelante podrán definirse reglas explícitas para fuentes o tipos de memoria de bajo riesgo.

### 3.4 Búsqueda híbrida

La recuperación combinará:

- búsqueda textual/keyword;
- metadata y filtros estructurados;
- similitud vectorial mediante embeddings cuando haya evaluación suficiente.

En PostgreSQL se prevé evaluar búsqueda de texto nativa y **pgvector** para vectores, evitando introducir otra base de datos salvo que exista una necesidad demostrada. El índice es derivado y debe poder reconstruirse.

### 3.5 Lisa Memory API + MCP

Los agentes no leerán tablas ni carpetas directamente. Accederán a memoria mediante servicios de dominio y, para runtimes compatibles, un **servidor/adaptador MCP interno**.

Operaciones conceptuales:

```text
recall(query, scope)
propose_memory(source, candidate)
get_current_truth(entity_or_topic)
get_timeline(entity_or_topic)
list_sources(memory_id)
revoke_or_forget(memory_id, reason)
```

Los nombres no fijan todavía el contrato final. Autorización y filtros de información se ejecutan **antes** de recuperar o enviar contexto a un modelo.

## 4. Relación con proyectos externos

Se tomarán ideas, no dependencias obligatorias:

- **GBrain**: Current/Compiled Truth + Timeline + procedencia e interfaz de memoria compartida.
- **OpenHuman**: ingesta de distintas fuentes, Markdown legible y memoria jerarquizada.
- **Khoj**: recuperación sobre conocimiento personal y documentos.
- **Mem0**: referencia para extracción/actualización de recuerdos; no se adopta como corazón de Lisa en la primera fase.
- **Graphiti**: candidato posterior si las relaciones temporales entre entidades justifican un knowledge graph dedicado.

Lisa debe conservar una única memoria canónica. No se desplegarán simultáneamente varios frameworks que mantengan copias independientes de la misma verdad salvo que una evaluación demuestre un beneficio claro.

## 5. Despliegue futuro en el servidor personal

La memoria real no vivirá en la demo pública de Vercel.

Topología prevista:

```text
Servidor privado Lisa
|
+-- Lisa API / AuthorizationService
+-- Memory Ingestor worker
+-- PostgreSQL (+ vector extension si se aprueba)
+-- Nextcloud mediante APIs para documentos/Markdown/versiones
+-- Lisa Memory API
+-- MCP interno para runtimes privados
+-- índices/cachés reconstruibles
+-- backups cifrados y restore probado
```

Nextcloud sigue accediéndose mediante APIs soportadas; no se escribe directamente en su datadir. PostgreSQL mantiene estado, identidad, relaciones y procedencia. Los Markdown pueden sincronizarse/exportarse mediante un único flujo propietario de escritura para evitar conflictos.

El endpoint MCP, si se habilita, será interno y autenticado. No se expondrá una herramienta genérica que permita a un agente saltarse ACL, leer toda la memoria o modificarla sin registrar fuente y actor.

## 6. Datos mínimos previstos

Entidades de diseño:

- `MemoryFact`: afirmación vigente, tipo, estado, confianza/política y revisión.
- `MemoryEvent`: cambio temporal o acontecimiento que forma el Timeline.
- `MemorySource`: referencia a conversación, mensaje, documento, revisión, integración o acción.
- `MemoryRelation`: relación estructurada sencilla entre entidades cuando sea útil.
- `MemoryIndexChunk`: fragmento derivado para búsqueda; eliminable y reconstruible.
- `KnowledgeItem`: página Markdown durable y revisable ya definida en el modelo de Lisa.

No guardar el mismo conocimiento como tres autoridades distintas. Las vistas, índices y grafos se derivan de fuentes canónicas claramente identificadas.

## 7. Fases de implantación

1. **M01 · Modelo y contratos**: esquema de hechos/eventos/fuentes, revisiones y scopes.
2. **M02 · Markdown + Current Truth/Timeline**: lectura, edición y consolidación con procedencia.
3. **M03 · Memory Ingestor**: extracción de candidatos y contradicciones sobre fixtures, sin datos personales.
4. **M04 · Hybrid Search**: keyword + metadata; añadir embeddings/pgvector solo tras benchmark.
5. **M05 · API/MCP compartidos**: varios agentes recuperan la misma memoria bajo ACL.
6. **M06 · Evaluación avanzada**: decidir con datos si Mem0, Graphiti u otra capa aporta valor.

Estas fases dependen de identidad/ACL, esquema persistente y copias del backend. No conectar corpus personal real antes de las puertas de seguridad del backlog principal.

## 8. Criterios de éxito

La primera versión útil debe demostrar que:

- una decisión posterior sustituye el Current Truth sin borrar el Timeline;
- toda afirmación durable puede mostrar su procedencia;
- dos agentes distintos recuperan la misma verdad vigente;
- una revocación elimina o invalida derivados e índices correspondientes;
- Markdown puede exportarse y leerse sin Lisa;
- reconstruir el índice no cambia la fuente canónica;
- una búsqueda de un agente sin scope no revela ni siquiera fragmentos candidatos del área prohibida.

## 9. No objetivos iniciales

- No construir un knowledge graph completo antes de demostrar necesidad.
- No guardar cada frase del usuario como memoria.
- No confiar en embeddings como única forma de recuperación.
- No hacer de Mem0, Graphiti, GBrain u OpenHuman una autoridad paralela.
- No permitir que el modelo decida permisos o borre procedencia.
- No convertir la demo pública en almacén de memoria personal.

## 10. Relación con el chat web y las cuentas de modelos

El cliente de preguntas será la web de Lisa; Pi o un CLI no son requisitos. El Context Builder consultará esta memoria mediante servicios autorizados y enviará solo el contexto pertinente al adapter del modelo. Historial de chat, memoria durable, contexto activo y caché del proveedor se mantienen separados.

La investigación de [18 · Chat web y multicuenta](18-chat-web-multicuenta.md) evalúa CLIProxyAPI como gateway opcional para cambiar de cuenta sin perder el hilo. **No convierte el gateway en almacén de memoria ni condiciona M01–M06 a que las suscripciones admitan esa ruta.**

Cambiar exclusivamente la cuenta de inferencia no crea un nuevo hecho de memoria, no duplica fuentes y no cambia el conversation_id. Cambiar de agente o promover contenido mantiene el flujo previo de nueva conversación y permisos revisados. Los reintentos deben revalidar acceso si cambian permisos; Sandbox sigue sin recall personal.

Se conserva la política de guardado explícito fuera de proyecto. La continuidad multicuenta no autoriza retener todos los chats o convertirlos automáticamente en Current Truth. El track C06 comprobará la conexión entre chat y Memory API; todavía no está implementado.
