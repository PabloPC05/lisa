"""Persistencia local de eventos; el adaptador debe autenticar al emisor.

No es almacenamiento nativo de OpenClaw ni una API expuesta a Internet.
"""
import json
import sqlite3
from contextlib import closing
from uuid import UUID

from .core import route


class EventConflict(ValueError):
    """Un evento ya registrado tiene otro contenido o destino."""


def session_identity(config, user, chat, topic, case_id=None):
    routed = route(config, user, chat, topic)
    case = str(UUID(case_id)) if case_id is not None else 'default'
    # Una tupla serializada evita colisiones por separadores en identificadores.
    key = json.dumps(['lisa-v1', routed['agent'], config['telegram']['account'],
                      str(chat), str(topic), str(user), case], separators=(',', ':'))
    return routed['agent'], key


class SessionStore:
    def __init__(self, path):
        self.path = str(path)
        with closing(self._connect()) as db, db:
            db.execute('''CREATE TABLE IF NOT EXISTS events (
                seq INTEGER PRIMARY KEY AUTOINCREMENT,
                account TEXT NOT NULL,
                event_id TEXT NOT NULL,
                session_key TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(account, event_id)
            )''')
            db.execute('CREATE INDEX IF NOT EXISTS events_session ON events(session_key, seq)')

    def _connect(self):
        return sqlite3.connect(self.path, timeout=5)

    def append(self, config, *, user, chat, topic, event_id, content, case_id=None):
        agent, key = session_identity(config, user, chat, topic, case_id)
        if not isinstance(event_id, str) or not event_id.strip():
            raise ValueError('event_id debe ser una cadena no vacía')
        if not isinstance(content, str) or not content.strip():
            raise ValueError('content debe ser una cadena no vacía')
        account = config['telegram']['account']
        with closing(self._connect()) as db, db:
            # Serializa comprobar+insertar frente a otros escritores SQLite.
            db.execute('BEGIN IMMEDIATE')
            prior = db.execute('SELECT seq, session_key, content FROM events '
                               'WHERE account=? AND event_id=?', (account, event_id)).fetchone()
            if prior:
                if prior[1:] != (key, content):
                    raise EventConflict('Evento repetido con contenido o destino diferente')
                return {'agent': agent, 'seq': prior[0], 'inserted': False}
            row = db.execute('INSERT INTO events(account,event_id,session_key,content) '
                             'VALUES (?,?,?,?)', (account, event_id, key, content))
            return {'agent': agent, 'seq': row.lastrowid, 'inserted': True}

    def history(self, config, *, user, chat, topic, case_id=None, limit=50):
        _, key = session_identity(config, user, chat, topic, case_id)
        if type(limit) is not int or not 1 <= limit <= 200:
            raise ValueError('limit debe estar entre 1 y 200')
        with closing(self._connect()) as db:
            rows = db.execute('SELECT seq,content,created_at FROM events WHERE session_key=? '
                              'ORDER BY seq DESC LIMIT ?', (key, limit)).fetchall()
        return [{'seq': seq, 'content': content, 'created_at': created_at}
                for seq, content, created_at in reversed(rows)]
