# 05 · Contratos propios de integración

Diseño pendiente de implementar. No son endpoints nativos de OpenClaw, SFTPGo, Drive o SilverBullet. Preferir adaptador de herramientas al runtime en vez de alterar su núcleo.

## Herramientas documentales

| Operación | Entrada | Salida / fallo |
|---|---|---|
| search | actor autenticado, scope, query, límite | fragmentos, ID, versión, localizador; sin cruces de ACL |
| resolve | actor, ID, versión opcional | metadatos y acceso temporal autenticado; 404 opaco si no accesible |
| ingest | actor, staging_id, área propuesta, idempotency_key | ID y versión, o NEEDS_REVIEW |
| move | actor, ID, destino, expected_revision | misma identidad; 409 si revisión cambió |
| append_version | actor, ID, staging_id, expected_revision | versión nueva sin destruir anterior |
| propose_note_change | actor, note_id, diff, expected_revision | propuesta verificable y resultado de validación |
| apply_note_change | actor, proposal_id, expected_revision | revisión nueva o conflicto |

La identidad del actor procede del transporte autenticado; nunca aceptar `agent=vivienda` enviado por un cliente como prueba de autorización. El `--agent` de la demo es solo selector de una simulación local.

## Esquema mínimo de nota

```yaml
id: 22222222-2222-4222-8222-222222222222
area: Vivienda
type: expediente
status: abierto
revision: 1
updated_at: 2026-09-23T00:00:00Z
sources:
  - document_id: 11111111-1111-4111-8111-111111111111
    version: 1
    locator: pagina 1
```

Cuerpo: resumen, hechos con fuentes, incertidumbres, decisiones, tareas y registro de cambios. No convertir una respuesta especulativa en hecho persistente. Las fechas de actualización no sustituyen fecha del documento ni de los hechos.

## Eventos y trabajos

Job: `id`, `kind`, `area`, `actor_id`, `idempotency_key`, `payload_ref`, `state`, `attempts`, `created_at`, `deadline`, `result_ref`. Estados: queued → running → succeeded / needs_review / failed / cancelled. Reintento limitado con backoff solo para errores transitorios; una entrega de email ambigua requiere reconciliación antes de repetir.

Una transacción persiste trabajo y evento de salida mediante outbox. Un consumidor idempotente marca entrega por identificador externo. Guardar payloads sensibles fuera de logs. Cancelación detiene nuevas acciones; no presume deshacer efectos ya completados.

## Gestiones y navegador (fase posterior)

Preparar → previsualizar → autorizar cuando proceda → ejecutar → comprobar resultado → registrar evidencia. La propuesta incluye destinatario, sitio, contenido exacto, importe si existe y efectos. La autorización vincula hash de propuesta y caduca; cambios invalidan autorización. No reutilizar un «sí» para otro envío.

Priorizar API oficial cuando exista. Browser/computer use requiere worker separado, timeouts, cuotas CPU/RAM, perfil por identidad y capturas protegidas. CAPTCHA/2FA se resuelven mediante intervención del usuario, no se sortean. Nunca poner el gestor de contraseñas completo a disposición del prompt; estudiar broker de secretos con cuentas/tokens limitados.

## Errores

400 validación; 401 autenticación; 404 documento no visible/no existente sin filtrar existencia; 409 conflicto; 413 tamaño; 429 cuota; 503 proveedor no disponible. Un error de modelo no debe dejar a medias una escritura del documento. Correlation ID en logs, sin contenido íntegro por defecto.
