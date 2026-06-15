/* =====================================================================
 * simulator.js
 * ---------------------------------------------------------------------
 * Gitの「状態」を管理する学習用シミュレーターです。
 * 本物のGitは動かしません。あくまで状態変化を見せるための疑似エンジンです。
 *
 * 管理する4つのエリア:
 *   1. workingDir  … 作業フォルダ（編集中のファイル）
 *   2. staging     … ステージング（コミット対象）
 *   3. localCommits… ローカルリポジトリ（手元の記録）
 *   4. remoteCommits… GitHub（リモートの記録）
 *
 * window.GitSimulator として公開します。
 * UI(app.js)は run(コマンド文字列) を呼び、戻り値のログを表示し、
 * getState() で4エリアを再描画します。
 * ===================================================================== */

window.GitSimulator = (function () {
  "use strict";

  // 状態を保持する内部オブジェクト
  var state;

  // 7桁のランダムなコミットIDっぽい文字列を作る
  function shortHash() {
    return Math.random().toString(16).slice(2, 9);
  }

  // 初期状態を作る（リセット時にも使う）
  function makeInitialState() {
    return {
      branch: "main",
      branches: ["main"],
      // status: "modified"(変更) / "untracked"(新規) を持たせて表示を分ける
      workingDir: [
        { name: "index.html", status: "modified" },
        { name: "style.css", status: "untracked" }
      ],
      staging: [],
      localCommits: [{ id: shortHash(), message: "first commit" }],
      remoteCommits: [], // 最初はまだpushしていない想定
      // pull用: リモートにだけある未取り込みコミット
      incomingCommits: []
    };
  }

  function reset() {
    state = makeInitialState();
    // 1つ目のコミットはリモートにも存在する状態にしておく（pushの差分を分かりやすく）
    state.remoteCommits = state.localCommits.slice();
  }

  // 現在の状態のコピーを返す（UI側で安全に読めるように）
  function getState() {
    return JSON.parse(JSON.stringify(state));
  }

  // ---- ログ生成ヘルパー -------------------------------------------------
  // run() は { ok, lines } を返す。lines は表示する行の配列。
  function ok(lines) {
    return { ok: true, lines: Array.isArray(lines) ? lines : [lines] };
  }
  function err(lines) {
    return { ok: false, lines: Array.isArray(lines) ? lines : [lines] };
  }

  // ---- 各コマンドの処理 -------------------------------------------------

  function cmdStatus() {
    var lines = ["On branch " + state.branch];
    if (state.staging.length) {
      lines.push("Changes to be committed: (ステージ済み)");
      state.staging.forEach(function (f) {
        lines.push("    " + (f.status === "untracked" ? "new file:   " : "modified:   ") + f.name);
      });
    }
    var changed = state.workingDir.filter(function (f) { return f.status === "modified"; });
    var untracked = state.workingDir.filter(function (f) { return f.status === "untracked"; });
    if (changed.length) {
      lines.push("Changes not staged for commit: (未ステージの変更)");
      changed.forEach(function (f) { lines.push("    modified:   " + f.name); });
    }
    if (untracked.length) {
      lines.push("Untracked files: (未追跡の新規ファイル)");
      untracked.forEach(function (f) { lines.push("    " + f.name); });
    }
    if (!state.staging.length && !state.workingDir.length) {
      lines.push("nothing to commit, working tree clean");
    }
    return ok(lines);
  }

  function cmdAddAll() {
    if (!state.workingDir.length) {
      return ok("追加する変更はありません（作業フォルダは空です）。");
    }
    // 作業フォルダの全ファイルをステージングへ移動
    state.workingDir.forEach(function (f) { state.staging.push(f); });
    var count = state.workingDir.length;
    state.workingDir = [];
    return ok(count + " 件のファイルをステージングに追加しました。");
  }

  function cmdAddFile(name) {
    var idx = -1;
    for (var i = 0; i < state.workingDir.length; i++) {
      if (state.workingDir[i].name === name) { idx = i; break; }
    }
    if (idx === -1) {
      return err("fatal: '" + name + "' は作業フォルダに見つかりません（変更なし or 名前ミス）。");
    }
    var f = state.workingDir.splice(idx, 1)[0];
    state.staging.push(f);
    return ok("'" + name + "' をステージングに追加しました。");
  }

  function cmdCommit(message) {
    if (!message) {
      return err('メッセージが必要です: git commit -m "内容"');
    }
    if (!state.staging.length) {
      return err("nothing to commit（ステージングが空です。先に git add してください）。");
    }
    var id = shortHash();
    state.localCommits.push({ id: id, message: message });
    var n = state.staging.length;
    state.staging = []; // ステージングを空にして記録へ
    return ok([
      "[" + state.branch + " " + id + "] " + message,
      " " + n + " 件のファイルを記録しました。"
    ]);
  }

  function cmdPush() {
    // ローカルにあってリモートに無いコミットを送る
    var remoteIds = state.remoteCommits.map(function (c) { return c.id; });
    var toPush = state.localCommits.filter(function (c) {
      return remoteIds.indexOf(c.id) === -1;
    });
    if (!toPush.length) {
      return ok("Everything up-to-date（送る変更はありません）。");
    }
    toPush.forEach(function (c) { state.remoteCommits.push(c); });
    return ok([
      "To github.com:user/repo.git",
      "   " + toPush.length + " 件のコミットを GitHub に送信しました。"
    ]);
  }

  function cmdPull() {
    if (!state.incomingCommits.length) {
      return ok("Already up to date（取り込む変更はありません）。");
    }
    // リモートの未取り込みコミットをローカルとリモートに反映
    state.incomingCommits.forEach(function (c) {
      state.localCommits.push(c);
      state.remoteCommits.push(c);
    });
    var n = state.incomingCommits.length;
    state.incomingCommits = [];
    return ok([
      "Updating ...",
      "Fast-forward",
      " " + n + " 件の変更を GitHub から取り込みました。"
    ]);
  }

  function cmdRestoreFile(name) {
    var idx = -1;
    for (var i = 0; i < state.workingDir.length; i++) {
      if (state.workingDir[i].name === name) { idx = i; break; }
    }
    if (idx === -1) {
      return err("'" + name + "' は作業フォルダに変更として見つかりません。");
    }
    state.workingDir.splice(idx, 1);
    return ok("'" + name + "' の変更を取り消しました（最後のコミットの状態に戻しました）。");
  }

  function cmdRestoreStaged(name) {
    var idx = -1;
    for (var i = 0; i < state.staging.length; i++) {
      if (state.staging[i].name === name) { idx = i; break; }
    }
    if (idx === -1) {
      return err("'" + name + "' はステージングに見つかりません。");
    }
    var f = state.staging.splice(idx, 1)[0];
    state.workingDir.push(f); // ステージから作業フォルダへ戻す（内容は保持）
    return ok("'" + name + "' をステージングから降ろしました（変更は作業フォルダに残ります）。");
  }

  function cmdBranchList() {
    var lines = state.branches.map(function (b) {
      return (b === state.branch ? "* " : "  ") + b;
    });
    return ok(lines);
  }

  function cmdBranchCreate(name) {
    if (state.branches.indexOf(name) !== -1) {
      return err("fatal: ブランチ '" + name + "' は既に存在します。");
    }
    state.branches.push(name);
    return ok("ブランチ '" + name + "' を作成しました（移動はしていません）。");
  }

  function cmdSwitch(name) {
    if (state.branches.indexOf(name) === -1) {
      return err("fatal: '" + name + "' というブランチはありません（-c で作成できます）。");
    }
    state.branch = name;
    return ok("Switched to branch '" + name + "'");
  }

  function cmdSwitchCreate(name) {
    if (state.branches.indexOf(name) !== -1) {
      return err("fatal: ブランチ '" + name + "' は既に存在します。");
    }
    state.branches.push(name);
    state.branch = name;
    return ok("Switched to a new branch '" + name + "'（作成して移動しました）。");
  }

  function cmdLog() {
    if (!state.localCommits.length) {
      return ok("（まだコミットがありません）");
    }
    // 新しい順に表示
    var lines = state.localCommits.slice().reverse().map(function (c) {
      return c.id + " " + c.message;
    });
    return ok(lines);
  }

  function cmdDiff() {
    var changed = state.workingDir.filter(function (f) { return f.status === "modified"; });
    if (!changed.length) {
      return ok("（ステージ前の変更はありません）");
    }
    var lines = [];
    changed.forEach(function (f) {
      lines.push("diff --git a/" + f.name + " b/" + f.name);
      lines.push("--- a/" + f.name);
      lines.push("+++ b/" + f.name);
      lines.push("+ （ここに変更内容が表示されます）");
    });
    return ok(lines);
  }

  function cmdRemote() {
    return ok([
      "origin  git@github.com:user/repo.git (fetch)",
      "origin  git@github.com:user/repo.git (push)"
    ]);
  }

  // ---- 学習デモ用の補助コマンド ----------------------------------------
  // 状況学習で「他の人がpushした」状況を再現するための内部コマンド
  function makeIncoming() {
    state.incomingCommits.push({ id: shortHash(), message: "他の人の変更" });
    return ok("（GitHub側に新しい変更が作られました。git pull で取り込めます）");
  }
  // 「ファイルを編集した」状況を再現する内部コマンド
  function makeChange() {
    var existing = state.workingDir.map(function (f) { return f.name; });
    if (existing.indexOf("app.js") === -1) {
      state.workingDir.push({ name: "app.js", status: "modified" });
      return ok("（app.js を編集しました。作業フォルダに変更が増えました）");
    }
    return ok("（すでに編集中のファイルがあります）");
  }

  // ---- コマンド文字列を解釈して実行する本体 ----------------------------
  function run(raw) {
    var input = String(raw || "").trim();
    if (!input) return err("コマンドを入力してください。");

    // 内部デモ用の特別コマンド
    if (input === "__remote_commit__") return makeIncoming();
    if (input === "__make_change__") return makeChange();

    // commit -m はメッセージに空白が入るので先に判定
    var commitMatch = input.match(/^git\s+commit\s+-m\s+["'](.*)["']\s*$/);
    if (commitMatch) return cmdCommit(commitMatch[1]);
    // クォート無しのcommit -m もある程度許容
    var commitMatch2 = input.match(/^git\s+commit\s+-m\s+(.+)$/);
    if (commitMatch2) return cmdCommit(commitMatch2[1].replace(/^["']|["']$/g, ""));

    var parts = input.split(/\s+/);
    if (parts[0] !== "git") {
      return err("'git' で始まるコマンドを入力してください。");
    }

    var sub = parts[1];
    switch (sub) {
      case "status":
        return cmdStatus();
      case "add":
        if (parts[2] === ".") return cmdAddAll();
        if (parts[2]) return cmdAddFile(parts[2]);
        return err("追加するファイルを指定してください（例: git add . ）。");
      case "push":
        return cmdPush();
      case "pull":
        return cmdPull();
      case "restore":
        if (parts[2] === "--staged" && parts[3]) return cmdRestoreStaged(parts[3]);
        if (parts[2] === "--staged") return err("ファイル名を指定してください。");
        if (parts[2]) return cmdRestoreFile(parts[2]);
        return err("戻すファイルを指定してください。");
      case "branch":
        if (parts[2]) return cmdBranchCreate(parts[2]);
        return cmdBranchList();
      case "switch":
        if (parts[2] === "-c" && parts[3]) return cmdSwitchCreate(parts[3]);
        if (parts[2] === "-c") return err("新しいブランチ名を指定してください。");
        if (parts[2]) return cmdSwitch(parts[2]);
        return err("移動先のブランチ名を指定してください。");
      case "log":
        return cmdLog();
      case "diff":
        return cmdDiff();
      case "remote":
        return cmdRemote();
      case "commit":
        return err('メッセージが必要です: git commit -m "内容"');
      default:
        return err("このシミュレーターは '" + sub + "' に未対応です。");
    }
  }

  // 初期化して公開
  reset();
  return {
    run: run,
    reset: reset,
    getState: getState,
    makeIncoming: makeIncoming,
    makeChange: makeChange
  };
})();
