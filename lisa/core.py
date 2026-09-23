"""Routing y localización de fixtures sin red ni escrituras.

La autorización de actor y la apertura resistente a TOCTOU quedan fuera de esta
demo. No exponer estas funciones directamente como API de archivos.
"""
from pathlib import Path
from uuid import UUID


class AccessDenied(ValueError):
    """La configuración no permite la operación."""


def route(config, user, chat, topic):
    telegram = config['telegram']
    if str(user) not in telegram['allowed_users']:
        raise AccessDenied('Usuario no autorizado')
    if str(chat) != telegram['chat_id']:
        raise AccessDenied('Chat no autorizado')
    agent = telegram['topics'].get(str(topic))
    if not agent or agent not in config['agents']:
        raise AccessDenied('Tema no configurado')
    # Clave propia de la demo, no especificación de clave nativa OpenClaw.
    session = ':'.join(map(str, ('demo', agent, telegram['account'], chat, topic, user)))
    return {'agent': agent, 'session_key': session}


def resolve(config, root, agent, document_id):
    try:
        normalized_id = str(UUID(document_id))
    except (ValueError, TypeError, AttributeError) as exc:
        raise AccessDenied('Documento no disponible') from exc
    actor = config['agents'].get(agent)
    document = config['documents'].get(normalized_id)
    if not actor or not document or document['area'] not in actor['read_areas']:
        raise AccessDenied('Documento no disponible')
    area = document['area']
    if area not in config['areas']:
        raise AccessDenied('Área no configurada')
    root = Path(root).resolve(strict=True)
    area_relative = Path(config['areas'][area])
    relative = Path(document['path'])
    if any(p.is_absolute() or '..' in p.parts for p in (area_relative, relative)):
        raise AccessDenied('Ruta no permitida')
    area_root = (root / area_relative).resolve(strict=True)
    target = (area_root / relative).resolve(strict=True)
    if not area_root.is_relative_to(root) or not target.is_relative_to(area_root):
        raise AccessDenied('Ruta no permitida')
    if not target.is_file():
        raise AccessDenied('Documento no disponible')
    return target
