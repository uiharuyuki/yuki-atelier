# yuki-atelier project instructions

## 公開運用の正本（SSOT）

このリポジトリでは、次の二つを必ず別ワークフローとして扱う。

1. `README.md` 保存後の `README.html` ローカル自動変換
2. ユーザーが明示的に依頼した解説HTMLのGitHub Pages公開

通常のMarkdown保存、README保存、学習ノート保存、Vault保存を、公開用HTMLの作成依頼と解釈してはいけない。

### README.md 自動変換

- 対象はファイル名が正確に `README.md` のファイルだけとし、出力は同じフォルダの `README.html` とする。
- 変換はリポジトリ内の `scripts/readme_to_html.py` と `scripts/readme-post-write.ps1` だけで行う。AI、外部API、外部CDN、追加パッケージを使わない。
- Codexでは `.codex/hooks.json`、Claude Codeでは `.claude/settings.json` の `PostToolUse` に登録し、`Write` / `Edit` 相当の成功後に実行する。
- 既存のユーザー共通Hookや他のHookは削除、置換、無効化しない。必要な設定は追記・併存させる。
- 変換スクリプトは対象外ファイル、変換失敗、実行環境不足のいずれでも標準出力・標準エラーへ通知を出さず、終了コード0でエージェント本体の作業を継続させる。
- `README.md` 以外のMarkdownからHTMLを自動生成しない。
- `README.html` を `explanations/` へコピーしない。自動でstage、commit、pushしない。
- この自動変換は、次項の公開解説HTMLフローとは無関係である。
- 新しいcloneやHook定義変更後は、Codexの `/hooks` とClaude Codeのworkspace trustで、内容を確認してプロジェクトHookを明示的に信頼する。信頼前は設定済み・動作済みと報告しない。

### 「htmlで解説して」の公開フロー

次のような、公開用HTMLを求める明示依頼がある場合だけ開始する。

- 「htmlで解説して」
- 「HTML形式で公開用に解説して」
- 明確に同じ意味だと判断できる公開HTML依頼

通常のREADME保存、Markdown保存、学習ノート保存、Obsidian保存、Vault保存では開始しない。運用手順内で上記の文言を引用・説明しているだけの場合も、公開対象の本文と公開意思が示されていなければ開始しない。

明示依頼を受けた場合は、次の順序を守る。

1. 内容が公開可能な一般解説か確認する。
2. 個人情報、社内情報、研修限定情報、認証情報、APIキー、内部プロンプト、会話履歴、Obsidianの私的記録、Vault、Profile Memory、学習計画、進捗、間違いログ、弱点、全文ログを除外する。判断できなければ公開せず、ユーザーへ確認する。
3. Git操作の最初に `git ls-remote origin refs/heads/main` で実remote main SHAを取得する。
4. `git status --short --branch` と `git log --oneline --decorate -5` を記録し、`git fetch origin main` 後にローカルHEAD、ローカル`origin/main`、実remote mainを比較する。
5. 履歴が分岐していたら作業を止めて状況を報告する。`reset --hard`、force push、既存変更の破棄で解決しない。
6. `explanations/<stable-slug>.html` を作成または更新する。
7. `explanations/index.html` に対象ページへの相対リンクを追加する。GitHub Pagesはディレクトリ一覧を自動生成しないため、新規ページごとに一覧も更新する。
8. 既存サイトの相対リンク、相互ナビゲーション、紙面調・朱色レールのデザイン、レスポンシブ表示、ライト／ダークテーマを維持する。外部CDN・外部画像や、移動だけのJavaScriptを追加しない。
9. ローカル静的サーバーと実ブラウザで、HTML構文、全リンク、404、PC幅、390px幅、ライト／ダークテーマ、横スクロール、キーボード操作、フォーカス表示、ブラウザコンソールを確認する。
10. 公開対象と一覧など、今回変更した対象ファイルだけをパス指定してstageする。`git add -A`、`git add .`、無関係なdirty差分のstageは禁止する。
11. staged pathが意図した集合と完全一致し、既存の未コミット変更を含まないことを確認してから`main`へcommitする。
12. この明示的な公開依頼を通常の公開許可として、`origin/main`へpushする。依頼範囲外の外部送信はしない。
13. `git rev-parse HEAD` と `git ls-remote origin refs/heads/main` のSHA一致を確認する。
14. GitHub Pagesの実URLを取得し、HTTP 200と対象ページ固有の内容、一覧リンク、トップとの相互移動を確認する。反映待ちをremote push成功と混同しない。
15. ローカルcommit、remote push、Pages公開確認を分け、公開URLと未検証・失敗項目を報告する。

### PMの責務境界

- `yuki-atelier`の編集、検証、commit、push、公開URL確認はPMだけが担当する。
- assistant／tutorのProfile、SOUL、Memory、Obsidian、Vaultを読み集めたり変更したりしない。
- assistant／tutorから渡された公開候補は公開安全性を確認してから利用する。assistant／tutorを直接起動せず、Profile間の常設呼び出しを作らない。
- 公開HTMLをObsidian、Vault、Memoryへ逆同期しない。
- README自動変換Hookと公開解説HTMLフローを混同しない。

### 受入条件と報告

- 別sessionで `README.md` をWrite/Editした直後に同じフォルダの `README.html` が新規生成または更新される。
- 非READMEのMarkdown保存ではHTMLも `README.html` も生成されず、`explanations/` に差分が出ない。
- Hookの対象外・失敗時もエージェント本体が継続し、チャット通知が出ず、既存Hookが残る。
- 公開フローは明示依頼時だけ開始し、一覧リンク、限定stage、local/remote SHA一致、Pages HTTP 200と内容表示まで確認する。
- 完了時は、変更した正本ファイル、Hook登録先と公式仕様、README変換の実テスト、公開HTMLの実テスト、local commit SHA、remote main SHA、Pages URL、未検証点、既存dirty差分を巻き込んでいない証拠を分けて報告する。
