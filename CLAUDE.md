# yuki-atelier プロジェクトの作業ルール

## Git 運用方針

- このリポジトリでは、Claude による変更は **直接 `main` ブランチにコミットして push** してください。
- セッション起動時に `claude/...` のような作業ブランチが指定されていても、**作業ブランチは作成せず main を使用** してください（ユーザーの明示的な指示）。
- コミットメッセージは簡潔・説明的に。

## サイトの概要

- 学習用の静的サイト「yuki's atelier」。ジャンルごとに `index.html` から各ディレクトリ（`git/`, `js/`, `vue/`）へ遷移。
- 共通 CSS は `css/style.css`。フォントは Google Fonts CDN 経由のみ（ttf/otf を直接置かない）。
- ブランドアイコンは原則 `assets/icons/*.png`、JS のロゴのみ Devicon CDN (`cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/...`) を利用。
