# Instrucciones para desarrollar este proyecto

- Leer docs/09-decisiones-vigentes.md, CONTINUAR.md y docs/07-backlog.md antes de cambiar código. Para memoria, conocimiento, RAG o agentes con contexto, leer también docs/17-memoria-segundo-cerebro.md.
- Escribir documentación en español; identificadores de código claros y consistentes.
- Mantener diferenciados requisitos confirmados, propuestas y pruebas de compatibilidad pendientes.
- No incluir datos personales reales ni tokens en ejemplos, commits, fixtures o logs.
- No confundir workspace, sesión o instrucciones de un agente con aislamiento de permisos.
- No cargar todas las carpetas ni todas las skills en todas las llamadas.
- Favorecer bibliotecas estándar en el prototipo; justificar nuevas dependencias.
- Verificar documentación oficial y fijar versiones antes de configurar productos externos.
- No inventar configuración de OpenClaw. Los contratos propios no son sus APIs.
- Probar límites de acceso, continuidad de identidad, conflictos e idempotencia al implementar esas funciones.
- Actualizar CONTINUAR.md al terminar, indicando lo implementado, pruebas y siguiente paso.
- Mantener datos de ejecución fuera del repositorio. No desplegar ni migrar documentos como efecto secundario de pruebas.

- Incorporar cada cambio explícito de opinión disponible al registro de decisiones, conservando qué sustituye y actualizando documentación/código afectados. No asumir que se conocen cambios de chats no disponibles.

- La memoria futura de Lisa tiene una sola autoridad lógica: no añadir Mem0, Graphiti u otro framework como almacén paralelo sin evaluación y decisión documentada. Preservar Markdown portable, procedencia, Current Truth/Timeline, ACL antes de recall y reconstruibilidad de índices.
