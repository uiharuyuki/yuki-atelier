/* =====================================================================
 * quiz.js
 * ---------------------------------------------------------------------
 * クイズの出題・採点と、学習進捗の保存（localStorage）を担当します。
 *
 * 進捗データの形（localStorageに JSON で保存）:
 *   {
 *     learnedCommands: [ "add-all", ... ],  // 開いて学んだコマンドid
 *     quizAnswered:    数値,                 // 回答した問題の延べ数
 *     quizCorrect:     数値,                 // 正解の延べ数
 *     reviewIds:       [ "q5", ... ]         // 間違えた＝復習対象の問題id
 *   }
 *
 * window.GVT_Quiz として公開します。
 * ===================================================================== */

window.GVT_Quiz = (function () {
  "use strict";

  var STORAGE_KEY = "gvt_progress_v1";

  // 進捗の初期値
  function emptyProgress() {
    return {
      learnedCommands: [],
      quizAnswered: 0,
      quizCorrect: 0,
      reviewIds: []
    };
  }

  // localStorageから読み込む（壊れていたら初期化）
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyProgress();
      var data = JSON.parse(raw);
      // 念のため必要なキーを補完
      return Object.assign(emptyProgress(), data);
    } catch (e) {
      return emptyProgress();
    }
  }

  // localStorageへ保存（プライベートモード等で失敗しても止めない）
  function save(progress) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      /* 保存できない環境では進捗は一時的なものになります */
    }
  }

  // コマンドを「学んだ」として記録
  function markLearned(commandId) {
    var p = load();
    if (p.learnedCommands.indexOf(commandId) === -1) {
      p.learnedCommands.push(commandId);
      save(p);
    }
    return p;
  }

  // クイズ回答を採点して進捗に反映
  // 戻り値: { correct: true/false, explain, question }
  function answer(questionId, choiceIndex) {
    var question = findQuestion(questionId);
    if (!question) return null;

    var correct = choiceIndex === question.answer;
    var p = load();
    p.quizAnswered += 1;
    if (correct) {
      p.quizCorrect += 1;
      // 正解したら復習対象から外す
      p.reviewIds = p.reviewIds.filter(function (id) { return id !== questionId; });
    } else {
      // 不正解は復習対象に追加（重複しないように）
      if (p.reviewIds.indexOf(questionId) === -1) {
        p.reviewIds.push(questionId);
      }
    }
    save(p);
    return {
      correct: correct,
      explain: question.explain,
      answerIndex: question.answer,
      question: question
    };
  }

  // idから問題を探す
  function findQuestion(id) {
    var list = window.GVT_DATA.QUIZ;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  // 復習対象の問題だけを返す
  function getReviewQuestions() {
    var p = load();
    return window.GVT_DATA.QUIZ.filter(function (q) {
      return p.reviewIds.indexOf(q.id) !== -1;
    });
  }

  // 進捗サマリーを計算して返す（画面表示用）
  function getSummary() {
    var p = load();
    var totalCommands = window.GVT_DATA.COMMANDS.length;
    var rate = p.quizAnswered > 0
      ? Math.round((p.quizCorrect / p.quizAnswered) * 100)
      : 0;
    return {
      learnedCount: p.learnedCommands.length,
      totalCommands: totalCommands,
      quizAnswered: p.quizAnswered,
      quizCorrect: p.quizCorrect,
      correctRate: rate,
      reviewCount: p.reviewIds.length
    };
  }

  // 進捗をすべて消す
  function resetProgress() {
    save(emptyProgress());
  }

  return {
    load: load,
    markLearned: markLearned,
    answer: answer,
    getReviewQuestions: getReviewQuestions,
    getSummary: getSummary,
    resetProgress: resetProgress
  };
})();
