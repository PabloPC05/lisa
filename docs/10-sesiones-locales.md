# 10 · Sesiones persistentes locales

`lisa.sessions.SessionStore` registra eventos entrantes en SQLite usando solo la biblioteca estándar. Es una base independiente del futuro adaptador, no el historial nativo de OpenClaw.

- Revalida usuario/chat/tema contra la configuración al escribir y leer.
- Separa cuenta, agente, usuario, chat, tema y expediente UUID. Sin UUID usa el expediente `default`.
- Deduplica por cuenta y event_id. Una repetición idéntica devuelve la secuencia existente; cambiar destino o texto produce EventConflict sin sobrescribir.
- Serializa comprobación e inserción mediante transacción SQLite; resiste reintentos concurrentes.
- Recupera los últimos 1–200 mensajes en orden cronológico. El límite de mensajes no equivale a un presupuesto de tokens.
- Persiste tras cerrar y volver a abrir el almacén.

## Uso de demostración

Desde la raíz, usando una carpeta temporal fuera del checkout:

```bash
LISA_DEMO_DIR=$(mktemp -d)
python -m lisa record --config config/example.json --db "$LISA_DEMO_DIR/sessions.sqlite" --user 1001 --chat=-10001 --topic 10 --event-id demo-1 --text 'Mensaje ficticio'
python -m lisa history --config config/example.json --db "$LISA_DEMO_DIR/sessions.sqlite" --user 1001 --chat=-10001 --topic 10
```

Añadir `--case-id` con un UUID separa expedientes. El directorio padre de la base debe existir. En la integración Telegram, usar el update_id auténtico como event_id; nunca uno inventado por el modelo.

## Límites

La CLI confía en los identificadores proporcionados: no autentica identidades de red. Configuración y base están bajo control del operador. No exponer como API sin autenticación ni pasar el archivo SQLite a agentes. No cifra la base ni implementa retención, entrega de respuestas, procesamiento exactamente una vez, cola de trabajos, invocación de modelos, extracción de memoria o autorización entre áreas. Deduplicar la recepción no demuestra que una acción externa sea idempotente. No modificar permisos del archivo desde código: provisionar directorio y usuario de servicio antes de producción.
