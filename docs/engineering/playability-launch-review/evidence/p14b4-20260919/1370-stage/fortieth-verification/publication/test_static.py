"""Read-only Stage40 map and publisher guard tests; no Git mutation or heavy route."""
import copy
import hashlib
import json
import unittest
from pathlib import Path
from unittest import mock

import publish_stage40 as p


class StaticTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        raw = p.MAP.read_bytes()
        assert hashlib.sha256(raw).hexdigest() == p.MAP_SHA
        cls.good = json.loads(raw)

    def refused(self, change):
        bad = copy.deepcopy(self.good)
        change(bad)
        with self.assertRaises(RuntimeError):
            p.validate_map(bad)

    def test_exact_map(self):
        rows = p.validate_map(self.good)
        self.assertEqual((len(rows), sum(row['bytes'] for row in rows)), (130, 663707))
        self.assertEqual(len({row['target'] for row in rows}), 130)
        self.assertTrue(all(row['target'].startswith(p.PREFIX) for row in rows))

    def test_inherited_r1_rows_exact(self):
        old = json.loads(p.R1_MAP.read_bytes())
        self.assertEqual(hashlib.sha256(p.R1_MAP.read_bytes()).hexdigest(), p.R1_MAP_SHA)
        actual = {row['target']: row for row in self.good['rows']}
        self.assertEqual(len(old['rows']), 60)
        self.assertTrue(all(actual[row['target']] == row for row in old['rows']))

    def test_roster_exact(self):
        rows = p.validate_map(self.good)
        expected = ('source\ttarget\tbytes\tsha256\tgitBlobOid\n' + ''.join(
            f"{row['source']}\t{row['target']}\t{row['bytes']}\t{row['sha256']}\t{row['gitBlobOid']}\n"
            for row in rows)).encode()
        actual = (p.HERE / 'SOURCE-ROSTER.tsv').read_bytes()
        self.assertEqual(actual, expected)
        self.assertEqual(hashlib.sha256(actual).hexdigest(), p.ROSTER_SHA)

    def test_refuse_schema_and_authority_drift(self):
        self.refused(lambda d: d.__setitem__('schema', 'old'))
        self.refused(lambda d: d.__setitem__('stage39PublishedEvidenceTip', '0' * 40))
        self.refused(lambda d: d.__setitem__('productionHeadAtSourceReview', '0' * 40))
        self.refused(lambda d: d.__setitem__('productionSrcTree', '0' * 40))
        self.refused(lambda d: d.__setitem__('observedStopReceiptSha256', p.R13_STOP_SHA))

    def test_refuse_target_traversal_collision_and_oversize(self):
        self.refused(lambda d: d['rows'][0].__setitem__('target', p.PREFIX + '../outside'))
        self.refused(lambda d: d['rows'][1].__setitem__('target', d['rows'][0]['target']))
        self.refused(lambda d: d['rows'][0].__setitem__('bytes', 100000000))
        self.refused(lambda d: d['rows'][0].__setitem__('source', '/tmp/outside'))

    def test_refuse_relabelled_stops_and_refines(self):
        for suffix in (
            '1370-c0-h-typecheck-r10-source-independent-static-review-r1/RECEIPT.json',
            '1370-c0-h-typecheck-r11-independent-observed-stop-review-r1/RECEIPT.json',
            '1370-c0-h-typecheck-r12-independent-static-review-r1/RECEIPT.json',
            '1370-c0-h-typecheck-collection-filled-exact-independent-review-r13-r4/RECEIPT.json',
            '1370-c0-h-typecheck-r13-independent-observed-stop-review-r1/RECEIPT.json',
        ):
            def change(d, suffix=suffix):
                next(row for row in d['rows'] if row['target'].endswith(suffix))['classification'] = 'ACCEPTED_TYPES'
            self.refused(change)

    def test_clean_git_env(self):
        with mock.patch.dict('os.environ', {'GIT_DIR': '/tmp/evil', 'GIT_INDEX_FILE': '/tmp/evil-index', 'PATH': '/bin'}):
            env = p.clean_env()
            self.assertNotIn('GIT_DIR', env)
            self.assertNotIn('GIT_INDEX_FILE', env)
            self.assertEqual(env['PATH'], '/bin')

    def test_publisher_source_has_no_file_size_rlimit_and_push_is_nonforce(self):
        source = (p.HERE / 'publish_stage40.py').read_text()
        self.assertNotIn('RLIMIT_FSIZE', source)
        self.assertIn("'push', '--no-force'", source)
        self.assertIn("'update-ref', EVIDENCE_REF, commit, BASE", source)
        self.assertIn('MAP_REVIEW_SHA', source)
        self.assertIn('R11_STOP_SHA', source)
        self.assertIn('R13_STOP_SHA', source)


if __name__ == '__main__':
    unittest.main()
