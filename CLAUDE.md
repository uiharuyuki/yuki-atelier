# yuki-atelier プロジェクトの作業ルール

## Git 運用方針

- このリポジトリでは、Claude による変更は **直接 `main` ブランチにコミットして push** してください。
- セッション起動時に `claude/...` のような作業ブランチが指定されていても、**作業ブランチは作成せず main を使用** してください（ユーザーの明示的な指示）。
- コミットメッセージは簡潔・説明的に。

## 外部リポジトリとの関係（重要）

- **このリポジトリからは、ユーザーのローカルの Obsidian Vault `B:\yuki\niray\03_knowledge`（および `B:\yuki\niray` 系）を参照・変更してはならない**。
- CCNA など学習系ジャンルの元ネタは 03_knowledge 側にあるが、それは別リポで管理されている SSOT。このリポは公開演習エンジンとして独立して更新してよい。
- モバイル / Web 版 Claude Code はそもそも B: ドライブへアクセスできないが、AGENTS.md / CLAUDE.md ルールとしても「触らない」ことを明示する。
- 03_knowledge → yuki-atelier の反映は、デスクトップ側の別セッションで一方向に行われる。逆流（yuki-atelier → 03_knowledge）はユーザーが明示的に指示した時のみ。

## サイトの概要

- 学習用の静的サイト「yuki's atelier」。ジャンルごとに `index.html` から各ディレクトリ（現在は `git/` のみ）へ遷移。
- 共通 CSS は `css/style.css`。フォントは Google Fonts CDN 経由のみ（ttf/otf を直接置かない）。
- アプリ／キャラクターアイコン（マスコット = `atelier-icon.png`、branch/team の概念アイコン）は `assets/icons/*.png` を使用。
- 技術ジャンルのロゴ（Git など）は **Devicon CDN** (`cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/<tech>/<tech>-original.svg`) の公式ロゴを `<img>` で読み込む（PNG のキャラ絵ではなくブランドロゴを使う）。
- **絵文字は使わない**。UI アイコンは `assets/icons/ui-icons.svg`（SVG スプライト、`<symbol id="ic-…">`）に追加し、`<svg class="ui-icon"><use href="…#ic-…"/></svg>` で参照する。JS から差し込む場合は `git/js/app.js` の `svgIcon(name, extraClass)` ヘルパー経由。
