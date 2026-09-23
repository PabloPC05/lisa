import argparse
import json
import sqlite3
from pathlib import Path

from .core import AccessDenied, resolve, route
from .sessions import SessionStore


def main():
    parser = argparse.ArgumentParser(description='Prototipo local de Lisa')
    commands = parser.add_subparsers(dest='command', required=True)
    routing = commands.add_parser('route')
    routing.add_argument('--config', required=True, type=Path)
    routing.add_argument('--user', required=True)
    routing.add_argument('--chat', required=True)
    routing.add_argument('--topic', required=True)
    resolver = commands.add_parser('resolve')
    resolver.add_argument('--config', required=True, type=Path)
    resolver.add_argument('--agent', required=True)
    resolver.add_argument('--id', required=True)
    for name in ('record', 'history'):
        command = commands.add_parser(name)
        command.add_argument('--config', required=True, type=Path)
        command.add_argument('--db', required=True, type=Path)
        command.add_argument('--user', required=True)
        command.add_argument('--chat', required=True)
        command.add_argument('--topic', required=True)
        command.add_argument('--case-id')
        if name == 'record':
            command.add_argument('--event-id', required=True)
            command.add_argument('--text', required=True)
        else:
            command.add_argument('--limit', type=int, default=50)
    args = parser.parse_args()
    try:
        config = json.loads(args.config.read_text(encoding='utf-8'))
        if args.command == 'route':
            result = route(config, args.user, args.chat, args.topic)
        elif args.command == 'resolve':
            root = args.config.resolve().parent / config['documents_root']
            result = {'path': str(resolve(config, root, args.agent, args.id))}
        else:
            actor = dict(user=args.user, chat=args.chat, topic=args.topic, case_id=args.case_id)
            route(config, args.user, args.chat, args.topic)
            store = SessionStore(args.db)
            if args.command == 'record':
                result = store.append(config, **actor, event_id=args.event_id, content=args.text)
            else:
                result = store.history(config, **actor, limit=args.limit)
        print(json.dumps(result, ensure_ascii=False))
    except (sqlite3.Error, AccessDenied, OSError, KeyError, TypeError, ValueError) as exc:
        parser.exit(2, f'Error: {exc}\n')


if __name__ == '__main__':
    main()
