import copy
import json
from pathlib import Path
import tempfile
import unittest

from lisa.core import AccessDenied, resolve, route

ROOT = Path(__file__).resolve().parents[1]
DOC_ID = '11111111-1111-4111-8111-111111111111'


class CoreTests(unittest.TestCase):
    def setUp(self):
        self.config = json.loads((ROOT / 'config/example.json').read_text())
        self.root = ROOT / 'examples/documents'

    def test_topics_have_distinct_agents_and_sessions(self):
        first = route(self.config, '1001', '-10001', '10')
        second = route(self.config, '1001', '-10001', '20')
        self.assertEqual(first['agent'], 'vivienda')
        self.assertEqual(second['agent'], 'universidad')
        self.assertNotEqual(first['session_key'], second['session_key'])
        self.assertEqual(first, route(self.config, '1001', '-10001', '10'))

    def test_unknown_sender_chat_and_topic_rejected(self):
        for values in [('999', '-10001', '10'), ('1001', '-2', '10'), ('1001', '-10001', '30')]:
            with self.subTest(values=values), self.assertRaises(AccessDenied):
                route(self.config, *values)

    def test_valid_document(self):
        result = resolve(self.config, self.root, 'vivienda', DOC_ID)
        self.assertEqual(result.name, 'contrato-ficticio.md')

    def test_other_area_and_unknown_actor_rejected(self):
        for actor in ['universidad', 'unknown']:
            with self.subTest(actor=actor), self.assertRaises(AccessDenied):
                resolve(self.config, self.root, actor, DOC_ID)

    def test_invalid_and_missing_uuid_rejected(self):
        for doc_id in ['bad', '33333333-3333-4333-8333-333333333333']:
            with self.subTest(doc_id=doc_id), self.assertRaises(AccessDenied):
                resolve(self.config, self.root, 'vivienda', doc_id)

    def test_traversal_and_absolute_path_rejected(self):
        for path in ['../Universidad/README.md', '/etc/passwd']:
            self.config['documents'][DOC_ID]['path'] = path
            with self.subTest(path=path), self.assertRaises(AccessDenied):
                resolve(self.config, self.root, 'vivienda', DOC_ID)

    def test_symlink_outside_area_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / 'Vivienda').mkdir()
            (root / 'outside.md').write_text('fixture')
            (root / 'Vivienda/link.md').symlink_to(root / 'outside.md')
            self.config['documents'][DOC_ID]['path'] = 'link.md'
            with self.assertRaises(AccessDenied):
                resolve(self.config, root, 'vivienda', DOC_ID)

    def test_area_symlink_outside_root_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            base = Path(temp)
            root = base / 'root'
            root.mkdir()
            outside = base / 'outside'
            outside.mkdir()
            (outside / 'contrato-ficticio.md').write_text('fixture')
            (root / 'Vivienda').symlink_to(outside, target_is_directory=True)
            with self.assertRaises(AccessDenied):
                resolve(self.config, root, 'vivienda', DOC_ID)

    def test_identity_survives_registered_move_and_edit(self):
        # Simula actualización explícita del registro; no hay watcher automático.
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            area = root / 'Vivienda'
            area.mkdir()
            old = area / 'contrato-ficticio.md'
            old.write_text('v1')
            self.assertEqual(resolve(self.config, root, 'vivienda', DOC_ID), old)
            (area / 'archivo').mkdir()
            new = area / 'archivo/nuevo.md'
            old.rename(new)
            self.config['documents'][DOC_ID]['path'] = 'archivo/nuevo.md'
            new.write_text('v2')
            self.assertEqual(resolve(self.config, root, 'vivienda', DOC_ID), new)

    def test_routing_does_not_mutate_config(self):
        original = copy.deepcopy(self.config)
        route(self.config, '1001', '-10001', '10')
        self.assertEqual(original, self.config)


if __name__ == '__main__':
    unittest.main()
