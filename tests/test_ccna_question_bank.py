import json
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CCNA_HTML = ROOT / "ccna" / "index.html"
QUESTIONS_JS = ROOT / "ccna" / "questions.js"
APP_JS = ROOT / "ccna" / "app.js"
STATE_JS = ROOT / "ccna" / "state.js"
ROOT_HTML = ROOT / "index.html"


class CcnaQuestionBankTests(unittest.TestCase):
    def test_ccna_page_is_question_bank_not_textbook(self):
        html = CCNA_HTML.read_text(encoding="utf-8")
        self.assertIn("CCNA 復習問題集", html)
        self.assertIn('id="question-list"', html)
        self.assertIn('id="review-filter"', html)
        self.assertIn('src="questions.js"', html)
        self.assertIn('src="app.js"', html)
        for obsolete in ("<h3>教科書</h3>", "OSI参照モデル", "TCP/IP モデル", "カプセル化とPDU"):
            self.assertNotIn(obsolete, html)

    def test_questions_only_cover_the_current_lesson(self):
        self.assertTrue(QUESTIONS_JS.is_file())
        script = (
            "const fs=require('fs'),vm=require('vm');"
            "const code=fs.readFileSync(process.argv[1],'utf8');"
            "const data=vm.runInNewContext(code+'\\nJSON.stringify(CCNA_QUESTIONS)');"
            "process.stdout.write(data);"
        )
        result = subprocess.run(
            ["node", "-e", script, str(QUESTIONS_JS)],
            check=True,
            capture_output=True,
            text=True,
        )
        questions = json.loads(result.stdout)
        self.assertGreaterEqual(len(questions), 5)
        ids = set()
        for question in questions:
            self.assertEqual(question["session"], "2026-07-25")
            self.assertEqual(question["topic"], "ネットワークとは何か")
            self.assertNotIn(question["id"], ids)
            ids.add(question["id"])
            self.assertGreaterEqual(len(question["choices"]), 3)
            self.assertIn(question["answer"], range(len(question["choices"])))
            self.assertTrue(question["explanation"].strip())
            combined = question["question"] + question["explanation"]
            for obsolete in ("OSI参照モデル", "TCP/IPモデル", "カプセル化", "PDU"):
                self.assertNotIn(obsolete, combined)

    def test_app_supports_answer_explanations_and_review_filter(self):
        self.assertTrue(APP_JS.is_file())
        app = APP_JS.read_text(encoding="utf-8")
        self.assertIn("CCNAQuizState.acquire(window)", app)
        self.assertIn("CCNAQuizState.save(storage", app)
        self.assertIn("review-filter", app)
        self.assertIn("explanation", app)
        self.assertIn("last-answer", app)
        self.assertIn("【正解】", app)
        self.assertIn("reviewOnly && correct", app)
        self.assertIn("lastAnswer.focus()", app)
        html = CCNA_HTML.read_text(encoding="utf-8")
        self.assertIn('role="status"', html)
        self.assertIn('tabindex="-1"', html)
        self.assertIn("questions.js", html)

    def test_storage_failures_and_malformed_progress_are_safe(self):
        self.assertTrue(STATE_JS.is_file())
        script = r"""
const fs = require('fs');
const vm = require('vm');
const questionsCode = fs.readFileSync(process.argv[1], 'utf8');
const stateCode = fs.readFileSync(process.argv[2], 'utf8');
const context = {};
vm.createContext(context);
vm.runInContext(questionsCode + '\nthis.questions = CCNA_QUESTIONS;', context);
vm.runInContext(stateCode + '\nthis.stateApi = CCNAQuizState;', context);

const blockedWindow = {};
Object.defineProperty(blockedWindow, 'localStorage', {get() { throw new Error('blocked getter'); }});
if (context.stateApi.acquire(blockedWindow) !== null) process.exit(1);

const throwingStorage = {
  getItem() { throw new Error('blocked'); },
  setItem() { throw new Error('blocked'); }
};
if (context.stateApi.save(throwingStorage, 'key', {x: 'wrong'}) !== false) process.exit(2);
const blocked = context.stateApi.load(throwingStorage, 'key', context.questions);
if (Object.keys(blocked).length !== 0) process.exit(3);

const known = context.questions[0].id;
const malformedStorage = {
  getItem() { return JSON.stringify({[known]: 'wrong', unknown: 'correct', bad: 'maybe'}); },
  setItem() {}
};
const restored = context.stateApi.load(malformedStorage, 'key', context.questions);
if (JSON.stringify(restored) !== JSON.stringify({[known]: 'wrong'})) process.exit(4);
"""
        subprocess.run(
            ["node", "-e", script, str(QUESTIONS_JS), str(STATE_JS)],
            check=True,
            capture_output=True,
            text=True,
        )

    def test_home_keeps_git_and_describes_ccna_as_question_bank(self):
        html = ROOT_HTML.read_text(encoding="utf-8")
        self.assertIn('href="git/index.html"', html)
        self.assertIn('href="ccna/index.html"', html)
        self.assertIn("選択式の復習問題集", html)


if __name__ == "__main__":
    unittest.main()
