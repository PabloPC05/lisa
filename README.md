# Lisa

Servidor personal de conocimiento y gestiones: documentos identificados de forma estable, memoria Markdown por áreas, agentes con contexto selectivo y acceso móvil mediante OpenClaw y Telegram.

**Estado: especificación v0.2 y prototipo local con sesiones SQLite.** No hay servidor desplegado, bot conectado, migración de documentos ni integración OpenClaw implementada. Fecha de preparación: 23-09-2026.

## Empieza aquí

1. [CONTINUAR.md](CONTINUAR.md): estado real y siguiente tarea para una nueva sesión.
2. [Especificación](docs/01-especificacion.md): alcance, requisitos y aceptación.
3. [Arquitectura y decisiones](docs/02-arquitectura.md).
4. [Archivos, identidad y sincronización](docs/03-datos.md).
5. [Agentes, contexto y móvil](docs/04-agentes.md).
6. [Contratos de integración](docs/05-contratos.md).
7. [Despliegue y operación](docs/06-operacion.md).
8. [Backlog](docs/07-backlog.md) y [fuentes](docs/08-fuentes.md).
9. [Decisiones vigentes](docs/09-decisiones-vigentes.md): cambios y preferencias del propietario.
10. [Sesiones persistentes y demo](docs/10-sesiones-locales.md).

## Base ejecutable

Python 3.11 o superior, sin paquetes externos:

```bash
python -m unittest discover -s tests -v
python -m lisa route --config config/example.json --user 1001 --chat=-10001 --topic 10
python -m lisa resolve --config config/example.json --agent vivienda --id 11111111-1111-4111-8111-111111111111
```

El primer comando ejecuta pruebas. El segundo calcula agente y clave de sesión para identidades ficticias. El tercero localiza un documento de demostración. No envía mensajes, no llama a modelos ni cambia archivos. `config/example.json` es **configuración propia del prototipo**, no configuración válida de OpenClaw.

## Principios

- Un corpus portable de Markdown y documentos, separado del código de este repositorio.
- Identidad estable de documento independiente de nombre, carpeta y versión.
- Un bot y temas privados por área como propuesta inicial; conversaciones y habilidades separadas.
- El servidor almacena y orquesta; los modelos se consumen por API, sin GPU requerida.
- Contexto bajo demanda, con límites medidos; tener archivos disponibles no equivale a incluirlos en el prompt.
- Un único propietario de escritura por documento; recuperación y copias verificadas antes de migrar.

No subir documentos personales, mensajes, credenciales, sesiones de navegador ni copias de bases de datos a GitHub. El propietario ha autorizado que este repositorio sea **público**. No se ha escogido licencia de distribución: queda pendiente del propietario.
