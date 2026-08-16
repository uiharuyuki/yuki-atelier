from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


REPOSITORY = Path(__file__).resolve().parents[1]
CONVERTER = REPOSITORY / "scripts" / "readme_to_html.py"
WRAPPER = REPOSITORY / "scripts" / "readme-post-write.ps1"


def run_converter(payload: object | str) -> subprocess.CompletedProcess[str]:
    serialized = payload if isinstance(payload, str) else json.dumps(payload)
    return subprocess.run(
        [sys.executable, str(CONVERTER)],
        input=serialized,
        capture_output=True,
        text=True,
        check=False,
    )


class ReadmeToHtmlHookTests(unittest.TestCase):
    def assert_silent_success(self, result: subprocess.CompletedProcess[str]) -> None:
        self.assertEqual(result.returncode, 0)
        self.assertEqual(result.stdout, "")
        self.assertEqual(result.stderr, "")

    def test_claude_write_creates_and_updates_readme_html(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            readme = directory / "README.md"
            output = directory / "README.html"
            readme.write_text("# First title\n\nShort README.\n", encoding="utf-8")
            payload = {
                "cwd": str(directory),
                "tool_name": "Write",
                "tool_input": {"file_path": str(readme)},
            }

            first = run_converter(payload)
            self.assert_silent_success(first)
            self.assertTrue(output.is_file())
            self.assertIn("First title", output.read_text(encoding="utf-8"))

            readme.write_text("# Updated title\n\nReplacement body.\n", encoding="utf-8")
            second = run_converter(payload)
            self.assert_silent_success(second)
            rendered = output.read_text(encoding="utf-8")
            self.assertIn("Updated title", rendered)
            self.assertNotIn("First title", rendered)

    def test_codex_apply_patch_input_finds_readme(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            readme = directory / "README.md"
            readme.write_text("# Codex path\n\nConverted from patch input.\n", encoding="utf-8")
            payload = {
                "cwd": str(directory),
                "tool_name": "apply_patch",
                "tool_input": {
                    "command": (
                        "*** Begin Patch\n"
                        f"*** Update File: {readme}\n"
                        "*** End Patch"
                    )
                },
            }

            result = run_converter(payload)
            self.assert_silent_success(result)
            self.assertTrue((directory / "README.html").is_file())

    def test_non_readme_markdown_does_not_generate_html(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            note = directory / "notes.md"
            note.write_text("# Private note\n\n" + "content " * 300, encoding="utf-8")
            payload = {
                "cwd": str(directory),
                "tool_name": "Edit",
                "tool_input": {"file_path": str(note)},
            }

            result = run_converter(payload)
            self.assert_silent_success(result)
            self.assertFalse((directory / "notes.html").exists())
            self.assertFalse((directory / "README.html").exists())

    def test_invalid_input_and_missing_file_are_silent(self) -> None:
        malformed = run_converter("{")
        self.assert_silent_success(malformed)

        missing = run_converter(
            {"cwd": str(REPOSITORY), "tool_input": {"file_path": "missing/README.md"}}
        )
        self.assert_silent_success(missing)

    @unittest.skipUnless(sys.platform == "win32", "PowerShell wrapper is Windows-specific")
    def test_powershell_wrapper_forwards_stdin_silently(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            readme = directory / "README.md"
            readme.write_text("# Wrapper path\n\nLocal conversion.\n", encoding="utf-8")
            payload = json.dumps(
                {"cwd": str(directory), "tool_input": {"file_path": str(readme)}}
            )
            result = subprocess.run(
                [
                    "powershell",
                    "-NoProfile",
                    "-NonInteractive",
                    "-ExecutionPolicy",
                    "Bypass",
                    "-File",
                    str(WRAPPER),
                ],
                input=payload,
                capture_output=True,
                text=True,
                check=False,
            )

            self.assert_silent_success(result)
            self.assertTrue((directory / "README.html").is_file())


if __name__ == "__main__":
    unittest.main()
