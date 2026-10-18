"""Isolated instruction setup tests; no game, private data, network or clients."""
import contextlib
import hashlib
import importlib.util
import io
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location(
    "studio_setup", Path(__file__).resolve().parents[1] / "studio-workflow-setup.py")
setup = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(setup)


class InstructionSetupTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / "repo"
        self.root.mkdir()
        self.payload = {
            ".agents/skills/example/SKILL.md": b"---\nname: example\ndescription: fixture\n---\nRead reference.md\n",
            ".agents/skills/example/reference.md": b"Complete pinned instruction reference\n",
        }
        entries = [{"path": p, "source_path": "skills/example/" + Path(p).name,
                    "sha256": hashlib.sha256(b).hexdigest(), "bytes": len(b), "adapted": False}
                   for p, b in self.payload.items()]
        self.source = {"name": "example", "repository": "vendor/instructions", "commit": "a" * 40,
                       "files": entries, "required_files": list(self.payload)}
        self.manifest = {"schema_version": 1, "scope": "repository-instructions-only",
                         "sources": [self.source]}
        self.save()
        self.link = self.root / ".claude/skills/example"

    def save(self):
        p = self.root / setup.MANIFEST
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(json.dumps(self.manifest))

    def fetch(self, source, entry):
        self.assertEqual(source["commit"], "a" * 40)
        return self.payload[entry["path"]]

    def install(self, fetch=None):
        sources = setup.load(self.root)["sources"]
        return setup.apply(self.root, sources, fetch or self.fetch)

    def invoke(self, args):
        with patch.object(setup, "ROOT", self.root), patch.object(setup, "host", return_value={}), \
                contextlib.redirect_stdout(io.StringIO()) as output:
            code = setup.main(args)
        return code, json.loads(output.getvalue())

    def test_plan_and_check_are_read_only_without_network(self):
        before = sorted(str(p.relative_to(self.root)) for p in self.root.rglob("*"))
        with patch.object(setup.urllib.request, "urlopen", side_effect=AssertionError("network")):
            code, report = self.invoke(["--check"])
            self.assertEqual(code, 1)
            self.assertFalse(report["instruction_integrity"])
            self.assertEqual(report["runtime_readiness"], "unverified")
            code, plan = self.invoke(["--plan"])
            self.assertEqual(code, 0)
            self.assertEqual(plan["download_bytes"], sum(map(len, self.payload.values())))
            self.assertEqual(plan["downloads"][0]["commit"], "a" * 40)
        self.assertEqual(before, sorted(str(p.relative_to(self.root)) for p in self.root.rglob("*")))

    def test_repeat_apply_needs_no_download_and_uses_portable_link(self):
        self.assertTrue(self.install()["instruction_integrity"])
        self.assertEqual(os.readlink(self.link), "../../.agents/skills/example")
        self.assertEqual(self.link.resolve(), (self.root / ".agents/skills/example").resolve())
        def no_fetch(*args):
            raise AssertionError("Second apply downloaded matching files")
        self.assertTrue(self.install(no_fetch)["instruction_integrity"])
        code, report = self.invoke(["--check"])
        self.assertEqual(code, 0)
        self.assertEqual(report["client_discovery"], "unverified")

    def test_tampered_download_exposes_no_files_or_links(self):
        with self.assertRaises(setup.SetupError):
            self.install(lambda *_: b"tampered")
        self.assertFalse((self.root / ".agents").exists())
        self.assertFalse(self.link.is_symlink())

    def test_partial_download_failure_exposes_nothing(self):
        calls = []
        def interrupted(source, entry):
            calls.append(entry["path"])
            if len(calls) == 2:
                raise OSError("synthetic interrupted transfer")
            return self.fetch(source, entry)
        with self.assertRaisesRegex(OSError, "interrupted"):
            self.install(interrupted)
        self.assertFalse((self.root / ".agents").exists())
        self.assertEqual(list(self.root.glob(".studio-instructions-*")), [])

    def test_partial_publication_reports_missing_link_and_is_recoverable(self):
        with patch.object(Path, "symlink_to", side_effect=OSError("synthetic link failure")):
            with self.assertRaises(OSError):
                self.install()
        result = setup.report(self.root, [self.source])
        self.assertFalse(result["instruction_integrity"])
        self.assertIn(".claude/skills/example", result["missing"])
        self.assertTrue(self.install(lambda *_: self.fail("unnecessary download"))["instruction_integrity"])

    def test_modified_file_and_unrelated_link_are_preserved(self):
        self.install()
        p = self.root / self.source["files"][0]["path"]
        p.write_bytes(b"local edits")
        with self.assertRaisesRegex(setup.SetupError, "Preserved"):
            self.install()
        self.assertEqual(p.read_bytes(), b"local edits")
        self.link.unlink()
        self.link.symlink_to("../../unrelated")
        with self.assertRaises(setup.SetupError):
            self.install()
        self.assertEqual(os.readlink(self.link), "../../unrelated")

    def test_existing_client_directory_is_not_replaced(self):
        self.link.mkdir(parents=True)
        note = self.link / "keep.md"
        note.write_text("unrelated")
        with self.assertRaises(setup.SetupError):
            self.install()
        self.assertEqual(note.read_text(), "unrelated")

    def test_unexpected_instruction_resource_is_preserved_and_reported(self):
        self.install()
        extra = self.root / ".agents/skills/example/unreviewed.py"
        extra.write_text("not executed")
        with self.assertRaisesRegex(setup.SetupError, "Preserved"):
            self.install()
        self.assertEqual(extra.read_text(), "not executed")
        self.assertIn(str(extra.relative_to(self.root)), setup.report(self.root, [self.source])["mismatched"])

    def test_correct_dangling_link_can_recover_missing_target(self):
        self.link.parent.mkdir(parents=True)
        self.link.symlink_to("../../.agents/skills/example")
        self.assertTrue(self.install()["instruction_integrity"])

    def test_destination_symlink_cannot_escape_checkout(self):
        outside = Path(self.temp.name) / "outside"
        outside.mkdir()
        (self.root / ".agents").symlink_to(outside)
        with self.assertRaisesRegex(setup.SetupError, "Symlink"):
            self.install()
        self.assertEqual(list(outside.iterdir()), [])

    def test_path_traversal_and_source_traversal_rejected(self):
        for key, value in [("path", ".agents/skills/example/../../escape"),
                           ("source_path", "skills/example/../../escape")]:
            original = self.source["files"][0][key]
            self.source["files"][0][key] = value
            self.save()
            with self.assertRaises(setup.SetupError):
                setup.load(self.root)
            self.source["files"][0][key] = original

    def test_immutable_commit_required(self):
        self.source["commit"] = "main"
        self.save()
        code, report = self.invoke(["--plan"])
        self.assertEqual(code, 2)
        self.assertIn("Immutable", report["error"])

    def test_missing_referenced_resource_rejected_before_install(self):
        self.source["files"].pop()
        self.save()
        with self.assertRaisesRegex(setup.SetupError, "referenced resource"):
            setup.load(self.root)

    def test_missing_original_prerequisite_needs_git_repair_not_download(self):
        self.source["files"][0]["adapted"] = True
        self.save()
        code, report = self.invoke(["--plan"])
        self.assertEqual(code, 1)
        self.assertEqual(len(report["restore_from_reviewed_git_manually"]), 1)
        with self.assertRaisesRegex(setup.SetupError, "missing original"):
            self.install()

    def test_apply_requires_selection_and_rejects_unknown_selection(self):
        with contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit) as error:
            setup.main(["--apply"])
        self.assertEqual(error.exception.code, 2)
        code, report = self.invoke(["--apply", "--select", "unknown"])
        self.assertEqual(code, 2)
        self.assertFalse(report["instruction_integrity"])

    def test_recorded_lock_blocks_writes(self):
        lock = self.root.parent / "studio-scratch/HEAVY-LANE-LOCK"
        lock.parent.mkdir()
        lock.write_text("foreign writer")
        with self.assertRaisesRegex(setup.SetupError, "lane/run"):
            self.install()
        self.assertEqual(lock.read_text(), "foreign writer")
        self.assertFalse((self.root / ".agents").exists())

    def test_missing_optional_clients_do_not_block_instruction_integrity(self):
        self.install()
        with patch.object(setup.shutil, "which", return_value=None):
            result = setup.host()
        self.assertTrue(all(t["status"] == "missing" for t in result["tools"]))
        self.assertTrue(setup.report(self.root, [self.source])["instruction_integrity"])

    def test_bounded_duplicate_metadata_is_rejected(self):
        path = self.root / setup.MANIFEST
        path.write_text('{"schema_version":1,"schema_version":1}')
        code, report = self.invoke(["--check"])
        self.assertEqual(code, 2)
        self.assertIn("Duplicate", report["error"])
        path.write_bytes(b" " * (setup.LIMIT + 1))
        with self.assertRaisesRegex(setup.SetupError, "Oversized"):
            setup.load(self.root)
        path.write_text("[]")
        self.assertEqual(self.invoke(["--check"])[0], 2)

    def test_https_download_checks_immutable_url_and_bytes(self):
        entry = self.source["files"][0]
        with patch.object(setup.urllib.request, "urlopen", return_value=io.BytesIO(b"wrong")) as request:
            with self.assertRaisesRegex(setup.SetupError, "Tampered"):
                setup.download(self.source, entry)
        self.assertIn("/" + "a" * 40 + "/", request.call_args.args[0])

    def test_runtime_prerequisites_are_separate_and_derived_from_lock(self):
        lock = self.root / "package-lock.json"
        lock.write_text(json.dumps({"packages": {"node_modules/vitest": {"version": "2.1.9"}}}))
        result = setup.runtime_metadata(self.root)
        item = next(x for x in result if x["path"] == "node_modules/vitest/package.json")
        self.assertEqual(item["status"], "missing")
        path = self.root / item["path"]
        path.parent.mkdir(parents=True)
        path.write_text('{"version":"9.0.0"}')
        item = next(x for x in setup.runtime_metadata(self.root) if x["path"] == item["path"])
        self.assertEqual(item["status"], "mismatched")
        self.assertEqual(item["expected"], "2.1.9")
        self.install()
        self.assertTrue(setup.report(self.root, [self.source])["instruction_integrity"])

    def test_non_instruction_download_is_rejected(self):
        self.source["files"][0]["path"] = ".agents/skills/example/installer.py"
        self.save()
        with self.assertRaisesRegex(setup.SetupError, "Only selected Markdown"):
            setup.load(self.root)

    def test_malformed_runtime_metadata_does_not_obscure_instruction_result(self):
        self.install()
        (self.root / "package-lock.json").write_text("not json")
        code, report = self.invoke(["--check"])
        self.assertEqual(code, 0)
        self.assertTrue(report["instruction_integrity"])
        self.assertEqual(report["runtime_metadata"][0]["status"], "mismatched")
        self.assertEqual((self.root / "package-lock.json").read_text(), "not json")
        (self.root / "package-lock.json").write_text("[]")
        self.assertEqual(self.invoke(["--check"])[0], 0)


if __name__ == "__main__":
    unittest.main()
