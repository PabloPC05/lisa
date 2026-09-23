# Cómo retomar Lisa

Leer primero [decisiones vigentes](docs/09-decisiones-vigentes.md), AGENTS.md y backlog. Las instrucciones posteriores explícitas del propietario prevalecen sobre propuestas anteriores.

## Entregado

- Especificación, arquitectura propuesta, contratos y backlog.
- Paquete Python `lisa`, encaminamiento y resolución de documentos ficticios.
- Sesiones SQLite por agente/cuenta/usuario/chat/tema/expediente, recuperación tras reinicio, deduplicación y detección de conflictos.
- CLI `record` y `history`; demos sin modelos ni servicios externos.
- Registro de cambios de decisión y flujo de actualización entre sesiones.
- Destino autorizado: repositorio público `PabloPC05/lisa`; preservar historial remoto al publicar.

Validación local: 18 pruebas aprobadas. Incluyen ocho pruebas nuevas de persistencia, separación, revocación, reintentos concurrentes y conflictos. La CI está configurada para Python 3.11 y 3.12; su resultado se consulta en GitHub. El movimiento documental probado sigue requiriendo actualizar manualmente el manifiesto.

## No implementado

Integración OpenClaw/Telegram, modelos, interfaz gráfica, editor, control de escritorio, autenticación web, registro SQL de documentos, OCR, búsqueda, copias automáticas y gestiones externas. SQLite implementa eventos locales, no el registro documental B03 ni una cola B16. El prototipo no es una frontera de seguridad para producción.

## Siguiente paso

B01: verificar y fijar una versión oficial de OpenClaw, ensayar dos agentes/temas con reinicio, habilidades y trazas. Requiere entorno de integración y credenciales de prueba; no inventar configuración. Mantener el almacén local desacoplado hasta conocer el contrato del adaptador.

B02: cerrar elección de almacenamiento y editor mediante un recorrido de prueba. B20: evaluar interfaz con toma de control gráfica y consola de desarrollo según la dirección expresada; Telegram es todavía propuesta, no requisito definitivo. No contratar ni desplegar infraestructura como efecto secundario.

## Prompt de continuación

> Continúa Lisa. Lee AGENTS.md, docs/09-decisiones-vigentes.md y CONTINUAR.md. Incorpora mis nuevas decisiones disponibles, actualiza los documentos afectados y conserva el historial de cambios. Ejecuta las pruebas. Trabaja en el siguiente elemento del backlog sin presentar prototipos como integraciones completadas. Documenta pruebas, límites y estado real. No migres documentos personales ni actives gestiones reales sin autorización específica.
