import json
import subprocess
import unicodedata
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CCNA_HTML = ROOT / "ccna" / "index.html"
QUESTIONS_JS = ROOT / "ccna" / "questions.js"
CHAPTER_01_JS = ROOT / "ccna" / "questions-ch01.js"
CHAPTER_02_JS = ROOT / "ccna" / "questions-ch02.js"
CHAPTER_03_JS = ROOT / "ccna" / "questions-ch03.js"
CHAPTER_04_JS = ROOT / "ccna" / "questions-ch04.js"
CHAPTER_05_JS = ROOT / "ccna" / "questions-ch05.js"
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

    def test_question_sources_are_split_by_chapter(self):
        self.assertTrue(CHAPTER_01_JS.is_file())
        self.assertTrue(CHAPTER_02_JS.is_file())
        self.assertTrue(CHAPTER_03_JS.is_file())
        self.assertTrue(CHAPTER_04_JS.is_file())
        self.assertTrue(CHAPTER_05_JS.is_file())
        html = CCNA_HTML.read_text(encoding="utf-8")
        chapter_01_script = 'src="questions-ch01.js"'
        chapter_02_script = 'src="questions-ch02.js"'
        chapter_03_script = 'src="questions-ch03.js"'
        chapter_04_script = 'src="questions-ch04.js"'
        chapter_05_script = 'src="questions-ch05.js"'
        combined_script = 'src="questions.js"'
        self.assertLess(html.index(chapter_01_script), html.index(chapter_02_script))
        self.assertLess(html.index(chapter_02_script), html.index(chapter_03_script))
        self.assertLess(html.index(chapter_03_script), html.index(chapter_04_script))
        self.assertLess(html.index(chapter_04_script), html.index(chapter_05_script))
        self.assertLess(html.index(chapter_05_script), html.index(combined_script))
        combined = QUESTIONS_JS.read_text(encoding="utf-8")
        self.assertIn("...CCNA_CHAPTER_01_QUESTIONS", combined)
        self.assertIn("...CCNA_CHAPTER_02_QUESTIONS", combined)
        self.assertIn("...CCNA_CHAPTER_03_QUESTIONS", combined)
        self.assertIn("...CCNA_CHAPTER_04_QUESTIONS", combined)
        self.assertIn("...CCNA_CHAPTER_05_QUESTIONS", combined)

    def test_questions_only_cover_the_current_lesson(self):
        self.assertTrue(QUESTIONS_JS.is_file())
        script = (
            "const fs=require('fs'),vm=require('vm');"
            "const code=process.argv.slice(1).map(path=>fs.readFileSync(path,'utf8')).join('\\n');"
            "const data=vm.runInNewContext(code+'\\nJSON.stringify(CCNA_QUESTIONS)');"
            "process.stdout.write(data);"
        )
        result = subprocess.run(
            ["node", "-e", script, str(CHAPTER_01_JS), str(CHAPTER_02_JS), str(CHAPTER_03_JS), str(CHAPTER_04_JS), str(CHAPTER_05_JS), str(QUESTIONS_JS)],
            check=True,
            capture_output=True,
            text=True,
        )
        questions = json.loads(result.stdout)
        self.assertEqual(len(questions), 70)
        self.assertEqual(sum(question["chapter"] == "第03章" for question in questions), 10)
        self.assertEqual(sum(question["chapter"] == "第04章" for question in questions), 15)
        self.assertEqual(sum(question["chapter"] == "第05章" for question in questions), 15)
        ids = set()
        normalized_question_texts = set()
        allowed_sessions = {"2026-07-25", "2026-07-29", "2026-08-03", "2026-08-05", "2026-08-18"}
        allowed_topics = {
            "ネットワークとは何か",
            "LANとWAN",
            "LANの分類",
            "通信方式",
            "MACアドレスとスイッチ",
            "フレームとパケット",
            "TCPとUDP",
            "DNS",
            "DHCP",
            "SSHとTelnet",
            "ネットワーク機器",
            "デフォルトゲートウェイ",
            "2進数",
            "プレフィックス長",
            "ホスト数",
            "サブネット数",
            "ブロックサイズ",
            "ネットワークアドレス",
            "ホスト範囲",
            "Ethernet II",
            "次ホップMAC",
            "MACアドレス学習",
            "未知ユニキャスト",
            "MACアドレステーブル",
            "VLAN別MACアドレステーブル",
            "TCP",
            "レイヤ2ループ",
            "ブロードキャストストーム",
            "STP",
            "VLANとブロードキャストドメイン",
            "VLAN ID",
            "アクセスポート",
            "トランクポート",
            "IEEE 802.1Q",
            "ネイティブVLAN",
            "VLAN設定",
            "show vlan",
            "DTP",
            "VLAN間ルーティング",
            "Router on a Stick",
            "サブインターフェース",
            "L3スイッチとSVI",
            "管理VLAN",
            "ルーティング",
            "直接接続経路",
            "ルート不一致",
            "スタティックルート",
            "往路と復路",
            "デフォルトルート",
            "ダイナミックルーティング",
            "コンバージェンス",
            "IGPとEGP",
            "RIP",
            "OSPF",
            "EIGRP",
            "show ip route",
            "AD値",
            "ロンゲストマッチ",
        }
        for question in questions:
            self.assertIn(question["session"], allowed_sessions)
            self.assertIn(question["topic"], allowed_topics)
            self.assertIn(question["chapter"], {"第01章", "第02章", "第03章", "第04章", "第05章"})
            if "-ch05-" in question["id"]:
                expected_chapter = "第05章"
            elif "-ch04-" in question["id"]:
                expected_chapter = "第04章"
            elif "-ch03-" in question["id"]:
                expected_chapter = "第03章"
            else:
                expected_chapter = "第02章" if question["session"] == "2026-08-03" else "第01章"
            self.assertEqual(question["chapter"], expected_chapter)
            self.assertNotIn(question["id"], ids)
            ids.add(question["id"])
            self.assertEqual(len(question["choices"]), 4)
            self.assertEqual(len(question["choices"]), len(set(question["choices"])))
            normalized_question = " ".join(
                unicodedata.normalize("NFKC", question["question"]).split()
            )
            self.assertNotIn(
                normalized_question,
                normalized_question_texts,
                f"duplicate question text: {question['question']}",
            )
            normalized_question_texts.add(normalized_question)
            self.assertIn(question["answer"], range(len(question["choices"])))
            self.assertTrue(question["explanation"].strip())
            self.assertNotIn("<script", question["question"] + question["explanation"])
            if question["topic"] in {"ネットワークアドレス", "ホスト範囲"}:
                self.assertIn("【補足】", question["question"])

    def test_chapter_filter_separates_chapters(self):
        html = CCNA_HTML.read_text(encoding="utf-8")
        app = APP_JS.read_text(encoding="utf-8")
        self.assertIn('id="chapter-filter"', html)
        self.assertIn('value="第01章"', html)
        self.assertIn('value="第02章"', html)
        self.assertIn('value="第03章"', html)
        self.assertIn('value="第04章"', html)
        self.assertIn('value="第05章"', html)
        self.assertIn("chapterFilter", app)
        self.assertIn("selectedChapter", app)
        self.assertIn("question.chapter === selectedChapter", app)
        self.assertIn("chapter-heading", app)

    def test_app_supports_answer_explanations_and_review_filter(self):
        self.assertTrue(APP_JS.is_file())
        app = APP_JS.read_text(encoding="utf-8")
        self.assertIn("CCNAQuizState.acquire(window)", app)
        self.assertIn("CCNAQuizState.save(storage", app)
        self.assertIn("review-filter", app)
        self.assertIn("explanation", app)
        self.assertIn("last-answer", app)
        self.assertIn("shuffledQuestion", app)
        self.assertIn("getRandomValues", app)
        self.assertIn("choices.findIndex", app)
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
const questionsCode = process.argv.slice(1, 7).map(path => fs.readFileSync(path, 'utf8')).join('\n');
const stateCode = fs.readFileSync(process.argv[7], 'utf8');
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
            ["node", "-e", script, str(CHAPTER_01_JS), str(CHAPTER_02_JS), str(CHAPTER_03_JS), str(CHAPTER_04_JS), str(CHAPTER_05_JS), str(QUESTIONS_JS), str(STATE_JS)],
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
