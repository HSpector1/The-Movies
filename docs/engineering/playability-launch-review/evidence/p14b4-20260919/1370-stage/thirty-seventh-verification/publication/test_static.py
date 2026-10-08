"""Synthetic source-map refusals only; never stages, commits, pushes or reads archive captures."""
import copy,hashlib,json
from unittest import TestCase,main,mock
from publish_stage37 import MAP,MAP_SHA,parse_power_status,require_ac,validate_map

class StaticTests(TestCase):
 @classmethod
 def setUpClass(cls):
  raw=MAP.read_bytes();assert hashlib.sha256(raw).hexdigest()==MAP_SHA
  cls.good=json.loads(raw)
 def rejected(self,change):
  bad=copy.deepcopy(self.good);change(bad)
  with self.assertRaises(RuntimeError):validate_map(bad)
 def test_real_map_deterministic(self):
  rows=validate_map(self.good)
  self.assertEqual(len(rows),183)
  self.assertEqual([r['target'] for r in rows],sorted(r['target'] for r in rows))
 def test_wrong_base(self):self.rejected(lambda d:d.__setitem__('baseEvidenceCommit','0'*40))
 def test_wrong_production(self):self.rejected(lambda d:d.__setitem__('productionSrcTree','0'*40))
 def test_duplicate_destination(self):self.rejected(lambda d:d['rows'][1].__setitem__('target',d['rows'][0]['target']))
 def test_traversal(self):self.rejected(lambda d:d['rows'][0].__setitem__('target',d['targetPrefix']+'/../outside'))
 def test_outside_source(self):self.rejected(lambda d:d['rows'][0].__setitem__('source','/tmp/x'))
 def test_oversize(self):self.rejected(lambda d:d['rows'][0].__setitem__('bytes',100000000))
 def test_bad_oid(self):self.rejected(lambda d:d['rows'][0].__setitem__('gitBlobOid','z'*40))
 def test_missing_row(self):self.rejected(lambda d:d['rows'].pop())
 def test_missing_h_review(self):self.rejected(lambda d:d['authority'].__setitem__('HFullSourceReviewReceiptSha256','0'*64))
 def test_missing_m0_review(self):self.rejected(lambda d:d['authority'].__setitem__('M0FullSourceReviewReceiptSha256','0'*64))
 def test_held_r1_relabel_refused(self):
  self.rejected(lambda d:next(r for r in d['rows'] if r['target'].endswith('manifest-r1/H-SOURCE-MANIFEST.json')).__setitem__('classification','ACCEPTED'))
 def test_ac_parser(self):
  self.assertTrue(parse_power_status("Now drawing from 'AC Power'\n"))
  self.assertFalse(parse_power_status("Now drawing from 'Battery Power'\n"))
  self.assertFalse(parse_power_status(''))
 @mock.patch('publish_stage37.subprocess.run')
 def test_battery_refused(self,run):
  run.return_value.returncode=0;run.return_value.stdout="Now drawing from 'Battery Power'\n"
  with self.assertRaisesRegex(RuntimeError,'AC power'):require_ac()
 @mock.patch('publish_stage37.subprocess.run')
 def test_pmset_failure_refused(self,run):
  run.side_effect=FileNotFoundError('pmset')
  with self.assertRaisesRegex(RuntimeError,'AC power'):require_ac()
if __name__=='__main__':main()
