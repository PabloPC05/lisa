# Instrucciones para desarrollar este proyecto

- Leer docs/09-decisiones-vigentes.md, CONTINUAR.md y docs/07-backlog.md antes de cambiar código. Para memoria, conocimiento, RAG o agentes con contexto, leer también docs/17-memoria-segundo-cerebro.md. Para chat web, modelos, cuentas, gateways o continuidad, leer docs/18-chat-web-multicuenta.md.
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

- El chat de preguntas utiliza la web propia de Lisa: no imponer Pi, terminal ni un runtime de programación. Separar conversación/memoria, adapter de modelos y autenticación del proveedor.
- CLIProxyAPI es una investigación opcional, no una integración operativa ni autorizada por existir documentación. Antes de cuentas reales, completar C00 y las puertas de seguridad; no iniciar OAuth, instalar proxies o habilitar créditos por trabajar en memoria.
- Cambiar solo cuenta de inferencia conserva la conversación si agente/modo/permisos no cambian; cambiar de agente mantiene la promoción existente a nueva sesión. Preservar guardado explícito y ausencia de recall personal en Sandbox.
- No hacer fallback silencioso a otra facturación o modelo. Probar streaming interrumpido, cancelación, reintentos globales, permisos revocados y duplicados; no suplantar clientes ni asumir que el prompt sobrevive a un proxy sin verificarlo.
