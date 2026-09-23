import copy
import json
from pathlib import Path
from tempfile import TemporaryDirectory
from concurrent.futures import ThreadPoolExecutor
import unittest

from lisa.core import AccessDenied
from lisa.sessions import EventConflict, SessionStore


class SessionTests(unittest.TestCase):
    def setUp(self):
        self.temp = TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name) / 'sessions.sqlite'
        self.store = SessionStore(self.path)
        self.config = json.loads((Path(__file__).resolve().parents[1] / 'config/example.json').read_text())
        self.actor = dict(user='1001', chat='-10001', topic='10')

    def add(self, event='1', content='hola', **overrides):
        return self.store.append(self.config, **(self.actor | overrides), event_id=event, content=content)

    def history(self, **overrides):
        return self.store.history(self.config, **(self.actor | overrides))

    def test_restart_and_recent_history_order(self):
        for i in range(4):
            self.add(str(i), str(i))
        self.store = SessionStore(self.path)
        self.assertEqual([r['content'] for r in self.history(limit=2)], ['2', '3'])

    def test_duplicate_is_idempotent(self):
        first = self.add()
        second = self.add()
        self.assertTrue(first['inserted'])
        self.assertFalse(second['inserted'])
        self.assertEqual(first['seq'], second['seq'])
        self.assertEqual(len(self.history()), 1)

    def test_conflict_does_not_overwrite(self):
        self.add()
        with self.assertRaises(EventConflict):
            self.add(content='otro texto')
        with self.assertRaises(EventConflict):
            self.add(topic='20')
        self.assertEqual(self.history()[0]['content'], 'hola')
        self.assertEqual(self.history(topic='20'), [])

    def test_area_case_and_user_isolation(self):
        self.add()
        case = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
        self.add('2', 'expediente', case_id=case)
        self.assertEqual(len(self.history()), 1)
        self.assertEqual(self.history(case_id=case)[0]['content'], 'expediente')
        self.assertEqual(self.history(topic='20'), [])
        self.config['telegram']['allowed_users'].append('1002')
        self.assertEqual(self.history(user='1002'), [])

    def test_revoke_access_on_read_and_write(self):
        self.add()
        self.config['telegram']['allowed_users'] = []
        with self.assertRaises(AccessDenied):
            self.history()
        with self.assertRaises(AccessDenied):
            self.add('2')

    def test_account_isolation(self):
        self.add()
        self.config['telegram']['account'] = 'other'
        self.assertEqual(self.history(), [])
        self.assertTrue(self.add()['inserted'])

    def test_invalid_input(self):
        for case in ['', '../other', 'invalid']:
            with self.assertRaises(ValueError):
                self.add(case_id=case)
        for limit in [0, 201, True]:
            with self.assertRaises(ValueError):
                self.history(limit=limit)

    def test_concurrent_retries_insert_once(self):
        with ThreadPoolExecutor(max_workers=4) as pool:
            results = list(pool.map(lambda _: self.add(), range(8)))
        self.assertEqual(sum(r['inserted'] for r in results), 1)
        self.assertEqual(len(self.history()), 1)


if __name__ == '__main__':
    unittest.main()
