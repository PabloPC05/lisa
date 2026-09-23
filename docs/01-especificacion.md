# 01 · Especificación funcional

Consultar también [decisiones vigentes](09-decisiones-vigentes.md), que recogen cambios posteriores.

## Contexto y grado de decisión

La conversación de referencia trata de Obsidian/SilverBullet, agentes OpenClaw por carpetas, almacenamiento en VPS, SFTPGo, enlaces resistentes a renombrados y comunicación móvil. La recuperación disponible aporta un resumen, no la transcripción completa. No se presupone una decisión de proveedor o producto que el usuario no haya tomado.

**Confirmado:** segundo cerebro organizado por áreas en Markdown; agentes que puedan consultar y actualizar el área adecuada; referencias a documentos que sigan siendo útiles tras reorganizarlos; acceso móvil; equipo encendido continuamente; modelos por API; preocupación por coste de contexto y carga de skills irrelevantes; posibilidad de tareas y computer use concurrentes.

**Propuesto:** servidor como fuente canónica, registro de documentos con UUID, un bot Telegram con temas, editor web SilverBullet, gestores externos opcionales, Python y SQLite para servicios propios. Google Drive, Nextcloud y SFTPGo siguen siendo alternativas o complementos. No se ha contratado infraestructura ni elegido capacidad definitiva.

## Casos de uso

1. Abrir Vivienda desde el móvil, preguntar sobre un expediente y recibir respuesta con enlaces al documento y versión que la sostienen.
2. Enviar un documento, clasificarlo, registrar su identidad y crear o actualizar la nota del expediente sin perder el original.
3. Mover o renombrar ese documento y abrirlo desde el enlace anterior.
4. Dictar una idea o tarea; confirmar la transcripción cuando sea ambigua; guardarla en el área correcta.
5. Consultar Universidad sin incorporar memoria de Finanzas, Familia o Coding al prompt.
6. Pedir una consulta entre áreas, concediendo acceso acotado para esa tarea y dejando constancia de fuentes.
7. Preparar una gestión con navegador y revisar el resultado concreto antes de un envío, firma, pago o modificación externa relevante.
8. Cambiar de servidor y recuperar documentos, notas, identidad y configuración desde una copia.

## Requisitos verificables

| ID | Requisito | Criterio de aceptación |
|---|---|---|
| R01 | Memoria Markdown portable | Se puede leer/exportar sin OpenClaw ni editor específico |
| R02 | Identidad persistente | Un enlace por ID conserva su documento tras move/rename gestionado |
| R03 | Versiones y procedencia | Una afirmación cita ID, versión y localización; una edición no borra la anterior |
| R04 | Agentes por ámbito | Vivienda no puede leer/escribir Finanzas en una prueba de acceso negativa |
| R05 | Sesiones separadas | Dos temas y dos expedientes no mezclan historial; respuestas vuelven al tema origen |
| R06 | Contexto selectivo | El trazado muestra solo memoria, skills y fragmentos autorizados necesarios |
| R07 | Acceso móvil | Consulta, adjunto y apertura de referencia funcionan desde iPhone y Android vía web/chat |
| R08 | Ingesta recuperable | Reentregar un evento no duplica documento ni nota; fallos conservan el original |
| R09 | Edición concurrente | Dos escritores con la misma versión base producen un conflicto explícito |
| R10 | Credenciales protegidas | Secretos fuera de notas/repositorio/prompts; acceso limitado por tarea |
| R11 | Operación continua | Reinicio conserva cola y estado; restauración completa ensayada |
| R12 | Límites de coste | Presupuesto por tarea/día y límite de concurrencia detienen nuevas llamadas |
| R13 | Revisión de acciones | Una autorización caducada o para un contenido diferente no permite ejecutar |
| R14 | Control de acceso | Usuario/chat/tema desconocido se rechaza antes de llamar al modelo |

## MVP y ampliaciones

**MVP:** dos áreas (Vivienda y Universidad), consulta y notas, documentos con ID, acceso móvil, fuente canónica única, escritura controlada, copias y auditoría mínima. Arrancar con documentos ficticios, después un pequeño expediente autorizado.

**Después:** Finanzas/Familia/Personal, OCR, audio, búsqueda semántica si mejora una evaluación, automatizaciones, credenciales delegadas y navegador. n8n no es requisito del MVP. No construir un nuevo Nextcloud ni un nuevo framework de agentes.

Quedan fuera de la primera entrega: decisiones financieras/jurídicas autónomas, pagos, envío automático de documentación personal, modelos locales y sincronización bidireccional indiscriminada entre varios sistemas.

## Métricas de salida del piloto

Veinte preguntas con fuentes conocidas; ninguna fuga entre áreas; todos los movimientos gestionados del juego de prueba mantienen enlaces; recuperación sin pérdida más allá del RPO; registro de coste y latencia p50/p95. El umbral de exactitud se fija con el usuario antes de evaluar; no se promete ahorro porcentual sin medición.
