/* =====================================================================
 * lessons.js
 * ---------------------------------------------------------------------
 * 学習データをまとめたファイルです。
 * ここを編集するだけで「コマンド」「状況」「クイズ」の中身を増やせます。
 * 他のJSファイル(app/simulator/quiz)はこのデータを読み込んで表示します。
 *
 * window.GVT_DATA という1つのオブジェクトに格納して公開しています。
 * （バニラJSなので import/export は使わず、グローバル変数で共有します）
 * ===================================================================== */

window.GVT_DATA = {

  /* -------------------------------------------------------------------
   * COMMANDS: 「コマンドから学ぶ」モードで使うデータ
   * id        … 内部識別子（進捗保存のキーにもなる）
   * name      … 表示するコマンド
   * area      … 主に関係する状態エリア（バッジ表示用）
   * meaning   … ひとことで言うと？
   * when      … どんな場面で使う？
   * caution   … 注意点
   * myth      … よくある勘違い
   * demo      … シミュレーターに送って状態変化を見せるコマンド文字列
   * ----------------------------------------------------------------- */
  COMMANDS: [
    {
      id: "status",
      name: "git status",
      area: "確認",
      meaning: "今どのファイルが変更・ステージされているかを表示します。",
      when: "迷ったらまず実行。今の状態を確認したいとき。",
      caution: "状態を表示するだけで、何も変更しません。安全なコマンドです。",
      myth: "「statusで保存される」と思われがちですが、保存はしません。確認専用です。",
      demo: "git status"
    },
    {
      id: "add-all",
      name: "git add .",
      area: "ステージング",
      meaning: "変更したファイルを“まとめて”コミット対象（ステージング）に乗せます。",
      when: "変更した全ファイルを次のコミットに含めたいとき。",
      caution: "「.」は現在地以下すべてが対象。意図しないファイルまで乗ることがあります。",
      myth: "addはGitHubに送る操作ではありません。あくまで手元の準備です。",
      demo: "git add ."
    },
    {
      id: "add-file",
      name: "git add ファイル名",
      area: "ステージング",
      meaning: "指定した1つのファイルだけをコミット対象に乗せます。",
      when: "一部のファイルだけコミットしたいとき。",
      caution: "ファイル名のタイプミスに注意。存在しないと何も乗りません。",
      myth: "add後に再度ファイルを編集したら、その編集分はもう一度addが必要です。",
      demo: "git add index.html"
    },
    {
      id: "commit",
      name: 'git commit -m "メッセージ"',
      area: "ローカルリポジトリ",
      meaning: "ステージングの内容を1つの記録（コミット）としてローカルに保存します。",
      when: "区切りの良いところで変更を記録に残したいとき。",
      caution: "ステージングが空だとコミットできません。先にaddが必要です。",
      myth: "commitしてもGitHubには反映されません。手元に記録されるだけです。",
      demo: 'git commit -m "ボタンの色を変更"'
    },
    {
      id: "push",
      name: "git push",
      area: "GitHub",
      meaning: "ローカルのコミットをGitHub（リモート）へ送ります。",
      when: "手元の記録をGitHubに反映・共有したいとき。",
      caution: "リモートに先に新しい変更があると、先にpullが必要な場合があります。",
      myth: "push対象は“コミット済み”の内容だけ。コミットしていない変更は送られません。",
      demo: "git push"
    },
    {
      id: "pull",
      name: "git pull",
      area: "作業フォルダ",
      meaning: "GitHub上の新しい変更を取り込み、手元を最新にします。",
      when: "他の人の変更を取り込みたいとき。作業を始める前にも有効。",
      caution: "手元の未保存の変更とぶつかると“コンフリクト”が起きることがあります。",
      myth: "pullは取り込みであって送信ではありません。送るのはpushです。",
      demo: "git pull"
    },
    {
      id: "restore-file",
      name: "git restore ファイル名",
      area: "作業フォルダ",
      meaning: "作業フォルダの変更を取り消し、最後のコミットの状態に戻します。",
      when: "編集をなかったことにしたいとき。",
      caution: "戻すと変更内容は消えます。元に戻せないので慎重に。",
      myth: "ステージ済みの変更は戻せません。それには --staged を使います。",
      demo: "git restore style.css"
    },
    {
      id: "restore-staged",
      name: "git restore --staged ファイル名",
      area: "ステージング",
      meaning: "ステージングから降ろします（addの取り消し）。変更自体は残ります。",
      when: "間違えてaddしたファイルを、コミット対象から外したいとき。",
      caution: "降ろすだけで編集内容は消えません。作業フォルダに戻るだけです。",
      myth: "ファイルが消えるわけではありません。ステージから外れるだけです。",
      demo: "git restore --staged index.html"
    },
    {
      id: "branch",
      name: "git branch",
      area: "ローカルリポジトリ",
      meaning: "ブランチ（作業の枝分かれ）の一覧を表示します。",
      when: "今どんなブランチがあるか、どこにいるか確認したいとき。",
      caution: "一覧表示だけ。* が付いているのが今いるブランチです。",
      myth: "git branch 名前 で“作成”はできますが、移動はしません。移動はswitchです。",
      demo: "git branch"
    },
    {
      id: "switch",
      name: "git switch ブランチ名",
      area: "ローカルリポジトリ",
      meaning: "既存のブランチへ移動（切り替え）します。",
      when: "別の作業ラインに移りたいとき。",
      caution: "未コミットの変更があると切り替えできないことがあります。",
      myth: "switchは移動だけ。新規作成は -c を付けます。",
      demo: "git switch main"
    },
    {
      id: "switch-c",
      name: "git switch -c ブランチ名",
      area: "ローカルリポジトリ",
      meaning: "新しいブランチを作って、同時にそこへ移動します。",
      when: "新機能や試作を、今の状態から枝分かれして始めたいとき。",
      caution: "枝分かれ元は“今いるブランチ”。意図した場所から作りましょう。",
      myth: "-c は create（作成）の意味。付け忘れると既存ブランチへの移動扱いです。",
      demo: "git switch -c feature"
    },
    {
      id: "log",
      name: "git log --oneline",
      area: "ローカルリポジトリ",
      meaning: "コミットの履歴を1行ずつ短く表示します。",
      when: "これまでの記録をざっと振り返りたいとき。",
      caution: "表示だけで何も変更しません。安全に使えます。",
      myth: "ここに出るのはコミット済みのものだけ。未コミットの変更は出ません。",
      demo: "git log --oneline"
    },
    {
      id: "diff",
      name: "git diff",
      area: "確認",
      meaning: "まだステージしていない変更の中身（差分）を表示します。",
      when: "コミット前に「何を変えたか」を見たいとき。",
      caution: "標準のdiffはステージ前の変更が対象。ステージ済みは --staged で見ます。",
      myth: "diffは内容の確認だけ。変更を保存したり取り消したりはしません。",
      demo: "git diff"
    },
    {
      id: "remote",
      name: "git remote -v",
      area: "GitHub",
      meaning: "接続先のリモート（GitHubのURL）を表示します。",
      when: "どのリポジトリに push / pull するのか確認したいとき。",
      caution: "表示だけ。origin という名前が一般的な接続先の呼び名です。",
      myth: "remoteは設定の確認。これ自体は送受信しません。",
      demo: "git remote -v"
    }
  ],

  /* -------------------------------------------------------------------
   * SITUATIONS: 「状況から学ぶ」モードで使うデータ
   * 「こうしたい」という気持ちから、使うコマンドへ案内します。
   * commands … 関連コマンドの表示文字列（複数可）
   * reason   … なぜそのコマンドなのか
   * change   … 状態がどう変わるか（短い説明）
   * demo     … シミュレーターで再現する手順（コマンド配列）
   * ----------------------------------------------------------------- */
  SITUATIONS: [
    {
      id: "sit-changed",
      icon: "ic-pencil",
      title: "ファイルを変更した",
      desc: "編集したけど、今どうなってるか分からない。",
      commands: ["git status", "git diff"],
      reason: "まず今の状態を見れば、次に何をすべきか判断できます。",
      change: "作業フォルダに「変更あり」のファイルが見えます。状態は変わりません。",
      demo: ["git status"]
    },
    {
      id: "sit-save",
      icon: "ic-disk",
      title: "変更を保存したい",
      desc: "区切りが良いので記録に残したい。",
      commands: ["git add .", 'git commit -m "メッセージ"'],
      reason: "addでコミット対象を選び、commitで記録します。2段階なのがGitの特徴。",
      change: "作業フォルダ → ステージング → ローカルリポジトリへとファイルが移動します。",
      demo: ["git add .", 'git commit -m "変更を保存"']
    },
    {
      id: "sit-upload",
      icon: "ic-rocket",
      title: "GitHubにアップしたい",
      desc: "手元の記録を共有・バックアップしたい。",
      commands: ["git push"],
      reason: "コミット済みの内容をリモートへ送るのがpushです。",
      change: "ローカルリポジトリのコミットがGitHubにコピーされます。",
      demo: ["git add .", 'git commit -m "公開用に保存"', "git push"]
    },
    {
      id: "sit-download",
      icon: "ic-inbox",
      title: "GitHubの変更を取り込みたい",
      desc: "他の人の更新を手元に反映したい。",
      commands: ["git pull"],
      reason: "リモートの新しいコミットを取り込み、手元を最新にします。",
      change: "GitHubのコミットがローカルと作業フォルダに反映されます。",
      demo: ["__remote_commit__", "git pull"]
    },
    {
      id: "sit-unadd",
      icon: "ic-undo",
      title: "間違えてaddした",
      desc: "コミット対象に余計なファイルを入れてしまった。",
      commands: ["git restore --staged ファイル名"],
      reason: "ステージから降ろすだけ。編集内容は消えないので安心です。",
      change: "ステージングのファイルが作業フォルダに戻ります（内容はそのまま）。",
      demo: ["git add .", "git restore --staged index.html"]
    },
    {
      id: "sit-undo",
      icon: "ic-broom",
      title: "作業を取り消したい",
      desc: "編集をやめて、元の状態に戻したい。",
      commands: ["git restore ファイル名"],
      reason: "最後のコミットの状態へ戻します。変更は消えるので注意。",
      change: "作業フォルダの「変更あり」が消え、元の状態に戻ります。",
      demo: ["git restore style.css"]
    },
    {
      id: "sit-branch",
      icon: "ic-leaf",
      title: "ブランチを作りたい",
      desc: "今の状態を保ったまま、別の試作を始めたい。",
      commands: ["git switch -c ブランチ名"],
      reason: "枝分かれして作業すれば、元のブランチを汚さずに試せます。",
      change: "新しいブランチが作られ、今いる場所がそこへ切り替わります。",
      demo: ["git switch -c feature"]
    }
  ],

  /* -------------------------------------------------------------------
   * QUIZ: 「クイズで復習」モードで使うデータ
   * q       … 問題文
   * choices … 選択肢
   * answer  … 正解のindex（0始まり）
   * explain … 解説
   * tag     … 関連コマンドid（復習のひも付け用）
   * ----------------------------------------------------------------- */
  QUIZ: [
    {
      id: "q1",
      q: "変更をコミット対象に追加するコマンドは？",
      choices: ["git status", "git add .", "git push", "git commit"],
      answer: 1,
      explain: "git add でステージング（コミット対象）に乗せます。push/commitはその後の段階です。",
      tag: "add-all"
    },
    {
      id: "q2",
      q: "ステージングの内容を記録として手元に保存するのは？",
      choices: ['git commit -m "msg"', "git add .", "git pull", "git status"],
      answer: 0,
      explain: "commitでローカルリポジトリに1つの記録を作ります。GitHubにはまだ送られません。",
      tag: "commit"
    },
    {
      id: "q3",
      q: "ローカルのコミットをGitHubへ送るコマンドは？",
      choices: ["git pull", "git push", "git add .", "git restore"],
      answer: 1,
      explain: "pushでリモート（GitHub）へ送信します。pullは逆に取り込みです。",
      tag: "push"
    },
    {
      id: "q4",
      q: "GitHub上の新しい変更を手元に取り込むのは？",
      choices: ["git push", "git commit", "git pull", "git branch"],
      answer: 2,
      explain: "pullでリモートの変更を取り込みます。送るのがpush、取り込むのがpull。",
      tag: "pull"
    },
    {
      id: "q5",
      q: "間違えてaddしたファイルをステージから外すには？",
      choices: [
        "git restore ファイル名",
        "git restore --staged ファイル名",
        "git delete ファイル名",
        "git push"
      ],
      answer: 1,
      explain: "--staged を付けるとステージから降ろせます。編集内容は消えません。",
      tag: "restore-staged"
    },
    {
      id: "q6",
      q: "今の変更状況をただ確認したいとき、まず使うのは？",
      choices: ["git status", "git commit", "git push", "git switch"],
      answer: 0,
      explain: "statusは状態を表示するだけの安全なコマンド。迷ったらまず実行。",
      tag: "status"
    },
    {
      id: "q7",
      q: "新しいブランチを作って同時に移動するコマンドは？",
      choices: [
        "git branch ブランチ名",
        "git switch ブランチ名",
        "git switch -c ブランチ名",
        "git checkout"
      ],
      answer: 2,
      explain: "-c は create の意味。作成と移動を一度に行えます。",
      tag: "switch-c"
    },
    {
      id: "q8",
      q: "次のうち「GitHubに反映される」のはどれ？",
      choices: ["git add .", 'git commit -m "msg"', "git push", "git status"],
      answer: 2,
      explain: "add・commitは手元の作業。GitHubに届くのはpushしたときです。",
      tag: "push"
    },
    {
      id: "q9",
      q: "編集を取り消して最後のコミットの状態に戻すには？",
      choices: [
        "git restore ファイル名",
        "git restore --staged ファイル名",
        "git pull",
        "git add ."
      ],
      answer: 0,
      explain: "--staged なしのrestoreは作業フォルダの変更を取り消します（内容は消える）。",
      tag: "restore-file"
    },
    {
      id: "q10",
      q: "コミットの履歴を1行ずつ短く見るには？",
      choices: ["git diff", "git log --oneline", "git remote -v", "git status"],
      answer: 1,
      explain: "log --oneline で履歴をコンパクトに確認できます。",
      tag: "log"
    }
  ]
};
