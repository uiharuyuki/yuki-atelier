/* =====================================================================
 * app.js
 * ---------------------------------------------------------------------
 * 画面（UI）の制御を担当します。
 *  - ビューの切り替え（ホーム / 状況 / コマンド / シミュレーター / クイズ）
 *  - 各ビューのHTML生成
 *  - 4つの状態エリアの描画（共通部品）
 *  - simulator.js / quiz.js / lessons.js を呼び出して連携
 *
 * データは window.GVT_DATA、状態は window.GitSimulator、
 * 進捗は window.GVT_Quiz に分けてあります（このファイルは表示専門）。
 * ===================================================================== */

(function () {
  "use strict";

  var DATA = window.GVT_DATA;
  var SIM = window.GitSimulator;
  var QUIZ = window.GVT_Quiz;

  // よく使うDOM取得の短縮
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") node.className = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") {
          node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  // HTMLエスケープ（ユーザー入力をターミナルに出すとき用）
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  // SVG スプライトからアイコン要素を作る
  // 例: svgIcon("ic-warn", "ui-icon-inline")
  function svgIcon(name, extraClass) {
    var svgNS = "http://www.w3.org/2000/svg";
    var xlinkNS = "http://www.w3.org/1999/xlink";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "ui-icon" + (extraClass ? " " + extraClass : ""));
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS(svgNS, "use");
    use.setAttributeNS(xlinkNS, "xlink:href", "../assets/icons/ui-icons.svg#" + name);
    use.setAttribute("href", "../assets/icons/ui-icons.svg#" + name);
    svg.appendChild(use);
    return svg;
  }

  /* ===================================================================
   * 共通部品: 4つの状態エリアを描画する
   * stateオブジェクト（SIM.getState()の戻り値）を受け取り、
   * 作業フォルダ / ステージング / ローカル / GitHub を並べて表示します。
   * =================================================================== */
  function renderStateAreas(state) {
    var areas = el("div", { class: "state-areas", role: "group", "aria-label": "Gitの4つの状態エリア" });

    // 1. 作業フォルダ
    areas.appendChild(stateColumn(
      "作業フォルダ", "あなたが編集する場所", "area-working",
      state.workingDir.map(function (f) {
        return fileCard(f.name, f.status === "untracked" ? "新規" : "変更", f.status);
      }),
      "ここのファイルを編集します"
    ));
    areas.appendChild(arrow("git add"));

    // 2. ステージング
    areas.appendChild(stateColumn(
      "ステージング", "次のコミットに含める準備", "area-staging",
      state.staging.map(function (f) {
        return fileCard(f.name, "準備中", "staged");
      }),
      "コミット対象の控え室"
    ));
    areas.appendChild(arrow("git commit"));

    // 3. ローカルリポジトリ
    areas.appendChild(stateColumn(
      "ローカルリポジトリ", "手元の記録（コミット）", "area-local",
      state.localCommits.slice().reverse().map(function (c) {
        return commitCard(c.id, c.message);
      }),
      "現在のブランチ: " + state.branch
    ));
    areas.appendChild(arrow("git push ↑ / git pull ↓"));

    // 4. GitHub
    var githubCards = state.remoteCommits.slice().reverse().map(function (c) {
      return commitCard(c.id, c.message);
    });
    if (state.incomingCommits && state.incomingCommits.length) {
      state.incomingCommits.forEach(function (c) {
        githubCards.unshift(commitCard(c.id, c.message + "（未取り込み）", true));
      });
    }
    areas.appendChild(stateColumn(
      "GitHub", "みんなで共有する場所", "area-github",
      githubCards,
      "リモート: origin"
    ));

    return areas;
  }

  function stateColumn(title, subtitle, cls, cards, emptyNote) {
    var body = el("div", { class: "area-body" });
    if (cards.length) {
      cards.forEach(function (c) { body.appendChild(c); });
    } else {
      body.appendChild(el("p", { class: "area-empty", text: "（空）" }));
    }
    return el("div", { class: "state-col " + cls }, [
      el("div", { class: "area-head" }, [
        el("h3", { class: "area-title", text: title }),
        el("p", { class: "area-sub", text: subtitle })
      ]),
      body,
      el("p", { class: "area-note", text: emptyNote })
    ]);
  }

  function fileCard(name, label, kind) {
    return el("div", { class: "card file-card kind-" + kind }, [
      el("span", { class: "card-icon", "aria-hidden": "true" }, [svgIcon("ic-page")]),
      el("span", { class: "card-name", text: name }),
      el("span", { class: "card-tag", text: label })
    ]);
  }

  function commitCard(id, message, incoming) {
    return el("div", { class: "card commit-card" + (incoming ? " incoming" : "") }, [
      el("span", { class: "card-icon", "aria-hidden": "true" }, [svgIcon("ic-dot")]),
      el("span", { class: "commit-id", text: id }),
      el("span", { class: "card-name", text: message })
    ]);
  }

  function arrow(label) {
    return el("div", { class: "area-arrow", "aria-hidden": "true" }, [
      el("span", { class: "arrow-glyph", text: "→" }),
      el("span", { class: "arrow-label", text: label })
    ]);
  }

  /* ===================================================================
   * ビュー: ホーム
   * =================================================================== */
  function renderHome() {
    var view = $("#view-home");
    view.innerHTML = "";
    var s = QUIZ.getSummary();

    view.appendChild(el("div", { class: "hero" }, [
      el("h1", { id: "home-title", class: "hero-title", text: "Gitを“暗記”ではなく“状態の変化”で学ぶ" }),
      el("p", { class: "hero-lead", text: "git add / commit / push などのコマンドが、作業フォルダ・ステージング・ローカルリポジトリ・GitHubをどう動かすのか。カードの移動として目で見て理解できる学習サイトです。" }),
      el("div", { class: "hero-actions" }, [
        navButton("状況から学ぶ", "situations", "primary"),
        navButton("コマンドから学ぶ", "commands"),
        navButton("シミュレーター", "simulator"),
        navButton("クイズで復習", "quiz")
      ])
    ]));

    // 進捗サマリー
    view.appendChild(progressPanel(s));

    // 3つの入口の説明
    var cards = el("div", { class: "entry-grid" });
    [
      { v: "situations", icon: "ic-compass", t: "状況から学ぶ", d: "「変更を保存したい」など“やりたいこと”から、使うコマンドと状態変化を学びます。" },
      { v: "commands", icon: "ic-book", t: "コマンドから学ぶ", d: "各コマンドの意味・使う場面・注意点・よくある勘違いを確認し、デモで動きを見ます。" },
      { v: "quiz", icon: "ic-memo", t: "クイズで復習", d: "選択式クイズで理解度を確認。間違えた問題は自動で復習リストに保存されます。" }
    ].forEach(function (e) {
      cards.appendChild(el("button", { class: "entry-card", "data-view": e.v }, [
        el("span", { class: "entry-icon", "aria-hidden": "true" }, [svgIcon(e.icon)]),
        el("h2", { class: "entry-title", text: e.t }),
        el("p", { class: "entry-desc", text: e.d })
      ]));
    });
    view.appendChild(el("section", { class: "home-section" }, [
      el("h2", { class: "section-title", text: "3つの学び方" }), cards
    ]));

    // ブランチ解説ページへの導線（別ページ branch.html）
    view.appendChild(el("a", { class: "branch-banner", href: "branch.html" }, [
      el("span", { class: "branch-banner-icon", "aria-hidden": "true" }, [svgIcon("ic-leaf")]),
      el("span", {}, [
        el("strong", { text: "ブランチを学ぶ（解説ページ）" }),
        el("span", { class: "branch-banner-sub", text: "main と作業ブランチの違い・分岐と合流のしくみを図解で確認できます。" })
      ]),
      el("span", { class: "branch-banner-arrow", "aria-hidden": "true", text: "→" })
    ]));

    // 4エリアの概念図（静的な説明）
    view.appendChild(el("section", { class: "home-section" }, [
      el("h2", { class: "section-title", text: "覚えるのは“4つの場所”の動きだけ" }),
      el("p", { class: "section-lead", text: "Gitはこの4つの場所の間でファイルやコミットを動かしているだけ、と考えると一気に分かりやすくなります。" }),
      renderStateAreas(SIM.getState())
    ]));
  }

  function navButton(label, view, variant) {
    return el("button", {
      class: "btn " + (variant === "primary" ? "btn-primary" : "btn-ghost"),
      "data-view": view, text: label
    });
  }

  function progressPanel(s) {
    function stat(num, label) {
      return el("div", { class: "stat" }, [
        el("span", { class: "stat-num", text: String(num) }),
        el("span", { class: "stat-label", text: label })
      ]);
    }
    return el("section", { class: "progress-panel", "aria-label": "学習の進捗" }, [
      el("h2", { class: "section-title", text: "あなたの進捗" }),
      el("div", { class: "stat-row" }, [
        stat(s.learnedCount + " / " + s.totalCommands, "学習済みコマンド"),
        stat(s.correctRate + "%", "クイズ正答率"),
        stat(s.reviewCount, "復習が必要")
      ]),
      el("p", { class: "muted small", text: "進捗はこのブラウザ（localStorage）に保存されます。" })
    ]);
  }

  /* ===================================================================
   * ビュー: 状況から学ぶ
   * =================================================================== */
  function renderSituations() {
    var view = $("#view-situations");
    view.innerHTML = "";
    view.appendChild(el("h1", { id: "situations-title", class: "view-title", text: "状況から学ぶ" }));
    view.appendChild(el("p", { class: "view-lead", text: "「今こうしたい」という気持ちを選ぶと、使うべきコマンド・理由・状態の変化が分かります。" }));

    var grid = el("div", { class: "situation-grid" });
    DATA.SITUATIONS.forEach(function (sit) {
      grid.appendChild(el("button", {
        class: "situation-card", "data-sit": sit.id, "aria-haspopup": "true"
      }, [
        el("span", { class: "situation-icon", "aria-hidden": "true" }, [svgIcon(sit.icon)]),
        el("span", { class: "situation-title", text: sit.title }),
        el("span", { class: "situation-desc", text: sit.desc })
      ]));
    });
    view.appendChild(grid);

    // 詳細表示エリア
    view.appendChild(el("div", { id: "situation-detail", class: "detail-panel", "aria-live": "polite" }));
  }

  function showSituationDetail(id) {
    var sit = DATA.SITUATIONS.filter(function (x) { return x.id === id; })[0];
    if (!sit) return;
    var panel = $("#situation-detail");
    panel.innerHTML = "";

    var cmdList = el("ul", { class: "cmd-pill-list" });
    sit.commands.forEach(function (c) {
      cmdList.appendChild(el("li", {}, [el("code", { class: "cmd-pill", text: c })]));
    });

    panel.appendChild(el("div", { class: "detail-card" }, [
      el("h2", { class: "detail-title" }, [
        el("span", { class: "detail-title-icon", "aria-hidden": "true" }, [svgIcon(sit.icon)]),
        " ", sit.title
      ]),
      labeledBlock("使うコマンド", cmdList),
      labeledBlock("なぜ？", el("p", { text: sit.reason })),
      labeledBlock("状態はこう変わる", el("p", { text: sit.change })),
      el("button", { class: "btn btn-primary", onClick: function () { runSituationDemo(sit); } }, ["シミュレーターで動きを見る"]),
      el("div", { id: "situation-demo", class: "demo-stage" })
    ]));
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // 状況デモ: シミュレーターをリセットし、手順を順に実行して状態を見せる
  function runSituationDemo(sit) {
    SIM.reset();
    var stage = $("#situation-demo");
    stage.innerHTML = "";
    var termLines = [];

    sit.demo.forEach(function (cmd) {
      var res = SIM.run(cmd);
      if (cmd.indexOf("__") !== 0) termLines.push("$ " + cmd);
      res.lines.forEach(function (l) { termLines.push(l); });
    });

    stage.appendChild(el("div", { class: "mini-terminal" },
      termLines.map(function (l) {
        var line = el("div", { class: "term-line" });
        line.innerHTML = l.indexOf("$ ") === 0
          ? '<span class="term-prompt">' + esc(l) + "</span>"
          : esc(l);
        return line;
      })
    ));
    stage.appendChild(renderStateAreas(SIM.getState()));
  }

  /* ===================================================================
   * ビュー: コマンドから学ぶ
   * =================================================================== */
  function renderCommands() {
    var view = $("#view-commands");
    view.innerHTML = "";
    view.appendChild(el("h1", { id: "commands-title", class: "view-title", text: "コマンドから学ぶ" }));
    view.appendChild(el("p", { class: "view-lead", text: "カードを選ぶと、意味・使う場面・注意点・よくある勘違い、そしてデモを確認できます。開いたコマンドは「学習済み」として記録されます。" }));

    var learned = QUIZ.load().learnedCommands;
    var grid = el("div", { class: "command-grid" });
    DATA.COMMANDS.forEach(function (cmd) {
      var isLearned = learned.indexOf(cmd.id) !== -1;
      grid.appendChild(el("button", { class: "command-card", "data-cmd": cmd.id }, [
        el("code", { class: "command-name", text: cmd.name }),
        el("span", { class: "command-area", text: cmd.area }),
        el("p", { class: "command-meaning", text: cmd.meaning }),
        isLearned ? el("span", { class: "learned-badge" }, [svgIcon("ic-check"), "学習済み"]) : null
      ]));
    });
    view.appendChild(grid);
    view.appendChild(el("div", { id: "command-detail", class: "detail-panel", "aria-live": "polite" }));
  }

  function showCommandDetail(id) {
    var cmd = DATA.COMMANDS.filter(function (x) { return x.id === id; })[0];
    if (!cmd) return;
    QUIZ.markLearned(cmd.id); // 開いたら学習済みに

    var panel = $("#command-detail");
    panel.innerHTML = "";
    panel.appendChild(el("div", { class: "detail-card" }, [
      el("h2", {}, [el("code", { class: "detail-cmd-name", text: cmd.name })]),
      labeledBlock("ひとことで言うと", el("p", { text: cmd.meaning })),
      labeledBlock("使う場面", el("p", { text: cmd.when })),
      labeledBlock("注意点", el("p", { text: cmd.caution })),
      labeledBlock("よくある勘違い", el("p", { class: "myth", text: cmd.myth }), "ic-warn"),
      el("button", { class: "btn btn-primary", onClick: function () { runCommandDemo(cmd); } }, ["このコマンドのデモを見る"]),
      el("div", { id: "command-demo", class: "demo-stage" })
    ]));

    // バッジ更新のため一覧を再描画（ただし詳細は残す）
    refreshLearnedBadges();
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function runCommandDemo(cmd) {
    SIM.reset();
    // pushのデモは事前にcommitが必要なので軽く準備する
    var prep = [];
    if (cmd.id === "push") prep = ["git add .", 'git commit -m "デモ用コミット"'];
    if (cmd.id === "pull") prep = ["__remote_commit__"];
    if (cmd.id === "commit") prep = ["git add ."];
    if (cmd.id === "restore-staged") prep = ["git add ."];
    if (cmd.id === "log") prep = ["git add .", 'git commit -m "デモ用コミット"'];

    var stage = $("#command-demo");
    stage.innerHTML = "";
    var termLines = [];
    prep.concat([cmd.demo]).forEach(function (c) {
      var res = SIM.run(c);
      if (c.indexOf("__") !== 0) termLines.push("$ " + c);
      res.lines.forEach(function (l) { termLines.push(l); });
    });

    stage.appendChild(el("div", { class: "mini-terminal" },
      termLines.map(function (l) {
        var line = el("div", { class: "term-line" });
        line.innerHTML = l.indexOf("$ ") === 0
          ? '<span class="term-prompt">' + esc(l) + "</span>"
          : esc(l);
        return line;
      })
    ));
    stage.appendChild(renderStateAreas(SIM.getState()));
  }

  function refreshLearnedBadges() {
    var learned = QUIZ.load().learnedCommands;
    var cards = document.querySelectorAll("#view-commands .command-card");
    cards.forEach(function (card) {
      var id = card.getAttribute("data-cmd");
      if (learned.indexOf(id) !== -1 && !card.querySelector(".learned-badge")) {
        card.appendChild(el("span", { class: "learned-badge" }, [svgIcon("ic-check"), "学習済み"]));
      }
    });
  }

  function labeledBlock(label, contentNode, iconName) {
    var labelChildren = iconName
      ? [svgIcon(iconName, "ui-icon-inline"), " " + label]
      : [label];
    return el("div", { class: "detail-block" }, [
      el("h3", { class: "detail-label" }, labelChildren),
      contentNode
    ]);
  }

  /* ===================================================================
   * ビュー: シミュレーター
   * =================================================================== */
  // ボタンで実行できるコマンドのプリセット
  var SIM_BUTTONS = [
    "git status", "git add .", "git add index.html",
    'git commit -m "変更を保存"', "git push", "git pull",
    "git restore style.css", "git restore --staged index.html",
    "git branch", "git switch -c feature", "git switch main",
    "git log --oneline", "git diff", "git remote -v"
  ];

  function renderSimulator() {
    var view = $("#view-simulator");
    view.innerHTML = "";
    view.appendChild(el("h1", { id: "simulator-title", class: "view-title", text: "シミュレーター" }));
    view.appendChild(el("p", { class: "view-lead", text: "ボタンか入力でコマンドを実行すると、ターミナルにログが出て、下の4つのエリアが変化します。本物のGitは動きません。安心して何度でも試せます。" }));

    // 補助シナリオ（状況づくり）ボタン
    var helpers = el("div", { class: "helper-row" }, [
      el("button", { class: "btn btn-ghost btn-sm", onClick: function () { simExec("__make_change__"); } }, ["＋ ファイルを編集する"]),
      el("button", { class: "btn btn-ghost btn-sm", onClick: function () { simExec("__remote_commit__"); } }, ["＋ GitHubに変更が来た状況"]),
      el("button", { class: "btn btn-ghost btn-sm", onClick: function () { SIM.reset(); refreshSimulatorView(); appendTerm("（リセットしました）", "info"); } }, ["↻ リセット"])
    ]);
    view.appendChild(helpers);

    // コマンドボタン群
    var btnGrid = el("div", { class: "sim-btn-grid", role: "group", "aria-label": "実行するコマンド" });
    SIM_BUTTONS.forEach(function (c) {
      btnGrid.appendChild(el("button", { class: "sim-cmd-btn", onClick: function () { simExec(c); } }, [
        el("code", { text: c })
      ]));
    });
    view.appendChild(btnGrid);

    // 自由入力
    var form = el("form", { class: "sim-form", onSubmit: function (e) {
      e.preventDefault();
      var input = $("#simInput");
      if (input.value.trim()) { simExec(input.value.trim()); input.value = ""; }
    }});
    form.appendChild(el("label", { class: "sr-only", for: "simInput", text: "コマンドを入力" }));
    form.appendChild(el("input", { id: "simInput", class: "sim-input", type: "text", placeholder: "例: git add .  /  git commit -m \"msg\"", autocomplete: "off", "aria-label": "Gitコマンドを入力" }));
    form.appendChild(el("button", { class: "btn btn-primary", type: "submit" }, ["実行"]));
    view.appendChild(form);

    // ターミナル
    view.appendChild(el("div", { class: "terminal", id: "terminal", role: "log", "aria-live": "polite", "aria-label": "ターミナル出力" }, [
      el("div", { class: "term-line term-info", text: "Git Visual Trainer — 学習用ターミナル（疑似）" }),
      el("div", { class: "term-line term-info", text: "上のボタンを押すか、コマンドを入力してください。" })
    ]));

    // 状態エリア
    view.appendChild(el("h2", { class: "section-title", text: "今のGitの状態" }));
    view.appendChild(el("div", { id: "sim-state" }));
    refreshSimulatorView();
  }

  function simExec(cmd) {
    var res = SIM.run(cmd);
    if (cmd.indexOf("__") !== 0) appendTerm("$ " + cmd, "prompt");
    res.lines.forEach(function (l) { appendTerm(l, res.ok ? "out" : "err"); });
    refreshSimulatorView();
  }

  function appendTerm(text, kind) {
    var term = $("#terminal");
    if (!term) return;
    var line = el("div", { class: "term-line term-" + (kind || "out") });
    if (kind === "prompt") {
      line.innerHTML = '<span class="term-prompt">' + esc(text) + "</span>";
    } else {
      line.textContent = text;
    }
    term.appendChild(line);
    term.scrollTop = term.scrollHeight;
  }

  function refreshSimulatorView() {
    var holder = $("#sim-state");
    if (!holder) return;
    holder.innerHTML = "";
    holder.appendChild(renderStateAreas(SIM.getState()));
  }

  /* ===================================================================
   * ビュー: クイズ / 復習
   * =================================================================== */
  var quizState = { pool: [], index: 0, mode: "all" };

  function renderQuiz() {
    var view = $("#view-quiz");
    view.innerHTML = "";
    view.appendChild(el("h1", { id: "quiz-title", class: "view-title", text: "クイズで復習" }));
    view.appendChild(el("p", { class: "view-lead", text: "選択式のクイズで理解度をチェック。間違えた問題は自動で復習リストに保存され、あとからまとめて解き直せます。" }));

    var s = QUIZ.getSummary();
    view.appendChild(progressPanel(s));

    view.appendChild(el("div", { class: "quiz-mode-row" }, [
      el("button", { class: "btn btn-primary", onClick: function () { startQuiz("all"); } }, ["全問にチャレンジ"]),
      el("button", { class: "btn btn-ghost", onClick: function () { startQuiz("review"); } }, ["復習だけ解く（" + s.reviewCount + "問）"]),
      el("button", { class: "btn btn-ghost btn-sm", onClick: function () {
        if (confirm("学習の進捗（学習済み・正答数・復習リスト）をすべて消します。よろしいですか？")) {
          QUIZ.resetProgress(); renderQuiz();
        }
      }}, ["進捗をリセット"])
    ]));

    view.appendChild(el("div", { id: "quiz-stage", class: "quiz-stage", "aria-live": "polite" }));
  }

  function startQuiz(mode) {
    quizState.mode = mode;
    quizState.index = 0;
    if (mode === "review") {
      quizState.pool = QUIZ.getReviewQuestions();
      if (!quizState.pool.length) {
        $("#quiz-stage").innerHTML = "";
        $("#quiz-stage").appendChild(el("p", { class: "quiz-empty", text: "復習対象の問題はありません。まずは全問にチャレンジしてみましょう。" }));
        return;
      }
    } else {
      quizState.pool = DATA.QUIZ.slice();
    }
    showQuestion();
  }

  function showQuestion() {
    var stage = $("#quiz-stage");
    stage.innerHTML = "";
    var q = quizState.pool[quizState.index];

    var card = el("div", { class: "quiz-card" });
    card.appendChild(el("p", { class: "quiz-counter", text: "第 " + (quizState.index + 1) + " 問 / " + quizState.pool.length + " 問" }));
    card.appendChild(el("h2", { class: "quiz-question", text: q.q }));

    var choices = el("div", { class: "quiz-choices", role: "group", "aria-label": "選択肢" });
    q.choices.forEach(function (choice, i) {
      choices.appendChild(el("button", {
        class: "quiz-choice", "data-i": String(i),
        onClick: function () { onAnswer(q, i, card); }
      }, [el("code", { text: choice })]));
    });
    card.appendChild(choices);
    card.appendChild(el("div", { class: "quiz-feedback", id: "quiz-feedback" }));
    stage.appendChild(card);
  }

  function onAnswer(q, choiceIndex, card) {
    var result = QUIZ.answer(q.id, choiceIndex);
    var buttons = card.querySelectorAll(".quiz-choice");
    buttons.forEach(function (b, i) {
      b.disabled = true;
      if (i === result.answerIndex) b.classList.add("correct");
      if (i === choiceIndex && !result.correct) b.classList.add("wrong");
    });

    var fb = $("#quiz-feedback", card);
    fb.innerHTML = "";
    fb.appendChild(el("p", { class: "fb-result " + (result.correct ? "ok" : "ng"),
      text: result.correct ? "正解！" : "残念… 復習リストに追加しました。" }));
    fb.appendChild(el("p", { class: "fb-explain", text: result.explain }));

    var isLast = quizState.index >= quizState.pool.length - 1;
    fb.appendChild(el("button", { class: "btn btn-primary", onClick: function () {
      if (isLast) { finishQuiz(); }
      else { quizState.index += 1; showQuestion(); }
    }}, [isLast ? "結果を見る" : "次の問題へ"]));
  }

  function finishQuiz() {
    var stage = $("#quiz-stage");
    stage.innerHTML = "";
    var s = QUIZ.getSummary();
    stage.appendChild(el("div", { class: "quiz-card" }, [
      el("h2", { class: "quiz-question", text: "おつかれさまでした！" }),
      el("p", { text: "今の正答率は " + s.correctRate + "%、復習が必要な問題は " + s.reviewCount + " 問です。" }),
      el("div", { class: "quiz-mode-row" }, [
        el("button", { class: "btn btn-primary", onClick: function () { startQuiz("all"); } }, ["もう一度（全問）"]),
        s.reviewCount ? el("button", { class: "btn btn-ghost", onClick: function () { startQuiz("review"); } }, ["復習だけ解く"]) : null,
        el("button", { class: "btn btn-ghost", onClick: function () { renderQuiz(); } }, ["クイズトップへ"])
      ])
    ]));
    // 進捗パネルを最新化するためトップも更新
    refreshProgressPanels();
  }

  // 画面内のすべての進捗パネルを更新（ホーム/クイズ共通）
  function refreshProgressPanels() {
    var s = QUIZ.getSummary();
    document.querySelectorAll(".progress-panel").forEach(function (panel) {
      var fresh = progressPanel(s);
      panel.replaceWith(fresh);
    });
  }

  /* ===================================================================
   * ルーティング: ビューの切り替え
   * =================================================================== */
  var VIEWS = ["home", "situations", "commands", "simulator", "quiz"];

  function showView(name) {
    if (VIEWS.indexOf(name) === -1) name = "home";
    VIEWS.forEach(function (v) {
      var sec = document.getElementById("view-" + v);
      if (sec) sec.hidden = (v !== name);
    });
    // ナビのアクティブ表示
    document.querySelectorAll(".nav-link").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-view") === name);
    });

    // 各ビューを描画（毎回作り直して進捗を反映）
    if (name === "home") renderHome();
    else if (name === "situations") renderSituations();
    else if (name === "commands") renderCommands();
    else if (name === "simulator") renderSimulator();
    else if (name === "quiz") renderQuiz();

    // フォーカスを移してアクセシビリティ向上
    var main = $("#app");
    if (main) main.focus();
    // メニューを閉じる（モバイル）
    closeNav();
    window.scrollTo({ top: 0, behavior: "smooth" });

    // ハッシュ更新（戻る/進むに対応）
    if (location.hash !== "#" + name) {
      history.replaceState(null, "", "#" + name);
    }
  }

  function closeNav() {
    var nav = $("#primaryNav");
    var toggle = $("#navToggle");
    if (nav) nav.classList.remove("open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  /* ===================================================================
   * イベント登録（イベント委譲でまとめて処理）
   * =================================================================== */
  function bindEvents() {
    // data-view を持つ要素のクリックでビュー切り替え
    document.addEventListener("click", function (e) {
      var viewBtn = e.target.closest("[data-view]");
      if (viewBtn) { e.preventDefault(); showView(viewBtn.getAttribute("data-view")); return; }

      var sitBtn = e.target.closest("[data-sit]");
      if (sitBtn) { showSituationDetail(sitBtn.getAttribute("data-sit")); return; }

      var cmdBtn = e.target.closest("[data-cmd]");
      if (cmdBtn) { showCommandDetail(cmdBtn.getAttribute("data-cmd")); return; }
    });

    // モバイルメニューの開閉
    var toggle = $("#navToggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var nav = $("#primaryNav");
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }

    // ブラウザの戻る/進む
    window.addEventListener("hashchange", function () {
      var name = location.hash.replace(/^#/, "") || "home";
      showView(name);
    });
  }

  /* ===================================================================
   * 起動
   * =================================================================== */
  document.addEventListener("DOMContentLoaded", function () {
    bindEvents();
    var initial = location.hash.replace(/^#/, "") || "home";
    showView(initial);
  });
})();
